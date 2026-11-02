// Pre-generated narration for daily stories (scripts/story-audio/generate_audio.py, migration 024).
// Stories without it, or whose text has changed since, are read in the browser's own voice.
import { cacheLife } from "next/cache";
import { splitSentences, type Story } from "@/data/stories";
import { createPublicClient } from "./supabase/admin";

const MEDIA_BUCKET = "lesson-media";

export interface StoryAudio {
  url: string;
  sentences: { text: string; start: number; end: number }[];
}

interface StoryAudioRow {
  audio_path: string;
  sentences: StoryAudio["sentences"];
}

async function readStoryAudio(storyId: string): Promise<StoryAudioRow | null> {
  "use cache";
  cacheLife("minutes");
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("story_audio").select("audio_path, sentences").eq("story_id", storyId).maybeSingle();
  return error ? null : (data as StoryAudioRow | null);
}

export async function getStoryAudio(story: Story): Promise<StoryAudio | null> {
  const row = await readStoryAudio(story.id);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!row || !supabaseUrl) return null;
  const texts = story.lines.flatMap((line) => splitSentences(line.text));
  const isCurrent = texts.length === row.sentences.length && texts.every((text, i) => text === row.sentences[i].text);
  return isCurrent ? { url: `${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/${row.audio_path}`, sentences: row.sentences } : null;
}
