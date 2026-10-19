-- Visit planner: lets anyone in a care circle post when they plan to visit the
-- patient, so the whole circle can see who is coming and around what time.
--
-- Wall-clock date + time (no timezone) on purpose: a visit is "Saturday
-- 2-4pm" at the patient's home, regardless of where the viewer's device is.

create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.care_circles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  visit_date date not null,
  start_time time not null,
  end_time time not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint visits_end_after_start check (end_time > start_time)
);

create index if not exists idx_visits_circle_date
  on public.visits(circle_id, visit_date);

drop trigger if exists trg_visits_updated_at on public.visits;
create trigger trg_visits_updated_at before update on public.visits
  for each row execute function public.set_updated_at();

alter table public.visits enable row level security;

grant select, insert, update, delete on public.visits to authenticated;

-- Everyone in the circle (owner, caretakers AND family members) can see
-- every planned visit.
drop policy if exists "visits readable by circle" on public.visits;
create policy "visits readable by circle" on public.visits
  for select using (public.user_circle_role(circle_id) is not null);

-- Any member can post their own visit -- family members are the main
-- visitors, so unlike medications/appointments this is not editor-only.
drop policy if exists "visits insertable by member" on public.visits;
create policy "visits insertable by member" on public.visits
  for insert with check (
    public.user_circle_role(circle_id) is not null
    and user_id = auth.uid()
  );

-- You can change or cancel your own visit; the owner and caretakers can
-- manage anyone's (e.g. to clear out a stale entry).
drop policy if exists "visits updatable by author or editor+" on public.visits;
create policy "visits updatable by author or editor+" on public.visits
  for update using (
    user_id = auth.uid()
    or public.user_circle_role(circle_id) in ('owner', 'editor')
  )
  -- Stops a row being moved into a circle the user isn't part of.
  with check (public.user_circle_role(circle_id) is not null);

drop policy if exists "visits deletable by author or editor+" on public.visits;
create policy "visits deletable by author or editor+" on public.visits
  for delete using (
    user_id = auth.uid()
    or public.user_circle_role(circle_id) in ('owner', 'editor')
  );

notify pgrst, 'reload schema';
