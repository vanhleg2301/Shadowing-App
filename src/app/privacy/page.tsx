import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Privacy Policy · Shadowing English",
};

const CONTACT_EMAIL = "viet.anh@nullifymatter.com.sg";
const LAST_UPDATED = "19 October 2026";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      <div className="mt-2 space-y-2 leading-relaxed text-ink/90">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <Link href="/" className="text-sm font-semibold text-brand">
        ← Back to the app
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink md:text-[40px]">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted">Last updated: {LAST_UPDATED}</p>

      <p className="mt-6 leading-relaxed text-ink/90">
        Shadowing English (“the app”, “we”) helps you learn English with videos. This policy explains what we collect,
        why, and the choices you have. You can use the app without an account; signing in is only needed to save your
        words, favorites and progress.
      </p>

      <Section title="What we collect">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <b>Your Google account basics</b> when you sign in: name, email address and profile picture.
          </li>
          <li>
            <b>Your learning data</b>: saved words (with the sentence they came from), favorite videos, lesson progress,
            review history and the days you studied.
          </li>
          <li>
            <b>Your time zone</b>, stored in a cookie, so your daily streak follows your local day.
          </li>
        </ul>
        <p>
          <b>Voice recordings</b> made in Shadowing mode stay in your browser. They are never uploaded to our servers
          and disappear when you leave the page.
        </p>
      </Section>

      <Section title="How we use it">
        <p>
          Only to run the app for you: keep you signed in, show your saved words, favorites, progress and streak, and
          schedule your word reviews. We don’t sell your data, show ads or use it for advertising.
        </p>
      </Section>

      <Section title="Services we rely on">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <b>Supabase</b> stores your account and learning data.
          </li>
          <li>
            <b>Google</b> handles sign-in.
          </li>
          <li>
            <b>YouTube</b> plays the videos through its embedded player, which is covered by Google’s own privacy
            policy.
          </li>
          <li>
            <b>Anthropic (Claude)</b>, <b>dictionaryapi.dev</b> and <b>Datamuse</b> receive the word you look up and,
            for Claude, the sentence it appears in, to produce the dictionary entry. No account information is sent.
          </li>
          <li>
            <b>Vercel</b> hosts the app.
          </li>
        </ul>
      </Section>

      <Section title="Cookies">
        <p>
          We use only the cookies the app needs to work: your sign-in session and your time zone. There are no
          advertising or tracking cookies.
        </p>
      </Section>

      <Section title="How long we keep it">
        <p>
          We keep your data while you have an account. When you delete your account, your account and all learning
          data linked to it are deleted straight away.
        </p>
      </Section>

      <Section title="Your choices">
        <ul className="list-disc space-y-1 pl-5">
          <li>Remove individual saved words or favorites at any time.</li>
          <li>
            Delete your account and all its data from the{" "}
            <Link href="/account" className="font-semibold text-brand">
              Account
            </Link>{" "}
            page.
          </li>
          <li>Ask us for a copy of your data or any other privacy question by email.</li>
        </ul>
      </Section>

      <Section title="Children">
        <p>The app is not directed at children under 13, and we don’t knowingly collect their data.</p>
      </Section>

      <Section title="Changes and contact">
        <p>
          If we change this policy we will update the date above. Questions:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-brand">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </Section>
    </main>
  );
}
