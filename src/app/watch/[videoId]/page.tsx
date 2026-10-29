import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LessonPlayer } from "@/components/LessonPlayer";
import { ListenNotesPlayer } from "@/components/ListenNotesPlayer";
import { LessonSkeleton } from "@/components/Skeleton";
import { getCatalogVideo } from "@/lib/catalog";
import { NO_SUBTITLES_ERROR } from "@/lib/captions";
import { getLessonPart, getPartForSentence, getTimePart, type TimePart } from "@/lib/lesson-parts";
import { getLesson, type LessonResult } from "@/lib/lessons";
import { getLessonUserState, getVideoNotes } from "@/lib/user-data";
import { isValidVideoId } from "@/lib/youtube-url";

const MODES = ["watch", "shadow", "dictation", "cloze"] as const;
type StartMode = (typeof MODES)[number];

interface LessonOptions {
  mode: StartMode;
  isListenFirst: boolean;
  backHref: string;
  playbackRate: number;
  part: number | null;
  // Opens at this sentence (from phrase search) instead of where the learner left off.
  sentence: number | null;
  // The query to keep when moving between parts (mode, course day, speed).
  query: string;
}

const RATES = [0.5, 0.75, 1, 1.25];

// Course links open a lesson in a given mode (?mode=shadow, ?listen=1) and return to the course day (?from=course-3).
function parseOptions(sp: Record<string, string | string[] | undefined>): LessonOptions {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const mode = first(sp.mode);
  const courseDay = first(sp.from)?.match(/^course-(\d{1,2})$/)?.[1];
  return {
    mode: (MODES as readonly string[]).includes(mode ?? "") ? (mode as StartMode) : "watch",
    isListenFirst: first(sp.listen) === "1",
    backHref: courseDay ? `/course/${courseDay}` : "/",
    playbackRate: RATES.includes(Number(first(sp.rate))) ? Number(first(sp.rate)) : 1,
    part: Number(first(sp.part)) || null,
    sentence: /^\d{1,5}$/.test(first(sp.s) ?? "") ? Number(first(sp.s)) : null,
    query: new URLSearchParams(
      Object.entries(sp).flatMap(([key, value]) => (key === "part" || key === "s" || value === undefined ? [] : [[key, first(value) ?? ""]])),
    ).toString(),
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

  // Catalog videos without a stored transcript skip getLesson: the server can't fetch YouTube captions,
  // and a cached failure would outlive the transcript being stored later.
  const catalogVideo = await getCatalogVideo(videoId).catch(() => undefined);
  if (catalogVideo?.hasTranscript === false) {
    return (
      <NotesLoader
        videoId={videoId}
        title={catalogVideo.title}
        backHref={options.backHref}
        part={getTimePart(catalogVideo.duration, options.part)}
        partQuery={options.query}
      />
    );
  }

  const userStatePromise = getLessonUserState(videoId).catch(() => ({ isFavorite: false, savedWords: [], lastSentence: 0 }));
  let result: LessonResult;
  try {
    result = await getLesson(videoId);
  } catch {
    result = { error: "Couldn't load this lesson. Please try again later." };
  }

  if (result.error === NO_SUBTITLES_ERROR) {
    return <NotesLoader videoId={videoId} title="YouTube video" backHref={options.backHref} />;
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
  const lastSentence = Math.min(options.sentence ?? userState.lastSentence, result.lesson.sentences.length - 1);
  // Long videos open in parts of about 5 minutes; without ?part= the learner resumes in the part they were in.
  const cut = getLessonPart(result.lesson, options.part ?? getPartForSentence(result.lesson, lastSentence));
  const lesson = cut?.lesson ?? result.lesson;
  const initialSentence = cut ? Math.min(Math.max(lastSentence - cut.part.offset, 0), lesson.sentences.length - 1) : lastSentence;
  return (
    <LessonPlayer
      lesson={lesson}
      part={cut?.part}
      partQuery={options.query}
      initialIsFavorite={userState.isFavorite}
      initialSavedWords={userState.savedWords}
      initialSentence={initialSentence}
      initialMode={options.mode}
      isListenFirst={options.isListenFirst}
      backHref={options.backHref}
      initialRate={options.playbackRate}
    />
  );
}

interface NotesLoaderProps {
  videoId: string;
  title: string;
  backHref: string;
  part?: TimePart | null;
  partQuery?: string;
}

async function NotesLoader({ videoId, title, backHref, part, partQuery }: NotesLoaderProps) {
  const notes = await getVideoNotes(videoId).catch(() => null);
  return <ListenNotesPlayer videoId={videoId} title={title} initialNotes={notes} backHref={backHref} part={part ?? undefined} partQuery={partQuery} />;
}
