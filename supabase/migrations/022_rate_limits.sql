-- Fixed-window rate limits shared by every server instance: one counter row per (key, window).
-- Only the server (service role) calls hit_rate_limit; learners can't read or write the table.
-- Run once in Supabase Dashboard -> SQL Editor.

create table if not exists public.rate_limits (
  key text not null check (char_length(key) <= 120),
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (key, window_start)
);

alter table public.rate_limits enable row level security;

-- Counts one hit for key in the current window and returns true while it is within the limit.
-- The upsert is atomic, so parallel requests can't both slip under the limit.
create or replace function public.hit_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql security definer set search_path = public as $$
declare
  started timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  total integer;
begin
  insert into public.rate_limits as r (key, window_start, hits)
  values (p_key, started, 1)
  on conflict (key, window_start) do update set hits = r.hits + 1
  returning r.hits into total;

  -- Old windows are only clutter; sweep them now and then.
  if random() < 0.01 then
    delete from public.rate_limits where window_start < now() - interval '2 days';
  end if;

  return total <= p_limit;
end;
$$;

revoke execute on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;
