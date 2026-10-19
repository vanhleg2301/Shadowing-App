import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LessonPlayer } from "@/components/LessonPlayer";
import { getLessonUserState } from "@/lib/user-data";
import { getLesson, type LessonResult } from "@/lib/youtube";
import { isValidVideoId } from "@/lib/youtube-url";

export default function WatchPage({ params }: PageProps<"/watch/[videoId]">) {
  return (
    <Suspense fallback={<p className="grid h-dvh place-items-center text-muted">Preparing your lesson...</p>}>
      {params.then(({ videoId }) => (
        <LessonLoader videoId={videoId} />
      ))}
    </Suspense>
  );
}

async function LessonLoader({ videoId }: { videoId: string }) {
  if (!isValidVideoId(videoId)) notFound();

  const userStatePromise = getLessonUserState(videoId).catch(() => ({ isFavorite: false, savedWords: [] }));
  let result: LessonResult;
  try {
    result = await getLesson(videoId);
  } catch {
    result = { error: "Couldn't load this lesson. Please try again later." };
  }

  if (result.error !== undefined) {
    return (
      <div className="grid h-dvh place-items-center px-6 text-center">
        <div>
          <p className="text-lg font-semibold text-ink">{result.error}</p>
          <Link href="/" className="btn-3d btn-brand mt-4 px-5 py-2.5">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const userState = await userStatePromise;
  return (
    <LessonPlayer
      lesson={result.lesson}
      initialIsFavorite={userState.isFavorite}
      initialSavedWords={userState.savedWords}
    />
  );
}
