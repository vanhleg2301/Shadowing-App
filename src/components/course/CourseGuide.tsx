"use client";

import Link from "next/link";
import { useState } from "react";
import { BottomSheet } from "@/components/BottomSheet";
import type { ScheduleSession } from "@/lib/course-schedule";

interface CourseGuideProps {
  planTitle: string;
  scheduleTitle: string;
  schedule: ScheduleSession[];
}

const ROUTES = [
  { level: "Moving from A1 to A2", plan: "Choose a Slow collection and turn on the Gentle plan. About 60–75 minutes a day." },
  { level: "You understand A2 but freeze when you speak", plan: "Choose a Slow or Medium collection and the full plan. About 2–3 hours a day." },
  { level: "You are B1 but lose track when people talk fast", plan: "Choose a Natural collection. About 3 hours a day." },
];

// The "?" guide on the course pages, in plain English for learners who are still at A1–A2.
export function CourseGuide({ planTitle, scheduleTitle, schedule }: CourseGuideProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="btn-3d shrink-0 gap-2 py-1.5 pl-1.5 pr-3 text-sm" aria-haspopup="dialog">
        <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-brand-soft font-extrabold text-brand">
          ?
        </span>
        How to study
      </button>
      {isOpen && (
        <BottomSheet title="How to study this course" onClose={() => setIsOpen(false)}>
          <div className="space-y-6 pb-2 text-sm text-ink">
            <section>
              <h3 className="text-base font-extrabold">1. Choose your route</h3>
              <ul className="mt-2 space-y-2">
                {ROUTES.map((route) => (
                  <li key={route.level} className="rounded-2xl border border-line bg-cream p-3">
                    <p className="font-bold">{route.level}</p>
                    <p className="mt-0.5 text-muted">{route.plan}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-muted">
                You are on: <b className="text-ink">{planTitle}</b>. Not sure of your level?{" "}
                <Link href="/course/level-check" className="font-semibold text-brand">
                  Take the 2-minute level check
                </Link>
                .
              </p>
            </section>

            <section>
              <h3 className="text-base font-extrabold">2. A sample day</h3>
              <p className="mt-1 text-muted">{scheduleTitle} The times are only a suggestion, so change them to fit your day, but keep the order.</p>
              <div className="mt-3 space-y-4">
                {schedule.map((session) => (
                  <div key={session.name}>
                    <p className="font-bold text-accent">{session.name}</p>
                    <ol className="mt-1.5 space-y-1">
                      {session.items.map((item) => (
                        <li key={`${item.time}-${item.label}`} className={`flex gap-3 ${item.isBreak ? "text-muted" : ""}`}>
                          <span className="w-11 shrink-0 font-mono text-xs leading-5 tabular-nums">{item.time}</span>
                          <span className="min-w-0 flex-1">
                            {item.label} · {item.minutes} min
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-base font-extrabold">3. Rest</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Take the breaks in the timetable. Don&apos;t join the steps into one long session.</li>
                <li>Between sessions, do something else. You don&apos;t need to study more.</li>
                <li>Sleep about 7–8 hours. If you are tired at night, take the quiz, go to bed and do the speaking tomorrow.</li>
                <li>If it is too much, spread one course day over two real days. Studying regularly matters more than finishing fast.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-extrabold">4. After the 7 days</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Open Review every day for the words that are due, about 10 minutes.</li>
                <li>Read or listen to one daily story, then shadow one short video.</li>
                <li>When it feels easy, move to a faster collection. If a day is still hard, study it again.</li>
              </ul>
            </section>
          </div>
        </BottomSheet>
      )}
    </>
  );
}
