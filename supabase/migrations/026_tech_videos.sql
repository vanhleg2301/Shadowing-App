-- YouTube videos for News > AI & Tech (scripts/import-tech-videos.ts). Their transcripts are in public.lessons like
-- every other video, but they are kept out of public.videos so they don't join the speed collections and courses.
create table if not exists public.tech_videos (
  video_id text primary key check (video_id ~ '^[A-Za-z0-9_-]{11}$'),
  title text not null,
  channel text not null,
  duration text not null,
  level text not null,
  published_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists tech_videos_published_idx on public.tech_videos (published_at desc);

alter table public.tech_videos enable row level security;

drop policy if exists "tech videos are public" on public.tech_videos;
create policy "tech videos are public" on public.tech_videos for select to anon, authenticated using (true);
