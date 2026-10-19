-- Spaced-repetition review for saved words, per-lesson progress and daily study streaks.
-- Run once in Supabase Dashboard -> SQL Editor.

-- 1. Review schedule on saved words (simplified SM-2). New words are due immediately.
alter table public.saved_words
  add column if not exists due_at timestamptz not null default now(),
  add column if not exists interval_days real not null default 0,
  add column if not exists ease real not null default 2.5,
  add column if not exists reps integer not null default 0,
  add column if not exists lapses integer not null default 0,
  add column if not exists last_reviewed_at timestamptz;

create index if not exists saved_words_user_due_idx on public.saved_words (user_id, due_at);

-- 2. Where the learner is in each lesson (for "continue" and progress bars).
create table if not exists public.lesson_progress (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  video_id text not null check (video_id ~ '^[A-Za-z0-9_-]{11}$'),
  last_sentence integer not null default 0 check (last_sentence >= 0),
  max_sentence integer not null default 0 check (max_sentence >= 0),
  sentence_count integer not null default 0 check (sentence_count >= 0),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

create index if not exists lesson_progress_user_updated_idx on public.lesson_progress (user_id, updated_at desc);

-- 3. One row per day the learner studied, in their own time zone (for the streak).
create table if not exists public.study_days (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null,
  activity integer not null default 0 check (activity >= 0),
  primary key (user_id, day)
);

alter table public.lesson_progress enable row level security;
alter table public.study_days enable row level security;

create policy "lesson_progress_select_own" on public.lesson_progress for select to authenticated using (auth.uid() = user_id);
create policy "lesson_progress_insert_own" on public.lesson_progress for insert to authenticated with check (auth.uid() = user_id);
create policy "lesson_progress_update_own" on public.lesson_progress for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "lesson_progress_delete_own" on public.lesson_progress for delete to authenticated using (auth.uid() = user_id);

create policy "study_days_select_own" on public.study_days for select to authenticated using (auth.uid() = user_id);
create policy "study_days_insert_own" on public.study_days for insert to authenticated with check (auth.uid() = user_id);
create policy "study_days_update_own" on public.study_days for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "study_days_delete_own" on public.study_days for delete to authenticated using (auth.uid() = user_id);
