"use client";

import { Icon, type IconName } from "@/components/Icon";

export interface LessonStage {
  id: string;
  title: string;
  detail: string;
  icon: IconName;
  isDone: boolean;
  // Not needed to finish the lesson: never "next", and left out of the progress.
  isOptional?: boolean;
}

interface LessonPathProps {
  stages: LessonStage[];
  onOpen: (id: string) => void;
}

// A lesson as a path of parts: done ones are ticked, the next one is highlighted, and Continue opens it.
export function LessonPath({ stages, onOpen }: LessonPathProps) {
  const required = stages.filter((stage) => !stage.isOptional);
  const next = required.find((stage) => !stage.isDone);
  const doneCount = required.filter((stage) => stage.isDone).length;

  return (
    <section aria-label="Lesson parts">
      <div className="flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${(doneCount / required.length) * 100}%` }} />
        </div>
        <span className="text-sm font-bold text-muted">
          {doneCount}/{required.length}
        </span>
      </div>

      <ol className="relative mt-5">
        {stages.map((stage, i) => {
          const isNext = stage.id === next?.id;
          return (
            <li key={stage.id} className="relative pb-3 last:pb-0">
              {i < stages.length - 1 && (
                <span aria-hidden className={`absolute left-8 top-14 h-[calc(100%-3.5rem)] w-1 -translate-x-1/2 rounded-full ${stage.isDone ? "bg-brand" : "bg-line"}`} />
              )}
              <button
                type="button"
                onClick={() => onOpen(stage.id)}
                className={`relative flex w-full items-center gap-4 rounded-3xl border-2 p-2 pr-4 text-left transition-transform hover:-translate-y-0.5 active:translate-y-0 ${
                  isNext ? "border-brand bg-surface shadow-[0_4px_0_0_var(--color-brand)]" : "border-transparent"
                }`}
              >
                <span
                  className={`grid size-12 shrink-0 place-items-center rounded-full ${
                    stage.isDone ? "bg-brand text-on-brand" : isNext ? "bg-brand-soft text-brand ring-4 ring-brand/20" : "bg-surface text-muted ring-1 ring-line"
                  }`}
                >
                  <Icon name={stage.isDone ? "check" : stage.icon} className="size-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-extrabold leading-snug text-ink">{stage.title}</span>
                  <span className="block text-sm text-muted">
                    {[stage.isDone && "Done", stage.isOptional && "Optional", stage.detail].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <Icon name="chevronRight" className="size-5 shrink-0 text-muted" />
              </button>
            </li>
          );
        })}
      </ol>

      <button type="button" onClick={() => onOpen((next ?? stages[0]).id)} className="btn-3d btn-brand mt-5 w-full py-3.5 text-lg">
        {next ? (doneCount === 0 ? "Start" : "Continue") : "Practise again"}
        <Icon name="chevronRight" className="size-5" />
      </button>
    </section>
  );
}
