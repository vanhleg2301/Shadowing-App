"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { savePhrasesToReview, setCourseBlockDone, setCourseBlocksDone } from "@/app/actions";
import { CoursePractice } from "@/components/course/CoursePractice";
import { CourseTakeTurns } from "@/components/course/CourseTakeTurns";
import { DayTest } from "@/components/course/DayTest";
import { CardDeck } from "@/components/lesson/CardDeck";
import { FocusScreen } from "@/components/lesson/FocusScreen";
import { LessonPath, type LessonStage } from "@/components/lesson/LessonPath";
import { VideoGuideSection } from "@/components/course/VideoGuideSection";
import { SentencePlayerSheet } from "@/components/course/SentencePlayerSheet";
import { SpeakingPrompt } from "@/components/course/SpeakingPrompt";
import { VideoSentence } from "@/components/course/VideoSentence";
import { StudyTimer } from "@/components/StudyTimer";
import { Icon, type IconName } from "@/components/Icon";
import { WordLookupSheet } from "@/components/WordLookupSheet";
import { type BlockKind, type CourseBlock, type CourseDay, type CoursePhrase } from "@/data/course-a2";
import { isCourseDayComplete, TEST_SKIPPED_BLOCK } from "@/data/courses";
import { dayInWeek, weekOf } from "@/data/course-weeks";
import { useAuth } from "@/hooks/useAuth";
import { useWordLookup } from "@/hooks/useWordLookup";
import { speak } from "@/lib/speech";
import { buildDayTest, getPassScore } from "@/lib/day-test";
import type { DayGuide, DayStudy, StudySentence, WarmUpSentence } from "@/lib/video-study";
import { LessonNotes } from "@/components/LessonNotes";
import { QuickAnswers } from "@/components/speak/QuickAnswers";
import { useLinePlayer } from "@/hooks/useLinePlayer";
import type { QuickTopic } from "@/data/quick-answers";
import type { LineNarration } from "@/lib/story-audio";

interface CourseDayViewProps {
  day: CourseDay;
  courseId: string;
  // The day within its week, which is how progress is stored.
  progressDay: number;
  blocks: CourseBlock[];
  // Words and sentences from the day's main video; null when its transcript isn't stored yet.
  study: DayStudy | null;
  // The main video's written guide, when there is one.
  guide: DayGuide | null;
  // Sentences from the main videos 1, 3 and 7 study days back, for the warm-up.
  warmUp: WarmUpSentence[];
  // Speaking reflex questions on the main video's topic, with their recording.
  quick: { topic: QuickTopic; narration: LineNarration | null };
  // The app's Kokoro sentences, for reading the video guide's model aloud.
  appNarration: LineNarration | null;
  initialDone: string[];
  isSignedIn: boolean;
  hasNextDay: boolean;
  // The Gentle plan shows fewer phrases and questions and opens videos slower.
  phraseCount?: number;
  promptCount?: number;
  playbackRate?: number;
}

const KIND_ICON: Record<BlockKind, IconName> = {
  review: "repeat",
  words: "book",
  watch: "headphones",
  practice: "mic",
  quiz: "chart",
  quick: "chat",
  more: "plus",
  listen: "headphones",
  free: "play",
};

const DEFAULT_PROMPT_COUNT = 3;

const fromCourse = (day: number, playbackRate?: number) => `from=course-${day}${playbackRate ? `&rate=${playbackRate}` : ""}`;

// Steps done elsewhere: a rest day's videos, Review, or anything the learner enjoys. The warm-up is its own screen
// when earlier videos gave sentences to hear again; otherwise it is Review.
function blockHref(block: CourseBlock, day: number, playbackRate: number | undefined, hasReviewSection: boolean): string | null {
  if (block.kind === "review") return hasReviewSection ? null : "/review";
  if (block.kind === "free") return block.id === "stories" ? "/stories" : "/";
  if (!block.videoId) return null;
  return `/watch/${block.videoId}?mode=watch&listen=1&${fromCourse(day, playbackRate)}`;
}

type SectionId = "review" | "words" | "practice" | "quiz" | "quick" | "more";
const SECTION_KINDS: readonly string[] = ["review", "words", "practice", "quiz", "quick", "more"];
// Parts of "More if you have time", each on its own screen.
type ExtraScreen = "turns" | "speak" | "guide";
const EXTRA_SCREENS: readonly string[] = ["turns", "speak", "guide"];
const PRACTICE_SIZE = 5;

// Short enough to type on a phone, long enough to be more than a greeting.
function pickPracticeSentences(sentences: StudySentence[]): StudySentence[] {
  const fits = sentences.filter((s) => {
    const words = s.text.split(/\s+/).length;
    return words >= 4 && words <= 14;
  });
  return (fits.length >= PRACTICE_SIZE ? fits : sentences).slice(0, PRACTICE_SIZE);
}

function getStepTip(block: CourseBlock): string {
  if (block.kind === "listen") return "Listen with the text hidden. Notice what you understand now that you didn't before.";
  if (block.kind === "review") return "Go through the words you saved, as flashcards.";
  return "Anything you enjoy counts: a video, a podcast, a story.";
}

function getStepLink(block: CourseBlock): string {
  if (block.kind === "review") return "Open Review";
  if (block.kind === "free") return block.id === "stories" ? "Open Stories" : "Find something to watch";
  return "Open the video";
}

interface Prompt {
  text: string;
  sampleAnswer?: string;
}

// Speaking starts from the video: say the guide's model with your own details (or retell the video), then say
// something true about yourself with its own chunks, copying the line from the video first.
function getPrompts(study: DayStudy | null, guide: DayGuide | null, day: CourseDay, count: number): Prompt[] {
  if (!study) return day.speakingPrompts.slice(0, count).map((text) => ({ text }));
  return [
    guide
      ? { text: `${guide.model.title}: say the model with your own details.`, sampleAnswer: guide.model.text }
      : { text: `Retell “${study.title}” in your own words. What is it about? Say three things you remember.` },
    ...study.items.slice(0, count - 1).map((item) => ({ text: `Say something about your own life with “${item.text}”.`, sampleAnswer: item.sentence.text })),
  ];
}

export function CourseDayView({
  day: fullDay,
  courseId,
  progressDay,
  blocks,
  study,
  guide,
  warmUp,
  quick,
  appNarration,
  initialDone,
  isSignedIn,
  hasNextDay,
  phraseCount,
  promptCount = DEFAULT_PROMPT_COUNT,
  playbackRate,
}: CourseDayViewProps) {
  const day: CourseDay = { ...fullDay, phrases: phraseCount ? fullDay.phrases.slice(0, phraseCount) : fullDay.phrases };
  // Without a stored transcript the day falls back to its hand-written phrases.
  const phrases: CoursePhrase[] = study
    ? study.items.map((item) => ({ text: item.text, meaning: "", example: item.sentence.text }))
    : day.phrases;
  const prompts = getPrompts(study, guide, day, promptCount);
  const testQuestions = buildDayTest(study, phrases, guide?.questions ?? [], day.day * 7);
  const hasReviewSection = warmUp.length > 0;
  // Only the activities this day has: review and free days are all videos, and words need something to show.
  const sections = SECTION_KINDS.filter((kind) => {
    if (!blocks.some((b) => b.kind === kind)) return false;
    if (kind === "review") return hasReviewSection;
    if (kind === "practice") return study !== null;
    return kind === "words" ? phrases.length > 0 : kind === "quiz" ? testQuestions.length > 0 : true;
  });
  const { lookup, openWord, sheetProps } = useWordLookup(study?.videoId ?? "", []);
  const { signInWithGoogle } = useAuth();
  const appVoice = useLinePlayer(appNarration);
  const [done, setDone] = useState(() => new Set(initialDone));
  const [recorded, setRecorded] = useState(() => new Set<number>());
  const [phraseMessage, setPhraseMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const required = blocks.filter((b) => !b.isOptional);
  const minutesLeft = required.filter((b) => !done.has(b.id)).reduce((sum, b) => sum + b.minutes, 0);
  const isDayComplete = isCourseDayComplete(blocks, done);
  const sentenceHref = (videoId: string, index: number) => `/watch/${videoId}?mode=shadow&s=${index}&${fromCourse(day.day, playbackRate)}`;
  const [heard, setHeard] = useState<{ videoId: string; sentence: StudySentence } | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const openBlock = blocks.find((b) => b.id === open) ?? null;
  const close = () => setOpen(null);
  const backToMore = () => setOpen("more");

  const toggleBlock = (blockId: string, isDone: boolean) => {
    if (!isSignedIn) {
      signInWithGoogle();
      return;
    }
    setDone((prev) => {
      const next = new Set(prev);
      if (isDone) next.add(blockId);
      else next.delete(blockId);
      return next;
    });
    startTransition(async () => {
      const result = await setCourseBlockDone({ courseId, day: progressDay, blockId, isDone });
      if (!result.ok) {
        setDone((prev) => {
          const next = new Set(prev);
          if (isDone) next.delete(blockId);
          else next.add(blockId);
          return next;
        });
      }
    });
  };

  // Finishing a part on screen ticks it; signed out, only on this page, without asking to sign in.
  const finishBlock = (blockId: string) => {
    if (done.has(blockId)) return;
    if (isSignedIn) toggleBlock(blockId, true);
    else setDone((prev) => new Set(prev).add(blockId));
  };

  // Moves on without finishing every step; a day whose test wasn't passed is remembered as such.
  const handleMarkDayDone = () => {
    if (!isSignedIn) {
      signInWithGoogle();
      return;
    }
    const missing = required.filter((b) => !done.has(b.id)).map((b) => b.id);
    if (missing.includes("quiz")) missing.push(TEST_SKIPPED_BLOCK);
    if (missing.length === 0) return;
    const before = done;
    setDone(new Set([...done, ...missing]));
    startTransition(async () => {
      const result = await setCourseBlocksDone({ courseId, day: progressDay, blockIds: missing });
      if (!result.ok) setDone(before);
    });
  };

  const handleSavePhrases = () => {
    if (!isSignedIn) {
      signInWithGoogle();
      return;
    }
    setPhraseMessage(null);
    startTransition(async () => {
      const result = await savePhrasesToReview({
        phrases: study
          ? study.items.map((item) => ({ text: item.text.slice(0, 60), meaning: item.sentence.translation?.slice(0, 200) ?? "", example: item.sentence.text.slice(0, 300) }))
          : day.phrases,
      });
      setPhraseMessage(result.ok ? "Added to Review. You'll see them as flashcards." : "Couldn't save the phrases. Please try again.");
    });
  };

  const handleRecorded = (index: number) => {
    const next = new Set(recorded).add(index);
    setRecorded(next);
    if (next.size === prompts.length) finishBlock("more");
  };

  const stages: LessonStage[] = blocks.map((block) => ({
    id: block.id,
    title: block.title,
    detail: `${block.minutes} min`,
    icon: KIND_ICON[block.kind],
    isDone: done.has(block.id),
    isOptional: block.isOptional,
  }));

  // A word's meaning and a sentence playing open as sheets; inside a focus screen they must be part of it.
  const sheets = (
    <>
      {lookup && sheetProps && <WordLookupSheet {...sheetProps} />}
      {heard && (
        <SentencePlayerSheet
          key={`${heard.videoId}-${heard.sentence.index}`}
          videoId={heard.videoId}
          sentence={heard.sentence}
          lessonHref={sentenceHref(heard.videoId, heard.sentence.index)}
          playbackRate={playbackRate}
          onClose={() => setHeard(null)}
        />
      )}
    </>
  );

  const renderScreen = (block: CourseBlock) => {
    const section = sections.includes(block.kind) ? (block.kind as SectionId) : null;
    if (section === "review") {
      return (
        <CardDeck
          title="Earlier sentences"
          cards={warmUp.map(({ videoId, title, day: from, sentence }) => (
            <div key={`${videoId}-${sentence.index}`}>
              <p className="mb-2 text-sm text-muted">
                {from === day.day - 1 ? "Yesterday" : `Week ${weekOf(from)} · Day ${dayInWeek(from)}`} · {title}
              </p>
              <ul>
                <VideoSentence sentence={sentence} onHear={() => setHeard({ videoId, sentence })} isHiddenFirst onWordClick={openWord} />
              </ul>
            </div>
          ))}
          onClose={close}
          onDone={() => finishBlock("review")}
          summaryTitle="Warmed up!"
          summaryDetail="Hearing a sentence again after a day, three days and a week is what makes it stick."
        >
          {sheets}
        </CardDeck>
      );
    }
    if (section === "words") {
      const cards = study
        ? study.items.map((item) => (
            <div key={item.text}>
              <ul>
                <VideoSentence
                  sentence={item.sentence}
                  highlight={item.text}
                  onHear={() => setHeard({ videoId: study.videoId, sentence: item.sentence })}
                  onWordClick={openWord}
                />
              </ul>
              <p className="mt-3 text-sm text-muted">Read it, hear it in the video, and tap any word you don&apos;t know.</p>
            </div>
          ))
        : day.phrases.map((p) => <PhraseCard key={p.text} phrase={p} />);
      return (
        <CardDeck
          title={study ? "Words from the video" : "Today's phrases"}
          cards={cards}
          onClose={close}
          onDone={() => finishBlock("words")}
          summaryTitle="Ready to listen"
          summaryDetail="You know the words, so the video will make sense. Add them to Review to keep them."
          finish={
            <>
              <button type="button" onClick={handleSavePhrases} disabled={isPending} className="btn-3d btn-brand py-3">
                <Icon name="plus" className="size-4" />
                Add all to Review
              </button>
              {phraseMessage && <p className="text-sm font-semibold text-brand">{phraseMessage}</p>}
            </>
          }
        >
          {sheets}
        </CardDeck>
      );
    }
    if (section === "practice" && study) {
      return (
        <CoursePractice
          videoId={study.videoId}
          sentences={pickPracticeSentences(study.sentences)}
          playbackRate={playbackRate}
          onClose={close}
          onDone={() => finishBlock("practice")}
        />
      );
    }
    if (section === "quiz") {
      return (
        <FocusScreen title="Day test" progress={done.has("quiz") ? 1 : 0} onClose={close}>
          <p className="mb-4 text-muted">
            {testQuestions.length} questions from today&apos;s video. Get {getPassScore(testQuestions.length)} right to finish the day.
          </p>
          <DayTest questions={testQuestions} videoId={study?.videoId ?? null} onPass={() => finishBlock("quiz")} />
          {sheets}
        </FocusScreen>
      );
    }
    if (section === "quick") {
      return <QuickAnswers topic={quick.topic} narration={quick.narration} onClose={close} onDone={() => finishBlock("quick")} />;
    }
    if (section === "more") {
      return <MoreScreen block={block} study={study} guide={guide} day={day.day} playbackRate={playbackRate} isDone={done.has("more")} onOpen={setOpen} onClose={close} />;
    }
    if (block.kind === "watch" && block.videoId) {
      return (
        <WatchScreen
          block={block}
          from={fromCourse(day.day, playbackRate)}
          isListenFirst={blocks.findIndex((b) => b.kind === "watch") < blocks.findIndex((b) => b.kind === "words")}
          isDone={done.has(block.id)}
          isPending={isPending}
          onToggle={(isDone) => {
            toggleBlock(block.id, isDone);
            if (isDone) close();
          }}
          onClose={close}
        />
      );
    }
    const href = blockHref(block, day.day, playbackRate, hasReviewSection);
    const isDone = done.has(block.id);
    return (
      <FocusScreen
        title={block.title}
        progress={isDone ? 1 : 0}
        onClose={close}
        footer={
          <button
            type="button"
            onClick={() => {
              toggleBlock(block.id, !isDone);
              if (!isDone) close();
            }}
            disabled={isPending}
            className={`btn-3d w-full py-3 ${isDone ? "" : "btn-brand"}`}
          >
            {isDone ? "Not done yet" : "I've done it"}
          </button>
        }
      >
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <span className="grid size-16 place-items-center rounded-full bg-brand-soft text-brand">
            <Icon name={KIND_ICON[block.kind]} className="size-8" />
          </span>
          <p className="mt-4 text-2xl font-extrabold leading-snug text-ink">{block.title}</p>
          <p className="mt-1 text-sm font-semibold text-muted">
            About {block.minutes} min{block.isOptional ? " · optional" : ""}
          </p>
          <p className="mt-4 max-w-md text-lg text-ink">{getStepTip(block)}</p>
          {href && (
            <Link href={href} className="btn-3d btn-brand mt-6 px-6 py-3 text-lg">
              {getStepLink(block)}
              <Icon name="chevronRight" className="size-5" />
            </Link>
          )}
          <p className="mt-4 max-w-sm text-sm text-muted">Come back here when you&apos;ve finished, and tick it off.</p>
        </div>
      </FocusScreen>
    );
  };

  const renderExtra = (screen: ExtraScreen) => {
    if (screen === "turns" && study) {
      return <CourseTakeTurns videoId={study.videoId} lines={study.turns} playbackRate={playbackRate} onClose={backToMore} onDone={() => finishBlock("more")} />;
    }
    if (screen === "guide" && guide) {
      return (
        <FocusScreen
          title="The video on one page"
          progress={0}
          onClose={backToMore}
          footer={
            <button type="button" onClick={backToMore} className="btn-3d btn-brand w-full py-3">
              Done
            </button>
          }
        >
          <p className="mb-4 text-muted">See how the video is built, hear its key lines, and get a model to copy.</p>
          <VideoGuideSection guide={guide} onHear={(sentence) => study && setHeard({ videoId: study.videoId, sentence })} voice={appVoice.voice} />
          {sheets}
        </FocusScreen>
      );
    }
    return (
      <FocusScreen
        title="Speak"
        progress={recorded.size / prompts.length}
        onClose={backToMore}
        footer={
          <div className="flex items-center gap-3">
            <p className="min-w-0 flex-1 text-sm font-semibold text-muted">
              {recorded.size}/{prompts.length} answered
            </p>
            <button type="button" onClick={backToMore} className="btn-3d btn-brand shrink-0 px-6 py-3">
              Done
            </button>
          </div>
        }
      >
        <p className="mb-4 text-muted">Answer out loud, record, listen back, then try once more. Recordings stay on your device.</p>
        <ol lang="en" className="space-y-3">
          {prompts.map((prompt, i) => (
            <SpeakingPrompt key={prompt.text} index={i} prompt={prompt.text} sampleAnswer={prompt.sampleAnswer} onRecorded={() => handleRecorded(i)} />
          ))}
        </ol>
      </FocusScreen>
    );
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <audio {...appVoice.audioProps} />
      <StudyTimer />
      <p className="text-sm font-semibold text-muted">
        {isDayComplete ? "All done for today" : `About ${Math.round(minutesLeft / 6) / 10} h left today`}
      </p>
      <LessonPath stages={stages} onOpen={setOpen} />

      {!isDayComplete && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="min-w-0 flex-1 basis-48 text-xs text-muted">Short on time? You can move on now and come back to the steps later.</p>
          <button type="button" onClick={handleMarkDayDone} disabled={isPending} className="btn-3d shrink-0 px-3 py-1.5 text-sm">
            Mark day as done
          </button>
        </div>
      )}
      {!isSignedIn && (
        <p className="text-sm text-muted">
          <button type="button" onClick={signInWithGoogle} className="font-semibold text-brand">
            Sign in
          </button>{" "}
          to save your progress and unlock the next days.
        </p>
      )}

      {isDayComplete && (
        <section className="animate-fade-up rounded-3xl border border-accent/30 bg-gradient-to-br from-accent-soft to-surface p-5 text-center">
          <p className="text-2xl font-extrabold text-ink">Day {progressDay} complete!</p>
          <p className="mt-1 text-muted">{day.canDo}</p>
          {hasNextDay ? (
            <Link href={`/course/${day.day + 1}`} className="btn-3d btn-brand mt-4 px-5 py-2.5">
              Go to the next day
            </Link>
          ) : (
            <Link href="/course" className="btn-3d btn-brand mt-4 px-5 py-2.5">
              See your course summary
            </Link>
          )}
        </section>
      )}

      <LessonNotes lessonKey={`course:${courseId}:${progressDay}`} title={`Day ${day.day}: ${day.title}`} href={`/course/${day.day}`} />

      {open && EXTRA_SCREENS.includes(open) ? renderExtra(open as ExtraScreen) : openBlock ? renderScreen(openBlock) : sheets}
    </div>
  );
}

// A hand-written phrase, for days whose video transcript isn't stored.
function PhraseCard({ phrase }: { phrase: CoursePhrase }) {
  return (
    <div lang="en" className="rounded-3xl border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-2xl font-extrabold text-ink">{phrase.text}</p>
        <button
          type="button"
          onClick={() => speak(phrase.example)}
          aria-label="Listen to the example"
          className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand"
        >
          <Icon name="volume" className="size-5" />
        </button>
      </div>
      <p className="mt-2 text-muted">{phrase.meaning}</p>
      <p className="mt-3 rounded-xl bg-cream px-3 py-2 italic text-ink/90">“{phrase.example}”</p>
      <p className="mt-3 text-sm text-muted">Say it out loud twice.</p>
    </div>
  );
}

interface WatchScreenProps {
  block: CourseBlock;
  from: string;
  // B1 hears the video before its words, with no subtitles at all.
  isListenFirst: boolean;
  isDone: boolean;
  isPending: boolean;
  onToggle: (isDone: boolean) => void;
  onClose: () => void;
}

// The day's main video, heard twice: first for the general idea, then with the text to catch the rest.
function WatchScreen({ block, from, isListenFirst, isDone, isPending, onToggle, onClose }: WatchScreenProps) {
  const passes = [
    {
      label: isListenFirst ? "No subtitles" : "Text hidden",
      tip: "Don't stop or go back: get the general idea. It's fine not to catch every word.",
      href: `/watch/${block.videoId}?mode=watch&listen=1&${from}`,
    },
    {
      label: "With the text",
      tip: "Pause when you need to, and tap any word you don't know.",
      href: `/watch/${block.videoId}?mode=watch&${from}`,
    },
  ];
  return (
    <FocusScreen
      title={block.title}
      progress={isDone ? 1 : 0}
      onClose={onClose}
      footer={
        <button type="button" onClick={() => onToggle(!isDone)} disabled={isPending} className={`btn-3d w-full py-3 ${isDone ? "" : "btn-brand"}`}>
          {isDone ? "Not done yet" : "I've watched it twice"}
        </button>
      }
    >
      <p className="text-xs font-bold uppercase tracking-wide text-accent">Watch twice · about {block.minutes} min</p>
      <p className="mt-1 text-2xl font-extrabold leading-snug text-ink">{block.title.replace(/^Watch it twice: /, "")}</p>
      <ol className="mt-5 space-y-3">
        {passes.map((pass, i) => (
          <li key={pass.label}>
            <Link href={pass.href} className="pressable flex items-center gap-4 rounded-3xl border border-line bg-surface p-4 hover:border-brand">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft font-extrabold text-brand">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-extrabold text-ink">{pass.label}</span>
                <span className="block text-sm text-muted">{pass.tip}</span>
              </span>
              <Icon name="chevronRight" className="size-5 shrink-0 text-muted" />
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-muted">Come back here after the second time, and tick it off.</p>
    </FocusScreen>
  );
}

interface MoreScreenProps {
  block: CourseBlock;
  study: DayStudy | null;
  guide: DayGuide | null;
  day: number;
  playbackRate?: number;
  isDone: boolean;
  onOpen: (screen: string) => void;
  onClose: () => void;
}

// Everything that used to be its own optional step, in one place: none of it is needed to finish the day.
function MoreScreen({ block, study, guide, day, playbackRate, isDone, onOpen, onClose }: MoreScreenProps) {
  const from = fromCourse(day, playbackRate);
  const items: { title: string; detail: string; icon: IconName; open?: string; href?: string }[] = [
    ...((study?.turns.length ?? 0) > 0 ? [{ title: "Take turns with the speaker", detail: "The video says a line, you say the next", icon: "user" as const, open: "turns" }] : []),
    { title: "Speak about it", detail: "Retell the video and talk about your own life", icon: "record", open: "speak" },
    ...(guide ? [{ title: "The video on one page", detail: "Its parts, and a model to copy", icon: "news" as const, open: "guide" }] : []),
    ...(block.videoId ? [{ title: "Shadow the whole video", detail: "Say every sentence with the speaker", icon: "mic" as const, href: `/watch/${block.videoId}?mode=shadow&${from}` }] : []),
    ...(block.extras ?? []).map((video) => ({
      title: `Same topic: ${video.title}`,
      detail: "Another video, text hidden",
      icon: "play" as const,
      href: `/watch/${video.id}?mode=watch&listen=1&${from}`,
    })),
  ];
  return (
    <FocusScreen
      title="More if you have time"
      progress={isDone ? 1 : 0}
      onClose={onClose}
      footer={
        <button type="button" onClick={onClose} className="btn-3d btn-brand w-full py-3">
          Back to the day
        </button>
      }
    >
      <p className="text-muted">The day is done without these. Pick what you enjoy.</p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => {
          const content = (
            <>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                <Icon name={item.icon} className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-extrabold text-ink">{item.title}</span>
                <span className="block text-sm text-muted">{item.detail}</span>
              </span>
              <Icon name="chevronRight" className="size-5 shrink-0 text-muted" />
            </>
          );
          const className = "pressable flex w-full items-center gap-4 rounded-3xl border border-line bg-surface p-4 text-left hover:border-brand";
          return (
            <li key={item.title}>
              {item.href ? (
                <Link href={item.href} className={className}>
                  {content}
                </Link>
              ) : (
                <button type="button" onClick={() => item.open && onOpen(item.open)} className={className}>
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </FocusScreen>
  );
}
