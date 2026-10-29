-- News tab: VOA Learning English news lessons (As It Is, Science & Technology, Health & Lifestyle, Arts &
-- Culture) get a category and their publishing date, so the app can list them newest first.
-- The import job fills both. Run once in Supabase Dashboard -> SQL Editor, before deploying the News tab.

alter table public.videos add column if not exists category text check (category is null or char_length(category) between 1 and 40);
alter table public.videos add column if not exists published_at timestamptz;

create index if not exists videos_news_idx on public.videos (published_at desc) where category is not null;
