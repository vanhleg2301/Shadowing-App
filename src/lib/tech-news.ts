// News articles republished from The Conversation (src/lib/tech-news-import.ts, daily Vercel cron).
import { cacheLife } from "next/cache";
import type { NewsTopic } from "./news";
import { createPublicClient } from "./supabase/admin";

export interface TechArticleBlock {
  type: "p" | "h" | "li";
  text: string;
}

export interface TechArticleItem {
  id: string;
  topic: NewsTopic;
  title: string;
  summary: string;
  authors: string[];
  published_at: string;
  level: string;
  word_count: number;
}

export interface TechArticle extends TechArticleItem {
  source_url: string;
  counter_url: string;
  blocks: TechArticleBlock[];
  disclosure: string | null;
}


// The newest articles, of one topic or of all of them.
export async function getTechArticles(topic?: NewsTopic): Promise<TechArticleItem[]> {
  "use cache";
  cacheLife("minutes");
  const supabase = createPublicClient();
  if (!supabase) return [];
  const query = supabase.from("tech_articles").select("id, topic, title, summary, authors, published_at, level, word_count");
  const { data, error } = await (topic ? query.eq("topic", topic) : query).order("published_at", { ascending: false }).limit(300);
  return error ? [] : ((data ?? []) as TechArticleItem[]);
}

export async function getTechArticle(id: string): Promise<TechArticle | null> {
  "use cache";
  cacheLife("hours");
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("tech_articles")
    .select("id, topic, title, summary, authors, published_at, level, word_count, source_url, counter_url, blocks, disclosure")
    .eq("id", id)
    .maybeSingle();
  return error ? null : (data as TechArticle | null);
}
