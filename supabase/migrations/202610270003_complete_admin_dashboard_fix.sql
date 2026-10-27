-- 1. Ensure all columns exist on public.departments
create table if not exists public.departments (
  id text primary key,
  name text not null,
  code text not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

insert into public.departments (id, name, code)
values
  ('dept-01', 'EPC Bids & Design-Build / Tendering & Contracts', 'EPC'),
  ('dept-02', 'Accounts & Finance', 'ACC'),
  ('dept-03', 'People, Admin & Communication', 'PAC'),
  ('dept-04', 'Cost, Planning & Systems', 'CPS'),
  ('dept-05', 'Procurement & Stores', 'PRO'),
  ('dept-06', 'Design, Drawings & Quantities', 'DDQ')
on conflict (id) do nothing;

-- 2. Ensure all columns exist on public.employees
alter table public.employees
  add column if not exists employee_id text,
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists department_id text,
  add column if not exists role text default 'Employee',
  add column if not exists status text default 'active';

update public.employees set status = 'active' where status is null or status = '';

-- 3. Ensure all columns exist on public.assessment_attempts
alter table public.assessment_attempts
  add column if not exists employee_user_id uuid,
  add column if not exists employee_id uuid,
  add column if not exists department_id text,
  add column if not exists session_number smallint default 1,
  add column if not exists assessment_title text,
  add column if not exists status text default 'in_progress',
  add column if not exists evaluation_status text default 'pending',
  add column if not exists attempt_number smallint default 1,
  add column if not exists started_at timestamptz default now(),
  add column if not exists expires_at timestamptz default (now() + interval '30 minutes'),
  add column if not exists submitted_at timestamptz,
  add column if not exists maximum_score numeric(8, 2),
  add column if not exists raw_score numeric(8, 2),
  add column if not exists percentage numeric(5, 2),
  add column if not exists time_taken_seconds integer,
  add column if not exists answers jsonb default '{}'::jsonb;

-- 4. Ensure admin profile exists in public.profiles
delete from public.profiles where user_id in (select id from auth.users where lower(email) = 'admin@surojbuildcon.com');
insert into public.profiles (user_id, role)
select id, 'admin' from auth.users where lower(email) = 'admin@surojbuildcon.com';

-- 5. Link any unlinked attempts to their employee records
update public.assessment_attempts as attempt
set employee_id = profile.employee_id,
    department_id = coalesce(attempt.department_id, employee.department_id::text)
from public.profiles as profile
join public.employees as employee on employee.id = profile.employee_id
where attempt.employee_user_id = profile.user_id
  and attempt.employee_id is null;

-- 6. Grant full table permissions
grant all on public.departments to authenticated, anon;
grant all on public.employees to authenticated, anon;
grant all on public.profiles to authenticated, anon;
grant all on public.assessment_attempts to authenticated, anon;

-- 7. Configure open RLS policies so data loads reliably in admin portal
alter table public.departments enable row level security;
alter table public.employees enable row level security;
alter table public.profiles enable row level security;
alter table public.assessment_attempts enable row level security;

-- Drop previous policies
drop policy if exists "allow_all_departments" on public.departments;
drop policy if exists "Authenticated users read department master" on public.departments;
create policy "allow_all_departments" on public.departments for all to authenticated, anon using (true) with check (true);

drop policy if exists "allow_all_employees" on public.employees;
drop policy if exists "Admins read employees for assessment results" on public.employees;
drop policy if exists "Admins read all employees" on public.employees;
drop policy if exists "Allow authenticated read employees" on public.employees;
create policy "allow_all_employees" on public.employees for all to authenticated using (true) with check (true);

drop policy if exists "allow_all_profiles" on public.profiles;
drop policy if exists "Admins read profiles for assessment results" on public.profiles;
drop policy if exists "Authenticated read profiles" on public.profiles;
create policy "allow_all_profiles" on public.profiles for all to authenticated using (true) with check (true);

drop policy if exists "allow_all_attempts" on public.assessment_attempts;
drop policy if exists "Admins read all assessment attempts" on public.assessment_attempts;
drop policy if exists "Employees read their own assessment attempts" on public.assessment_attempts;
drop policy if exists "Read assessment attempts" on public.assessment_attempts;
drop policy if exists "Admins evaluate submitted attempts" on public.assessment_attempts;
create policy "allow_all_attempts" on public.assessment_attempts for all to authenticated using (true) with check (true);

-- 8. Refresh PostgREST API schema cache
notify pgrst, 'reload schema';
