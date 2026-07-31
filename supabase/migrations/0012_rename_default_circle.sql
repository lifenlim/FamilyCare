-- Rename the default care circle name from "My Care Circle" to "Family Care"
-- for consistency with the app's brand name.

alter table public.care_circles
  alter column name set default 'Family Care';

update public.care_circles
  set name = 'Family Care'
  where name = 'My Care Circle';

create or replace function public.ensure_my_circle()
returns public.care_circles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_circle public.care_circles%rowtype;
begin
  select * into v_circle from public.care_circles where owner_id = auth.uid();
  if found then
    return v_circle;
  end if;

  insert into public.care_circles (owner_id, name)
  values (auth.uid(), 'Family Care')
  returning * into v_circle;

  return v_circle;
end;
$$;

grant execute on function public.ensure_my_circle() to authenticated;
