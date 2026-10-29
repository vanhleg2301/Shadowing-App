-- Phrase search matches the exact words in order. The English dictionary in 018 dropped short words
-- ("on", "the", "by") and stemmed the rest, so "get on well" also found "get paid well" and
-- "by the way" found "both ways". The 'simple' configuration keeps every word as written.
-- Run once in Supabase Dashboard -> SQL Editor, after 018.

drop index if exists public.lesson_sentences_tsv_idx;
alter table public.lesson_sentences drop column if exists tsv;
alter table public.lesson_sentences add column tsv tsvector generated always as (to_tsvector('simple', text)) stored;
create index lesson_sentences_tsv_idx on public.lesson_sentences using gin (tsv);

create or replace function public.search_sentences(q text, max_results integer default 40)
returns table (video_id text, idx integer, start_sec real, text text, highlighted text, title text, collection_id text, category text, rank real)
language sql stable security invoker set search_path = public as $$
  with query as (select phraseto_tsquery('simple', left(q, 100)) as tsq)
  select s.video_id, s.idx, s.start_sec, s.text,
    ts_headline('simple', s.text, query.tsq, 'StartSel=[[, StopSel=]], HighlightAll=true'),
    v.title, v.collection_id, v.category, ts_rank(s.tsv, query.tsq)
  from public.lesson_sentences s
  join public.videos v on v.video_id = s.video_id and v.is_published
  cross join query
  where s.tsv @@ query.tsq
  order by ts_rank(s.tsv, query.tsq) desc, length(s.text), s.video_id, s.idx
  limit least(greatest(max_results, 1), 100);
$$;
