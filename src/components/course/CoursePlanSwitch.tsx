"use client";

import Link from "next/link";
import { useTransition } from "react";
import { setCourseMode } from "@/app/actions";
import type { CourseMode } from "@/lib/course-mode";

const PLANS: { mode: CourseMode; title: string; detail: string }[] = [
  { mode: "gentle", title: "Gentle", detail: "A1 → A2 · about 1 hour a day" },
  { mode: "full", title: "Full", detail: "Already A2 · 2–3 hours a day" },
];

// Chooses between the full A2 course and the Gentle plan; progress is shared between them.
export function CoursePlanSwitch({ current }: { current: CourseMode }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mt-4">
      <div role="radiogroup" aria-label="Course plan" className="grid grid-cols-2 gap-1 rounded-2xl border border-line bg-cream p-1">
        {PLANS.map((plan) => {
          const isCurrent = plan.mode === current;
          return (
            <button
              key={plan.mode}
              type="button"
              role="radio"
              aria-checked={isCurrent}
              disabled={isPending}
              onClick={() => !isCurrent && startTransition(async () => void (await setCourseMode({ mode: plan.mode })))}
              className={`rounded-xl px-3 py-2 text-left transition-colors ${isCurrent ? "bg-brand text-on-brand" : "text-ink hover:bg-surface"}`}
            >
              <span className="block font-bold">{plan.title}</span>
              <span className={`block text-xs ${isCurrent ? "text-on-brand/80" : "text-muted"}`}>{plan.detail}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-sm text-muted">
        Not sure which one?{" "}
        <Link href="/course/level-check" className="font-semibold text-brand">
          Take the 2-minute level check
        </Link>
      </p>
    </div>
  );
}
