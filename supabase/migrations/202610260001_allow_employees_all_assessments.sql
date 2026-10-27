create or replace function public.validate_assessment_attempt_department()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  assigned_employee_id uuid;
  assigned_department_id text;
begin
  if new.employee_user_id <> (select auth.uid()) then
    raise exception 'Assessment attempts must belong to the authenticated employee';
  end if;

  if new.session_number not between 1 and 6 then
    raise exception 'Assessment session must be between 1 and 6';
  end if;

  select employee.id, employee.department_id::text
    into assigned_employee_id, assigned_department_id
  from public.profiles as profile
  join public.employees as employee on employee.id = profile.employee_id
  where profile.user_id = new.employee_user_id
    and profile.role::text = 'employee'
    and employee.status::text = 'active';

  if assigned_employee_id is null then
    raise exception 'An active employee profile is required';
  end if;

  new.employee_id := assigned_employee_id;
  new.department_id := assigned_department_id;
  new.attempt_number := 1;
  return new;
end;
$$;