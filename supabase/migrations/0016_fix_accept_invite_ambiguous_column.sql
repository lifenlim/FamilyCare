-- accept_invite's RETURNS TABLE(circle_id, role) implicitly declares
-- PL/pgSQL variables named circle_id/role, which collide with the bare
-- column names used in the INSERT ... ON CONFLICT (circle_id, user_id)
-- below -- Postgres raises "column reference is ambiguous" for every call.
-- Nothing reads this function's return value, so just rename the output
-- columns to stop the collision.

-- CREATE OR REPLACE can't change a function's return signature, so the old
-- circle_id/role-named version has to go first.
drop function if exists public.accept_invite(uuid);

create or replace function public.accept_invite(p_token uuid)
returns table(out_circle_id uuid, out_role text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.care_circle_invites%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Must be signed in to accept an invite';
  end if;

  select * into v_invite from public.care_circle_invites where id = p_token for update;
  if not found then
    raise exception 'Invite not found';
  end if;
  if v_invite.revoked_at is not null then
    raise exception 'This invite has been revoked';
  end if;
  if v_invite.expires_at < now() then
    raise exception 'This invite has expired';
  end if;
  if v_invite.accepted_by is not null then
    raise exception 'This invite has already been used';
  end if;
  if exists (select 1 from public.care_circles c where c.id = v_invite.circle_id and c.owner_id = auth.uid()) then
    raise exception 'You already own this care circle';
  end if;

  insert into public.care_circle_members (circle_id, user_id, role)
  values (v_invite.circle_id, auth.uid(), v_invite.role)
  on conflict (circle_id, user_id) do update set role = excluded.role;

  update public.care_circle_invites
    set accepted_by = auth.uid(), accepted_at = now()
    where id = p_token;

  insert into public.activity_log (circle_id, user_id, action, entity_type, entity_id)
  values (v_invite.circle_id, auth.uid(), 'accepted_invite', 'care_circle_invites', v_invite.id);

  return query select v_invite.circle_id, v_invite.role;
end;
$$;

grant execute on function public.accept_invite(uuid) to authenticated;
