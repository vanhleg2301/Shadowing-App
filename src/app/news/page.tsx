import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { NewsList } from "@/components/NewsList";
import { ListSkeleton } from "@/components/Skeleton";
import { getNewsVideos } from "@/lib/catalog";
import { formatNewsDate } from "@/lib/news";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const STORIES_PER_PAGE = 13;

export default function NewsPage({ searchParams }: PageProps<"/news">) {
  return (
    <AppShell active="/news">
      <main className="w-full max-w-6xl px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:px-10">
        <Breadcrumbs items={[{ label: "News" }]} />
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-[36px]">News</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Short news stories read slowly and clearly by VOA Learning English. Listen, read along and tap any word.
        </p>
        <Suspense fallback={<ListSkeleton />}>
          {searchParams.then((sp) => (
            <NewsContent category={typeof sp.category === "string" ? sp.category : null} page={Number(sp.page) || 1} />
          ))}
        </Suspense>
      </main>
    </AppShell>
  );
}

async function NewsContent({ category, page }: { category: string | null; page: number }) {
  const videos = await getNewsVideos();
  if (videos.length === 0) {
    return <p className="mt-8 text-muted">No stories yet. New ones arrive every morning.</p>;
  }
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
