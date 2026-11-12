// Prints the daily stories and the grammar units' stories as JSON for generate_audio.py, split into the sentences
// the app highlights and plays one by one.
import { GRAMMAR_UNITS, getGrammarNarration, getGrammarNarrationId } from "../../src/data/grammar";
import { STORIES, splitSentences } from "../../src/data/stories";

const stories = [
  ...STORIES.map((story) => ({
    id: story.id,
    lines: story.lines.map((line) => ({ speaker: line.speaker ?? null, sentences: splitSentences(line.text) })),
  })),
  ...GRAMMAR_UNITS.map((unit) => ({
    id: getGrammarNarrationId(unit),
    lines: getGrammarNarration(unit).map((line) => ({ speaker: line.speaker, sentences: splitSentences(line.text) })),
  })),
];
process.stdout.write(JSON.stringify(stories));
