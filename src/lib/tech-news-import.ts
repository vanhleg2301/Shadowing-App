// Imports AI articles from The Conversation for News > AI & Tech. Run daily by /api/cron/tech-news.
//
// The Conversation allows republishing under CC BY-ND (https://theconversation.com/republishing-guidelines) with
// these rules, which the importer and the reader keep: the words are not edited; authors, their institutions and
// The Conversation are credited with a link; the page counter is shown; images are left out because their rights
// differ; and not everything is republished, so each run takes only a few articles. Needs migration 025.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { TechArticle, TechArticleBlock } from "./tech-news";

const FEED_URL = "https://theconversation.com/topics/artificial-intelligence-ai-90/articles.atom";
const USER_AGENT = "Mozilla/5.0 (compatible; ShadowingAppImporter/1.0; +https://shadowing-app-liard.vercel.app)";
const MIN_WORDS = 300;
const MAX_WORDS = 1800;
const BLOCK_TYPES: Record<string, TechArticleBlock["type"]> = { p: "p", h2: "h", h3: "h", h4: "h", li: "li" };
const SKIPPED_TAGS = new Set(["figure", "script", "style", "iframe"]);
const RAW_TEXT_TAGS = new Set(["script", "style"]);
// The feed's AI tag also covers articles that only mention AI, so the title or summary must be about technology.
const ON_TOPIC =
  /\b(AI|artificial intelligence|chatgpt|chatbots?|grok|claude|gemini|machine learning|algorithms?|software|coding|code|programm\w+|computers?|cyber\w*|hack\w*|data cent\w+|internet|websites?|robots?|driverless|tech|technology|PHP|digital)\b/i;

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", mdash: "—", ndash: "–",
  lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”", copy: "©", eacute: "é", pound: "£", euro: "€",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, name: string) => {
    if (name[0] === "#") {
      const code = name[1].toLowerCase() === "x" ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[name.toLowerCase()] ?? match;
  });
}

interface ParsedHtml {
  blocks: TechArticleBlock[];
  disclosure: string | null;
  hasTable: boolean;
}

// Collects the article's text blocks, without its images and captions.
function parseArticleHtml(html: string): ParsedHtml {
  const result: ParsedHtml = { blocks: [], disclosure: null, hasTable: false };
  let skipDepth = 0;
  let blockDepth = 0;
  let blockType: TechArticleBlock["type"] = "p";
  let isFinePrint = false;
  let text: string[] = [];

  const openTag = (tag: string, attrs: string) => {
    if (tag === "table") result.hasTable = true;
    if (SKIPPED_TAGS.has(tag)) skipDepth++;
    else if (!skipDepth && tag in BLOCK_TYPES) {
      if (blockDepth === 0) {
        blockType = BLOCK_TYPES[tag];
        isFinePrint = /class\s*=\s*["'][^"']*fine-print/i.test(attrs);
        text = [];
      }
      blockDepth++;
    }
  };
  const closeTag = (tag: string) => {
    if (SKIPPED_TAGS.has(tag)) skipDepth = Math.max(skipDepth - 1, 0);
    else if (!skipDepth && tag in BLOCK_TYPES && blockDepth > 0) {
      blockDepth--;
      if (blockDepth === 0) {
        const blockText = text.join("").replace(/\s+/g, " ").trim();
        if (blockText && isFinePrint) result.disclosure = blockText;
        else if (blockText) result.blocks.push({ type: blockType, text: blockText });
      }
    }
  };

  const tagPattern = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
  let last = 0;
  for (let match = tagPattern.exec(html); match; match = tagPattern.exec(html)) {
    if (blockDepth && !skipDepth) text.push(decodeEntities(html.slice(last, match.index)));
    last = tagPattern.lastIndex;
    if (!match[2]) continue;
    const tag = match[2].toLowerCase();
    const attrs = match[3];
    if (match[1]) {
      closeTag(tag);
      continue;
    }
    openTag(tag, attrs);
    if (attrs.trimEnd().endsWith("/")) closeTag(tag);
    else if (RAW_TEXT_TAGS.has(tag)) {
      const end = html.toLowerCase().indexOf(`</${tag}`, last);
      if (end < 0) break;
      tagPattern.lastIndex = last = end;
    }
  }
  return result;
}

function countSyllables(word: string): number {
  const lower = word.toLowerCase();
  let count = (lower.match(/[aeiouy]+/g) ?? []).length;
  if (lower.endsWith("e") && !lower.endsWith("le") && count > 1) count--;
  return Math.max(count, 1);
}

// A rough CEFR level from the Flesch-Kincaid grade (sentence and word length), and the word count.
function estimateLevel(text: string): { level: string; wordCount: number } {
  const words = text.match(/[A-Za-z][A-Za-z'’-]*/g) ?? [];
  const sentences = Math.max((text.match(/[.!?]+(?:\s|$)/g) ?? []).length, 1);
  if (words.length === 0) return { level: "C1", wordCount: 0 };
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const grade = (0.39 * words.length) / sentences + (11.8 * syllables) / words.length - 15.59;
  for (const [limit, level] of [[6, "A2"], [8.5, "B1"], [11.5, "B2"], [14.5, "C1"]] as const) {
    if (grade <= limit) return { level, wordCount: words.length };
  }
  return { level: "C2", wordCount: words.length };
}

function getElementText(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`));
  if (!match) return "";
  const cdata = match[1].match(/^\s*<!\[CDATA\[([\s\S]*)\]\]>\s*$/);
  return cdata ? cdata[1] : decodeEntities(match[1]);
}

function parseEntry(entry: string): TechArticle | null {
  const number = getElementText(entry, "id").match(/article\/(\d+)$/);
  const content = getElementText(entry, "content");
  const counter = content.match(/https:\/\/counter\.theconversation\.com\/content\/\d+\/count\.gif/);
  const link = [...entry.matchAll(/<link\s[^>]*>/g)].map((m) => m[0]).find((tag) => /rel="alternate"/.test(tag));
  const href = link?.match(/href="([^"]*)"/)?.[1];
  if (!number || !counter || !href) return null;
  const parsed = parseArticleHtml(content);
  if (parsed.hasTable) return null; // a table can't be shown without it, and the text must stay whole
  const { level, wordCount } = estimateLevel(parsed.blocks.filter((b) => b.type !== "h").map((b) => b.text).join(" "));
  if (wordCount < MIN_WORDS || wordCount > MAX_WORDS) return null;
  const title = getElementText(entry, "title");
  const summary = getElementText(entry, "summary");
  if (!ON_TOPIC.test(`${title} ${summary}`)) return null;
  return {
    id: `tc-${number[1].padStart(8, "0")}`,
    title: title.trim(),
    summary: summary.trim(),
    authors: [...entry.matchAll(/<author>([\s\S]*?)<\/author>/g)].map((m) => getElementText(m[1], "name").trim()),
    source_url: decodeEntities(href),
    counter_url: counter[0],
    published_at: getElementText(entry, "published"),
    level,
    word_count: wordCount,
    blocks: parsed.blocks,
    disclosure: parsed.disclosure,
  };
}

export async function getFeedArticles(): Promise<{ entries: number; articles: TechArticle[] }> {
  const response = await fetch(FEED_URL, { headers: { "User-Agent": USER_AGENT }, cache: "no-store" });
  if (!response.ok) throw new Error(`Feed returned ${response.status}`);
  const xml = await response.text();
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => m[1]);
  const articles = entries.map(parseEntry).filter((a): a is TechArticle => a !== null);
  articles.sort((a, b) => b.published_at.localeCompare(a.published_at));
  return { entries: entries.length, articles };
}

export async function importTechArticles(admin: SupabaseClient, limit = 1) {
  const { data, error } = await admin.from("tech_articles").select("id");
  if (error) throw new Error(`Reading stored articles failed: ${error.message}`);
  const stored = new Set((data ?? []).map((row: { id: string }) => row.id));
  const { entries, articles } = await getFeedArticles();
  const fresh = articles.filter((a) => !stored.has(a.id)).slice(0, limit);
  if (fresh.length > 0) {
    const { error: insertError } = await admin.from("tech_articles").insert(fresh);
    if (insertError) throw new Error(`Storing articles failed: ${insertError.message}`);
  }
  return { entries, usable: articles.length, alreadyStored: stored.size, imported: fresh.map((a) => a.id) };
}
