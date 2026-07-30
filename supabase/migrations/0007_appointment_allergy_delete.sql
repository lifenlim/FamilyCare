-- Lets the owner/editor (Primary/Secondary Caretaker) remove an appointment
-- or allergy, same as 0006 did for medications. Table-level DELETE grants
-- already exist from 0002_grants.sql; only the RLS policies were missing.

create policy "appointments deletable by editor+" on public.appointments
  for delete using (public.user_circle_role(circle_id) in ('owner', 'editor'));

create policy "allergies deletable by editor+" on public.allergies
  for delete using (public.user_circle_role(circle_id) in ('owner', 'editor'));
