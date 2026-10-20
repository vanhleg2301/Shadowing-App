import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LessonPlayer } from "@/components/LessonPlayer";
import { LessonSkeleton } from "@/components/Skeleton";
import { getLesson, type LessonResult } from "@/lib/lessons";
import { getLessonUserState } from "@/lib/user-data";
import { isValidVideoId } from "@/lib/youtube-url";

const MODES = ["watch", "shadow", "dictation", "cloze"] as const;
type StartMode = (typeof MODES)[number];

interface LessonOptions {
  mode: StartMode;
  isListenFirst: boolean;
  backHref: string;
}

// Course links open a lesson in a given mode (?mode=shadow, ?listen=1) and return to the course day (?from=course-3).
function parseOptions(sp: Record<string, string | string[] | undefined>): LessonOptions {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const mode = first(sp.mode);
  const courseDay = first(sp.from)?.match(/^course-(\d{1,2})$/)?.[1];
  return {
    mode: (MODES as readonly string[]).includes(mode ?? "") ? (mode as StartMode) : "watch",
    isListenFirst: first(sp.listen) === "1",
    backHref: courseDay ? `/course/${courseDay}` : "/",
  };
}

export default function WatchPage({ params, searchParams }: PageProps<"/watch/[videoId]">) {
  return (
    <Suspense fallback={<LessonSkeleton />}>
      {Promise.all([params, searchParams]).then(([{ videoId }, sp]) => (
        <LessonLoader videoId={videoId} options={parseOptions(sp)} />
      ))}
    </Suspense>
  );
}

async function LessonLoader({ videoId, options }: { videoId: string; options: LessonOptions }) {
  if (!isValidVideoId(videoId)) notFound();

  const userStatePromise = getLessonUserState(videoId).catch(() => ({ isFavorite: false, savedWords: [], lastSentence: 0 }));
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
      initialSentence={Math.min(userState.lastSentence, result.lesson.sentences.length - 1)}
      initialMode={options.mode}
      isListenFirst={options.isListenFirst}
      backHref={options.backHref}
    />
  );
}
