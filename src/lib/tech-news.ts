// News > AI & Tech: articles republished from The Conversation (scripts/tech-news/import_tech_news.py).
import { cacheLife } from "next/cache";
import { createPublicClient } from "./supabase/admin";

export interface TechArticleBlock {
  type: "p" | "h" | "li";
  text: string;
}

export interface TechArticleItem {
  id: string;
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

export async function getTechArticles(): Promise<TechArticleItem[]> {
  "use cache";
  cacheLife("minutes");
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("tech_articles")
    .select("id, title, summary, authors, published_at, level, word_count")
    .order("published_at", { ascending: false })
    .limit(100);
  return error ? [] : ((data ?? []) as TechArticleItem[]);
}

export async function getTechArticle(id: string): Promise<TechArticle | null> {
  "use cache";
  cacheLife("hours");
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("tech_articles")
    .select("id, title, summary, authors, published_at, level, word_count, source_url, counter_url, blocks, disclosure")
    .eq("id", id)
    .maybeSingle();
  return error ? null : (data as TechArticle | null);
}
