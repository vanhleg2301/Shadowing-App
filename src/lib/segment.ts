// Cuts a stream of timed words into sentences short enough to shadow: first at sentence ends (. ? ! …),
// then long sentences at the most natural point (a pause, a comma, before "and/but/so..."), never with a
// tiny fragment on either side. Shared by captions.ts (new lessons) and scripts/resegment-lessons.ts.
// Kept free of Next.js imports so scripts can use it.

export interface TimedWord {
  start: number;
  text: string;
  // First word of a caption cue: its time is real (the others in a cue are estimated), so cutting here
  // keeps the audio in step.
  isCueStart?: boolean;
  // Last word of a caption cue.
  isCueEnd?: boolean;
}

export interface SegmentLimits {
  maxWords: number;
  maxSec: number;
  // Caption lines often hold a short reply and the next line ("Me too. I'm starving."); their words carry
  // estimated times, so such lines stay whole and sentences only end where a line does.
  endsOnlyAtCueEnds?: boolean;
}

// Auto captions time every word, so long sentences can be cut anywhere natural.
export const WORD_TIMED_LIMITS: SegmentLimits = { maxWords: 18, maxSec: 12 };
// Caption cues only time the start of each line, so sentences are cut less often and at line starts.
export const CUE_TIMED_LIMITS: SegmentLimits = { maxWords: 30, maxSec: 15, endsOnlyAtCueEnds: true };

// Neither side of a cut may be shorter than this.
const MIN_PART_WORDS = 4;
// Sentences this short ("Hi, Neil.") join the next one when they fit.
const TINY_SENTENCE_WORDS = 2;

// Words that usually open a new clause; a cut just before one sounds natural. The first group most often
// starts a new thought in run-on speech without punctuation ("...on his body so he is thinking...").
const STRONG_STARTERS = new Set("so and but because then now okay ok".split(" "));
const DANGLING_WORDS = new Set("and but so or because the a an to of in on at for with my your his her their our its is are was were".split(" "));
const CLAUSE_STARTERS = new Set("or if when while which who where although though after before until since that".split(" "));

export function endsSentence(text: string): boolean {
  return /[.?!…]["'”’)\]]*$/.test(text);
}

function durationOf(words: TimedWord[], next: TimedWord | undefined): number {
  if (words.length === 0) return 0;
  return (next?.start ?? words[words.length - 1].start + 0.4) - words[0].start;
}

function fits(words: TimedWord[], next: TimedWord | undefined, limits: SegmentLimits): boolean {
  return words.length <= limits.maxWords && durationOf(words, next) <= limits.maxSec;
}

// How good a cut before words[k] is: the pause before it, boosted after a comma or before a clause word,
// and nudged towards the middle so both halves are useful.
function cutScore(words: TimedWord[], k: number): number {
  const gap = Math.max(words[k].start - words[k - 1].start, 0.01);
  const previous = words[k - 1].text;
  const nextWord = words[k].text.toLowerCase().replace(/[^a-z']/g, "");
  const punctuation = /[,;:—–-]["'”’)]*$/.test(previous) ? 2.2 : 1;
  const clause = STRONG_STARTERS.has(nextWord) ? 2.5 : CLAUSE_STARTERS.has(nextWord) ? 1.5 : 1;
  const cueStart = words[k].isCueStart ? 1.6 : 1;
  // Never leave a dangling "and", "the" or "to" at the end of a part.
  const dangling = DANGLING_WORDS.has(previous.toLowerCase().replace(/[^a-z']/g, "")) ? 0.2 : 1;
  const balance = 1 - Math.abs(k / words.length - 0.5);
  return gap * punctuation * clause * cueStart * dangling * (0.5 + balance);
}

function splitLong(words: TimedWord[], next: TimedWord | undefined, limits: SegmentLimits): TimedWord[][] {
  if (fits(words, next, limits) || words.length < MIN_PART_WORDS * 2) return [words];
  let best = MIN_PART_WORDS;
  let bestScore = -1;
  for (let k = MIN_PART_WORDS; k <= words.length - MIN_PART_WORDS; k++) {
    const score = cutScore(words, k);
    if (score > bestScore) {
      bestScore = score;
      best = k;
    }
  }
  return [...splitLong(words.slice(0, best), words[best], limits), ...splitLong(words.slice(best), next, limits)];
}

export function segmentWords(words: TimedWord[], limits: SegmentLimits): TimedWord[][] {
  const sentences: TimedWord[][] = [[]];
  for (const word of words) {
    sentences[sentences.length - 1].push(word);
    if (endsSentence(word.text) && (!limits.endsOnlyAtCueEnds || word.isCueEnd)) sentences.push([]);
  }
  const nonEmpty = sentences.filter((s) => s.length > 0);

  // Join tiny sentences to the following one while the result still fits.
  const joined: TimedWord[][] = [];
  for (let i = 0; i < nonEmpty.length; i++) {
    let current = nonEmpty[i];
    while (!limits.endsOnlyAtCueEnds && current.length <= TINY_SENTENCE_WORDS && i + 1 < nonEmpty.length) {
      const candidate = [...current, ...nonEmpty[i + 1]];
      if (!fits(candidate, nonEmpty[i + 2]?.[0], limits)) break;
      current = candidate;
      i++;
    }
    joined.push(current);
  }

  return joined.flatMap((sentence, i) => splitLong(sentence, joined[i + 1]?.[0], limits));
}

// Caption cues give no time per word, so words are spread evenly over their cue.
export function spreadCueWords(cues: { start: number; end: number; text: string }[]): TimedWord[] {
  return cues.flatMap((cue) => {
    const tokens = cue.text.split(/\s+/).filter(Boolean);
    const step = tokens.length > 0 ? Math.max(cue.end - cue.start, 0) / tokens.length : 0;
    return tokens.map((text, i) => ({ start: Math.round((cue.start + i * step) * 100) / 100, text, isCueStart: i === 0, isCueEnd: i === tokens.length - 1 }));
  });
}
