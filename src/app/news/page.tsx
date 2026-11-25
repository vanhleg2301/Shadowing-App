import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { ArticleList } from "@/components/ArticleList";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { NewsList, VOA_TAB } from "@/components/NewsList";
import { PageNav } from "@/components/PageNav";
import { ListSkeleton } from "@/components/Skeleton";
import { getNewsVideos } from "@/lib/catalog";
import { NEWS_TOPICS, formatNewsDate, getTopicHref, isNewsTopic, type NewsTopic } from "@/lib/news";
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
            return (
              <>
                <NewsTabs tab={tab} />
                {tab === VOA_TAB ? (
                  <VoaStories category={typeof sp.category === "string" ? sp.category : null} page={page} />
                ) : (
                  <Articles topic={tab} page={page} />
                )}
              </>
            );
          })}
        </Suspense>
      </main>
    </AppShell>
  );
}

function NewsTabs({ tab }: { tab: Tab }) {
  const tabs: { label: string; href: string; isCurrent: boolean }[] = [
    { label: "Latest", href: "/news", isCurrent: tab === null },
    ...NEWS_TOPICS.map((topic) => ({ label: topic, href: getTopicHref(topic), isCurrent: tab === topic })),
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

async function Articles({ topic, page }: { topic: NewsTopic | null; page: number }) {
  const articles = await getTechArticles(topic ?? undefined);
  if (articles.length === 0) return <p className="mt-8 text-muted">No articles here yet. New ones arrive every morning.</p>;
  const totalPages = Math.max(1, Math.ceil(articles.length / ARTICLES_PER_PAGE));
  const safePage = Math.min(Math.max(1, Math.floor(page)), totalPages);
  return (
    <>
      <ArticleList articles={articles.slice((safePage - 1) * ARTICLES_PER_PAGE, safePage * ARTICLES_PER_PAGE)} isTopicShown={topic === null} />
      <PageNav page={safePage} totalPages={totalPages} hrefFor={(p) => getTopicHref(topic, p)} />
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
