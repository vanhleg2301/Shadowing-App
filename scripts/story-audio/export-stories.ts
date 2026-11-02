// Prints the daily stories as JSON for generate_audio.py, split into the sentences StoryReader highlights.
import { STORIES, splitSentences } from "../../src/data/stories";

const stories = STORIES.map((story) => ({
  id: story.id,
  lines: story.lines.map((line) => ({ speaker: line.speaker ?? null, sentences: splitSentences(line.text) })),
}));
process.stdout.write(JSON.stringify(stories));
