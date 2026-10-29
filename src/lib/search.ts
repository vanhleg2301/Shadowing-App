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
  highlighted: string;
  title: string;
  collection_id: string | null;
  category: string | null;
}

export const MIN_QUERY_LENGTH = 2;

function splitHighlight(highlighted: string): SentenceHit["parts"] {
  return highlighted
    .split(/(\[\[.*?\]\])/)
    .filter(Boolean)
    .map((part) => (part.startsWith("[[") ? { text: part.slice(2, -2), isMatch: true } : { text: part, isMatch: false }));
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
    parts: splitHighlight(row.highlighted),
    title: row.title,
    collectionId: row.collection_id,
    isNews: row.category !== null,
  }));
}
