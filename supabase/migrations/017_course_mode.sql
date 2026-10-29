-- The 7-day course plan a learner picked (full or Gentle), so it follows them to other devices.
alter table public.user_settings
  add column if not exists course_mode text not null default 'full' check (course_mode in ('full', 'gentle'));
