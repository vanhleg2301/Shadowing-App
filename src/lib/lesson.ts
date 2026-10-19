export interface Sentence {
  start: number;
  end: number;
  text: string;
  translation?: string;
}

export interface Lesson {
  videoId: string;
  title: string;
  author: string;
  durationSec: number;
  sentences: Sentence[];
  hasTranslation: boolean;
}

export function findActiveIndex(sentences: Sentence[], time: number): number {
  let active = -1;
  for (let i = 0; i < sentences.length; i++) {
    if (sentences[i].start > time) break;
    active = i;
  }
  return active;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
