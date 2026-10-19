export interface Token {
  text: string;
  norm: string;
}

export type WordResult = { text: string; isCorrect: boolean };

// Short function words make poor blanks: they are guessable without listening.
const CLOZE_SKIP = new Set(
  "the a an and or but so of to in on at for with from by is are was were be been am do does did has have had i you he she it we they me him her us them my your his its our their this that these those there here not no yes".split(
    " ",
  ),
);
const CLOZE_RATIO = 0.3;

export function normalizeToken(word: string): string {
  return word
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9']/g, "");
}

export function tokenize(text: string): Token[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => ({ text: t, norm: normalizeToken(t) }))
    .filter((t) => t.norm);
}

// Aligns what the learner typed with the sentence (longest common subsequence),
// so one missed word doesn't mark every following word as wrong.
export function checkDictation(sentence: string, typed: string): { words: WordResult[]; score: number } {
  const target = tokenize(sentence);
  const input = tokenize(typed);
  const lcs = Array.from({ length: target.length + 1 }, () => new Array<number>(input.length + 1).fill(0));
  for (let i = target.length - 1; i >= 0; i--) {
    for (let j = input.length - 1; j >= 0; j--) {
      lcs[i][j] = target[i].norm === input[j].norm ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const matched = new Set<number>();
  for (let i = 0, j = 0; i < target.length && j < input.length; ) {
    if (target[i].norm === input[j].norm) {
      matched.add(i);
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }

  return {
    words: target.map((t, i) => ({ text: t.text, isCorrect: matched.has(i) })),
    score: target.length === 0 ? 0 : Math.round((matched.size / target.length) * 100),
  };
}

// Picks content words spread evenly through the sentence; deterministic so the blanks don't move on re-render.
export function pickClozeIndexes(tokens: Token[]): number[] {
  const candidates = tokens.map((t, i) => i).filter((i) => !CLOZE_SKIP.has(tokens[i].norm) && tokens[i].norm.length > 2);
  if (candidates.length === 0) return [];
  const count = Math.max(1, Math.round(candidates.length * CLOZE_RATIO));
  const step = candidates.length / count;
  return Array.from({ length: count }, (_, k) => candidates[Math.floor(k * step + step / 2)]);
}
