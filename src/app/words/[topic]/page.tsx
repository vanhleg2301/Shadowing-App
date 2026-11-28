import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ListSkeleton } from "@/components/Skeleton";
import { VocabTopicView } from "@/components/vocab/VocabTopicView";
import { getGrammarUnit } from "@/data/grammar";
import { VOCAB_COURSE_ID, VOCAB_TOPICS, getVocabNarration, getVocabNarrationId, getVocabTopic } from "@/data/vocabulary";
import { getLineNarration } from "@/lib/story-audio";
import { getCourseProgress } from "@/lib/user-data";

export function generateStaticParams() {
  return VOCAB_TOPICS.map((topic) => ({ topic: topic.slug }));
}

export default function VocabTopicPage({ params }: PageProps<"/words/[topic]">) {
  return (
    <AppShell active="/words">
      <main className="w-full max-w-3xl px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1.25rem)] md:px-10">
        <Suspense fallback={<ListSkeleton rows={5} />}>
          {params.then(({ topic }) => (
            <TopicContent slug={topic} />
          ))}
        </Suspense>
      </main>
    </AppShell>
  );
}

async function TopicContent({ slug }: { slug: string }) {
  const topic = getVocabTopic(slug);
  if (!topic) notFound();
  const [progress, narration] = await Promise.all([
    getCourseProgress(VOCAB_COURSE_ID).catch(() => null),
    getLineNarration(
      getVocabNarrationId(topic),
      getVocabNarration(topic).map((line) => line.text),
    ),
  ]);
  const index = VOCAB_TOPICS.indexOf(topic);
  const next = VOCAB_TOPICS[index + 1];
  const grammar = topic.grammarSlug ? getGrammarUnit(topic.grammarSlug) : undefined;

  return (
    <>
      <Breadcrumbs items={[{ label: "Vocabulary", href: "/words" }, { label: topic.title }]} />
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-accent">
        A2 · {topic.kind === "situation" ? "Phrases for a situation" : "Words in pictures"}
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">{topic.title}</h1>
      <p className="mt-2 rounded-2xl border border-brand/20 bg-brand-soft px-4 py-3 text-ink">
        <b>Goal:</b> {topic.canDo}
      </p>
      {grammar && (
        <p className="mt-2 text-sm text-muted">
          Grammar for this topic:{" "}
          <Link href={`/grammar/${grammar.slug}`} className="font-semibold text-brand hover:text-brand-dark">
            {grammar.title}
          </Link>
        </p>
      )}
      <div className="mt-6">
        <VocabTopicView
          key={topic.slug}
          topic={topic}
          narration={narration}
          isSignedIn={progress !== null}
          passed={progress?.[topic.id] ?? []}
          nextHref={next ? `/words/${next.slug}` : null}
        />
      </div>
    </>
  );
}
