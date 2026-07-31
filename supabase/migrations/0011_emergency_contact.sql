-- Adds emergency contact fields to care_circles.

alter table public.care_circles
  add column if not exists emergency_contact_name text,
  add column if not exists emergency_contact_phone text,
  add column if not exists emergency_contact_relationship text;
