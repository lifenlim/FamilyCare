-- Collapses listUserCircles' two separate queries (owned + membership),
-- which also required a prior auth.getUser() round trip just to get the
-- id to filter by, into one query that uses auth.uid() internally. Called
-- on every page load (via getCircleContext) and every write action (via
-- requireEditor), so this is a broadly-felt latency win.

create or replace function public.list_my_circles()
returns table(
  circle_id uuid,
  circle_name text,
  patient_name text,
  role text
)
language sql
security invoker
set search_path = public
stable
as $$
  select c.id, c.name, c.patient_name, 'owner'::text
  from public.care_circles c
  where c.owner_id = auth.uid()
  union all
  select m.circle_id, c.name, c.patient_name, m.role
  from public.care_circle_members m
  join public.care_circles c on c.id = m.circle_id
  where m.user_id = auth.uid()
$$;

grant execute on function public.list_my_circles() to authenticated;
