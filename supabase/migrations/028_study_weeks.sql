-- My plan: one video studied in depth each week, with the daily steps the learner has ticked off.
-- week_start is the Monday of the week in the learner's own time zone.
-- done maps a day (YYYY-MM-DD) to the steps finished that day, e.g. {"2026-11-23": ["dictation", "review"]}.
-- Run once in Supabase Dashboard -> SQL Editor.

create table if not exists public.study_weeks (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  week_start date not null,
  video_id text not null check (video_id ~ '^[A-Za-z0-9_-]{11}$'),
  title text not null check (char_length(title) between 1 and 300),
  done jsonb not null default '{}'::jsonb check (jsonb_typeof(done) = 'object' and pg_column_size(done) < 8000),
  updated_at timestamptz not null default now(),
  primary key (user_id, week_start)
);

alter table public.study_weeks enable row level security;

drop policy if exists "study_weeks_select_own" on public.study_weeks;
drop policy if exists "study_weeks_insert_own" on public.study_weeks;
drop policy if exists "study_weeks_update_own" on public.study_weeks;
drop policy if exists "study_weeks_delete_own" on public.study_weeks;
create policy "study_weeks_select_own" on public.study_weeks for select to authenticated using (auth.uid() = user_id);
create policy "study_weeks_insert_own" on public.study_weeks for insert to authenticated with check (auth.uid() = user_id);
create policy "study_weeks_update_own" on public.study_weeks for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "study_weeks_delete_own" on public.study_weeks for delete to authenticated using (auth.uid() = user_id);
