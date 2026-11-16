import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SignInPrompt } from "@/components/SignInPrompt";
import { ListSkeleton } from "@/components/Skeleton";
import { getLessonNotes, type LessonNote } from "@/lib/user-data";

export const metadata: Metadata = { title: "My notes · Shadowing English" };

const KIND_LABELS: Record<string, string> = {
  watch: "Video",
  news: "News",
  course: "Course",
  grammar: "Grammar",
  story: "Story",
  tech: "AI & Tech",
};

export default function NotesPage() {
  return (
    <AppShell active="/notes">
      <main className="w-full max-w-3xl px-4 py-8 md:px-10">
        <Breadcrumbs items={[{ label: "My notes" }]} />
        <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-[36px]">My notes</h1>
        <p className="mt-2 text-muted">What you wrote down in each lesson, newest first.</p>
        <Suspense fallback={<ListSkeleton />}>
          <NoteList />
        </Suspense>
      </main>
    </AppShell>
  );
}

async function NoteList() {
  let notes: LessonNote[] | null;
  try {
    notes = await getLessonNotes();
  } catch {
    return <p className="mt-8 text-red-600">Couldn&apos;t load your notes. Please try again later.</p>;
  }
  if (!notes) return <SignInPrompt message="Sign in to keep notes for every lesson." />;
  if (notes.length === 0) {
    return <p className="mt-8 text-muted">No notes yet. Open any lesson and write in the “My notes” box.</p>;
  }
  return (
    <ul className="mt-6 space-y-4">
      {notes.map((note) => (
        <li key={note.lessonKey} className="rounded-3xl border border-line bg-surface p-4 shadow-[0_4px_0_0_var(--color-line)] sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <Link href={note.href} className="min-w-0 text-lg font-extrabold text-ink hover:text-brand">
              {note.title}
            </Link>
            <p className="text-xs font-semibold text-muted">
              {KIND_LABELS[note.lessonKey.split(":")[0]] ?? "Lesson"} · {new Date(note.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          <p lang="en" className="mt-3 max-h-80 overflow-y-auto whitespace-pre-wrap break-words rounded-2xl bg-cream p-4 leading-relaxed text-ink">
            {note.content}
          </p>
          <Link href={note.href} className="mt-3 inline-block text-sm font-semibold text-brand hover:text-brand-dark">
            Open the lesson to edit →
          </Link>
        </li>
      ))}
    </ul>
  );
}
