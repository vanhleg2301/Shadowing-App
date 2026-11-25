import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { ArticleList } from "@/components/ArticleList";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { NewsList, VOA_TAB } from "@/components/NewsList";
import { PageNav } from "@/components/PageNav";
import { ListSkeleton } from "@/components/Skeleton";
import { getNewsVideos } from "@/lib/catalog";
import { NEWS_LEVELS, NEWS_TOPICS, formatNewsDate, getTopicHref, isNewsLevel, isNewsTopic, isUpToLevel, type NewsLevel, type NewsTopic } from "@/lib/news";
import { getTechArticles } from "@/lib/tech-news";

const STORIES_PER_PAGE = 13;
const ARTICLES_PER_PAGE = 20;

type Tab = NewsTopic | typeof VOA_TAB | null;

export default function NewsPage({ searchParams }: PageProps<"/news">) {
  return (
    <AppShell active="/news">
      <main className="w-full max-w-6xl px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:px-10">
        <Breadcrumbs items={[{ label: "News" }]} />
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-[36px]">News</h1>
        <p className="mt-2 max-w-2xl text-muted">
          New articles every morning from The Conversation, written by researchers for everyone. They are real English, so each
          one shows an estimated level. Read along, listen, and tap any word for its meaning.
        </p>
        <Suspense fallback={<ListSkeleton />}>
          {searchParams.then((sp) => {
            const topic = typeof sp.topic === "string" ? sp.topic : "";
            const tab: Tab = topic === VOA_TAB ? VOA_TAB : isNewsTopic(topic) ? topic : null;
            const page = Number(sp.page) || 1;
            const level = typeof sp.level === "string" && isNewsLevel(sp.level) ? sp.level : null;
            return (
              <>
                <NewsTabs tab={tab} level={level} />
                {tab === VOA_TAB ? (
                  <VoaStories category={typeof sp.category === "string" ? sp.category : null} page={page} />
                ) : (
                  <Articles topic={tab} page={page} level={level} />
                )}
              </>
            );
          })}
        </Suspense>
      </main>
    </AppShell>
  );
}

// The chosen level stays on when switching topics.
function NewsTabs({ tab, level }: { tab: Tab; level: NewsLevel | null }) {
  const tabs: { label: string; href: string; isCurrent: boolean }[] = [
    { label: "Latest", href: getTopicHref(null, 1, level), isCurrent: tab === null },
    ...NEWS_TOPICS.map((topic) => ({ label: topic, href: getTopicHref(topic, 1, level), isCurrent: tab === topic })),
    { label: "VOA archive", href: `/news?topic=${VOA_TAB}`, isCurrent: tab === VOA_TAB },
  ];
  return (
    <nav aria-label="News topics" className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
      {tabs.map((t) => (
        <Link
          key={t.label}
          href={t.href}
          aria-current={t.isCurrent ? "page" : undefined}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
            t.isCurrent ? "border-brand bg-brand text-on-brand" : "border-line bg-surface text-ink"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

async function Articles({ topic, page, level }: { topic: NewsTopic | null; page: number; level: NewsLevel | null }) {
  const all = await getTechArticles(topic ?? undefined);
  if (all.length === 0) return <p className="mt-8 text-muted">No articles here yet. New ones arrive every morning.</p>;
  const articles = level ? all.filter((a) => isUpToLevel(a.level, level)) : all;
  const totalPages = Math.max(1, Math.ceil(articles.length / ARTICLES_PER_PAGE));
  const safePage = Math.min(Math.max(1, Math.floor(page)), totalPages);
  const levels = [
    { label: "All levels", value: null, count: all.length },
    ...NEWS_LEVELS.map((value) => ({ label: `Up to ${value}`, value, count: all.filter((a) => isUpToLevel(a.level, value)).length })),
  ];
  return (
    <>
      <nav aria-label="Article level" className="no-scrollbar -mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
        <span className="shrink-0 text-sm font-semibold text-muted">Level:</span>
        {levels.map((l) => (
          <Link
            key={l.label}
            href={getTopicHref(topic, 1, l.value)}
            aria-current={l.value === level ? "page" : undefined}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold ${
              l.value === level ? "border-ink bg-ink text-cream" : "border-line bg-surface text-ink"
            }`}
          >
            {l.label} <span className="font-normal opacity-70">{l.count}</span>
          </Link>
        ))}
      </nav>
      {articles.length === 0 ? (
        <p className="mt-6 text-muted">No articles at this level here yet. Try a higher level or another topic: most news is B2 and above.</p>
      ) : (
        <>
          <ArticleList articles={articles.slice((safePage - 1) * ARTICLES_PER_PAGE, safePage * ARTICLES_PER_PAGE)} isTopicShown={topic === null} />
          <PageNav page={safePage} totalPages={totalPages} hrefFor={(p) => getTopicHref(topic, p, level)} />
        </>
      )}
    </>
  );
}

async function VoaStories({ category, page }: { category: string | null; page: number }) {
  const videos = await getNewsVideos();
  if (videos.length === 0) return <p className="mt-8 text-muted">No stories yet.</p>;
  const categories = [...new Set(videos.map((v) => v.category ?? "News"))];
  const current = category && categories.includes(category) ? category : null;
  const filtered = current ? videos.filter((v) => v.category === current) : videos;
  const totalPages = Math.max(1, Math.ceil(filtered.length / STORIES_PER_PAGE));
  const safePage = Math.min(Math.max(1, Math.floor(page)), totalPages);
  const stories = filtered.slice((safePage - 1) * STORIES_PER_PAGE, safePage * STORIES_PER_PAGE).map((v) => ({
    videoId: v.videoId,
    title: v.title,
    category: v.category ?? "News",
    duration: v.duration,
    level: v.level,
    dateLabel: formatNewsDate(v.publishedAt),
  }));
  return <NewsList stories={stories} categories={categories} category={current} page={safePage} totalPages={totalPages} />;
}
