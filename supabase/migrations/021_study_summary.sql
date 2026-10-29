-- Streak and study stats computed in the database in one call, instead of downloading every study day
-- (capped at 400-1000 rows, so long histories were cut off) and counting in the app.
-- Runs as the caller (security invoker), so RLS limits it to the signed-in learner's own rows.
-- Run once in Supabase Dashboard -> SQL Editor.

create or replace function public.get_study_summary(today date, mastered_interval integer default 21, recent_days integer default 90)
returns jsonb
language sql stable security invoker set search_path = public as $$
  with days as (
    select day, seconds from public.study_days where user_id = auth.uid()
  ),
  -- Gaps and islands: consecutive days share the same (day - row number).
  islands as (
    select max(day) as last_day, count(*)::integer as length
    from (select day, day - (row_number() over (order by day))::integer as grp from days) numbered
    group by grp
  )
  select jsonb_build_object(
    'current_streak', coalesce((select length from islands where last_day in (today, today - 1) order by last_day desc limit 1), 0),
    'longest_streak', coalesce((select max(length) from islands), 0),
    'studied_today', exists (select 1 from days where day = today),
    'total_seconds', coalesce((select sum(seconds) from days), 0),
    'active_days', (select count(*) from days),
    'recent', coalesce((select jsonb_object_agg(day::text, seconds) from days where day > today - recent_days), '{}'::jsonb),
    'lessons_completed', (select count(*) from public.lesson_progress where user_id = auth.uid() and completed_at is not null),
    'words_saved', (select count(*) from public.saved_words where user_id = auth.uid()),
    'words_mastered', (select count(*) from public.saved_words where user_id = auth.uid() and interval_days >= mastered_interval),
    'words_due', (select count(*) from public.saved_words where user_id = auth.uid() and due_at <= now()),
    'goal_minutes', (select daily_goal_minutes from public.user_settings where user_id = auth.uid())
  );
$$;

grant execute on function public.get_study_summary(date, integer, integer) to authenticated;
