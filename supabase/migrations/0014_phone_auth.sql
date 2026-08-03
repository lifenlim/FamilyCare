-- Support phone/SMS sign-in alongside email, for users without an email
-- address. profiles.email was kept in sync via a trigger that only fired on
-- email changes -- a phone-only sign-up would never get a profiles row at
-- all, so widen the trigger to also fire on (and sync) phone.

alter table public.profiles
  add column if not exists phone text;

create or replace function public.handle_user_profile_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, phone)
  values (new.id, new.email, new.phone)
  on conflict (id) do update set email = excluded.email, phone = excluded.phone;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_user_email_sync();
create trigger on_auth_user_created
  after insert or update of email, phone on auth.users
  for each row execute function public.handle_user_profile_sync();

insert into public.profiles (id, email, phone)
select id, email, phone from auth.users
on conflict (id) do update set email = excluded.email, phone = excluded.phone;
