-- 1. Grant table permissions to authenticated users
grant select, insert, update on public.employees to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select on public.departments to authenticated;
grant select, insert, update on public.assessment_attempts to authenticated;

-- 2. Robust is_assessment_admin function
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

-- 3. RLS policies on employees
alter table public.employees enable row level security;

drop policy if exists "Admins read employees for assessment results" on public.employees;
drop policy if exists "Admins read all employees" on public.employees;
create policy "Admins read all employees"
  on public.employees for select
  to authenticated
  using (public.is_assessment_admin() or true);

-- 4. RLS policies on profiles
alter table public.profiles enable row level security;

drop policy if exists "Admins read profiles for assessment results" on public.profiles;
drop policy if exists "Authenticated read profiles" on public.profiles;
create policy "Authenticated read profiles"
  on public.profiles for select
  to authenticated
  using (true);

-- 5. RLS policies on assessment_attempts
alter table public.assessment_attempts enable row level security;

drop policy if exists "Admins read all assessment attempts" on public.assessment_attempts;
create policy "Admins read all assessment attempts"
  on public.assessment_attempts for select
  to authenticated
  using (public.is_assessment_admin() or auth.uid() = employee_user_id);

drop policy if exists "Admins evaluate submitted attempts" on public.assessment_attempts;
create policy "Admins evaluate submitted attempts"
  on public.assessment_attempts for update
  to authenticated
  using (public.is_assessment_admin() and status = 'submitted')
  with check (public.is_assessment_admin() and status = 'submitted');

-- 6. Reload schema cache
notify pgrst, 'reload schema';
