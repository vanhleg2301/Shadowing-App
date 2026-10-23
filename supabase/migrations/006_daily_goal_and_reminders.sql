-- Daily study goal (minutes per day) and push reminders.

alter table public.study_days
  add column if not exists seconds integer not null default 0 check (seconds >= 0 and seconds <= 86400);

create table if not exists public.user_settings (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  daily_goal_minutes integer not null default 15 check (daily_goal_minutes in (5, 10, 15, 20, 30, 45, 60)),
  reminders_enabled boolean not null default false,
  time_zone text not null default 'Asia/Ho_Chi_Minh' check (char_length(time_zone) <= 64),
  updated_at timestamptz not null default now()
);

create table if not exists public.push_subscriptions (
  endpoint text primary key check (char_length(endpoint) <= 1000),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  p256dh text not null check (char_length(p256dh) <= 200),
  auth text not null check (char_length(auth) <= 100),
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);

alter table public.user_settings enable row level security;
alter table public.push_subscriptions enable row level security;

create policy "user_settings_select_own" on public.user_settings for select to authenticated using (auth.uid() = user_id);
create policy "user_settings_insert_own" on public.user_settings for insert to authenticated with check (auth.uid() = user_id);
create policy "user_settings_update_own" on public.user_settings for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_settings_delete_own" on public.user_settings for delete to authenticated using (auth.uid() = user_id);

create policy "push_subscriptions_select_own" on public.push_subscriptions for select to authenticated using (auth.uid() = user_id);
create policy "push_subscriptions_insert_own" on public.push_subscriptions for insert to authenticated with check (auth.uid() = user_id);
create policy "push_subscriptions_update_own" on public.push_subscriptions for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "push_subscriptions_delete_own" on public.push_subscriptions for delete to authenticated using (auth.uid() = user_id);

-- Adds study time atomically, so two tabs reporting at once don't overwrite each other.
create or replace function public.add_study_seconds(p_day date, p_seconds integer)
returns void
language sql
security invoker
set search_path = public
as $$
  insert into public.study_days (user_id, day, activity, seconds)
  values (auth.uid(), p_day, 0, least(greatest(p_seconds, 0), 300))
  on conflict (user_id, day)
  do update set seconds = least(public.study_days.seconds + least(greatest(p_seconds, 0), 300), 86400);
$$;

revoke all on function public.add_study_seconds(date, integer) from public, anon;
grant execute on function public.add_study_seconds(date, integer) to authenticated;
