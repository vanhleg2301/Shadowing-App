-- Indexes for keyset paging (src/lib/keyset.ts): each page is "rows older than id X", newest first.
-- admin_audit and sign_in_events page by their identity id (the primary key index covers the plain
-- list); filtering sign-ins by event needs its own. My words reads a learner's words in batches by
-- (created_at, id). Run once in Supabase Dashboard -> SQL Editor.

create index if not exists sign_in_events_event_id_idx on public.sign_in_events (event, id desc);
create index if not exists saved_words_user_created_id_idx on public.saved_words (user_id, created_at desc, id desc);
