-- Articles for News > AI & Tech, republished from The Conversation under CC BY-ND
-- (scripts/tech-news/import_tech_news.py). Ids are 11 characters, so saved words use the same storage as lessons.
create table if not exists public.tech_articles (
  id text primary key check (id ~ '^tc-[0-9]{8}$'),
  title text not null,
  summary text not null,
  authors text[] not null,
  source_url text not null,
  counter_url text not null,
  published_at timestamptz not null,
  level text not null,
  word_count integer not null,
  blocks jsonb not null,
  disclosure text,
  created_at timestamptz not null default now()
);

create index if not exists tech_articles_published_idx on public.tech_articles (published_at desc);

alter table public.tech_articles enable row level security;

drop policy if exists "tech articles are public" on public.tech_articles;
create policy "tech articles are public" on public.tech_articles for select to anon, authenticated using (true);
