"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { setPlanTask } from "@/app/actions";
import { Icon } from "@/components/Icon";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { getThumbnailUrl } from "@/lib/media";
import { WEEKDAY_NAMES, addDays, getDayTasks, getWeekday, isDayDone, type PlanTask } from "@/lib/study-plan";
import { RecordingShelf, WeeklyRecorder } from "./WeeklyRecording";
import { WeekVideoPicker, type PlanVideo } from "./WeekVideoPicker";

interface PlanTodayProps {
  weekStart: string;
  today: string;
  weekNumber: number;
  video: { videoId: string; title: string };
  initialDone: Record<string, string[]>;
  suggestions: PlanVideo[];
  listenMore: PlanVideo[];
  speakTopic: string;
}

const LANGUAGE_EXCHANGES = [
  { name: "HelloTalk", href: "https://www.hellotalk.com/" },
  { name: "Tandem", href: "https://www.tandem.net/" },
];

export function PlanToday({ weekStart, today, weekNumber, video, initialDone, suggestions, listenMore, speakTopic }: PlanTodayProps) {
  const [done, setDone] = useState(initialDone);
  const [error, setError] = useState<string | null>(null);
  const [isChanging, setIsChanging] = useState(false);
  const [recordingsVersion, setRecordingsVersion] = useState(0);
  const weekday = getWeekday(today);
  const { core, extras } = getDayTasks(weekday);
  const todayDone = done[today] ?? [];
  const coreLeft = core.filter((task) => !todayDone.includes(task.key)).length;

  const toggle = async (task: PlanTask) => {
    const isDone = !todayDone.includes(task.key);
    const previous = done;
    setError(null);
    setDone({ ...done, [today]: isDone ? [...todayDone, task.key] : todayDone.filter((key) => key !== task.key) });
    const result = await setPlanTask({ weekStart, day: today, task: task.key, isDone }).catch(() => null);
    if (!result?.ok) {
      setDone(previous);
      setError("Couldn't save that. Please try again.");
    }
  };

  const videoHref = (query?: string) => `/watch/${video.videoId}?${query ? `${query}&` : ""}from=plan`;

  return (
    <>
      <section className="mt-6 rounded-3xl border border-line bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-4">
          <Link href={videoHref()} className="relative aspect-video w-full shrink-0 overflow-hidden rounded-2xl bg-cream sm:w-48">
            <Image src={getThumbnailUrl(video.videoId)} alt="" fill sizes="(min-width: 640px) 12rem, 90vw" className="object-cover" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-accent">Week {weekNumber} · this week&apos;s video</p>
            <h2 className="mt-1 text-xl font-extrabold leading-snug text-ink">{video.title}</h2>
            <button type="button" onClick={() => setIsChanging(true)} className="mt-2 text-sm font-semibold text-brand hover:text-brand-dark">
              Change video
            </button>
          </div>
        </div>

        <ol aria-label="This week" className="mt-5 grid grid-cols-7 gap-1.5">
          {WEEKDAY_NAMES.map((name, i) => {
            const day = addDays(weekStart, i);
            const isToday = day === today;
            const isComplete = isDayDone(i + 1, done[day]);
            const isStarted = (done[day]?.length ?? 0) > 0;
            return (
              <li
                key={day}
                aria-current={isToday ? "date" : undefined}
                className={`flex flex-col items-center gap-1 rounded-xl py-2 text-xs font-bold ${isToday ? "bg-brand-soft text-brand" : "text-muted"}`}
              >
                {name.slice(0, 3)}
                <span
                  aria-label={isComplete ? "done" : isStarted ? "started" : "not done"}
                  className={`grid size-6 place-items-center rounded-full border-2 ${
                    isComplete ? "border-brand bg-brand text-on-brand" : isStarted ? "border-brand" : "border-line"
                  }`}
                >
                  {isComplete && <Icon name="check" className="size-3.5" />}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      {isChanging && <WeekVideoPicker weekStart={weekStart} suggestions={suggestions} onCancel={() => setIsChanging(false)} />}

      <section aria-label="Today" className="mt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-extrabold text-ink">{WEEKDAY_NAMES[weekday - 1]} · about 1 hour</h2>
          <p className="text-sm font-semibold text-muted">{coreLeft === 0 ? "Today's plan is done. Well done!" : `${coreLeft} of ${core.length} steps left`}</p>
        </div>
        {weekday === 7 && <p className="mt-1 text-sm text-muted">Rest day. Do a short review, or just enjoy some easy listening.</p>}
        {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
        <ul className="mt-3 space-y-3">
          {core.map((task, i) => (
            <TaskCard key={task.key} task={task} number={i + 1} isDone={todayDone.includes(task.key)} onToggle={() => void toggle(task)}>
              {task.kind === "video" && (
                <Link href={videoHref(task.query)} className="btn-3d btn-brand px-4 py-2 text-sm">
                  <Icon name="play" className="size-4" />
                  Open the video
                </Link>
              )}
              {task.kind === "review" && (
                <Link href="/review" className="btn-3d btn-brand px-4 py-2 text-sm">
                  <Icon name="repeat" className="size-4" />
                  Open Review
                </Link>
              )}
              {task.kind === "retell" && (
                <Expandable label="Record here">
                  <VoiceRecorder recordLabel="Record your retelling" maxSeconds={180} />
                </Expandable>
              )}
              {task.kind === "talk" && (
                <Expandable label="Record here" isInitiallyOpen>
                  <WeeklyRecorder weekStart={weekStart} title={video.title} onSaved={() => setRecordingsVersion((v) => v + 1)} />
                </Expandable>
              )}
            </TaskCard>
          ))}
        </ul>
      </section>

      <section aria-label="Extra practice" className="mt-8">
        <h2 className="text-xl font-extrabold text-ink">Extra, if you have time</h2>
        <ul className="mt-3 space-y-3">
          {extras.map((task) => (
            <TaskCard key={task.key} task={task} isDone={todayDone.includes(task.key)} onToggle={() => void toggle(task)}>
              {task.kind === "listen-more" && (
                <ul className="w-full space-y-2">
                  {listenMore.map((v) => (
                    <li key={v.videoId}>
                      <Link
                        href={`/watch/${v.videoId}?from=plan`}
                        className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-2 hover:border-brand"
                      >
                        <span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-cream">
                          <Image src={getThumbnailUrl(v.videoId)} alt="" fill sizes="6rem" className="object-cover" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-ink">{v.title}</span>
                          <span className="block text-xs text-muted">
                            {v.level} · {v.duration}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {task.kind === "speak" && (
                <div className="w-full space-y-3">
                  <p className="rounded-2xl bg-surface p-3 font-semibold text-ink">
                    <span className="block text-xs font-bold uppercase tracking-wide text-accent">Today&apos;s topic</span>
                    {speakTopic}
                  </p>
                  <Expandable label="Record here">
                    <VoiceRecorder recordLabel="Record yourself" maxSeconds={180} />
                  </Expandable>
                  <p className="text-sm text-muted">
                    Ready for real people? Find a language partner for free on{" "}
                    {LANGUAGE_EXCHANGES.map((app, i) => (
                      <span key={app.name}>
                        {i > 0 && " or "}
                        <a href={app.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand underline">
                          {app.name}
                        </a>
                      </span>
                    ))}
                    : you help them with Vietnamese, they help you with English.
                  </p>
                </div>
              )}
            </TaskCard>
          ))}
        </ul>
      </section>

      <RecordingShelf version={recordingsVersion} />
    </>
  );
}

interface TaskCardProps {
  task: PlanTask;
  number?: number;
  isDone: boolean;
  onToggle: () => void;
  children?: ReactNode;
}

function TaskCard({ task, number, isDone, onToggle, children }: TaskCardProps) {
  return (
    <li className={`rounded-3xl border p-4 transition-colors ${isDone ? "border-brand/40 bg-brand-soft/50" : "border-line bg-surface"}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          role="checkbox"
          aria-checked={isDone}
          aria-label={`Mark "${task.title}" as done`}
          onClick={onToggle}
          className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border-2 transition-colors ${
            isDone ? "border-brand bg-brand text-on-brand" : "border-line bg-surface hover:border-brand"
          }`}
        >
          {isDone && <Icon name="check" className="size-4" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <h3 className={`font-extrabold ${isDone ? "text-muted line-through" : "text-ink"}`}>
              {number !== undefined && <span className="text-muted">{number}. </span>}
              {task.title}
            </h3>
            <span className="text-xs font-semibold text-muted">{task.minutes}</span>
          </div>
          <p className="mt-1 text-sm text-muted">{task.detail}</p>
          {children && <div className="mt-3 flex flex-wrap items-center gap-2">{children}</div>}
        </div>
      </div>
    </li>
  );
}

function Expandable({ label, isInitiallyOpen = false, children }: { label: string; isInitiallyOpen?: boolean; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);
  if (!isOpen) {
    return (
      <button type="button" onClick={() => setIsOpen(true)} className="btn-3d px-4 py-2 text-sm">
        <Icon name="mic" className="size-4" />
        {label}
      </button>
    );
  }
  return <div className="w-full rounded-2xl bg-cream p-3">{children}</div>;
}
