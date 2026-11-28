// Prints everything narrated with Kokoro as JSON for generate_audio.py, split into the sentences the app highlights
// and plays one by one: the daily stories, the grammar units, the vocabulary topics, the quick-answer questions and
// the app's other sentences (level checks, video guide models). The ids match what the pages ask for.
import { APP_NARRATION_ID, getAppNarration } from "../../src/data/app-narration";
import { GRAMMAR_UNITS, getGrammarNarration, getGrammarNarrationId } from "../../src/data/grammar";
import { QUICK_TOPICS, getQuickNarration, getQuickNarrationId } from "../../src/data/quick-answers";
import { STORIES, splitSentences } from "../../src/data/stories";
import { VOCAB_TOPICS, getVocabNarration, getVocabNarrationId } from "../../src/data/vocabulary";

type Line = { speaker: string | null; text: string };
const toLines = (lines: Line[]) => lines.map((line) => ({ speaker: line.speaker, sentences: splitSentences(line.text) }));
const narrator = (texts: string[]): Line[] => texts.map((text) => ({ speaker: null, text }));

const stories = [
  ...STORIES.map((story) => ({ id: story.id, lines: toLines(story.lines.map((line) => ({ speaker: line.speaker ?? null, text: line.text }))) })),
  ...GRAMMAR_UNITS.map((unit) => ({ id: getGrammarNarrationId(unit), lines: toLines(getGrammarNarration(unit)) })),
  ...VOCAB_TOPICS.map((topic) => ({ id: getVocabNarrationId(topic), lines: toLines(getVocabNarration(topic)) })),
  ...QUICK_TOPICS.map((topic) => ({ id: getQuickNarrationId(topic), lines: toLines(narrator(getQuickNarration(topic))) })),
  { id: APP_NARRATION_ID, lines: toLines(narrator(getAppNarration())) },
];
process.stdout.write(JSON.stringify(stories));
