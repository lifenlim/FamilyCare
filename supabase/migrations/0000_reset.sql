-- Drops the old prototype schema plus anything 0001_init.sql partially created,
-- so 0001_init.sql can be run on a clean slate. Run this FIRST, then run
-- 0001_init.sql again (unchanged).

drop trigger if exists on_auth_user_created on auth.users;

drop view if exists public.medications_with_balance;

drop function if exists public.accept_invite(uuid);
drop function if exists public.get_invite_info(uuid);
drop function if exists public.ensure_my_circle();
drop function if exists public.handle_user_email_sync();
drop function if exists public.handle_new_user();
drop function if exists public.user_circle_role(uuid);
drop function if exists public.set_updated_at();

drop table if exists public.activity_log cascade;
drop table if exists public.dose_checklist cascade;
drop table if exists public.allergies cascade;
drop table if exists public.appointments cascade;
drop table if exists public.medications cascade;
drop table if exists public.care_circle_invites cascade;
drop table if exists public.care_circle_members cascade;
drop table if exists public.care_circles cascade;
drop table if exists public.circle_members cascade;
drop table if exists public.circles cascade;
drop table if exists public.profiles cascade;
