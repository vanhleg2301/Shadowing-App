-- Sign-in history for Admin -> Sign-ins: successful and failed sign-ins and sign-outs, from now on.
-- Stores the device (browser and OS) and country, never the IP address. Only the server writes and
-- reads it, with the service role key, so there are no RLS policies for learners.
-- Run once in Supabase Dashboard -> SQL Editor.

create table if not exists public.sign_in_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  email text,
  event text not null check (event in ('sign_in', 'sign_in_failed', 'sign_out')),
  device text check (device is null or char_length(device) <= 80),
  country text check (country is null or char_length(country) <= 8),
  detail text check (detail is null or char_length(detail) <= 200),
  created_at timestamptz not null default now()
);

create index if not exists sign_in_events_created_idx on public.sign_in_events (created_at desc);
create index if not exists sign_in_events_user_idx on public.sign_in_events (user_id, created_at desc);

alter table public.sign_in_events enable row level security;
