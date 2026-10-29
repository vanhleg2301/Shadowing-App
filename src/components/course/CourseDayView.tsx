"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { savePhrasesToReview, setCourseBlockDone } from "@/app/actions";
import { PhraseQuiz } from "@/components/course/PhraseQuiz";
import { RolePlay } from "@/components/course/RolePlay";
import { SpeakingPrompt } from "@/components/course/SpeakingPrompt";
import { StudyTimer } from "@/components/StudyTimer";
import { Icon, type IconName } from "@/components/Icon";
import { type BlockKind, type CourseBlock, type CourseDay } from "@/data/course-a2";
import type { CourseDialogue } from "@/data/course-a2-dialogues";
import { useAuth } from "@/hooks/useAuth";
import { speak, type Accent } from "@/lib/speech";

interface CourseDayViewProps {
  day: CourseDay;
  courseId: string;
  blocks: CourseBlock[];
  dialogue: CourseDialogue | undefined;
  initialDone: string[];
  isSignedIn: boolean;
  hasNextDay: boolean;
}

const KIND_ICON: Record<BlockKind, IconName> = {
  review: "repeat",
  listen: "headphones",
  phrases: "book",
  shadow: "mic",
  dictation: "settings",
  speak: "record",
  roleplay: "user",
  quiz: "chart",
  extra: "plus",
};

const ACCENTS: Accent[] = ["uk", "us"];

function blockHref(block: CourseBlock, day: number): string | null {
  const from = `from=course-${day}`;
  if (block.kind === "review") return "/review";
  if (!block.videoId) return null;
  if (block.kind === "listen") return `/watch/${block.videoId}?mode=watch&listen=1&${from}`;
  if (block.kind === "dictation") return `/watch/${block.videoId}?mode=dictation&${from}`;
  return `/watch/${block.videoId}?mode=shadow&${from}`;
}

type SectionId = "phrases" | "speak" | "roleplay" | "quiz";
const SECTION_IDS: readonly string[] = ["phrases", "speak", "roleplay", "quiz"];

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

export function CourseDayView({ day, courseId, blocks, dialogue, initialDone, isSignedIn, hasNextDay }: CourseDayViewProps) {
  const { signInWithGoogle } = useAuth();
  const [done, setDone] = useState(() => new Set(initialDone));
  const [recorded, setRecorded] = useState(() => new Set<number>());
  const [phraseMessage, setPhraseMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const required = blocks.filter((b) => !b.isOptional);
  const requiredDone = required.filter((b) => done.has(b.id)).length;
  const minutesLeft = required.filter((b) => !done.has(b.id)).reduce((sum, b) => sum + b.minutes, 0);
  const isDayComplete = requiredDone === required.length;
  const nextBlock = required.find((b) => !done.has(b.id));
  const [openSection, setOpenSection] = useState<SectionId | null>(() => {
    const first = blocks.find((b) => SECTION_IDS.includes(b.kind) && !initialDone.includes(b.id));
    return (first?.kind as SectionId | undefined) ?? null;
  });

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
      const result = await setCourseBlockDone({ courseId, day: day.day, blockId, isDone });
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
      const result = await savePhrasesToReview({ phrases: day.phrases });
      if (!result.ok) {
        setPhraseMessage("Couldn't save the phrases. Please try again.");
        return;
      }
      setPhraseMessage("Added to Review. You'll see them as flashcards.");
      if (!done.has("phrases")) toggleBlock("phrases", true);
    });
  };

  const handleRecorded = (index: number) => {
    const next = new Set(recorded).add(index);
    setRecorded(next);
    if (next.size === day.speakingPrompts.length && !done.has("speak")) toggleBlock("speak", true);
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
        <ol className="mt-4 space-y-2">
          {blocks.map((block) => {
            const isDone = done.has(block.id);
            const href = blockHref(block, day.day);
            const section = SECTION_IDS.includes(block.kind) ? (block.kind as SectionId) : null;
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
                  disabled={isPending}
                  onClick={() => toggleBlock(block.id, !isDone)}
                  className={`grid size-7 shrink-0 place-items-center rounded-full border-2 transition-colors ${
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
          <p className="text-2xl font-extrabold text-ink">Day {day.day} complete!</p>
          <p className="mt-1 text-muted">{day.canDo}</p>
          {hasNextDay ? (
            <Link href={`/course/${day.day + 1}`} className="btn-3d btn-brand mt-4 px-5 py-2.5">
              Go to day {day.day + 1}
            </Link>
          ) : (
            <Link href="/course" className="btn-3d btn-brand mt-4 px-5 py-2.5">
              See your course summary
            </Link>
          )}
        </section>
      )}

      <DaySection
        id="phrases"
        title="Today's phrases"
        hint="Say each one out loud twice. Tap UK or US to hear it."
        isDone={done.has("phrases")}
        isOpen={openSection === "phrases"}
        onToggle={() => toggleSection("phrases")}
      >
        <div className="flex justify-end">
          <button type="button" onClick={handleSavePhrases} disabled={isPending} className="btn-3d btn-brand px-4 py-2 text-sm">
            <Icon name="plus" className="size-4" />
            Add all to Review
          </button>
        </div>
        {phraseMessage && <p className="mt-2 text-sm font-semibold text-brand">{phraseMessage}</p>}
        <ul lang="en" className="mt-4 grid gap-3 md:grid-cols-2">
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
      </DaySection>

      <DaySection
        id="speak"
        title="Speak"
        hint="Answer each question out loud for 30–60 seconds. Record, listen back, then try once more. Recordings stay on your device."
        isDone={done.has("speak")}
        isOpen={openSection === "speak"}
        onToggle={() => toggleSection("speak")}
      >
        <ol lang="en" className="space-y-3">
          {day.speakingPrompts.map((prompt, i) => (
            <SpeakingPrompt key={prompt} index={i} prompt={prompt} onRecorded={() => handleRecorded(i)} />
          ))}
        </ol>
        <p className="mt-3 text-sm text-muted">
          {recorded.size}/{day.speakingPrompts.length} answered
          {recorded.size === day.speakingPrompts.length ? " · speaking block done" : ""}
        </p>
      </DaySection>

      {dialogue && (
        <DaySection
          id="roleplay"
          title="Role-play"
          hint="Act out a real conversation. Listen to your partner, then record your reply."
          isDone={done.has("roleplay")}
          isOpen={openSection === "roleplay"}
          onToggle={() => toggleSection("roleplay")}
        >
          <RolePlay dialogue={dialogue} onComplete={() => markDone("roleplay")} />
        </DaySection>
      )}

      <DaySection
        id="quiz"
        title="Quiz"
        hint="10 quick questions on today's phrases. Get 8 right to finish the day."
        isDone={done.has("quiz")}
        isOpen={openSection === "quiz"}
        onToggle={() => toggleSection("quiz")}
      >
        <PhraseQuiz phrases={day.phrases} seed={day.day * 7} onPass={() => markDone("quiz")} />
      </DaySection>

      {nextBlock && <NextStepButton block={nextBlock} day={day.day} onGoToSection={goToSection} />}
    </div>
  );
}

interface NextStepButtonProps {
  block: CourseBlock;
  day: number;
  onGoToSection: (id: SectionId) => void;
}

// The next unfinished activity is always one tap away, just above the phone's bottom navigation.
function NextStepButton({ block, day, onGoToSection }: NextStepButtonProps) {
  const href = blockHref(block, day);
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
  if (!SECTION_IDS.includes(block.kind)) return null;
  return (
    <button type="button" onClick={() => onGoToSection(block.kind as SectionId)} className={className}>
      {content}
    </button>
  );
}
