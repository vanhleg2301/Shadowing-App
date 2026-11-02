-- Pre-generated narration for daily stories (scripts/story-audio/generate_audio.py). The MP3 lives in the
-- public lesson-media bucket; this row holds its path and the time of each sentence.
create table if not exists public.story_audio (
  story_id text primary key,
  audio_path text not null,
  text_hash text not null,
  sentences jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.story_audio enable row level security;

drop policy if exists "story audio is public" on public.story_audio;
create policy "story audio is public" on public.story_audio for select to anon, authenticated using (true);
