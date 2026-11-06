// Picks what a course day studies from its video, so every word and sentence comes from what the learner
// hears (comprehensible input): the video's own repeated chunks and words, and clear sentences that use them.
// Runs without any paid service; it only looks at the transcript.
import type { Sentence } from "./lesson";

export interface StudyItem {
  // A word or chunk exactly as it is said in the video.
  text: string;
  // How many sentences of the video use it.
  count: number;
  // The clearest sentence that uses it.
  sentenceIndex: number;
}

export interface VideoStudy {
  items: StudyItem[];
  // Sentence indexes, in video order.
  sentences: number[];
}

// Words a learner at A1–A2 already knows; they never count as something to study on their own.
const BASIC_WORDS = new Set(
  `a about above after again all also always am an and any are around as ask at away back bad be because been before being
  best better big bit both but by call came can can't come could day did didn't do does doesn't doing don't done down each
  even ever every feel few find first for from get gets getting give go goes going gone good got great had has have having he
  her here hers him his home how i i'd i'll i'm i've if in into is isn't it it's its just keep kind know last let let's like
  little long look lot lots made make man many may me maybe mean more most much must my myself need never new next nice no not
  now of off oh ok okay old on once one only or other our out over own people place put quite really right said same saw say
  see she should show so some something sometimes still such sure take tell than thank thanks that that's the their them then
  there there's these they they're thing things think this those though thought three through time to today too two up us
  use used very want was wasn't way we we're well went were what what's when where which while who why will with won't word
  words would yeah yes you you'd you'll you're your yours year years week guys hi hello um uh gonna wanna gotta actually today's
  another different tonight morning everyone someone anything everything nothing other others again okay alright`
    .split(/\s+/)
    .filter(Boolean),
);

// The channel talking about itself, not English to learn.
const CHANNEL_WORDS = new Set("english video videos channel lesson lessons easy slow bbc website subscribe comments worksheet podcast".split(" "));
const BOILERPLATE = /subscribe|comments?|website|worksheet|thanks? (you )?for watching|channel|patreon|\.com|link below|description/i;

// A chunk may not start or end on these; "the" or "and" at an edge means it was cut from a longer phrase.
const EDGE_WORDS = new Set("a an the and or but so of to that this is are was were i you he she it we they my your his her our their".split(" "));
// Longer chunks also may not end on these, so they stay whole phrases ("spend time with" yes, "becomes an adult when" no).
const LONG_EDGE_WORDS = new Set(
  "some any when who which what where how have has had be been can could will would do does did am not very just really if then as in on at for with from by about".split(" "),
);

const MIN_SENTENCE_WORDS = 5;
const MAX_SENTENCE_WORDS = 18;
const MAX_CHUNK_WORDS = 3;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .split(/[^a-z']+/)
    .map((w) => w.replace(/^'+|'+$/g, ""))
    .filter(Boolean);
}

const isStudyWord = (word: string) => word.length >= 4 && !word.includes("'") && !BASIC_WORDS.has(word) && !CHANNEL_WORDS.has(word);

// Names of people and places are written with a capital letter even mid-sentence; they aren't vocabulary.
function findNames(sentences: Sentence[]): Set<string> {
  const capital = new Map<string, number>();
  const lower = new Set<string>();
  for (const sentence of sentences) {
    sentence.text.split(/\s+/).forEach((raw, i) => {
      const word = raw.replace(/^[^A-Za-z]+|[^A-Za-z']+$/g, "");
      if (!word) return;
      const key = word.toLowerCase();
      if (/^[a-z]/.test(word)) lower.add(key);
      else if (i > 0 && key !== "i" && !key.startsWith("i'")) capital.set(key, (capital.get(key) ?? 0) + 1);
    });
  }
  return new Set([...capital.keys()].filter((key) => !lower.has(key)));
}

// Sentences that read well on their own: not too short, not too long, and not cut off mid-thought.
function isComplete(sentence: Sentence): boolean {
  const text = sentence.text.trim();
  return /^[A-Z"']/.test(text) && /[.!?]["']?$/.test(text);
}

function sentenceScore(sentence: Sentence, isPunctuated: boolean): number {
  const words = tokenize(sentence.text).length;
  if (words < MIN_SENTENCE_WORDS || words > MAX_SENTENCE_WORDS || BOILERPLATE.test(sentence.text)) return 0;
  // Auto captions have no punctuation, so only punctuated transcripts can ask for whole sentences.
  if (isPunctuated && !isComplete(sentence)) return 0;
  return 2 - Math.abs(words - 10) / 20;
}

export function buildVideoStudy(sentences: Sentence[], { itemCount = 10, sentenceCount = 10 } = {}): VideoStudy {
  const tokens = sentences.map((s) => tokenize(s.text));
  const isPunctuated = sentences.filter(isComplete).length >= sentences.length / 2;
  const seenText = new Set<string>();
  // A line said twice is only offered once.
  const scores = sentences.map((s, i) => {
    const key = tokens[i].join(" ");
    if (seenText.has(key)) return 0;
    seenText.add(key);
    return sentenceScore(s, isPunctuated);
  });
  const names = findNames(sentences);

  // Every chunk of 1–4 words, with the sentences it appears in.
  const seen = new Map<string, Set<number>>();
  tokens.forEach((words, i) => {
    for (let n = 1; n <= MAX_CHUNK_WORDS; n++) {
      for (let start = 0; start + n <= words.length; start++) {
        const chunk = words.slice(start, start + n);
        if (chunk.some((w) => names.has(w) || CHANNEL_WORDS.has(w))) continue;
        if (n === 1 ? !isStudyWord(chunk[0]) : EDGE_WORDS.has(chunk[0]) || EDGE_WORDS.has(chunk[n - 1]) || !chunk.some(isStudyWord)) continue;
        if (n > 2 && (LONG_EDGE_WORDS.has(chunk[0]) || LONG_EDGE_WORDS.has(chunk[n - 1]))) continue;
        const key = chunk.join(" ");
        if (!seen.has(key)) seen.set(key, new Set());
        seen.get(key)?.add(i);
      }
    }
  });

  const candidates = [...seen.entries()]
    .map(([text, where]) => {
      const usable = [...where].filter((i) => scores[i] > 0);
      const wordCount = text.split(" ").length;
      return {
        text,
        count: where.size,
        usable,
        // Repeated chunks are what the video is really about; a longer chunk repeated is worth more than a word.
        score: where.size * (1 + (wordCount - 1) * 0.35),
      };
    })
    .filter((c) => c.usable.length > 0 && c.count >= 2)
    .sort((a, b) => b.score - a.score || b.text.length - a.text.length);

  const items: StudyItem[] = [];
  const used = new Set<number>();
  for (const candidate of candidates) {
    if (items.length >= itemCount) break;
    // One item per study word, so "about yourself" doesn't come back as "yourself in".
    const studyWords = candidate.text.split(" ").filter(isStudyWord);
    if (items.some((item) => item.text.split(" ").some((w) => studyWords.includes(w)))) continue;
    // Each item gets a sentence of its own, so no sentence is shown twice.
    const best = candidate.usable.filter((i) => !used.has(i)).sort((a, b) => scores[b] - scores[a])[0];
    if (best === undefined) continue;
    used.add(best);
    items.push({ text: candidate.text, count: candidate.count, sentenceIndex: best });
  }

  // The sentences behind the chosen items, then the clearest others, spread across the video.
  const picked = new Set(items.map((item) => item.sentenceIndex));
  const rest = scores
    .map((score, i) => ({ score: score + tokens[i].filter(isStudyWord).length * 0.15, i }))
    .filter(({ score, i }) => score > 1 && !picked.has(i))
    .sort((a, b) => b.score - a.score);
  for (const { i } of rest) {
    if (picked.size >= sentenceCount) break;
    if ([...picked].every((p) => Math.abs(p - i) > 1)) picked.add(i);
  }

  return { items, sentences: [...picked].slice(0, Math.max(sentenceCount, items.length)).sort((a, b) => a - b) };
}

// Where the item is in its sentence, so it can be shown in bold or blanked out in a quiz.
export function findInSentence(sentence: string, item: string): { start: number; end: number } | null {
  const pattern = item
    .split(" ")
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/'/g, "['’]"))
    .join("[^A-Za-z']+");
  const match = new RegExp(`(^|[^A-Za-z'])(${pattern})(?![A-Za-z'])`, "i").exec(sentence);
  if (!match) return null;
  const start = match.index + match[1].length;
  return { start, end: start + match[2].length };
}

export interface StudySentence {
  index: number;
  text: string;
  translation?: string;
  // Where it is in the video, in seconds, so it can be played on its own.
  start: number;
  end: number;
}

// What a course day shows from its main video: plain data, so it can go to the browser.
export interface DayStudy {
  videoId: string;
  title: string;
  items: { text: string; sentence: StudySentence }[];
  sentences: StudySentence[];
}

export function buildDayStudy(lesson: { videoId: string; title: string; sentences: Sentence[] }, size: number): DayStudy | null {
  const study = buildVideoStudy(lesson.sentences, { itemCount: size, sentenceCount: size });
  const toStudySentence = (index: number): StudySentence => {
    const { text, translation, start, end } = lesson.sentences[index];
    return translation ? { index, text, translation, start, end } : { index, text, start, end };
  };
  // Items are shown as they are written in their sentence, so the quiz can blank them out exactly.
  const items = study.items.flatMap((item) => {
    const sentence = toStudySentence(item.sentenceIndex);
    const at = findInSentence(sentence.text, item.text);
    return at ? [{ text: sentence.text.slice(at.start, at.end), sentence }] : [];
  });
  if (items.length < 3) return null;
  return { videoId: lesson.videoId, title: lesson.title, items, sentences: study.sentences.map(toStudySentence) };
}

// A written guide with its lines found in the transcript, so each can be played.
export interface DayGuide {
  overview: string;
  sections: { title: string; lines: StudySentence[] }[];
  model: { title: string; text: string };
  questions: { question: string; options: string[] }[];
}

const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function findGuideLine(sentences: Sentence[], line: string): StudySentence | null {
  const target = normalize(line);
  const index = sentences.findIndex((s) => {
    const text = normalize(s.text);
    return text === target || text.includes(target) || (text.length > 20 && target.includes(text));
  });
  if (index < 0) return null;
  const { start, end, translation } = sentences[index];
  // The guide's own wording is shown, as a sentence; the timing comes from the transcript line that says it.
  const text = line.charAt(0).toUpperCase() + line.slice(1);
  return translation ? { index, text, translation, start, end } : { index, text, start, end };
}

export function resolveGuide(
  guide: { overview: string; sections: { title: string; lines: string[] }[]; model: DayGuide["model"]; questions: DayGuide["questions"] },
  sentences: Sentence[],
): DayGuide {
  return {
    overview: guide.overview,
    sections: guide.sections.map((section) => ({
      title: section.title,
      lines: section.lines.flatMap((line) => findGuideLine(sentences, line) ?? []),
    })),
    model: guide.model,
    questions: guide.questions,
  };
}
