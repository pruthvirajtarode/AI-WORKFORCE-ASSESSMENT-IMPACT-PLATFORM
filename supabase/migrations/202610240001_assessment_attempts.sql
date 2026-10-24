create table if not exists public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  employee_user_id uuid not null references auth.users(id) on delete cascade,
  session_number smallint not null check (session_number between 1 and 6),
  status text not null default 'in_progress' check (status in ('in_progress', 'submitted')),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  submitted_at timestamptz,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_user_id, session_number),
  check ((status = 'in_progress' and submitted_at is null) or (status = 'submitted' and submitted_at is not null))
);

alter table public.assessment_attempts enable row level security;

create policy "Employees read their own assessment attempts"
  on public.assessment_attempts for select
  using (auth.uid() = employee_user_id);

create policy "Employees create their own assessment attempts"
  on public.assessment_attempts for insert
  with check (auth.uid() = employee_user_id and status = 'in_progress' and submitted_at is null);

create policy "Employees update their own assessment attempts"
  on public.assessment_attempts for update
  using (auth.uid() = employee_user_id and status = 'in_progress')
  with check (auth.uid() = employee_user_id);

create or replace function public.protect_assessment_attempt_identity()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.employee_user_id <> new.employee_user_id
    or old.session_number <> new.session_number
    or old.started_at <> new.started_at
    or old.expires_at <> new.expires_at then
    raise exception 'Assessment attempt identity and timer are immutable';
  end if;
  if old.status = 'submitted' then
    raise exception 'Submitted assessment attempts are immutable';
  end if;
  return new;
end;
$$;

create trigger protect_assessment_attempt_identity
  before update on public.assessment_attempts
  for each row execute function public.protect_assessment_attempt_identity();

create index if not exists assessment_attempts_employee_status_idx
  on public.assessment_attempts (employee_user_id, status);

grant select, insert, update on public.assessment_attempts to authenticated;
revoke all on public.assessment_attempts from anon;