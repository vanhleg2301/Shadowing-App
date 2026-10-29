-- Full-text search over every transcript sentence: type a phrase ("get on well") and find the videos and
-- the exact sentences that use it. One row per sentence, kept in sync with public.lessons by a trigger.
-- Run once in Supabase Dashboard -> SQL Editor.

create table if not exists public.lesson_sentences (
  video_id text not null references public.lessons (video_id) on delete cascade,
  idx integer not null,
  start_sec real not null,
  text text not null,
  tsv tsvector generated always as (to_tsvector('english', text)) stored,
  primary key (video_id, idx)
);

create index if not exists lesson_sentences_tsv_idx on public.lesson_sentences using gin (tsv);

alter table public.lesson_sentences enable row level security;
drop policy if exists "lesson_sentences_select_all" on public.lesson_sentences;
create policy "lesson_sentences_select_all" on public.lesson_sentences for select to anon, authenticated using (true);

-- Rebuilds a lesson's rows whenever its transcript is written (seed script, VOA import, admin).
create or replace function public.sync_lesson_sentences() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from public.lesson_sentences where video_id = new.video_id;
  insert into public.lesson_sentences (video_id, idx, start_sec, text)
  select new.video_id, (s.ord - 1)::integer, coalesce((s.value ->> 'start')::real, 0), s.value ->> 'text'
  from jsonb_array_elements(new.sentences) with ordinality as s(value, ord)
  where coalesce(s.value ->> 'text', '') <> '';
  return new;
end;
$$;

drop trigger if exists lessons_sync_sentences on public.lessons;
create trigger lessons_sync_sentences
  after insert or update of sentences on public.lessons
  for each row execute function public.sync_lesson_sentences();

-- Backfill the transcripts stored so far.
insert into public.lesson_sentences (video_id, idx, start_sec, text)
select l.video_id, (s.ord - 1)::integer, coalesce((s.value ->> 'start')::real, 0), s.value ->> 'text'
from public.lessons l, jsonb_array_elements(l.sentences) with ordinality as s(value, ord)
where coalesce(s.value ->> 'text', '') <> ''
on conflict (video_id, idx) do nothing;

-- Sentences matching the words in order (phrase search), best matches first, from published videos only.
-- The match is wrapped in [[ ]] so the app can highlight it without rendering HTML.
create or replace function public.search_sentences(q text, max_results integer default 40)
returns table (video_id text, idx integer, start_sec real, text text, highlighted text, title text, collection_id text, category text, rank real)
language sql stable security invoker set search_path = public as $$
  with query as (select phraseto_tsquery('english', left(q, 100)) as tsq)
  select s.video_id, s.idx, s.start_sec, s.text,
    ts_headline('english', s.text, query.tsq, 'StartSel=[[, StopSel=]], HighlightAll=true'),
    v.title, v.collection_id, v.category, ts_rank(s.tsv, query.tsq)
  from public.lesson_sentences s
  join public.videos v on v.video_id = s.video_id and v.is_published
  cross join query
  where s.tsv @@ query.tsq
  order by ts_rank(s.tsv, query.tsq) desc, length(s.text), s.video_id, s.idx
  limit least(greatest(max_results, 1), 100);
$$;

grant execute on function public.search_sentences(text, integer) to anon, authenticated;
