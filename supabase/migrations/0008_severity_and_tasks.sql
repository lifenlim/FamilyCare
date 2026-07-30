-- 1. Allergy severity becomes a fixed Low/Medium/High dropdown instead of
--    free text. Added NOT VALID since existing rows may hold old free-text
--    values (e.g. "Mild") that wouldn't match -- this only enforces the
--    constraint on new/updated rows, not retroactively.
alter table public.allergies
  add constraint allergies_severity_check
    check (severity in ('low', 'medium', 'high')) not valid;

-- 2. New care_tasks table: recurring or one-time care procedures (med jabs,
-- blood tests, dressing changes, etc).
create table if not exists public.care_tasks (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.care_circles(id) on delete cascade,
  name text not null,
  schedule_type text not null check (schedule_type in ('ongoing', 'one_time')),
  recurrence text check (recurrence in ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly')),
  scheduled_at timestamptz,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (schedule_type = 'ongoing' and recurrence is not null and scheduled_at is null)
    or
    (schedule_type = 'one_time' and scheduled_at is not null and recurrence is null)
  )
);

create index if not exists idx_care_tasks_circle on public.care_tasks(circle_id);

drop trigger if exists trg_care_tasks_updated_at on public.care_tasks;
create trigger trg_care_tasks_updated_at before update on public.care_tasks
  for each row execute function public.set_updated_at();

alter table public.care_tasks enable row level security;

grant select, insert, update, delete on public.care_tasks to authenticated;

create policy "care tasks readable by circle" on public.care_tasks
  for select using (public.user_circle_role(circle_id) is not null);
create policy "care tasks writable by editor+" on public.care_tasks
  for insert with check (public.user_circle_role(circle_id) in ('owner', 'editor'));
create policy "care tasks updatable by editor+" on public.care_tasks
  for update using (public.user_circle_role(circle_id) in ('owner', 'editor'));
create policy "care tasks deletable by editor+" on public.care_tasks
  for delete using (public.user_circle_role(circle_id) in ('owner', 'editor'));
