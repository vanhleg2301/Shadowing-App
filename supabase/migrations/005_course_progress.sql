-- Progress through structured courses (first one: "Speak A2 in 7 days"). One row per finished block.
-- Run once in Supabase Dashboard -> SQL Editor.

create table if not exists public.course_progress (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  course_id text not null check (char_length(course_id) between 1 and 40),
  day integer not null check (day between 1 and 60),
  block_id text not null check (char_length(block_id) between 1 and 40),
  completed_at timestamptz not null default now(),
  primary key (user_id, course_id, day, block_id)
);

alter table public.course_progress enable row level security;

create policy "course_progress_select_own" on public.course_progress for select to authenticated using (auth.uid() = user_id);
create policy "course_progress_insert_own" on public.course_progress for insert to authenticated with check (auth.uid() = user_id);
create policy "course_progress_update_own" on public.course_progress for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "course_progress_delete_own" on public.course_progress for delete to authenticated using (auth.uid() = user_id);
