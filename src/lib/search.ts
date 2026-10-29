import { createPublicClient } from "./supabase/admin";

export interface SentenceHit {
  videoId: string;
  index: number;
  start: number;
  // The sentence split into plain and matched parts, for highlighting without HTML.
  parts: { text: string; isMatch: boolean }[];
  title: string;
  collectionId: string | null;
  isNews: boolean;
}

interface SearchRow {
  video_id: string;
  idx: number;
  start_sec: number;
  text: string;
  title: string;
  collection_id: string | null;
  category: string | null;
}

export const MIN_QUERY_LENGTH = 2;

// Marks where the whole phrase appears (the database's ts_headline marks each word on its own), allowing
// punctuation or extra spaces between the words.
function splitHighlight(text: string, query: string): SentenceHit["parts"] {
  // Words hold only letters, digits and apostrophes, so they are safe inside a RegExp.
  const words = query.match(/[\p{L}\p{N}']+/gu) ?? [];
  if (words.length === 0) return [{ text, isMatch: false }];
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}])${words.join("[^\\p{L}\\p{N}']+")}(?![\\p{L}\\p{N}])`, "giu");
  const parts: SentenceHit["parts"] = [];
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > last) parts.push({ text: text.slice(last, start), isMatch: false });
    parts.push({ text: match[0], isMatch: true });
    last = start + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), isMatch: false });
  return parts;
}

// Phrase search over every stored transcript sentence (search_sentences, migration 018).
// Null when search isn't available (no database, or the migration hasn't run).
export async function searchSentences(query: string): Promise<SentenceHit[] | null> {
  const q = query.trim();
  if (q.length < MIN_QUERY_LENGTH) return [];
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("search_sentences", { q, max_results: 60 });
  if (error) return null;
  return (data as SearchRow[]).map((row) => ({
    videoId: row.video_id,
    index: row.idx,
    start: row.start_sec,
    parts: splitHighlight(row.text, q),
    title: row.title,
    collectionId: row.collection_id,
    isNews: row.category !== null,
  }));
}
