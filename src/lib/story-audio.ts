// Pre-generated narration for daily stories and grammar units (scripts/story-audio/generate_audio.py, migration 024).
// Texts without it, or whose text has changed since, are read in the browser's own voice.
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
  return getNarration(story.id, story.lines.map((line) => line.text));
}

// Narration stored under this id, if it still reads exactly these lines.
export async function getNarration(id: string, lines: string[]): Promise<StoryAudio | null> {
  const row = await readStoryAudio(id);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!row || !supabaseUrl) return null;
  const texts = lines.flatMap((line) => splitSentences(line));
  const isCurrent = texts.length === row.sentences.length && texts.every((text, i) => text === row.sentences[i].text);
  return isCurrent ? { url: `${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/${row.audio_path}`, sentences: row.sentences } : null;
}

// A recording of a list of lines, with where each line starts and ends (a line may be several sentences).
export interface LineNarration {
  url: string;
  // The lines, so one can be found by its text.
  texts: string[];
  lineTimes: { start: number; end: number }[];
}

export async function getLineNarration(id: string, lines: string[]): Promise<LineNarration | null> {
  const audio = await getNarration(id, lines).catch(() => null);
  if (!audio) return null;
  let sentence = 0;
  const lineTimes = lines.map((line) => {
    const count = splitSentences(line).length;
    const times = { start: audio.sentences[sentence].start, end: audio.sentences[sentence + count - 1].end };
    sentence += count;
    return times;
  });
  return { url: audio.url, texts: lines, lineTimes };
}
