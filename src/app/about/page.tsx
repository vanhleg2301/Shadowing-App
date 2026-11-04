import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Icon, type IconName } from "@/components/Icon";

export const metadata: Metadata = {
  title: "About · Shadowing English",
  description: "A plain-English guide to comprehensible input, shadowing and the four study modes.",
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-ink/90">{children}</div>
    </section>
  );
}

interface ModeCardProps {
  icon: IconName;
  name: string;
  tag: string;
  what: string;
  use: string;
  tryThis: string;
}

const MODE_CARDS: ModeCardProps[] = [
  {
    icon: "play",
    name: "Watch",
    tag: "Start here",
    what: "Plays the video with the words under it. The words move with the speaker.",
    use: "To understand the story, meet new words, and hear natural English.",
    tryThis: "Watch once without stopping. Tap a word to see its meaning. Then watch again and read along.",
  },
  {
    icon: "mic",
    name: "Shadowing",
    tag: "Speak",
    what: "Stops after each sentence. You listen, then record yourself saying the same sentence.",
    use: "To practise how you say the sounds, the beat of the sentence, and speaking without translating in your head.",
    tryThis: "Listen, record, and compare. Try to copy the speaker’s rhythm. Then say it again, a little faster.",
  },
  {
    icon: "headphones",
    name: "Dictation",
    tag: "Listen",
    what: "Plays one sentence and hides the words. You type what you hear, then check.",
    use: "To hear small words and endings, like a, the, -s, and -ed. These are easy to miss.",
    tryThis: "Listen two or three times before you type. Check your answer. Then say the full sentence out loud.",
  },
  {
    icon: "book",
    name: "Cloze",
    tag: "Notice",
    what: "A cloze is a sentence with some words missing. You listen and fill in the blanks.",
    use: "To notice how words go together, and how English works in a real sentence.",
    tryThis: "Read the sentence first. Then listen and fill in the missing words. Check, then say the whole sentence.",
  },
];

const ROUTINE = [
  {
    title: "Watch one short video",
    detail: "Follow the idea, not every word. Two or three minutes is enough.",
    mode: "Watch",
  },
  {
    title: "Shadow five sentences",
    detail: "Listen, record, and compare. Pick five sentences, not the whole video.",
    mode: "Shadowing",
  },
  {
    title: "Do three sentences of dictation",
    detail: "Type what you hear, then check. Look at the small words you missed.",
    mode: "Dictation",
  },
  {
    title: "Do three sentences of cloze",
    detail: "Fill in the missing words, then read each full sentence out loud.",
    mode: "Cloze",
  },
  {
    title: "Watch the video again",
    detail: "Notice what is easier now. This is your brain learning from the same input.",
    mode: "Watch",
  },
];

function ModeCard({ icon, name, tag, what, use, tryThis }: ModeCardProps) {
  return (
    <article className="flex flex-col rounded-3xl border border-line bg-surface p-5 shadow-[0_4px_0_0_var(--color-line)]">
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand">
          <Icon name={icon} className="size-6" />
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-extrabold text-ink">{name}</h3>
          <p className="text-xs font-bold uppercase tracking-wide text-accent">{tag}</p>
        </div>
      </div>
      <dl className="mt-4 space-y-3 text-sm leading-relaxed">
        <div>
          <dt className="font-bold text-ink">What it does</dt>
          <dd className="text-muted">{what}</dd>
        </div>
        <div>
          <dt className="font-bold text-ink">Use it for</dt>
          <dd className="text-muted">{use}</dd>
        </div>
        <div>
          <dt className="font-bold text-ink">Try this</dt>
          <dd className="text-muted">{tryThis}</dd>
        </div>
      </dl>
    </article>
  );
}

export default function AboutPage() {
  return (
    <AppShell active="/about">
      <main className="mx-auto w-full max-w-3xl px-4 pb-12 pt-[calc(env(safe-area-inset-top)+1.5rem)] md:px-10 md:py-10">
        <Breadcrumbs items={[{ label: "About" }]} />

        <section className="animate-fade-up rounded-[2rem] border border-brand/20 bg-gradient-to-br from-brand-soft via-surface to-surface p-5 md:p-7">
          <p className="text-xs font-bold uppercase tracking-wide text-accent">About this app</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-[36px]">
            Learn English with videos you can understand
          </h1>
          <p className="mt-3 leading-relaxed text-ink/90">
            Shadowing English helps you listen to real English and speak it more easily. You watch short videos, read
            the words, and practise one sentence at a time.
          </p>
          <p className="mt-2 text-sm font-semibold text-muted">Written for A2 learners. Every idea is explained in simple words.</p>
        </section>

        <Section title="1. Comprehensible input: understand the message">
          <p>
            <b className="text-ink">Comprehensible input</b> is English you can mostly understand. It is a little above
            your level, but not too far above it. You get the idea, even when some words are new.
          </p>
          <p>
            You do not need every word. The pictures, the speaker’s face, and the story help you. That is why videos
            are useful: you can see what the person means.
          </p>
          <div className="rounded-3xl border border-line bg-surface p-4">
            <p className="font-bold text-ink">Good input feels like this</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-ink/90">
              <li>You can follow the story without stopping many times.</li>
              <li>You understand about seven or eight words out of ten.</li>
              <li>You meet a few new words, but not twenty new words in one minute.</li>
            </ul>
          </div>
          <p>
            <b className="text-ink">Why it works:</b> your brain learns language from messages, not only from rules.
            When you understand many messages, words and grammar start to feel natural.
          </p>
          <p className="text-sm text-muted">
            If a video is too hard, choose a slower collection. If it is too easy, choose a faster one. The right
            level is the level where you can still enjoy the video.
          </p>
        </Section>

        <Section title="2. Shadowing: speak along with the speaker">
          <p>
            <b className="text-ink">Shadowing</b> means you speak at the same time as the audio. You follow the
            speaker like a shadow. You do not wait for the sentence to end.
          </p>
          <p>
            Copy the words, the speed, and the rhythm. Try to copy the feeling, too: friendly, tired, or polite. Your
            voice should sound close to the original.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-brand-soft p-4">
              <p className="font-bold text-ink">Shadowing</p>
              <p className="mt-1 text-sm text-ink/80">Speak while the audio plays.</p>
            </div>
            <div className="rounded-3xl bg-cream p-4">
              <p className="font-bold text-ink">Repeating</p>
              <p className="mt-1 text-sm text-muted">Listen, stop, then speak.</p>
            </div>
          </div>

          <p>
            Both help. The Shadowing mode in this app uses small steps: you listen to one sentence, then record
            yourself saying it. Your goal is to keep the same rhythm, not to read the words like a list.
          </p>

          <div className="rounded-3xl border border-line bg-surface p-4">
            <p className="font-bold text-ink">How to shadow in this app</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-ink/90">
              <li>Tap Listen and read the sentence once.</li>
              <li>Tap Record and say the sentence. Try to keep the same beat.</li>
              <li>Tap Compare. Listen to the original, then to your voice.</li>
              <li>Do it three to five times. Then tap Next.</li>
            </ol>
          </div>

          <p className="text-sm text-muted">
            If a sentence is too fast, use 0.75x speed. If you lose the speaker, stop and start again. Mistakes are
            part of practice.
          </p>
        </Section>

        <Section title="3. The four modes">
          <p>
            A mode is a way to study one video. Open a video and choose a mode at the top. You can change the mode at
            any time.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {MODE_CARDS.map((card) => (
              <ModeCard key={card.name} {...card} />
            ))}
          </div>
        </Section>

        <Section title="4. A simple 10-minute routine">
          <p>You do not need a long study session. Try this order:</p>
          <ol className="mt-4 space-y-2">
            {ROUTINE.map((step, index) => (
              <li key={step.title} className="flex gap-3 rounded-2xl border border-line bg-surface p-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-extrabold text-on-brand">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-ink">{step.title}</p>
                  <p className="mt-0.5 text-sm text-muted">{step.detail}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-accent">{step.mode}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="rounded-2xl bg-accent-soft px-4 py-3 text-sm font-semibold text-ink">
            Short practice every day is better than one long practice each week.
          </p>
        </Section>

        <Section title="5. Good to know">
          <ul className="list-disc space-y-2 pl-5">
            <li>You can use the app without an account. Sign in to save your words, favorites, and progress.</li>
            <li>Your voice recordings stay in your browser. They are not uploaded.</li>
            <li>Use the Aa button to change the text size. Use the sun and moon button to change the theme.</li>
            <li>Tap any word in Watch mode to see its meaning and save it for review.</li>
          </ul>
        </Section>

        <section className="mt-10 rounded-[2rem] border border-brand/20 bg-brand-soft p-5 text-ink md:p-6">
          <h2 className="text-2xl font-extrabold tracking-tight">Ready to try?</h2>
          <p className="mt-2 leading-relaxed">
            Pick a video that looks interesting. Start with Watch, then try one sentence in Shadowing.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/" className="btn-3d btn-brand px-5 py-3">
              Find a video
            </Link>
            <Link href="/course" className="btn-3d px-5 py-3">
              See the course
            </Link>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
