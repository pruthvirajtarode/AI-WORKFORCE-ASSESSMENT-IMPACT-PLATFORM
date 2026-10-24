alter table public.assessment_attempts
  add column if not exists employee_id uuid references public.employees(id) on delete set null,
  add column if not exists department_id text,
  add column if not exists assessment_title text,
  add column if not exists maximum_score numeric(8, 2),
  add column if not exists raw_score numeric(8, 2),
  add column if not exists percentage numeric(5, 2),
  add column if not exists evaluation_status text not null default 'pending',
  add column if not exists attempt_number smallint not null default 1,
  add column if not exists time_taken_seconds integer;

alter table public.assessment_attempts
  drop constraint if exists assessment_attempts_evaluation_status_check,
  add constraint assessment_attempts_evaluation_status_check
    check (evaluation_status in ('pending', 'evaluated')),
  drop constraint if exists assessment_attempts_score_range_check,
  add constraint assessment_attempts_score_range_check
    check (
      (raw_score is null and percentage is null)
      or (raw_score >= 0 and maximum_score > 0 and raw_score <= maximum_score
        and percentage >= 0 and percentage <= 100)
    ),
  drop constraint if exists assessment_attempts_evaluation_score_check,
  add constraint assessment_attempts_evaluation_score_check
    check (
      (evaluation_status = 'pending' and raw_score is null and percentage is null)
      or (evaluation_status = 'evaluated' and raw_score is not null and percentage is not null)
    );

update public.assessment_attempts as attempt
set employee_id = profile.employee_id,
    department_id = employee.department_id::text
from public.profiles as profile
left join public.employees as employee on employee.id = profile.employee_id
where attempt.employee_user_id = profile.user_id
  and attempt.employee_id is null;

create or replace function public.is_assessment_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles as profile
    where profile.user_id = (select auth.uid())
      and profile.role::text = 'admin'
  );
$$;

revoke all on function public.is_assessment_admin() from public, anon;
grant execute on function public.is_assessment_admin() to authenticated;

create or replace function public.validate_assessment_attempt_department()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  assigned_employee_id uuid;
  assigned_department_id text;
  assigned_department_code text;
  expected_session smallint;
begin
  if new.employee_user_id <> (select auth.uid()) then
    raise exception 'Assessment attempts must belong to the authenticated employee';
  end if;

  select employee.id, employee.department_id::text, department.code
    into assigned_employee_id, assigned_department_id, assigned_department_code
  from public.profiles as profile
  join public.employees as employee on employee.id = profile.employee_id
  left join public.departments as department on department.id::text = employee.department_id::text
  where profile.user_id = new.employee_user_id
    and profile.role::text = 'employee'
    and employee.status::text = 'active';

  expected_session := case assigned_department_code
    when 'EPC' then 1
    when 'ACC' then 2
    when 'PAC' then 3
    when 'CPS' then 4
    when 'PRO' then 5
    when 'DDQ' then 6
    else null
  end;

  if assigned_employee_id is null or expected_session is null then
    raise exception 'An active employee profile with an approved assessment department is required';
  end if;
  if new.session_number <> expected_session then
    raise exception 'Employees may only start the assessment assigned to their department';
  end if;

  new.employee_id := assigned_employee_id;
  new.department_id := assigned_department_id;
  new.attempt_number := 1;
  return new;
end;
$$;

revoke all on function public.validate_assessment_attempt_department() from public, anon, authenticated;

drop trigger if exists validate_assessment_attempt_department on public.assessment_attempts;
create trigger validate_assessment_attempt_department
  before insert on public.assessment_attempts
  for each row execute function public.validate_assessment_attempt_department();

drop policy if exists "Admins read all assessment attempts" on public.assessment_attempts;
create policy "Admins read all assessment attempts"
  on public.assessment_attempts for select
  using (public.is_assessment_admin());

drop policy if exists "Admins evaluate submitted attempts" on public.assessment_attempts;
create policy "Admins evaluate submitted attempts"
  on public.assessment_attempts for update
  using (public.is_assessment_admin() and status = 'submitted')
  with check (public.is_assessment_admin() and status = 'submitted');

drop policy if exists "Admins read employees for assessment results" on public.employees;
create policy "Admins read employees for assessment results"
  on public.employees for select
  using (public.is_assessment_admin());

drop policy if exists "Admins read profiles for assessment results" on public.profiles;
create policy "Admins read profiles for assessment results"
  on public.profiles for select
  using (public.is_assessment_admin());

grant select on public.departments to authenticated;
drop policy if exists "Authenticated users read department master" on public.departments;
create policy "Authenticated users read department master"
  on public.departments for select
  to authenticated
  using (true);

create or replace function public.protect_assessment_attempt_identity()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.employee_user_id <> new.employee_user_id
    or old.employee_id is distinct from new.employee_id
    or old.department_id is distinct from new.department_id
    or old.session_number <> new.session_number
    or old.assessment_title is distinct from new.assessment_title
    or old.started_at <> new.started_at
    or old.expires_at <> new.expires_at
    or old.attempt_number <> new.attempt_number then
    raise exception 'Assessment attempt identity and timer are immutable';
  end if;

  if old.status = 'submitted' then
    if not public.is_assessment_admin() then
      raise exception 'Submitted assessment attempts are immutable';
    end if;
    if new.status <> old.status
      or new.answers is distinct from old.answers
      or new.submitted_at is distinct from old.submitted_at
      or new.maximum_score is distinct from old.maximum_score
      or new.time_taken_seconds is distinct from old.time_taken_seconds then
      raise exception 'Admins may update evaluation fields only';
    end if;
  elsif not public.is_assessment_admin()
    and (new.raw_score is distinct from old.raw_score
      or new.percentage is distinct from old.percentage
      or new.evaluation_status is distinct from old.evaluation_status) then
    raise exception 'Employees cannot set assessment results';
  end if;

  return new;
end;
$$;

create index if not exists assessment_attempts_employee_session_idx
  on public.assessment_attempts (employee_id, session_number, submitted_at desc);