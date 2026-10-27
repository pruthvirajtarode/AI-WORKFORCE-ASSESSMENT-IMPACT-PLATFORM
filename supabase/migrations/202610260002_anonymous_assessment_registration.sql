create or replace function public.register_assessment_guest(
  p_name text,
  p_department_code text
)
returns table (
  employee_db_id uuid,
  employee_code text,
  department_id text,
  department_name text,
  department_code text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  guest_user_id uuid := (select auth.uid());
  resolved_department_id uuid;
  resolved_department_name text;
  resolved_department_code text;
  resolved_employee_id uuid;
  resolved_employee_code text;
  resolved_department_text text;
begin
  if guest_user_id is null
    or not coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false) then
    raise exception 'An anonymous assessment session is required';
  end if;

  if length(trim(coalesce(p_name, ''))) not between 2 and 100 then
    raise exception 'Name must be between 2 and 100 characters';
  end if;

  select department.id, department.name, department.code
    into resolved_department_id, resolved_department_name, resolved_department_code
  from public.departments as department
  where upper(department.code) = upper(trim(p_department_code))
    and department.is_active = true;

  if resolved_department_id is null then
    raise exception 'Choose an active assessment department';
  end if;

  select employee.id, employee.employee_id, employee.department_id::text,
         department.name, department.code
    into resolved_employee_id, resolved_employee_code, resolved_department_text,
         resolved_department_name, resolved_department_code
  from public.profiles as profile
  join public.employees as employee on employee.id = profile.employee_id
  left join public.departments as department on department.id::text = employee.department_id::text
  where profile.user_id = guest_user_id
    and profile.role::text = 'employee';

  if resolved_employee_id is null then
    resolved_employee_code := 'GUEST-' || upper(substr(replace(guest_user_id::text, '-', ''), 1, 10));

    insert into public.employees (
      employee_id, name, email, phone, role, department_id, status, is_demo
    ) values (
      resolved_employee_code,
      trim(p_name),
      'guest+' || replace(guest_user_id::text, '-', '') || '@assessment.surojbuildcon.com',
      null,
      'Employee',
      resolved_department_id,
      'active',
      false
    )
    returning id into resolved_employee_id;

    insert into public.profiles (user_id, employee_id, role)
    values (guest_user_id, resolved_employee_id, 'employee');

    resolved_department_text := resolved_department_id::text;
  end if;

  return query select resolved_employee_id, resolved_employee_code,
    resolved_department_text, resolved_department_name, resolved_department_code;
end;
$$;

revoke all on function public.register_assessment_guest(text, text) from public, anon;
grant execute on function public.register_assessment_guest(text, text) to authenticated;