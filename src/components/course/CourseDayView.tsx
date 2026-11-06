"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { savePhrasesToReview, setCourseBlockDone } from "@/app/actions";
import { DayTest } from "@/components/course/DayTest";
import { VideoGuideSection } from "@/components/course/VideoGuideSection";
import { SentencePlayerSheet } from "@/components/course/SentencePlayerSheet";
import { SpeakingPrompt } from "@/components/course/SpeakingPrompt";
import { VideoSentence } from "@/components/course/VideoSentence";
import { StudyTimer } from "@/components/StudyTimer";
import { Icon, type IconName } from "@/components/Icon";
import { WordLookupSheet } from "@/components/WordLookupSheet";
import { type BlockKind, type CourseBlock, type CourseDay, type CoursePhrase } from "@/data/course-a2";
import { isCourseDayComplete } from "@/data/courses";
import { useAuth } from "@/hooks/useAuth";
import { useWordLookup } from "@/hooks/useWordLookup";
import { speak, type Accent } from "@/lib/speech";
import { buildDayTest, getPassScore } from "@/lib/day-test";
import type { DayGuide, DayStudy, StudySentence } from "@/lib/video-study";

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
  // Yesterday's main video, for the warm-up.
  previousStudy: DayStudy | null;
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
  listen: "headphones",
  readalong: "volume",
  guide: "news",
  phrases: "chat",
  shadow: "mic",
  speak: "record",
  quiz: "chart",
  extra: "plus",
  free: "play",
};

const ACCENTS: Accent[] = ["uk", "us"];
const DEFAULT_PROMPT_COUNT = 3;

const fromCourse = (day: number, playbackRate?: number) => `from=course-${day}${playbackRate ? `&rate=${playbackRate}` : ""}`;

// The warm-up is its own section when yesterday's video gave sentences to hear again; otherwise it is Review.
function blockHref(block: CourseBlock, day: number, playbackRate: number | undefined, hasReviewSection: boolean): string | null {
  if (block.kind === "review") return hasReviewSection ? null : "/review";
  if (block.kind === "free") return block.id === "stories" ? "/stories" : "/";
  if (!block.videoId) return null;
  const from = fromCourse(day, playbackRate);
  if (block.kind === "listen" || block.kind === "extra") return `/watch/${block.videoId}?mode=watch&listen=1&${from}`;
  if (block.kind === "readalong") return `/watch/${block.videoId}?mode=watch&${from}`;
  return `/watch/${block.videoId}?mode=shadow&${from}`;
}

type SectionId = "review" | "words" | "guide" | "phrases" | "speak" | "quiz";
const SECTION_KINDS: readonly string[] = ["review", "words", "guide", "phrases", "speak", "quiz"];

interface DaySectionProps {
  id: SectionId;
  title: string;
  hint: string;
  isDone: boolean;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

// On phones the day is long, so each activity folds away and only the one in use stays open.
function DaySection({ id, title, hint, isDone, isOpen, onToggle, children }: DaySectionProps) {
  return (
    <section id={id} className="scroll-mt-24 rounded-3xl border border-line bg-surface">
      <button type="button" onClick={onToggle} aria-expanded={isOpen} className="flex w-full items-center gap-3 p-4 text-left sm:p-5">
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-xl font-extrabold text-ink">
            {title}
            {isDone && <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-bold text-brand">Done</span>}
          </span>
          <span className="mt-0.5 block text-sm text-muted">{hint}</span>
        </span>
        <Icon name="chevronDown" className={`size-5 shrink-0 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && <div className="animate-fade-in px-4 pb-4 sm:px-5 sm:pb-5">{children}</div>}
    </section>
  );
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
  previousStudy,
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
  const hasReviewSection = previousStudy !== null;
  // Only the activities this day has: review and free days are all videos, and words need something to show.
  const sections = SECTION_KINDS.filter((kind) => {
    if (!blocks.some((b) => b.kind === kind)) return false;
    if (kind === "review") return hasReviewSection;
    if (kind === "guide") return guide !== null;
    return kind === "words" ? phrases.length > 0 : kind === "quiz" ? testQuestions.length > 0 : true;
  });
  const { lookup, openWord, sheetProps } = useWordLookup(study?.videoId ?? "", []);
  const { signInWithGoogle } = useAuth();
  const [done, setDone] = useState(() => new Set(initialDone));
  const [recorded, setRecorded] = useState(() => new Set<number>());
  const [phraseMessage, setPhraseMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const required = blocks.filter((b) => !b.isOptional);
  const requiredDone = required.filter((b) => done.has(b.id)).length;
  const minutesLeft = required.filter((b) => !done.has(b.id)).reduce((sum, b) => sum + b.minutes, 0);
  const isDayComplete = isCourseDayComplete(blocks, done);
  const nextBlock = required.find((b) => !done.has(b.id));
  const [openSection, setOpenSection] = useState<SectionId | null>(() => {
    const first = blocks.find((b) => sections.includes(b.kind) && !initialDone.includes(b.id));
    return (first?.kind as SectionId | undefined) ?? null;
  });
  const sentenceHref = (videoId: string, index: number) => `/watch/${videoId}?mode=shadow&s=${index}&${fromCourse(day.day, playbackRate)}`;
  const [heard, setHeard] = useState<{ videoId: string; sentence: StudySentence } | null>(null);

  const toggleSection = (id: SectionId) => setOpenSection((current) => (current === id ? null : id));
  const goToSection = (id: SectionId) => {
    setOpenSection(id);
    // Wait for the section to open before scrolling to it.
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

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
      if (!result.ok) {
        setPhraseMessage("Couldn't save the phrases. Please try again.");
        return;
      }
      setPhraseMessage("Added to Review. You'll see them as flashcards.");
      if (!done.has("words")) toggleBlock("words", true);
    });
  };

  const handleRecorded = (index: number) => {
    const next = new Set(recorded).add(index);
    setRecorded(next);
    if (next.size === prompts.length && !done.has("speak")) toggleBlock("speak", true);
  };

  const markDone = (blockId: string) => {
    if (isSignedIn && !done.has(blockId)) toggleBlock(blockId, true);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      <StudyTimer />
      <section className="rounded-3xl border border-line bg-surface p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-ink">Today&apos;s plan</h2>
          <span className="text-sm font-semibold text-muted">
            {isDayComplete ? "All done" : `${requiredDone}/${required.length} · about ${Math.round(minutesLeft / 6) / 10} h left`}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${(requiredDone / required.length) * 100}%` }} />
        </div>
        <ol className="stagger mt-4 space-y-2">
          {blocks.map((block) => {
            const isDone = done.has(block.id);
            const href = blockHref(block, day.day, playbackRate, hasReviewSection);
            const section = sections.includes(block.kind) ? (block.kind as SectionId) : null;
            return (
              <li
                key={block.id}
                className={`flex items-center gap-3 rounded-2xl border p-3 transition-colors ${
                  isDone ? "border-brand/30 bg-brand-soft/60" : "border-line bg-cream"
                }`}
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isDone}
                  aria-label={`Mark "${block.title}" as done`}
                  // The day test can only be ticked by passing it.
                  disabled={isPending || (block.kind === "quiz" && sections.includes("quiz"))}
                  title={block.kind === "quiz" ? "Pass the day test to tick this" : undefined}
                  onClick={() => toggleBlock(block.id, !isDone)}
                  className={`relative grid size-7 shrink-0 place-items-center rounded-full border-2 transition-colors after:absolute after:-inset-2 ${
                    isDone ? "border-brand bg-brand text-on-brand" : "border-line bg-surface"
                  }`}
                >
                  {isDone && (
                    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                      <path d="M5 12l5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <Icon name={KIND_ICON[block.kind]} className="size-5 shrink-0 text-brand" />
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold leading-snug ${isDone ? "text-muted line-through" : "text-ink"}`}>{block.title}</p>
                  <p className="text-xs text-muted">
                    {block.minutes} min{block.isOptional ? " · optional" : ""}
                  </p>
                </div>
                {href ? (
                  <Link href={href} className="btn-3d shrink-0 px-3 py-1.5 text-sm">
                    Start
                  </Link>
                ) : (
                  section && (
                    <button type="button" onClick={() => goToSection(section)} className="btn-3d shrink-0 px-3 py-1.5 text-sm">
                      Go
                    </button>
                  )
                )}
              </li>
            );
          })}
        </ol>
        {!isSignedIn && (
          <p className="mt-3 text-sm text-muted">
            <button type="button" onClick={signInWithGoogle} className="font-semibold text-brand">
              Sign in
            </button>{" "}
            to save your progress and unlock the next days.
          </p>
        )}
      </section>

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

      {previousStudy && (
        <DaySection
          id="review"
          title="Yesterday's sentences"
          hint="Hear each one in yesterday's video. Can you understand it without the text? Tap to check."
          isDone={done.has("review")}
          isOpen={openSection === "review"}
          onToggle={() => toggleSection("review")}
        >
          <ul className="space-y-3">
            {previousStudy.sentences.slice(0, 5).map((sentence) => (
              <VideoSentence
                key={sentence.index}
                sentence={sentence}
                onHear={() => setHeard({ videoId: previousStudy.videoId, sentence })}
                isHiddenFirst
                onWordClick={openWord}
              />
            ))}
          </ul>
          <SectionDoneButton isDone={done.has("review")} onDone={() => toggleBlock("review", true)} label="I've heard them all" />
        </DaySection>
      )}

      {sections.includes("words") && (
        <DaySection
          id="words"
          title={study ? "Words from the video" : "Today's phrases"}
          hint={
            study
              ? "These come up in today's video. Read each one in its sentence, hear it, and tap any word you don't know. Then you're ready to listen."
              : "Say each one out loud twice. Tap UK or US to hear it."
          }
          isDone={done.has("words")}
          isOpen={openSection === "words"}
          onToggle={() => toggleSection("words")}
        >
          <div className="flex justify-end">
            <button type="button" onClick={handleSavePhrases} disabled={isPending} className="btn-3d btn-brand px-4 py-2 text-sm">
              <Icon name="plus" className="size-4" />
              Add all to Review
            </button>
          </div>
          {phraseMessage && <p className="mt-2 text-sm font-semibold text-brand">{phraseMessage}</p>}
          {study ? (
            <ul className="mt-4 space-y-3">
              {study.items.map((item) => (
                <VideoSentence
                  key={item.text}
                  sentence={item.sentence}
                  highlight={item.text}
                  onHear={() => setHeard({ videoId: study.videoId, sentence: item.sentence })}
                  onWordClick={openWord}
                />
              ))}
            </ul>
          ) : (
            <ul lang="en" className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {day.phrases.map((p) => (
                <li key={p.text} className="rounded-2xl border border-line bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-lg font-bold text-ink">{p.text}</p>
                    <div className="flex shrink-0 gap-1">
                      {ACCENTS.map((accent) => (
                        <button
                          key={accent}
                          type="button"
                          onClick={() => speak(p.example, accent)}
                          aria-label={`Listen to the example in ${accent.toUpperCase()} English`}
                          className="min-h-9 min-w-10 rounded-lg bg-brand-soft px-2.5 text-xs font-bold text-brand"
                        >
                          {accent.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-muted">{p.meaning}</p>
                  <p className="mt-2 rounded-xl bg-cream px-3 py-2 text-sm italic text-ink/90">“{p.example}”</p>
                </li>
              ))}
            </ul>
          )}
          <SectionDoneButton isDone={done.has("words")} onDone={() => toggleBlock("words", true)} label="Ready to listen" />
        </DaySection>
      )}

      {guide && sections.includes("guide") && (
        <DaySection
          id="guide"
          title="The video on one page"
          hint="After the second listen: see how the video is built, hear its key lines, and get a model to copy."
          isDone={done.has("guide")}
          isOpen={openSection === "guide"}
          onToggle={() => toggleSection("guide")}
        >
          <VideoGuideSection guide={guide} onHear={(sentence) => study && setHeard({ videoId: study.videoId, sentence })} />
          <SectionDoneButton isDone={done.has("guide")} onDone={() => toggleBlock("guide", true)} label="Done" />
        </DaySection>
      )}

      {study && sections.includes("phrases") && (
        <DaySection
          id="phrases"
          title="Sentences from the video"
          hint="Do this after the second listen. Hear each sentence in the video and say it with the speaker, a few times, until it feels easy."
          isDone={done.has("phrases")}
          isOpen={openSection === "phrases"}
          onToggle={() => toggleSection("phrases")}
        >
          <ul className="space-y-3">
            {study.sentences.map((sentence) => (
              <VideoSentence
                key={sentence.index}
                sentence={sentence}
                onHear={() => setHeard({ videoId: study.videoId, sentence })}
                onWordClick={openWord}
              />
            ))}
          </ul>
          <SectionDoneButton isDone={done.has("phrases")} onDone={() => toggleBlock("phrases", true)} label="Done" />
        </DaySection>
      )}

      {sections.includes("quiz") && (
        <DaySection
          id="quiz"
          title="Day test"
          hint={`${testQuestions.length} questions from today's video. Get ${getPassScore(testQuestions.length)} right to finish the day.`}
          isDone={done.has("quiz")}
          isOpen={openSection === "quiz"}
          onToggle={() => toggleSection("quiz")}
        >
          <DayTest questions={testQuestions} videoId={study?.videoId ?? null} onPass={() => markDone("quiz")} />
        </DaySection>
      )}

      {sections.includes("speak") && (
        <DaySection
          id="speak"
          title="Speak"
          hint="Optional, when you feel ready. Answer out loud, record, listen back, then try once more. Recordings stay on your device."
          isDone={done.has("speak")}
          isOpen={openSection === "speak"}
          onToggle={() => toggleSection("speak")}
        >
          <ol lang="en" className="space-y-3">
            {prompts.map((prompt, i) => (
              <SpeakingPrompt key={prompt.text} index={i} prompt={prompt.text} sampleAnswer={prompt.sampleAnswer} onRecorded={() => handleRecorded(i)} />
            ))}
          </ol>
          <p className="mt-3 text-sm text-muted">
            {recorded.size}/{prompts.length} answered
            {recorded.size === prompts.length ? " · speaking block done" : ""}
          </p>
        </DaySection>
      )}

      {nextBlock && (
        <NextStepButton
          block={nextBlock}
          day={day.day}
          playbackRate={playbackRate}
          hasReviewSection={hasReviewSection}
          sections={sections}
          onGoToSection={goToSection}
        />
      )}
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
    </div>
  );
}

interface SectionDoneButtonProps {
  isDone: boolean;
  onDone: () => void;
  label: string;
}

function SectionDoneButton({ isDone, onDone, label }: SectionDoneButtonProps) {
  return (
    <div className="mt-4 flex justify-end">
      <button type="button" onClick={onDone} disabled={isDone} className="btn-3d btn-brand px-4 py-2 text-sm">
        {isDone ? "Done" : label}
      </button>
    </div>
  );
}

interface NextStepButtonProps {
  block: CourseBlock;
  day: number;
  playbackRate?: number;
  hasReviewSection: boolean;
  sections: readonly string[];
  onGoToSection: (id: SectionId) => void;
}

// The next unfinished activity is always one tap away, just above the phone's bottom navigation.
function NextStepButton({ block, day, playbackRate, hasReviewSection, sections, onGoToSection }: NextStepButtonProps) {
  const href = blockHref(block, day, playbackRate, hasReviewSection);
  const className =
    "btn-3d btn-brand fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-30 flex items-center gap-2 px-4 py-3 text-left md:hidden";
  const content = (
    <>
      <Icon name={KIND_ICON[block.kind]} className="size-5 shrink-0" />
      <span className="min-w-0 flex-1 truncate text-sm font-bold">Next: {block.title}</span>
      <Icon name="chevronRight" className="size-5 shrink-0" />
    </>
  );
  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  if (!sections.includes(block.kind)) return null;
  return (
    <button type="button" onClick={() => onGoToSection(block.kind as SectionId)} className={className}>
      {content}
    </button>
  );
}
