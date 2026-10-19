-- Favorite videos and the learner's personal word list.
-- Run once in Supabase Dashboard -> SQL Editor.

create table if not exists public.favorites (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  video_id text not null check (video_id ~ '^[A-Za-z0-9_-]{11}$'),
  title text not null check (char_length(title) <= 300),
  created_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

create index if not exists favorites_user_created_idx on public.favorites (user_id, created_at desc);

create table if not exists public.saved_words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  word text not null check (char_length(word) between 1 and 60),
  sentence text not null default '' check (char_length(sentence) <= 500),
  video_id text check (video_id ~ '^[A-Za-z0-9_-]{11}$'),
  -- Snapshot of the dictionary entry shown when the word was saved (meanings, IPA, phrases).
  entry jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, word)
);

create index if not exists saved_words_user_created_idx on public.saved_words (user_id, created_at desc);

alter table public.favorites enable row level security;
alter table public.saved_words enable row level security;

-- Each learner can only see and change their own rows.
create policy "favorites_select_own" on public.favorites for select to authenticated using (auth.uid() = user_id);
create policy "favorites_insert_own" on public.favorites for insert to authenticated with check (auth.uid() = user_id);
create policy "favorites_update_own" on public.favorites for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "favorites_delete_own" on public.favorites for delete to authenticated using (auth.uid() = user_id);

create policy "saved_words_select_own" on public.saved_words for select to authenticated using (auth.uid() = user_id);
create policy "saved_words_insert_own" on public.saved_words for insert to authenticated with check (auth.uid() = user_id);
create policy "saved_words_update_own" on public.saved_words for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "saved_words_delete_own" on public.saved_words for delete to authenticated using (auth.uid() = user_id);
