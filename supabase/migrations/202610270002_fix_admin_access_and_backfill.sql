-- 1. Link admin user to profiles table as admin
delete from public.profiles where user_id in (select id from auth.users where lower(email) = 'admin@surojbuildcon.com');
insert into public.profiles (user_id, role)
select id, 'admin' from auth.users where lower(email) = 'admin@surojbuildcon.com';

-- 2. Grant table permissions to authenticated role
grant select, insert, update on public.employees to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select on public.departments to authenticated;
grant select, insert, update on public.assessment_attempts to authenticated;

-- 3. Robust admin check function
create or replace function public.is_assessment_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles as profile
    where profile.user_id = (select auth.uid())
      and profile.role::text = 'admin'
  )
  or coalesce((select (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin'), false)
  or coalesce((select auth.jwt() ->> 'email' = 'admin@surojbuildcon.com'), false);
$$;

revoke all on function public.is_assessment_admin() from public, anon;
grant execute on function public.is_assessment_admin() to authenticated;

-- 4. RLS policies on employees (allow all authenticated to read active employee catalog)
alter table public.employees enable row level security;
drop policy if exists "Admins read employees for assessment results" on public.employees;
drop policy if exists "Admins read all employees" on public.employees;
drop policy if exists "Allow authenticated read employees" on public.employees;
create policy "Allow authenticated read employees"
  on public.employees for select
  to authenticated
  using (true);

-- 5. RLS policies on profiles
alter table public.profiles enable row level security;
drop policy if exists "Admins read profiles for assessment results" on public.profiles;
drop policy if exists "Authenticated read profiles" on public.profiles;
create policy "Authenticated read profiles"
  on public.profiles for select
  to authenticated
  using (true);

-- 6. RLS policies on assessment_attempts
alter table public.assessment_attempts enable row level security;
drop policy if exists "Admins read all assessment attempts" on public.assessment_attempts;
drop policy if exists "Employees read their own assessment attempts" on public.assessment_attempts;
drop policy if exists "Read assessment attempts" on public.assessment_attempts;

create policy "Read assessment attempts"
  on public.assessment_attempts for select
  to authenticated
  using (
    auth.uid() = employee_user_id
    or public.is_assessment_admin()
    or (auth.jwt() ->> 'email' = 'admin@surojbuildcon.com')
  );

drop policy if exists "Admins evaluate submitted attempts" on public.assessment_attempts;
create policy "Admins evaluate submitted attempts"
  on public.assessment_attempts for update
  to authenticated
  using (
    (public.is_assessment_admin() or auth.jwt() ->> 'email' = 'admin@surojbuildcon.com')
    and status = 'submitted'
  )
  with check (
    (public.is_assessment_admin() or auth.jwt() ->> 'email' = 'admin@surojbuildcon.com')
    and status = 'submitted'
  );

-- 7. Backfill any assessment attempts where employee_id is not yet linked
update public.assessment_attempts as attempt
set employee_id = profile.employee_id,
    department_id = coalesce(attempt.department_id, employee.department_id::text)
from public.profiles as profile
join public.employees as employee on employee.id = profile.employee_id
where attempt.employee_user_id = profile.user_id
  and attempt.employee_id is null;

-- 8. Refresh PostgREST schema cache
notify pgrst, 'reload schema';
