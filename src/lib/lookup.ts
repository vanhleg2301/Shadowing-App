import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { cacheLife } from "next/cache";
import { z } from "zod";
import type { WordInfo } from "./dictionary";

const MODEL_ID = process.env.MODEL_ID ?? "claude-opus-5-5";
const DICTIONARY_URL = "https://api.dictionaryapi.dev/api/v2/entries/en";
const DATAMUSE_URL = "https://api.datamuse.com/words";
const FREE_TIMEOUT_MS = 4000;
const MAX_PHRASES = 5;

const SYSTEM_PROMPT = `You write entries for an English learner's dictionary. The reader is at CEFR level A2 to B1.

Rules for every definition, meaning and example:
- Use only common A2–B1 words. Never explain a word with a harder word.
- Keep sentences short (under 15 words) and natural.
- Write everything in English.

Fields:
- headword: the dictionary form of the word (e.g. "was" -> "be", "struck" -> "strike").
- ipaUk / ipaUs: British and American IPA for the word as it appears, without slashes.
- contextMeaning: one short sentence saying what the word means in the given sentence.
- meanings: the 1–3 most common senses. Put the sense used in the given sentence first. Each has a part of speech, a simple definition and a short example.
- phrases: 3–5 common collocations, phrasal verbs or fixed expressions that contain the word, most useful first. Each has a simple meaning and a short example.`;

const WordEntrySchema = z.object({
  headword: z.string(),
  ipaUk: z.string(),
  ipaUs: z.string(),
  contextMeaning: z.string(),
  meanings: z.array(z.object({ partOfSpeech: z.string(), definition: z.string(), example: z.string() })),
  phrases: z.array(z.object({ text: z.string(), meaning: z.string(), example: z.string() })),
});

// Neighbours too generic to make a useful phrase ("the difference", "difference of").
const GENERIC_NEIGHBOURS = new Set(
  (
    "a an the this that these those my your his her its our their some any no every each " +
    "i you he she it we they me him us them who which what " +
    "is are was were be been being am do does did has have had will would can could shall should may might must " +
    "and or but so nor if than then as of to not"
  ).split(" "),
);

const DATAMUSE_POS: Record<string, string> = { n: "noun", v: "verb", adj: "adjective", adv: "adverb", u: "" };

interface DictionaryApiEntry {
  phonetics: { text?: string; audio?: string }[];
  meanings: { partOfSpeech: string; definitions: { definition: string; example?: string }[] }[];
}

interface DatamuseWord {
  word: string;
  score: number;
  tags?: string[];
  defs?: string[];
}

async function lookupWithClaude(word: string, sentence: string): Promise<WordInfo> {
  "use cache";
  cacheLife("weeks");

  // Keys that aren't scoped to a workspace (sk-ant-usr-...) must name the workspace on every request.
  const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID;
  const client = new Anthropic(workspaceId ? { defaultHeaders: { "anthropic-workspace-id": workspaceId } } : {});
  let response;
  try {
    response = await client.beta.messages.parse({
      model: MODEL_ID,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: betaZodOutputFormat(WordEntrySchema) },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `Word: ${word}\nSentence: ${sentence}` }],
    });
  } catch (error) {
    // Log here: errors crossing the "use cache" boundary lose their message in production.
    const detail = error instanceof Anthropic.APIError ? `${error.status} ${error.message}` : String(error);
    console.warn(`[lookup] Claude request failed for "${word}": ${detail}`);
    throw error;
  }

  const entry = response.parsed_output;
  if (response.stop_reason === "refusal" || !entry) {
    throw new Error(`Claude returned no entry (stop_reason: ${response.stop_reason})`);
  }

  return {
    word: entry.headword || word,
    ipaUk: entry.ipaUk || undefined,
    ipaUs: entry.ipaUs || undefined,
    contextMeaning: entry.contextMeaning || undefined,
    meanings: entry.meanings.slice(0, 3),
    phrases: entry.phrases.slice(0, MAX_PHRASES),
    source: "ai",
  };
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(FREE_TIMEOUT_MS) });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

async function findPhrases(word: string): Promise<WordInfo["phrases"]> {
  const query = (relation: string) =>
    fetchJson<DatamuseWord[]>(`${DATAMUSE_URL}?${relation}=${encodeURIComponent(word)}&max=30`);
  const [after, before] = await Promise.all([query("rel_bga"), query("rel_bgb")]);
  const isUseful = (w: DatamuseWord) => /^[a-z]+$/.test(w.word) && !GENERIC_NEIGHBOURS.has(w.word);

  return [
    ...(after ?? []).filter(isUseful).map((w) => ({ text: `${word} ${w.word}`, score: w.score })),
    ...(before ?? []).filter(isUseful).map((w) => ({ text: `${w.word} ${word}`, score: w.score })),
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_PHRASES)
    .map((p) => ({ text: p.text }));
}

// Free sources: dictionaryapi.dev (UK/US phonetics, often slow) and Datamuse (fast, US IPA, Wiktionary senses).
async function lookupFree(word: string): Promise<WordInfo> {
  "use cache";
  cacheLife("weeks");

  const encoded = encodeURIComponent(word);
  const [dictionary, datamuse, phrases] = await Promise.all([
    fetchJson<DictionaryApiEntry[]>(`${DICTIONARY_URL}/${encoded}`),
    fetchJson<DatamuseWord[]>(`${DATAMUSE_URL}?sp=${encoded}&md=dr&ipa=1&max=1`),
    findPhrases(word),
  ]);

  const phonetics = dictionary?.flatMap((e) => e.phonetics) ?? [];
  const ipaFor = (accent: "uk" | "us") =>
    phonetics.find((p) => p.text && p.audio?.endsWith(`-${accent}.mp3`))?.text?.replace(/^\/|\/$/g, "");
  const datamuseIpa = datamuse?.[0]?.tags?.find((t) => t.startsWith("ipa_pron:"))?.slice("ipa_pron:".length);

  const meanings = dictionary
    ? dictionary
        .flatMap((e) => e.meanings)
        .map((m) => ({
          partOfSpeech: m.partOfSpeech,
          definition: m.definitions[0].definition,
          example: m.definitions[0].example,
        }))
    : (datamuse?.[0]?.defs ?? [])
        .map((d) => d.split("\t"))
        .filter(([, definition]) => definition && !/surname|given name/i.test(definition))
        .map(([pos, definition]) => ({ partOfSpeech: DATAMUSE_POS[pos] ?? pos, definition: definition.trim() }));

  const ipaUk = ipaFor("uk");
  const ipaUs = ipaFor("us") ?? datamuseIpa;
  // Throwing (instead of returning an empty entry) keeps a transient outage out of the cache.
  if (meanings.length === 0 && !ipaUk && !ipaUs) throw new Error(`No free dictionary entry for "${word}"`);

  return { word, ipaUk, ipaUs, meanings: meanings.slice(0, 3), phrases, source: "free" };
}

export async function lookupWord(word: string, sentence: string): Promise<WordInfo> {
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return await lookupWithClaude(word, sentence);
    } catch {
      // No credits, bad key or outage: keep the feature working on the free sources.
    }
  }
  return lookupFree(word);
}
