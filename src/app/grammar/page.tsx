import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Icon } from "@/components/Icon";
import { GRAMMAR_COURSE_ID, GRAMMAR_UNITS } from "@/data/grammar";
import { getCourseProgress } from "@/lib/user-data";

export const metadata: Metadata = { title: "Grammar & Words · Shadowing English" };

export default function GrammarPage() {
  return (
    <AppShell active="/grammar">
      <main className="w-full max-w-4xl px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:px-10">
        <Breadcrumbs items={[{ label: "Grammar & Words" }]} />
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-[36px]">Grammar & Words</h1>
        <p className="mt-2 max-w-2xl text-muted">
          A break from long videos. Each unit is a short story that uses one pattern again and again. You understand the story first, then
          notice the pattern, hear it in real videos and say it yourself. About 15 minutes a unit.
        </p>
        <Suspense fallback={<UnitList passed={new Set()} />}>
          <UnitListWithProgress />
        </Suspense>
      </main>
    </AppShell>
  );
}

async function UnitListWithProgress() {
  const progress = await getCourseProgress(GRAMMAR_COURSE_ID).catch(() => null);
  const passed = new Set(GRAMMAR_UNITS.filter((unit) => progress?.[unit.id]?.includes("check")).map((unit) => unit.id));
  return <UnitList passed={passed} />;
}

function UnitList({ passed }: { passed: ReadonlySet<number> }) {
  return (
    <ol className="stagger mt-6 space-y-3">
      {GRAMMAR_UNITS.map((unit) => {
        const isDone = passed.has(unit.id);
        return (
          <li key={unit.id}>
            <Link
              href={`/grammar/${unit.slug}`}
              className="flex items-center gap-4 rounded-3xl border border-line bg-surface p-4 shadow-[0_4px_0_0_var(--color-line)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span
                className={`grid size-12 shrink-0 place-items-center rounded-2xl text-lg font-extrabold ${isDone ? "bg-accent text-white" : "bg-brand text-on-brand"}`}
              >
                {isDone ? "✓" : unit.id}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-ink">{unit.title}</p>
                <p className="truncate text-sm text-muted">
                  {unit.level} · {unit.canDo}
                </p>
              </div>
              <Icon name="chevronRight" className="size-5 shrink-0 text-muted" />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
