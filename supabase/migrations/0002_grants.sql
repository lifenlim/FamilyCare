-- RLS policies restrict which *rows* a role can see/change, but Postgres
-- separately requires the role to have base table-level privileges before it
-- will even evaluate those policies. 0001_init.sql enabled RLS and added
-- policies but never granted the underlying privileges -- run this once to
-- fix "permission denied for table ..." errors.

grant select, insert, update, delete on
  public.profiles,
  public.care_circles,
  public.care_circle_members,
  public.care_circle_invites,
  public.medications,
  public.appointments,
  public.allergies,
  public.dose_checklist,
  public.activity_log
to authenticated;
