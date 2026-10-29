-- App-wide settings changed from the admin panel; first one: the colour palette (Admin -> Theme).
-- Everyone can read them (the app needs the palette before sign-in); only the server, with the
-- service role key after checking the admin, can write. Run once in Supabase Dashboard -> SQL Editor.

create table if not exists public.app_settings (
  key text primary key check (char_length(key) between 1 and 40),
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

alter table public.app_settings enable row level security;

create policy "app_settings_read_all" on public.app_settings for select to anon, authenticated using (true);
