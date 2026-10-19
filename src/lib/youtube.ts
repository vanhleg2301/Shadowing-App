import { cacheLife } from "next/cache";
import type { Lesson, Sentence } from "./lesson";

// Unofficial endpoint (the official Data API only serves captions to the video owner).
// The ANDROID client returns caption URLs without needing a PO token.
const PLAYER_URL = "https://www.youtube.com/youtubei/v1/player?prettyPrint=false";
const CLIENT = { clientName: "ANDROID", clientVersion: "20.10.38", androidSdkVersion: 30, hl: "en" };

const MAX_SENTENCE_SEC = 15;
// Auto-generated captions have no punctuation, so phrases are cut at the longest pauses instead.
const ASR_MIN_WORDS = 3;
const ASR_MAX_WORDS = 12;
const ASR_MAX_SEC = 9;
// Words that usually open a new clause; a pause right before one is a better place to cut.
const CLAUSE_STARTERS = new Set(
  "and but so because then now okay ok he she they we i you it there this that what where when why how the".split(" "),
);

interface AsrWord {
  start: number;
  text: string;
}

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

export type LessonResult = { lesson: Lesson; error?: never } | { lesson?: never; error: string };

// Captions often start with credits (TED) or sound tags like [Music], which are not speech.
const NON_SPEECH_CUE = /^[[(][^\])]*[\])]$|\b(Transcriber|Translator|Reviewer):/;

async function fetchPlayer(videoId: string): Promise<PlayerResponse> {
  const res = await fetch(PLAYER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context: { client: CLIENT }, videoId }),
  });
  if (!res.ok) throw new Error(`YouTube player request failed: ${res.status}`);
  return res.json();
}

async function fetchJson3(track: CaptionTrack): Promise<Json3> {
  const url = `${track.baseUrl.replace(/&fmt=[^&]*/, "")}&fmt=json3`;
  const res = await fetch(url);
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

// Recursively split at the strongest pause until every phrase is short enough to shadow.
function splitAtPauses(words: AsrWord[]): AsrWord[][] {
  const duration = words.length > 0 ? words[words.length - 1].start - words[0].start : 0;
  if (words.length <= ASR_MAX_WORDS && duration <= ASR_MAX_SEC) return words.length > 0 ? [words] : [];
  if (words.length < ASR_MIN_WORDS * 2) return [words];

  let best = ASR_MIN_WORDS;
  let bestScore = -1;
  for (let k = ASR_MIN_WORDS; k <= words.length - ASR_MIN_WORDS; k++) {
    const gap = words[k].start - words[k - 1].start;
    const afterComma = words[k - 1].text.endsWith(",");
    const score = gap * (afterComma ? 1.6 : CLAUSE_STARTERS.has(words[k].text.toLowerCase()) ? 1.4 : 1);
    if (score > bestScore) {
      bestScore = score;
      best = k;
    }
  }
  return [...splitAtPauses(words.slice(0, best)), ...splitAtPauses(words.slice(best))];
}

// Auto-generated tracks carry a timestamp per word, which lets us cut phrases at natural pauses.
async function fetchAsrSentences(track: CaptionTrack): Promise<Sentence[]> {
  const data = await fetchJson3(track);
  const words: AsrWord[] = [];
  for (const event of data.events ?? []) {
    if (!event.segs || event.aAppend) continue;
    for (const seg of event.segs) {
      const text = seg.utf8.trim();
      if (!text || NON_SPEECH_CUE.test(text)) continue;
      words.push({ start: (event.tStartMs + (seg.tOffsetMs ?? 0)) / 1000, text });
    }
  }

  // Newer auto captions include punctuation: cut at sentence ends first, then split long sentences at pauses.
  const sentenceGroups: AsrWord[][] = [[]];
  for (const word of words) {
    sentenceGroups[sentenceGroups.length - 1].push(word);
    if (endsSentence(word.text)) sentenceGroups.push([]);
  }
  const chunks = sentenceGroups.flatMap(splitAtPauses);
  const hasPunctuation = sentenceGroups.length > 1;
  return chunks.map((chunk, i) => ({
    start: chunk[0].start,
    end: chunks[i + 1]?.[0].start ?? chunk[chunk.length - 1].start + 1,
    text: formatAsrPhrase(
      chunk.map((w) => w.text),
      i === 0 || endsSentence(chunks[i - 1][chunks[i - 1].length - 1].text) || !hasPunctuation,
    ),
  }));
}

function endsSentence(text: string): boolean {
  return /[.?!…]["'”’)\]]*$/.test(text);
}

// Caption cues are line fragments; shadowing works per sentence, so merge on terminal punctuation.
function mergeIntoSentences(cues: Cue[]): Sentence[] {
  const sentences: Sentence[] = [];
  let current: Sentence | null = null;

  for (const cue of cues) {
    if (!current) {
      current = { ...cue };
    } else {
      current.text = `${current.text} ${cue.text}`;
      current.end = cue.end;
    }
    if (endsSentence(cue.text) || current.end - current.start >= MAX_SENTENCE_SEC) {
      sentences.push(current);
      current = null;
    }
  }
  if (current) sentences.push(current);

  for (let i = 0; i < sentences.length - 1; i++) {
    sentences[i].end = sentences[i + 1].start;
  }
  return sentences;
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

export async function getLesson(videoId: string): Promise<LessonResult> {
  "use cache";
  cacheLife("days");

  const player = await fetchPlayer(videoId);
  if (player.playabilityStatus?.status !== "OK" || !player.videoDetails) {
    return { error: "This video doesn't exist or can't be played" };
  }

  const tracks = player.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
  const english =
    tracks.find((t) => t.languageCode.startsWith("en") && t.kind !== "asr") ??
    tracks.find((t) => t.languageCode.startsWith("en"));
  if (!english) return { error: "This video has no English subtitles yet" };

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
  };
}
