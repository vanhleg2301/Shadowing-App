// Dates are formatted on the server so the page and the browser never disagree about the time zone.
export function formatNewsDate(publishedAt: string | undefined): string | null {
  if (!publishedAt) return null;
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

// Sections of the daily articles from The Conversation (src/lib/tech-news-import.ts).
export const NEWS_TOPICS = ["World", "Politics", "Economy", "Health", "Environment", "Science & Tech", "Education", "Culture", "AI & Tech"] as const;
export type NewsTopic = (typeof NEWS_TOPICS)[number];

export function isNewsTopic(value: string): value is NewsTopic {
  return (NEWS_TOPICS as readonly string[]).includes(value);
}

export function getArticleHref(id: string): string {
  return `/news/article/${id}`;
}

// Articles are real English, mostly B2 and harder; a learner can hide the ones above their level.
const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];
export const NEWS_LEVELS = ["B1", "B2", "C1"] as const;
export type NewsLevel = (typeof NEWS_LEVELS)[number];

export function isNewsLevel(value: string): value is NewsLevel {
  return (NEWS_LEVELS as readonly string[]).includes(value);
}

export function isUpToLevel(level: string, max: NewsLevel): boolean {
  const index = LEVEL_ORDER.indexOf(level);
  return index >= 0 && index <= LEVEL_ORDER.indexOf(max);
}

// Easier first; an unknown level counts as the hardest.
export function getLevelRank(level: string): number {
  const index = LEVEL_ORDER.indexOf(level);
  return index < 0 ? LEVEL_ORDER.length : index;
}

// AI & Tech has its own page, with videos too; the other topics are a filter on /news.
export function getTopicHref(topic: NewsTopic | null, page = 1, level: NewsLevel | null = null): string {
  if (topic === "AI & Tech") return "/news/ai-tech";
  const params = new URLSearchParams();
  if (topic) params.set("topic", topic);
  if (level) params.set("level", level);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/news?${search}` : "/news";
}
