import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ListSkeleton } from "@/components/Skeleton";
import { getThumbnailUrl } from "@/lib/media";
import { formatNewsDate } from "@/lib/news";
import { getTechArticles, getTechVideos } from "@/lib/tech-news";

export const metadata: Metadata = { title: "AI & Tech · Shadowing English" };

export default function AiTechPage() {
  return (
    <AppShell active="/news">
      <main className="w-full max-w-6xl px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:px-10">
        <Breadcrumbs items={[{ label: "News", href: "/news" }, { label: "AI & Tech" }]} />
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-[36px]">AI &amp; Tech</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Real videos and articles about artificial intelligence, programming and technology. They are harder than the other
          news, so each one shows an estimated level. Shadow the videos, and tap any word for its meaning.
        </p>
        <Suspense fallback={<ListSkeleton />}>
          <VideoList />
          <ArticleList />
        </Suspense>
      </main>
    </AppShell>
  );
}

async function VideoList() {
  const videos = await getTechVideos();
  if (videos.length === 0) return null;
  return (
    <section className="mt-6">
      <h2 className="text-xl font-extrabold text-ink">Videos</h2>
      <ul className="stagger mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        {videos.map((video) => (
          <li key={video.video_id}>
            <Link href={`/watch/${video.video_id}`} className="pressable group flex h-full gap-3 rounded-2xl border border-line bg-surface p-2.5 hover:border-brand">
              <div className="relative aspect-video w-32 shrink-0 self-start overflow-hidden rounded-xl bg-cream">
                <Image src={getThumbnailUrl(video.video_id)} alt="" fill sizes="128px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1 py-0.5">
                <p className="text-xs font-bold uppercase tracking-wide text-accent">
                  ≈{video.level}
                  <span className="text-muted"> · {video.duration}</span>
                </p>
                <p className="mt-1 line-clamp-2 font-bold leading-snug text-ink group-hover:text-brand">{video.title}</p>
                <p className="mt-0.5 truncate text-sm text-muted">{video.channel}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

async function ArticleList() {
  const articles = await getTechArticles();
  if (articles.length === 0) return <p className="mt-8 text-muted">No articles yet. New ones arrive every morning.</p>;
  return (
    <section className="mt-8">
      <h2 className="text-xl font-extrabold text-ink">Articles</h2>
      <ul className="stagger mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        {articles.map((article) => (
          <li key={article.id}>
            <Link href={`/news/ai-tech/${article.id}`} className="pressable block h-full rounded-3xl border border-line bg-surface p-4 hover:border-brand">
              <p className="text-xs font-bold uppercase tracking-wide text-accent">
                ≈{article.level}
                <span className="text-muted">
                  {" "}
                  · {formatNewsDate(article.published_at)} · {Math.max(1, Math.round(article.word_count / 200))} min read
                </span>
              </p>
              <p className="mt-1 font-bold leading-snug text-ink">{article.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{article.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
