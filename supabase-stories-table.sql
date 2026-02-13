-- Run this in Supabase Dashboard → SQL Editor → New query, then Run.

-- Table for saved stories (per user)
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  config jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Only allow access to your own rows
alter table public.stories enable row level security;

create policy "Users manage own stories"
  on public.stories
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Optional: index for listing by user and date
create index if not exists stories_user_updated_idx on public.stories (user_id, updated_at desc);

