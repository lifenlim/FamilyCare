-- Lets one user own several circles (e.g. caring for both parents
-- separately). The uniqueness was only ever there to keep the original
-- one-circle-per-user assumption; nothing else in the schema depends on it
-- -- ensure_my_circle/getCircleContext already handle "which circle(s) does
-- this user have" as a set, not a single row.

alter table public.care_circles drop constraint if exists care_circles_owner_id_key;
