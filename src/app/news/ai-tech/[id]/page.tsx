import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { LessonSkeleton } from "@/components/Skeleton";
import { TechArticleReader } from "@/components/TechArticleReader";
import { formatNewsDate } from "@/lib/news";
import { getTechArticle } from "@/lib/tech-news";
import { getLessonUserState } from "@/lib/user-data";

export const metadata: Metadata = { title: "AI & Tech · Shadowing English" };

export default function TechArticlePage({ params }: PageProps<"/news/ai-tech/[id]">) {
  return (
    <AppShell active="/news">
      <Suspense fallback={<LessonSkeleton />}>
        {params.then(({ id }) => (
          <Article id={id} />
        ))}
      </Suspense>
    </AppShell>
  );
}

async function Article({ id }: { id: string }) {
  if (!/^tc-\d{8}$/.test(id)) notFound();
  const [article, userState] = await Promise.all([
    getTechArticle(id).catch(() => null),
    getLessonUserState(id).catch(() => ({ isFavorite: false, savedWords: [] as string[] })),
  ]);
  if (!article) notFound();
  return <TechArticleReader article={article} dateLabel={formatNewsDate(article.published_at)} initialSavedWords={userState.savedWords} initialIsFavorite={userState.isFavorite} />;
}
