-- get_invite_info now also returns the patient's name, so the invite page
-- can show who the invite is actually for -- especially useful now that one
-- owner can run several circles (one invite link alone doesn't say which
-- elder it's for otherwise).

drop function if exists public.get_invite_info(uuid);

create or replace function public.get_invite_info(p_token uuid)
returns table(
  circle_id uuid,
  circle_name text,
  patient_name text,
  role text,
  valid boolean
)
language sql
security definer
set search_path = public
stable
as $$
  select
    i.circle_id,
    c.name,
    c.patient_name,
    i.role,
    (i.revoked_at is null and i.expires_at > now() and i.accepted_by is null) as valid
  from public.care_circle_invites i
  join public.care_circles c on c.id = i.circle_id
  where i.id = p_token
$$;

grant execute on function public.get_invite_info(uuid) to anon, authenticated;
