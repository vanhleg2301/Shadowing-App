// Real sentences from the main collections' videos that use a grammar unit's pattern, so it is heard, not only read.
import { cacheLife, cacheTag } from "next/cache";
import { getStoredLesson, LESSONS_TAG } from "./lessons";
import { searchSentences, type SentenceHit } from "./search";
import type { StudySentence } from "./video-study";

export interface GrammarExample {
  videoId: string;
  title: string;
  sentence: StudySentence;
  parts: SentenceHit["parts"];
}

const EXAMPLE_COLLECTIONS = ["bob", "sponge"];
const PER_PHRASE = 2;
const MAX_EXAMPLES = 6;
// Long caption lines are hard to follow as one example.
const MAX_SENTENCE_LENGTH = 140;

export async function getGrammarExamples(phrases: string[]): Promise<GrammarExample[]> {
  "use cache";
  cacheLife("days");
  cacheTag(LESSONS_TAG);

  const hits: SentenceHit[] = [];
  for (const phrase of phrases) {
    const found = ((await searchSentences(phrase).catch(() => null)) ?? []).filter(
      (hit) =>
        !hit.isNews &&
        EXAMPLE_COLLECTIONS.includes(hit.collectionId ?? "") &&
        hit.parts.some((p) => p.isMatch) &&
        hit.parts.map((p) => p.text).join("").length <= MAX_SENTENCE_LENGTH &&
        !hits.some((h) => h.videoId === hit.videoId),
    );
    hits.push(...found.slice(0, PER_PHRASE));
  }

  const examples = await Promise.all(
    hits.slice(0, MAX_EXAMPLES).map(async (hit): Promise<GrammarExample | null> => {
      // The search has where the sentence starts; its end comes from the stored lesson.
      const line = (await getStoredLesson(hit.videoId).catch(() => null))?.sentences[hit.index];
      if (!line) return null;
      return {
        videoId: hit.videoId,
        title: hit.title,
        sentence: { index: hit.index, text: line.text, start: line.start, end: line.end },
        parts: hit.parts,
      };
    }),
  );
  return examples.filter((example) => example !== null);
}
