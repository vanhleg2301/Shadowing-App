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

// AI & Tech has its own page, with videos too; the other topics are a filter on /news.
export function getTopicHref(topic: NewsTopic | null, page = 1): string {
  if (topic === "AI & Tech") return "/news/ai-tech";
  const params = new URLSearchParams();
  if (topic) params.set("topic", topic);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/news?${search}` : "/news";
}
