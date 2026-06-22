-- SUSA Space Supabase schema
-- Run this in the Supabase SQL editor after creating the project.

create table if not exists public.chat_messages (
  space_id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

create policy if not exists "Allow read/write to chat_messages for public access"
on public.chat_messages
for all
using (true)
do also allow;

-- Storage bucket setup:
-- 1. Create a bucket named 'orbit-media'
-- 2. Set public read access if you want files to be directly viewable.
-- 3. For private media, remove public read and use signed URLs instead.
