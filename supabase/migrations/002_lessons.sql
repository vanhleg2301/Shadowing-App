-- Stored transcripts, so lessons don't depend on fetching YouTube captions at request time
-- (YouTube usually blocks that from cloud servers). Filled by scripts/seed-lessons.ts.
-- Run once in Supabase Dashboard -> SQL Editor.

create table if not exists public.lessons (
  video_id text primary key check (video_id ~ '^[A-Za-z0-9_-]{11}$'),
  title text not null,
  author text not null,
  duration_sec integer not null default 0,
  -- [{ start, end, text, translation? }] in seconds, one entry per sentence.
  sentences jsonb not null,
  has_translation boolean not null default false,
  caption_source text not null check (caption_source in ('human', 'asr')),
  updated_at timestamptz not null default now()
);

alter table public.lessons enable row level security;

-- Anyone may read lessons; only the service role (seed script, server) can write, which bypasses RLS.
create policy "lessons_select_all" on public.lessons for select to anon, authenticated using (true);
