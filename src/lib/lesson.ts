export interface Sentence {
  start: number;
  end: number;
  text: string;
  translation?: string;
  // Start time of each whitespace-separated word in text (auto captions only), for karaoke highlighting.
  wordStarts?: number[];
}

export interface Lesson {
  videoId: string;
  title: string;
  author: string;
  durationSec: number;
  sentences: Sentence[];
  hasTranslation: boolean;
  summary?: LessonSummary;
  // Set for lessons with hosted audio (src/lib/media.ts) instead of a YouTube video.
  media?: { audioUrl: string; imageUrl: string };
}

export interface LessonSummary {
  overview: string;
  keyPoints: string[];
  keyWords: { word: string; meaning: string }[];
  source: "ai" | "free";
}

export function findActiveIndex(sentences: Sentence[], time: number): number {
  let active = -1;
  for (let i = 0; i < sentences.length; i++) {
    if (sentences[i].start > time) break;
    active = i;
  }
  return active;
}

export function findActiveWord(sentence: Sentence, time: number): number {
  if (!sentence.wordStarts) return -1;
  let active = -1;
  for (let i = 0; i < sentence.wordStarts.length; i++) {
    if (sentence.wordStarts[i] > time) break;
    active = i;
  }
  return active;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
