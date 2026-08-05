-- Critical push alerts: medication balance hits zero, or an appointment is
-- today. Both fire once (deduped via critical_alerts_sent) to every owner
-- and editor in the circle -- viewers are excluded, and there is no
-- assigned-to/unconfirmed logic.
--
-- The scanning + sending RPCs below are called by a cron job with only the
-- anon key (this project never uses a service-role key), so they're gated
-- behind a secret stored in app_secrets rather than relying on auth.uid().
-- After running this migration, set your own secret once:
--   update public.app_secrets set value = 'a-long-random-string' where key = 'cron_secret';
-- and use that same string as CRON_SECRET in your environment.

create table if not exists public.app_secrets (
  key text primary key,
  value text not null
);

alter table public.app_secrets enable row level security;
-- Intentionally no grants/policies -- unreachable except from a security
-- definer function owned by the table owner, which bypasses RLS.

insert into public.app_secrets (key, value)
values ('cron_secret', 'change-me')
on conflict (key) do nothing;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_push_subscriptions_user on public.push_subscriptions(user_id);

create table if not exists public.critical_alerts_sent (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.care_circles(id) on delete cascade,
  alert_type text not null check (alert_type in ('medication_zero', 'appointment_today')),
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  unique (alert_type, entity_id)
);

create index if not exists idx_critical_alerts_sent_circle on public.critical_alerts_sent(circle_id);

alter table public.push_subscriptions enable row level security;
alter table public.critical_alerts_sent enable row level security;

-- update is required too -- the client upserts on conflict (endpoint),
-- which runs as an INSERT ... ON CONFLICT DO UPDATE under the hood.
grant select, insert, update, delete on public.push_subscriptions to authenticated;
grant select, delete on public.critical_alerts_sent to authenticated;

-- push_subscriptions: a user manages only their own device registrations
create policy "subscriptions manageable by owner" on public.push_subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- critical_alerts_sent: owner/editor can clear a stale "sent" row (e.g. on
-- top-up or reschedule) so the alert can re-arm; nothing needs to insert it
-- directly -- that only happens inside mark_alert_sent below.
create policy "alerts-sent clearable by editor+" on public.critical_alerts_sent
  for delete using (public.user_circle_role(circle_id) in ('owner', 'editor'));

-- ============================================================
-- RPCs used by the cron job (anon key + cron secret, no user session)
-- ============================================================

create or replace function public.get_due_critical_alerts(p_secret text)
returns table(
  circle_id uuid,
  alert_type text,
  entity_id uuid,
  title text,
  body text,
  user_id uuid,
  endpoint text,
  p256dh text,
  auth_key text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_secret is null or p_secret <> (select value from public.app_secrets where key = 'cron_secret') then
    raise exception 'unauthorized';
  end if;

  return query
  with due as (
    select
      m.circle_id,
      'medication_zero'::text as alert_type,
      m.id as entity_id,
      m.name || ' is out' as title,
      '0 left for ' || coalesce(cc.patient_name, 'the patient')
        || '. Refill today.' as body
    from public.medications_with_balance m
    join public.care_circles cc on cc.id = m.circle_id
    where m.current_balance <= 0
      and not exists (
        select 1 from public.critical_alerts_sent s
        where s.alert_type = 'medication_zero' and s.entity_id = m.id
      )
    union all
    select
      a.circle_id,
      'appointment_today'::text,
      a.id,
      'Appointment today',
      a.title || ' at ' || to_char(a.appointment_at, 'FMHH12:MI AM')
        || coalesce(' — ' || a.location, '')
    from public.appointments a
    where a.appointment_at::date = current_date
      and not exists (
        select 1 from public.critical_alerts_sent s
        where s.alert_type = 'appointment_today' and s.entity_id = a.id
      )
  ),
  recipients as (
    select cc.id as circle_id, cc.owner_id as user_id from public.care_circles cc
    union
    select ccm.circle_id, ccm.user_id
    from public.care_circle_members ccm
    where ccm.role = 'editor'
  )
  select d.circle_id, d.alert_type, d.entity_id, d.title, d.body,
         r.user_id, ps.endpoint, ps.p256dh, ps.auth as auth_key
  from due d
  join recipients r on r.circle_id = d.circle_id
  join public.push_subscriptions ps on ps.user_id = r.user_id;
end;
$$;

grant execute on function public.get_due_critical_alerts(text) to anon;

create or replace function public.mark_alert_sent(
  p_secret text,
  p_circle_id uuid,
  p_alert_type text,
  p_entity_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_secret is null or p_secret <> (select value from public.app_secrets where key = 'cron_secret') then
    raise exception 'unauthorized';
  end if;

  insert into public.critical_alerts_sent (circle_id, alert_type, entity_id)
  values (p_circle_id, p_alert_type, p_entity_id)
  on conflict (alert_type, entity_id) do nothing;
end;
$$;

grant execute on function public.mark_alert_sent(text, uuid, text, uuid) to anon;

create or replace function public.remove_push_subscription(p_secret text, p_endpoint text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_secret is null or p_secret <> (select value from public.app_secrets where key = 'cron_secret') then
    raise exception 'unauthorized';
  end if;

  delete from public.push_subscriptions where endpoint = p_endpoint;
end;
$$;

grant execute on function public.remove_push_subscription(text, text) to anon;
