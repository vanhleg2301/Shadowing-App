import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ListSkeleton } from "@/components/Skeleton";
import { formatNewsDate } from "@/lib/news";
import { getTechArticles } from "@/lib/tech-news";

export const metadata: Metadata = { title: "AI & Tech · Shadowing English" };

export default function AiTechPage() {
  return (
    <AppShell active="/news">
      <main className="w-full max-w-6xl px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:px-10">
        <Breadcrumbs items={[{ label: "News", href: "/news" }, { label: "AI & Tech" }]} />
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-[36px]">AI &amp; Tech</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Real articles about artificial intelligence, written by researchers for The Conversation. They are harder than the
          other news, so each one shows an estimated level. Tap any word for its meaning.
        </p>
        <Suspense fallback={<ListSkeleton />}>
          <ArticleList />
        </Suspense>
      </main>
    </AppShell>
  );
}

async function ArticleList() {
  const articles = await getTechArticles();
  if (articles.length === 0) return <p className="mt-8 text-muted">No articles yet. New ones arrive every morning.</p>;
  return (
    <ul className="stagger mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
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
  );
}
