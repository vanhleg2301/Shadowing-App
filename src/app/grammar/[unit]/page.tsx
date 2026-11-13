import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { GrammarUnitView } from "@/components/grammar/GrammarUnitView";
import { ListSkeleton } from "@/components/Skeleton";
import { GRAMMAR_COURSE_ID, GRAMMAR_UNITS, getGrammarNarration, getGrammarNarrationId, getGrammarUnit } from "@/data/grammar";
import { splitSentences } from "@/data/stories";
import { getGrammarExamples } from "@/lib/grammar-examples";
import { getNarration } from "@/lib/story-audio";
import { getCourseProgress } from "@/lib/user-data";

export function generateStaticParams() {
  return GRAMMAR_UNITS.map((unit) => ({ unit: unit.slug }));
}

export default function GrammarUnitPage({ params }: PageProps<"/grammar/[unit]">) {
  return (
    <AppShell active="/grammar">
      <main className="w-full max-w-3xl px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1.25rem)] md:px-10">
        <Suspense fallback={<ListSkeleton rows={5} />}>
          {params.then(({ unit }) => (
            <UnitContent slug={unit} />
          ))}
        </Suspense>
      </main>
    </AppShell>
  );
}

async function UnitContent({ slug }: { slug: string }) {
  const unit = getGrammarUnit(slug);
  if (!unit) notFound();
  const narration = getGrammarNarration(unit);
  const [examples, progress, audio] = await Promise.all([
    getGrammarExamples(unit.videoPhrases).catch(() => []),
    getCourseProgress(GRAMMAR_COURSE_ID).catch(() => null),
    getNarration(getGrammarNarrationId(unit), narration.map((line) => line.text)).catch(() => null),
  ]);
  // Where each narrated line (the story, then the lines to shadow) starts and ends in the recording.
  let sentence = 0;
  const lineTimes = audio
    ? narration.map((line) => {
        const count = splitSentences(line.text).length;
        const times = { start: audio.sentences[sentence].start, end: audio.sentences[sentence + count - 1].end };
        sentence += count;
        return times;
      })
    : null;
  const next = GRAMMAR_UNITS.find((u) => u.id === unit.id + 1);

  return (
    <>
      <Breadcrumbs items={[{ label: "Grammar & Words", href: "/grammar" }, { label: `Unit ${unit.id}` }]} />
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-accent">
        Unit {unit.id} · A2 · {unit.topic}
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">{unit.title}</h1>
      <p className="mt-2 rounded-2xl border border-brand/20 bg-brand-soft px-4 py-3 text-ink">
        <b>Goal:</b> {unit.canDo}
      </p>
      <div className="mt-6">
        <GrammarUnitView
          unit={unit}
          examples={examples}
          narration={audio && lineTimes ? { url: audio.url, lineTimes } : null}
          isSignedIn={progress !== null}
          isPassed={progress?.[unit.id]?.includes("check") ?? false}
          nextHref={next ? `/grammar/${next.slug}` : null}
        />
      </div>
    </>
  );
}
