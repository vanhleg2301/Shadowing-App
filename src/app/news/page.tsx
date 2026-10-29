import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { NewsList } from "@/components/NewsList";
import { ListSkeleton } from "@/components/Skeleton";
import { getNewsVideos } from "@/lib/catalog";
import { formatNewsDate } from "@/lib/news";

export default function NewsPage() {
  return (
    <AppShell active="/news">
      <main className="w-full max-w-6xl px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:px-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-[40px]">News</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Short news stories read slowly and clearly by VOA Learning English. Listen, read along and tap any word.
        </p>
        <Suspense fallback={<ListSkeleton />}>
          <NewsContent />
        </Suspense>
      </main>
    </AppShell>
  );
}

async function NewsContent() {
  const videos = await getNewsVideos();
  if (videos.length === 0) {
    return <p className="mt-8 text-muted">No stories yet. New ones arrive every morning.</p>;
  }
  const stories = videos.map((v) => ({
    videoId: v.videoId,
    title: v.title,
    category: v.category ?? "News",
    duration: v.duration,
    level: v.level,
    dateLabel: formatNewsDate(v.publishedAt),
  }));
  return <NewsList stories={stories} />;
}
