// Fetches and parses YouTube captions. Kept free of Next.js imports so scripts/seed-lessons.ts can reuse it.
import type { Lesson, Sentence } from "./lesson";
import { CUE_TIMED_LIMITS, WORD_TIMED_LIMITS, endsSentence, segmentWords, spreadCueWords, type TimedWord } from "./segment";

// Unofficial endpoint (the official Data API only serves captions to the video owner).
// The ANDROID client returns caption URLs without needing a PO token.
const PLAYER_URL = "https://www.youtube.com/youtubei/v1/player?prettyPrint=false";
const CLIENT = { clientName: "ANDROID", clientVersion: "20.10.38", androidSdkVersion: 30, hl: "en" };

interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
  kind?: string;
}

interface PlayerResponse {
  playabilityStatus?: { status: string };
  videoDetails?: { title: string; author: string; lengthSeconds: string };
  captions?: { playerCaptionsTracklistRenderer?: { captionTracks?: CaptionTrack[] } };
}

interface Json3 {
  events?: { tStartMs: number; dDurationMs?: number; aAppend?: number; segs?: { utf8: string; tOffsetMs?: number }[] }[];
}

interface Cue {
  start: number;
  end: number;
  text: string;
}

export const NO_SUBTITLES_ERROR = "This video has no English subtitles yet";

export type CaptionSource = "human" | "asr";

export type YouTubeLessonResult =
  | { lesson: Lesson; source: CaptionSource; error?: never }
  | { lesson?: never; source?: never; error: string };

// Captions often start with credits (TED) or sound tags like [Music], which are not speech.
const NON_SPEECH_CUE = /^[[(][^\])]*[\])]$|\b(Transcriber|Translator|Reviewer):/;

// YouTube sometimes holds a throttled connection open instead of answering.
const FETCH_TIMEOUT_MS = 20_000;

async function fetchPlayer(videoId: string): Promise<PlayerResponse> {
  const res = await fetch(PLAYER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context: { client: CLIENT }, videoId }),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`YouTube player request failed: ${res.status}`);
  return res.json();
}

async function fetchJson3(track: CaptionTrack): Promise<Json3> {
  const url = `${track.baseUrl.replace(/&fmt=[^&]*/, "")}&fmt=json3`;
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`Caption request failed: ${res.status}`);
  return res.json();
}

async function fetchCues(track: CaptionTrack): Promise<Cue[]> {
  const data = await fetchJson3(track);
  const cues: Cue[] = [];
  for (const event of data.events ?? []) {
    if (!event.segs || event.aAppend) continue;
    const text = event.segs.map((s) => s.utf8).join("").replace(/\s+/g, " ").trim();
    if (!text || NON_SPEECH_CUE.test(text)) continue;
    const start = event.tStartMs / 1000;
    cues.push({ start, end: start + (event.dDurationMs ?? 0) / 1000, text });
  }
  return cues;
}

function formatAsrPhrase(words: string[], startsSentence: boolean): string {
  const text = words.join(" ").replace(/i/g, "I").replace(/i'/g, "I'");
  return startsSentence ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

// Auto-generated tracks carry a timestamp per word, which lets us cut phrases at natural pauses.
async function fetchAsrSentences(track: CaptionTrack): Promise<Sentence[]> {
  const data = await fetchJson3(track);
  const words: TimedWord[] = [];
  for (const event of data.events ?? []) {
    if (!event.segs || event.aAppend) continue;
    for (const seg of event.segs) {
      const text = seg.utf8.trim();
      if (!text || NON_SPEECH_CUE.test(text)) continue;
      words.push({ start: (event.tStartMs + (seg.tOffsetMs ?? 0)) / 1000, text });
    }
  }

  // Newer auto captions include punctuation; segmentWords cuts at sentence ends, then at natural pauses.
  const chunks = segmentWords(words, WORD_TIMED_LIMITS);
  const hasPunctuation = words.some((w) => endsSentence(w.text));
  return chunks.map((chunk, i) => {
    const text = formatAsrPhrase(
      chunk.map((w) => w.text),
      i === 0 || endsSentence(chunks[i - 1][chunks[i - 1].length - 1].text) || !hasPunctuation,
    );
    const wordStarts = chunk.map((w) => Math.round(w.start * 100) / 100);
    return {
      start: chunk[0].start,
      end: chunks[i + 1]?.[0].start ?? chunk[chunk.length - 1].start + 1,
      text,
      // Only kept when every token lines up with one timed word.
      ...(text.split(/\s+/).length === wordStarts.length ? { wordStarts } : {}),
    };
  });
}

// Caption cues are line fragments that can hold the end of one sentence and the start of the next, so
// their words are cut again into whole sentences (src/lib/segment.ts).
function mergeIntoSentences(cues: Cue[]): Sentence[] {
  const chunks = segmentWords(spreadCueWords(cues), CUE_TIMED_LIMITS);
  const lastEnd = cues.length > 0 ? cues[cues.length - 1].end : 0;
  return chunks.map((chunk, i) => ({
    start: chunk[0].start,
    end: chunks[i + 1]?.[0].start ?? Math.max(lastEnd, chunk[chunk.length - 1].start + 0.5),
    text: chunk.map((w) => w.text).join(" "),
  }));
}

function attachTranslations(sentences: Sentence[], translated: Cue[]) {
  for (const sentence of sentences) {
    const parts = translated
      .filter((c) => {
        const mid = (c.start + c.end) / 2;
        return mid >= sentence.start && mid < sentence.end;
      })
      .map((c) => c.text);
    if (parts.length > 0) sentence.translation = parts.join(" ");
  }
}

export async function fetchLessonFromYouTube(videoId: string): Promise<YouTubeLessonResult> {
  const player = await fetchPlayer(videoId);
  if (player.playabilityStatus?.status !== "OK" || !player.videoDetails) {
    return { error: "This video doesn't exist or can't be played" };
  }

  const tracks = player.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
  const english =
    tracks.find((t) => t.languageCode.startsWith("en") && t.kind !== "asr") ??
    tracks.find((t) => t.languageCode.startsWith("en"));
  if (!english) return { error: NO_SUBTITLES_ERROR };

  const sentences =
    english.kind === "asr" ? await fetchAsrSentences(english) : mergeIntoSentences(await fetchCues(english));
  if (sentences.length === 0) return { error: "The English subtitles are empty" };

  const vietnamese = tracks.find((t) => t.languageCode === "vi" && t.kind !== "asr");
  if (vietnamese) attachTranslations(sentences, await fetchCues(vietnamese));

  return {
    lesson: {
      videoId,
      title: player.videoDetails.title,
      author: player.videoDetails.author,
      durationSec: Number(player.videoDetails.lengthSeconds),
      sentences,
      hasTranslation: sentences.some((s) => s.translation),
    },
    source: english.kind === "asr" ? "asr" : "human",
  };
}
