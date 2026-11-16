"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getLessonNote, saveLessonNote } from "@/app/actions";
import { useAuth } from "@/hooks/useAuth";

interface LessonNotesProps {
  // e.g. "grammar:past-simple"; one note per learner per key.
  lessonKey: string;
  title: string;
  href: string;
  className?: string;
}

type LoadState = "loading" | "signed-out" | "failed" | "ready";

const AUTOSAVE_MS = 1500;

// The learner's own plain-text note on a lesson. Saves as they type.
export function LessonNotes({ lessonKey, title, href, className = "" }: LessonNotesProps) {
  const { signInWithGoogle } = useAuth();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  // Mirrors of content and saved for the save callback, which also runs on unmount.
  const contentRef = useRef("");
  const savedRef = useRef("");

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    let isCurrent = true;
    void (async () => {
      const result = await getLessonNote({ lessonKey }).catch(() => null);
      if (!isCurrent) return;
      if (!result) return setLoadState("failed");
      if (!result.ok) return setLoadState(result.error === "signed-out" ? "signed-out" : "failed");
      contentRef.current = savedRef.current = result.content;
      setContent(result.content);
      setSaved(result.content);
      setLoadState("ready");
    })();
    return () => {
      isCurrent = false;
    };
  }, [lessonKey]);

  const save = useCallback(async () => {
    const snapshot = contentRef.current;
    if (snapshot === savedRef.current) return;
    setIsSaving(true);
    const result = await saveLessonNote({ lessonKey, title: title.slice(0, 200), href, content: snapshot }).catch(() => null);
    setIsSaving(false);
    setHasError(!result?.ok);
    if (!result?.ok) return;
    savedRef.current = snapshot;
    setSaved(snapshot);
  }, [lessonKey, title, href]);

  const isDirty = content !== saved;
  useEffect(() => {
    if (!isDirty) return;
    const timer = setTimeout(() => void save(), AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [content, isDirty, save]);

  // Unsaved text is flushed when the lesson is left.
  useEffect(() => () => void save(), [save]);

  const statusText = hasError ? "Couldn't save. Tap to retry" : isSaving ? "Saving…" : isDirty ? "Unsaved" : "Saved";

  return (
    <section aria-label="My notes" className={`rounded-3xl border border-line bg-surface p-4 sm:p-5 ${className}`}>
      <h2 className="text-lg font-extrabold text-ink">My notes</h2>
      <p className="text-sm text-muted">Write down what you learned in this lesson.</p>

      {loadState === "loading" && <div className="mt-3 h-32 animate-pulse rounded-2xl bg-cream" />}
      {loadState === "failed" && <p className="mt-3 text-sm text-red-600">Couldn&apos;t load your note. Please try again later.</p>}
      {loadState === "signed-out" && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl bg-cream p-3">
          <p className="flex-1 text-sm text-muted">Sign in to keep notes for every lesson, on all your devices.</p>
          <button type="button" onClick={signInWithGoogle} className="btn-3d btn-brand px-4 py-2 text-sm">
            Sign in
          </button>
        </div>
      )}

      {loadState === "ready" && (
        <>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onBlur={() => void save()}
            aria-label="Note"
            lang="en"
            rows={6}
            maxLength={20000}
            placeholder="New words, useful phrases, anything you want to remember…"
            className="mt-3 block min-h-32 w-full resize-y rounded-2xl border border-line bg-cream px-4 py-3 text-base leading-relaxed text-ink outline-none placeholder:text-muted focus:border-brand"
          />
          <div className="mt-2 flex items-center justify-between gap-2 text-xs">
            {content || saved ? (
              <button type="button" onClick={() => void save()} className={hasError ? "font-semibold text-red-600" : "text-muted"}>
                {statusText}
              </button>
            ) : (
              <span />
            )}
            <Link href="/notes" className="text-sm font-semibold text-brand hover:text-brand-dark">
              All my notes →
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
