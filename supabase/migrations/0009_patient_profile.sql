-- Adds patient profile + personal preference fields to care_circles, and the
-- owner/editor UPDATE policy needed to edit them (care_circles previously had
-- no update policy at all).

alter table public.care_circles
  add column if not exists patient_name text,
  add column if not exists date_of_birth date,
  add column if not exists gender text check (gender in ('male', 'female', 'other', 'prefer_not_to_say')),
  add column if not exists preferred_language text,
  add column if not exists profile_notes text,
  add column if not exists food_preference text,
  add column if not exists drink_preference text,
  add column if not exists hobbies_interests text;

create policy "circle updatable by editor+" on public.care_circles
  for update using (public.user_circle_role(id) in ('owner', 'editor'));
