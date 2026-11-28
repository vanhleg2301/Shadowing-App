import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ListSkeleton } from "@/components/Skeleton";
import { QuickAnswersPicker } from "@/components/speak/QuickAnswersPicker";
import { QUICK_TOPICS, getQuickNarration, getQuickNarrationId } from "@/data/quick-answers";
import { getLineNarration } from "@/lib/story-audio";

export const metadata: Metadata = { title: "Quick answers · Shadowing English" };

export default function SpeakPage() {
  return (
    <AppShell active="/speak">
      <main className="w-full max-w-4xl px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:px-10">
        <Breadcrumbs items={[{ label: "Quick answers" }]} />
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-[36px]">Quick answers</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Speaking reflex: hear a question, answer out loud at once, then compare with a model answer. Five minutes a day, on any
          topic. The questions you get stuck on come back first next time.
        </p>
        <Suspense fallback={<ListSkeleton rows={4} />}>
          <Topics />
        </Suspense>
      </main>
    </AppShell>
  );
}

async function Topics() {
  const narrations = await Promise.all(QUICK_TOPICS.map((topic) => getLineNarration(getQuickNarrationId(topic), getQuickNarration(topic))));
  return <QuickAnswersPicker topics={QUICK_TOPICS.map((topic, i) => ({ topic, narration: narrations[i] }))} />;
}
