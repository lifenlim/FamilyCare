-- Lets a circle owner hand the whole circle off to an existing member,
-- stepping down to editor themselves. The target must already be a member
-- (editor or viewer) of this specific circle -- ownership can't be handed
-- to someone outside the circle. Runs atomically as a definer function
-- since it touches care_circles, care_circle_members, and activity_log
-- together and needs to verify the caller actually owns *this* circle
-- (a user can now own several, so "the circle I own" is no longer unique
-- per user).

create or replace function public.transfer_ownership(p_circle_id uuid, p_new_owner_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Must be signed in';
  end if;

  if p_new_owner_id = auth.uid() then
    raise exception 'You already own this circle';
  end if;

  if not exists (
    select 1 from public.care_circles
    where id = p_circle_id and owner_id = auth.uid()
  ) then
    raise exception 'You do not own this care circle';
  end if;

  if not exists (
    select 1 from public.care_circle_members
    where circle_id = p_circle_id and user_id = p_new_owner_id
  ) then
    raise exception 'That person is not a member of this circle';
  end if;

  -- Owners aren't tracked in care_circle_members, so the new owner's
  -- membership row goes away once they take over the owner_id slot.
  delete from public.care_circle_members
  where circle_id = p_circle_id and user_id = p_new_owner_id;

  update public.care_circles set owner_id = p_new_owner_id where id = p_circle_id;

  -- The previous owner becomes an editor rather than losing access outright.
  insert into public.care_circle_members (circle_id, user_id, role)
  values (p_circle_id, auth.uid(), 'editor')
  on conflict (circle_id, user_id) do update set role = excluded.role;

  insert into public.activity_log (circle_id, user_id, action, entity_type, entity_id)
  values (p_circle_id, auth.uid(), 'transferred_ownership', 'care_circles', p_circle_id);
end;
$$;

grant execute on function public.transfer_ownership(uuid, uuid) to authenticated;
