-- The app's video list in one query: published videos plus whether their transcript is stored.
-- Before this the app also downloaded every lesson's video_id to work that out. security_invoker keeps
-- the RLS of videos and lessons (both readable by everyone). Run once in Supabase Dashboard -> SQL Editor.

create or replace view public.catalog_videos
with (security_invoker = true) as
select
  v.video_id, v.title, v.level, v.topic, v.duration, v.channel, v.sort_order, v.collection_id,
  v.category, v.published_at,
  exists (select 1 from public.lessons l where l.video_id = v.video_id) as has_transcript
from public.videos v
where v.is_published;

grant select on public.catalog_videos to anon, authenticated;
