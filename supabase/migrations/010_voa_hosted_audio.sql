-- VOA Learning English collection: lessons with audio hosted in Supabase Storage instead of YouTube,
-- imported by the "Import VOA lessons" GitHub Action (scripts/voa/import_voa.py), which also inserts the
-- videos and lessons rows. Run once in Supabase Dashboard -> SQL Editor.

insert into public.collections (id, name, sort_order) values
  ('voa', 'VOA Learning English', 6)
on conflict (id) do nothing;

-- 'aligned': the publisher's own transcript, timed against the audio with Whisper.
alter table public.lessons drop constraint if exists lessons_caption_source_check;
alter table public.lessons
  add constraint lessons_caption_source_check check (caption_source in ('human', 'asr', 'aligned'));

-- Public bucket: anyone can read the files, only the service role (the import job) can write them.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('lesson-media', 'lesson-media', true, 20971520, array['audio/mpeg', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
