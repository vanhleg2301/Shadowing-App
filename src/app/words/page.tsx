import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Icon } from "@/components/Icon";
import { VOCAB_COURSE_ID, VOCAB_TOPICS, getPhrasePicture, getTopicChecks, type VocabTopic } from "@/data/vocabulary";
import { getCourseProgress } from "@/lib/user-data";

export const metadata: Metadata = { title: "Vocabulary · Shadowing English" };

const SECTIONS: { kind: VocabTopic["kind"]; title: string; hint: string }[] = [
  { kind: "situation", title: "Phrases for everyday situations", hint: "Learn what to say, with pictures and real situations, then use it in a conversation." },
  { kind: "words", title: "Everyday words in pictures", hint: "The words of each grammar unit, one picture for each." },
];

export default function VocabularyPage() {
  return (
    <AppShell active="/words">
      <main className="w-full max-w-4xl px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:px-10">
        <Breadcrumbs items={[{ label: "Vocabulary" }]} />
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-[36px]">Vocabulary</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Level A2 phrases, learned as whole chunks: see them in pictures, choose what to say in a situation, hear them in a conversation and say
          them yourself. About 15 minutes a topic.
        </p>
        <Suspense fallback={<TopicList done={new Set()} />}>
          <TopicListWithProgress />
        </Suspense>
      </main>
    </AppShell>
  );
}

async function TopicListWithProgress() {
  const progress = await getCourseProgress(VOCAB_COURSE_ID).catch(() => null);
  const done = new Set(VOCAB_TOPICS.filter((topic) => getTopicChecks(topic).every((check) => progress?.[topic.id]?.includes(check))).map((t) => t.id));
  return <TopicList done={done} />;
}

function TopicList({ done }: { done: ReadonlySet<number> }) {
  return SECTIONS.map((section) => (
    <section key={section.kind} className="mt-8">
      <h2 className="text-xl font-extrabold text-ink">{section.title}</h2>
      <p className="mt-1 text-sm text-muted">{section.hint}</p>
      <ul className="stagger mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {VOCAB_TOPICS.filter((topic) => topic.kind === section.kind).map((topic) => (
          <li key={topic.id}>
            <Link
              href={`/words/${topic.slug}`}
              className="flex h-full items-center gap-4 rounded-3xl border border-line bg-surface p-4 shadow-[0_4px_0_0_var(--color-line)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="relative shrink-0">
                <Image src={getPhrasePicture(topic, topic.phrases[0])} alt="" width={128} height={128} className="size-16 rounded-2xl border border-line" />
                {done.has(topic.id) && (
                  <span className="absolute -left-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-accent text-xs font-extrabold text-white">✓</span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-ink">{topic.title}</span>
                <span className="block truncate text-sm text-muted">
                  {topic.phrases.length} {topic.kind === "situation" ? "phrases" : "words"} · {topic.canDo}
                </span>
              </span>
              <Icon name="chevronRight" className="size-5 shrink-0 text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  ));
}
