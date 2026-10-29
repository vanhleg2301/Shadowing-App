import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { NewsReader } from "@/components/NewsReader";
import { LessonSkeleton } from "@/components/Skeleton";
import { getCatalogVideo } from "@/lib/catalog";
import { getLesson } from "@/lib/lessons";
import { isHostedLesson } from "@/lib/media";
import { formatNewsDate } from "@/lib/news";
import { getLessonUserState } from "@/lib/user-data";

export default function NewsStoryPage({ params }: PageProps<"/news/[videoId]">) {
  return (
    <AppShell active="/news">
      <Suspense fallback={<LessonSkeleton />}>
        {params.then(({ videoId }) => (
          <Story videoId={videoId} />
        ))}
      </Suspense>
    </AppShell>
  );
}

async function Story({ videoId }: { videoId: string }) {
  if (!isHostedLesson(videoId)) notFound();
  const [result, video, userState] = await Promise.all([
    getLesson(videoId).catch(() => null),
    getCatalogVideo(videoId).catch(() => undefined),
    getLessonUserState(videoId).catch(() => ({ savedWords: [] as string[] })),
  ]);
  const lesson = result && result.error === undefined ? result.lesson : null;
  if (!lesson?.media) notFound();

  return (
    <NewsReader
      lesson={{ ...lesson, media: lesson.media }}
      category={video?.category ?? "News"}
      dateLabel={formatNewsDate(video?.publishedAt)}
      initialSavedWords={userState.savedWords}
    />
  );
}
