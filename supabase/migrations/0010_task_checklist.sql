-- Day-scoped "did we do this today" tracking for tasks, mirroring
-- dose_checklist for medications: checking it off never touches
-- care_tasks.status, so an ongoing task's schedule stays intact.

create table if not exists public.task_checklist (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.care_tasks(id) on delete cascade,
  checklist_date date not null default current_date,
  done boolean not null default false,
  done_by uuid references public.profiles(id) on delete set null,
  done_at timestamptz,
  unique (task_id, checklist_date)
);

create index if not exists idx_task_checklist_task on public.task_checklist(task_id);

alter table public.task_checklist enable row level security;

grant select, insert, update, delete on public.task_checklist to authenticated;

create policy "task checklist readable by circle" on public.task_checklist
  for select using (
    exists (
      select 1 from public.care_tasks t
      where t.id = task_id and public.user_circle_role(t.circle_id) is not null
    )
  );
create policy "task checklist writable by circle" on public.task_checklist
  for insert with check (
    exists (
      select 1 from public.care_tasks t
      where t.id = task_id and public.user_circle_role(t.circle_id) is not null
    )
  );
create policy "task checklist updatable by circle" on public.task_checklist
  for update using (
    exists (
      select 1 from public.care_tasks t
      where t.id = task_id and public.user_circle_role(t.circle_id) is not null
    )
  );
