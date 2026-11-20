// Vocabulary: A2 phrases learned as whole chunks, through pictures and everyday situations. A situation topic
// teaches what you say and what you hear there, asks what a picture shows and what would be said in a situation,
// lets the learner predict their lines in a conversation and ends with saying them. The grammar units' words are
// topics too (pictures only). The pictures share the grammar units' cast, so the people stay familiar.
import { GRAMMAR_UNITS, getWordPicture } from "./grammar";
import { SITUATION_TOPICS_1 } from "./vocab-situations-1";
import { SITUATION_TOPICS_2 } from "./vocab-situations-2";
import type { VocabPhrase, VocabTopic } from "./vocab-types";

export type { DialogueLine, SpeakTask, VocabPhrase, VocabTopic } from "./vocab-types";

export const VOCAB_COURSE_ID = "vocab-a2";

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");

// The grammar units' everyday words, as picture-only topics. Situation topics use ids 1–3 and 21–29.
const WORD_TOPICS: VocabTopic[] = GRAMMAR_UNITS.map((unit) => ({
  id: 10 + unit.id,
  slug: slugify(unit.topic),
  title: unit.topic,
  kind: "words",
  canDo: `I know the everyday words for ${unit.topic.toLowerCase()}.`,
  grammarSlug: unit.slug,
  phrases: unit.words.map((word) => ({ phrase: word.word, meaning: word.meaning, example: word.example, picture: getWordPicture(unit, word) })),
}));

// Topics whose pictures are not all drawn yet (Workers AI's free allowance is about 170 a day). They stay hidden
// until scripts/grammar-images/generate.mts has drawn them; then the slug is removed from this list.
const PICTURES_PENDING = new Set(["staying-at-a-hotel", "talking-about-your-day", "taxis-and-buses", "feelings-and-weather"]);

// Every situation topic, drawn or not: what the picture script works through.
export const ALL_SITUATION_TOPICS: VocabTopic[] = [...SITUATION_TOPICS_1, ...SITUATION_TOPICS_2];

export const VOCAB_TOPICS: VocabTopic[] = [...ALL_SITUATION_TOPICS, ...WORD_TOPICS].filter(
  (topic) => !PICTURES_PENDING.has(topic.slug),
);

export function getVocabTopic(slug: string): VocabTopic | undefined {
  return VOCAB_TOPICS.find((topic) => topic.slug === slug);
}

// The topic whose words a grammar unit uses.
export function getTopicForGrammar(grammarSlug: string): VocabTopic | undefined {
  return WORD_TOPICS.find((topic) => topic.grammarSlug === grammarSlug);
}

// Pictures of situation topics are in public/words/<topic slug>/, made by scripts/grammar-images/generate.mts.
export function getPhrasePicture(topic: VocabTopic, phrase: VocabPhrase): string {
  return topic.kind === "words" ? phrase.picture : `/words/${topic.slug}/${slugify(phrase.phrase)}.webp`;
}

// The phrase without its final ? . or ! (as it is saved for Review).
export const getPhraseCore = (phrase: string) => phrase.replace(/[?.!]+$/, "");

// The parts of the lesson a topic has, which all have to be passed to finish it.
export function getTopicChecks(topic: VocabTopic): ("picture" | "situation" | "dialogue")[] {
  return [
    "picture" as const,
    ...(topic.phrases.some((p) => p.situation) ? ["situation" as const] : []),
    ...(topic.dialogue ? ["dialogue" as const] : []),
  ];
}
