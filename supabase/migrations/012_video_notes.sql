-- Notes a learner writes while listening, pinned to a moment in the video. Used mainly for videos whose
-- transcript isn't stored yet (listen-and-note mode). Run once in Supabase Dashboard -> SQL Editor.

create table if not exists public.video_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  video_id text not null check (char_length(video_id) = 11),
  at_sec numeric(8, 1) not null check (at_sec >= 0),
  text text not null check (char_length(text) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists video_notes_user_video_idx on public.video_notes (user_id, video_id, at_sec);

alter table public.video_notes enable row level security;

create policy "video_notes_select_own" on public.video_notes for select to authenticated using (auth.uid() = user_id);
create policy "video_notes_insert_own" on public.video_notes for insert to authenticated with check (auth.uid() = user_id);
create policy "video_notes_update_own" on public.video_notes for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "video_notes_delete_own" on public.video_notes for delete to authenticated using (auth.uid() = user_id);
