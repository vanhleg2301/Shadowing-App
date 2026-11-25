-- News articles from more sections of The Conversation (World, Health, Environment, ...), not only AI.
-- Articles imported before this are all from the AI feed, so they get "AI & Tech".
alter table public.tech_articles add column if not exists topic text not null default 'AI & Tech';

create index if not exists tech_articles_topic_published_idx on public.tech_articles (topic, published_at desc);
