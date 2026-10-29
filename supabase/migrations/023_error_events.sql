-- Server errors from every route, page and server action (src/instrumentation.ts), shown in
-- Admin -> Errors. Written and read only with the service role. Run once in Supabase SQL Editor.

create table if not exists public.error_events (
  id bigint generated always as identity primary key,
  route_type text not null check (char_length(route_type) <= 20),
  route_path text not null check (char_length(route_path) <= 200),
  path text not null check (char_length(path) <= 300),
  method text not null check (char_length(method) <= 10),
  message text not null check (char_length(message) <= 1000),
  digest text check (digest is null or char_length(digest) <= 100),
  stack text check (stack is null or char_length(stack) <= 4000),
  created_at timestamptz not null default now()
);

create index if not exists error_events_created_idx on public.error_events (created_at desc);

alter table public.error_events enable row level security;
