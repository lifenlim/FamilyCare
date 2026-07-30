-- Lets the owner/editor (Primary/Secondary Caretaker) remove a medication.
-- The table-level DELETE grant already exists from 0002_grants.sql; only the
-- RLS policy was missing, so deletes were silently blocked by the default
-- deny-all. dose_checklist rows for the medication cascade-delete automatically
-- (medication_id references medications(id) on delete cascade).

create policy "care items deletable by editor+" on public.medications
  for delete using (public.user_circle_role(circle_id) in ('owner', 'editor'));
