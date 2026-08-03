-- FamilyCare schema, RLS policies, and helper functions.
-- Run once in the Supabase SQL Editor (Studio -> SQL Editor -> New query -> paste -> Run).

-- ============================================================
-- Tables
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.care_circles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade unique,
  name text not null default 'Family Care',
  patient_name text,
  date_of_birth date,
  gender text check (gender in ('male', 'female', 'other', 'prefer_not_to_say')),
  preferred_language text,
  profile_notes text,
  food_preference text,
  drink_preference text,
  hobbies_interests text,
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relationship text,
  created_at timestamptz not null default now()
);

create table if not exists public.care_circle_members (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.care_circles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('editor', 'viewer')),
  created_at timestamptz not null default now(),
  unique (circle_id, user_id)
);

create table if not exists public.care_circle_invites (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.care_circles(id) on delete cascade,
  role text not null check (role in ('editor', 'viewer')),
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  revoked_at timestamptz,
  accepted_by uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz
);

create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.care_circles(id) on delete cascade,
  name text not null,
  dose_amount numeric,
  frequency text check (frequency in ('once_daily', 'twice_daily', 'thrice_daily', 'as_needed')),
  last_refill_balance numeric not null default 0,
  last_refill_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.care_circles(id) on delete cascade,
  title text not null,
  appointment_at timestamptz not null,
  location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.allergies (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.care_circles(id) on delete cascade,
  name text not null,
  severity text check (severity in ('low', 'medium', 'high')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.care_tasks (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.care_circles(id) on delete cascade,
  name text not null,
  schedule_type text not null check (schedule_type in ('ongoing', 'one_time')),
  recurrence text check (recurrence in ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly')),
  scheduled_at timestamptz,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (schedule_type = 'ongoing' and recurrence is not null and scheduled_at is null)
    or
    (schedule_type = 'one_time' and scheduled_at is not null and recurrence is null)
  )
);

create table if not exists public.dose_checklist (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid not null references public.medications(id) on delete cascade,
  checklist_date date not null default current_date,
  taken boolean not null default false,
  taken_by uuid references public.profiles(id) on delete set null,
  taken_at timestamptz,
  unique (medication_id, checklist_date)
);

-- Day-scoped "did we do this today" tracking for tasks, same idea as
-- dose_checklist -- checking it off never touches care_tasks.status.
create table if not exists public.task_checklist (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.care_tasks(id) on delete cascade,
  checklist_date date not null default current_date,
  done boolean not null default false,
  done_by uuid references public.profiles(id) on delete set null,
  done_at timestamptz,
  unique (task_id, checklist_date)
);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.care_circles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  entity_type text,
  entity_id uuid,
  detail text,
  created_at timestamptz not null default now()
);

-- Free-text app feedback, not scoped to any circle. No select policy/grant
-- below -- there's no in-app list/admin view; review it in Supabase directly.
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text check (category in ('bug', 'idea', 'compliment', 'other')),
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_members_circle on public.care_circle_members(circle_id);
create index if not exists idx_invites_circle on public.care_circle_invites(circle_id);
create index if not exists idx_medications_circle on public.medications(circle_id);
create index if not exists idx_appointments_circle on public.appointments(circle_id);
create index if not exists idx_allergies_circle on public.allergies(circle_id);
create index if not exists idx_care_tasks_circle on public.care_tasks(circle_id);
create index if not exists idx_checklist_medication on public.dose_checklist(medication_id);
create index if not exists idx_task_checklist_task on public.task_checklist(task_id);
create index if not exists idx_activity_circle on public.activity_log(circle_id, created_at desc);
create index if not exists idx_feedback_user on public.feedback(user_id);

-- ============================================================
-- updated_at trigger
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_medications_updated_at on public.medications;
create trigger trg_medications_updated_at before update on public.medications
  for each row execute function public.set_updated_at();

drop trigger if exists trg_appointments_updated_at on public.appointments;
create trigger trg_appointments_updated_at before update on public.appointments
  for each row execute function public.set_updated_at();

drop trigger if exists trg_allergies_updated_at on public.allergies;
create trigger trg_allergies_updated_at before update on public.allergies
  for each row execute function public.set_updated_at();

drop trigger if exists trg_care_tasks_updated_at on public.care_tasks;
create trigger trg_care_tasks_updated_at before update on public.care_tasks
  for each row execute function public.set_updated_at();

-- ============================================================
-- Derived, never-mutated medication balance
-- current_balance = last_refill_balance minus (dose_amount * doses per day)
-- times days elapsed since the last refill/top-up. Nothing ever writes to
-- this; only a manual top-up resets last_refill_balance/last_refill_at.
-- ============================================================

create or replace view public.medications_with_balance
with (security_invoker = true) as
select
  m.*,
  greatest(
    0,
    m.last_refill_balance
      - coalesce(m.dose_amount, 0)
        * case m.frequency
            when 'once_daily' then 1
            when 'twice_daily' then 2
            when 'thrice_daily' then 3
            else 0
          end
        * extract(epoch from (now() - m.last_refill_at)) / 86400.0
  ) as current_balance
from public.medications m;

grant select on public.medications_with_balance to authenticated;

-- ============================================================
-- Role helper (security definer avoids recursive RLS lookups)
-- ============================================================

create or replace function public.user_circle_role(p_circle_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select case
    when exists (
      select 1 from public.care_circles c
      where c.id = p_circle_id and c.owner_id = auth.uid()
    ) then 'owner'
    else (
      select m.role from public.care_circle_members m
      where m.circle_id = p_circle_id and m.user_id = auth.uid()
    )
  end
$$;

grant execute on function public.user_circle_role(uuid) to authenticated;

-- ============================================================
-- RLS
-- ============================================================

alter table public.profiles enable row level security;
alter table public.care_circles enable row level security;
alter table public.care_circle_members enable row level security;
alter table public.care_circle_invites enable row level security;
alter table public.medications enable row level security;
alter table public.appointments enable row level security;
alter table public.allergies enable row level security;
alter table public.care_tasks enable row level security;
alter table public.dose_checklist enable row level security;
alter table public.task_checklist enable row level security;
alter table public.activity_log enable row level security;
alter table public.feedback enable row level security;

-- RLS policies restrict rows, but Postgres also requires base table-level
-- privileges before it evaluates them at all.
grant select, insert, update, delete on
  public.profiles,
  public.care_circles,
  public.care_circle_members,
  public.care_circle_invites,
  public.medications,
  public.appointments,
  public.allergies,
  public.care_tasks,
  public.dose_checklist,
  public.task_checklist,
  public.activity_log
to authenticated;

-- feedback: insert-only, no select grant -- there's no in-app read path
grant insert on public.feedback to authenticated;

-- profiles (lets circle-mates see each other's email for member lists / activity log)
create policy "profile visible to circle-mates" on public.profiles
  for select using (
    id = auth.uid()
    or exists (
      select 1
      from public.care_circles c
      left join public.care_circle_members m on m.circle_id = c.id
      where (c.owner_id = profiles.id or m.user_id = profiles.id)
        and public.user_circle_role(c.id) is not null
    )
  );

-- care_circles
create policy "circle visible to owner or member" on public.care_circles
  for select using (owner_id = auth.uid() or public.user_circle_role(id) is not null);
create policy "circle created by owner" on public.care_circles
  for insert with check (owner_id = auth.uid());
create policy "circle updatable by editor+" on public.care_circles
  for update using (public.user_circle_role(id) in ('owner', 'editor'));

-- care_circle_members
create policy "members visible to circle" on public.care_circle_members
  for select using (public.user_circle_role(circle_id) is not null);
create policy "owner revokes member" on public.care_circle_members
  for delete using (public.user_circle_role(circle_id) = 'owner');

-- care_circle_invites (no direct anon/invitee access -- see get_invite_info/accept_invite below)
create policy "owner manages invites" on public.care_circle_invites
  for select using (public.user_circle_role(circle_id) = 'owner');
create policy "owner creates invites" on public.care_circle_invites
  for insert with check (public.user_circle_role(circle_id) = 'owner' and created_by = auth.uid());
create policy "owner revokes invites" on public.care_circle_invites
  for update using (public.user_circle_role(circle_id) = 'owner');

-- medications / appointments / allergies: viewers read, editors+owner write
create policy "care items readable by circle" on public.medications
  for select using (public.user_circle_role(circle_id) is not null);
create policy "care items writable by editor+" on public.medications
  for insert with check (public.user_circle_role(circle_id) in ('owner', 'editor'));
create policy "care items updatable by editor+" on public.medications
  for update using (public.user_circle_role(circle_id) in ('owner', 'editor'));
create policy "care items deletable by editor+" on public.medications
  for delete using (public.user_circle_role(circle_id) in ('owner', 'editor'));

create policy "appointments readable by circle" on public.appointments
  for select using (public.user_circle_role(circle_id) is not null);
create policy "appointments writable by editor+" on public.appointments
  for insert with check (public.user_circle_role(circle_id) in ('owner', 'editor'));
create policy "appointments updatable by editor+" on public.appointments
  for update using (public.user_circle_role(circle_id) in ('owner', 'editor'));
create policy "appointments deletable by editor+" on public.appointments
  for delete using (public.user_circle_role(circle_id) in ('owner', 'editor'));

create policy "allergies readable by circle" on public.allergies
  for select using (public.user_circle_role(circle_id) is not null);
create policy "allergies writable by editor+" on public.allergies
  for insert with check (public.user_circle_role(circle_id) in ('owner', 'editor'));
create policy "allergies updatable by editor+" on public.allergies
  for update using (public.user_circle_role(circle_id) in ('owner', 'editor'));
create policy "allergies deletable by editor+" on public.allergies
  for delete using (public.user_circle_role(circle_id) in ('owner', 'editor'));

create policy "care tasks readable by circle" on public.care_tasks
  for select using (public.user_circle_role(circle_id) is not null);
create policy "care tasks writable by editor+" on public.care_tasks
  for insert with check (public.user_circle_role(circle_id) in ('owner', 'editor'));
create policy "care tasks updatable by editor+" on public.care_tasks
  for update using (public.user_circle_role(circle_id) in ('owner', 'editor'));
create policy "care tasks deletable by editor+" on public.care_tasks
  for delete using (public.user_circle_role(circle_id) in ('owner', 'editor'));

-- dose_checklist: any circle member (including viewers) can confirm a dose was taken
create policy "checklist readable by circle" on public.dose_checklist
  for select using (
    exists (
      select 1 from public.medications m
      where m.id = medication_id and public.user_circle_role(m.circle_id) is not null
    )
  );
create policy "checklist writable by circle" on public.dose_checklist
  for insert with check (
    exists (
      select 1 from public.medications m
      where m.id = medication_id and public.user_circle_role(m.circle_id) is not null
    )
  );
create policy "checklist updatable by circle" on public.dose_checklist
  for update using (
    exists (
      select 1 from public.medications m
      where m.id = medication_id and public.user_circle_role(m.circle_id) is not null
    )
  );

-- task_checklist: any circle member (including viewers) can confirm a task was done
create policy "task checklist readable by circle" on public.task_checklist
  for select using (
    exists (
      select 1 from public.care_tasks t
      where t.id = task_id and public.user_circle_role(t.circle_id) is not null
    )
  );
create policy "task checklist writable by circle" on public.task_checklist
  for insert with check (
    exists (
      select 1 from public.care_tasks t
      where t.id = task_id and public.user_circle_role(t.circle_id) is not null
    )
  );
create policy "task checklist updatable by circle" on public.task_checklist
  for update using (
    exists (
      select 1 from public.care_tasks t
      where t.id = task_id and public.user_circle_role(t.circle_id) is not null
    )
  );

-- activity_log: owner + editors can read; any member can log their own action
create policy "activity readable by owner+editor" on public.activity_log
  for select using (public.user_circle_role(circle_id) in ('owner', 'editor'));
create policy "activity insertable by self" on public.activity_log
  for insert with check (user_id = auth.uid() and public.user_circle_role(circle_id) is not null);

-- feedback: insert-only, no select policy -- reviewed directly in Supabase
create policy "feedback insertable by self" on public.feedback
  for insert with check (user_id = auth.uid());

-- ============================================================
-- RPCs: circle bootstrap + invite accept flow
-- ============================================================

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

-- Safe single-row lookup by unguessable token; never lists invites.
create or replace function public.get_invite_info(p_token uuid)
returns table(circle_id uuid, circle_name text, role text, valid boolean)
language sql
security definer
set search_path = public
stable
as $$
  select
    i.circle_id,
    c.name,
    i.role,
    (i.revoked_at is null and i.expires_at > now() and i.accepted_by is null) as valid
  from public.care_circle_invites i
  join public.care_circles c on c.id = i.circle_id
  where i.id = p_token
$$;

grant execute on function public.get_invite_info(uuid) to anon, authenticated;

create or replace function public.accept_invite(p_token uuid)
returns table(circle_id uuid, role text)
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

-- ============================================================
-- Keep profiles.email/phone synced with auth.users (phone lets users
-- without an email address sign in via SMS OTP instead)
-- ============================================================

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
create trigger on_auth_user_created
  after insert or update of email, phone on auth.users
  for each row execute function public.handle_user_profile_sync();

insert into public.profiles (id, email, phone)
select id, email, phone from auth.users
on conflict (id) do update set email = excluded.email, phone = excluded.phone;
