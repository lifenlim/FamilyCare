-- Free-text app feedback from signed-in users. No list/admin view in the
-- app by design -- review submissions directly in the Supabase table
-- editor, hence no select policy or grant.

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text check (category in ('bug', 'idea', 'compliment', 'other')),
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_feedback_user on public.feedback(user_id);

alter table public.feedback enable row level security;

grant insert on public.feedback to authenticated;

create policy "feedback insertable by self" on public.feedback
  for insert with check (user_id = auth.uid());
