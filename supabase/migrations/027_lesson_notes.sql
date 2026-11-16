-- One Markdown note per learner per lesson (video, course day, grammar unit, story, AI & Tech article).
-- title and href are copied from the lesson so My notes can list them without looking each lesson up.
-- Run once in Supabase Dashboard -> SQL Editor.

create table if not exists public.lesson_notes (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  lesson_key text not null check (char_length(lesson_key) between 3 and 80),
  title text not null check (char_length(title) between 1 and 200),
  href text not null check (char_length(href) between 1 and 200 and href like '/%'),
  content text not null check (char_length(content) between 1 and 20000),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_key)
);

create index if not exists lesson_notes_user_updated_idx on public.lesson_notes (user_id, updated_at desc);

alter table public.lesson_notes enable row level security;

drop policy if exists "lesson_notes_select_own" on public.lesson_notes;
drop policy if exists "lesson_notes_insert_own" on public.lesson_notes;
drop policy if exists "lesson_notes_update_own" on public.lesson_notes;
drop policy if exists "lesson_notes_delete_own" on public.lesson_notes;
create policy "lesson_notes_select_own" on public.lesson_notes for select to authenticated using (auth.uid() = user_id);
create policy "lesson_notes_insert_own" on public.lesson_notes for insert to authenticated with check (auth.uid() = user_id);
create policy "lesson_notes_update_own" on public.lesson_notes for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "lesson_notes_delete_own" on public.lesson_notes for delete to authenticated using (auth.uid() = user_id);
