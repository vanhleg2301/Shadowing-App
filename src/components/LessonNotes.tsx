"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { getLessonNote, saveLessonNote } from "@/app/actions";
import { NoteMarkdown } from "@/components/NoteMarkdown";
import { useAuth } from "@/hooks/useAuth";
import { continueList, countWords, insertBlock, toggleLinePrefix, wrapSelection, type TextEdit } from "@/lib/markdown-editing";

interface LessonNotesProps {
  // e.g. "grammar:past-simple"; one note per learner per key.
  lessonKey: string;
  title: string;
  href: string;
  className?: string;
}

type LoadState = "loading" | "signed-out" | "failed" | "ready";
type EditBuilder = (value: string, start: number, end: number) => TextEdit;

const AUTOSAVE_MS = 1500;
const TEMPLATE = "## New words\n- \n\n## Useful phrases\n- \n\n## What I learned\n- ";
const TOOLS: { label: string; text: string; className?: string; edit: EditBuilder }[] = [
  { label: "Heading", text: "H", edit: (v, s, e) => toggleLinePrefix(v, s, e, "## ") },
  { label: "Bold (Ctrl+B)", text: "B", className: "font-extrabold", edit: (v, s, e) => wrapSelection(v, s, e, "**", "**", "bold") },
  { label: "Italic (Ctrl+I)", text: "I", className: "italic", edit: (v, s, e) => wrapSelection(v, s, e, "_", "_", "italic") },
  { label: "Bullet list", text: "•", edit: (v, s, e) => toggleLinePrefix(v, s, e, "- ") },
  { label: "Numbered list", text: "1.", edit: (v, s, e) => toggleLinePrefix(v, s, e, "1. ") },
  { label: "Checklist", text: "☐", edit: (v, s, e) => toggleLinePrefix(v, s, e, "- [ ] ") },
  { label: "Quote", text: "“", edit: (v, s, e) => toggleLinePrefix(v, s, e, "> ") },
  { label: "Table", text: "▦", edit: (v, s, e) => insertBlock(v, s, e, "| Word | Meaning |\n| --- | --- |\n|  |  |\n") },
];
const SHORTCUTS: Record<string, [before: string, after: string, placeholder: string]> = {
  b: ["**", "**", "bold"],
  i: ["_", "_", "italic"],
};

// Writes through the browser's editing pipeline so undo works and React's onChange fires.
function applyEdit(el: HTMLTextAreaElement, edit: TextEdit) {
  el.focus();
  el.setSelectionRange(edit.from, edit.to);
  const isApplied = edit.insert === "" ? edit.from === edit.to || document.execCommand("delete") : document.execCommand("insertText", false, edit.insert);
  if (!isApplied) {
    const next = el.value.slice(0, edit.from) + edit.insert + el.value.slice(edit.to);
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set?.call(el, next);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }
  requestAnimationFrame(() => el.setSelectionRange(edit.selectFrom, edit.selectTo));
}

// The learner's own Markdown note on a lesson: what they learned, words and phrases to keep. Saves as they type.
export function LessonNotes({ lessonKey, title, href, className = "" }: LessonNotesProps) {
  const { signInWithGoogle } = useAuth();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
    // The untouched template counts as an empty note, so opening the editor alone stores nothing.
    const snapshot = contentRef.current === TEMPLATE ? "" : contentRef.current;
    if (snapshot === savedRef.current) return;
    setIsSaving(true);
    const result = await saveLessonNote({ lessonKey, title: title.slice(0, 200), href, content: snapshot }).catch(() => null);
    setIsSaving(false);
    setHasError(!result?.ok);
    if (!result?.ok) return;
    savedRef.current = snapshot;
    setSaved(snapshot);
  }, [lessonKey, title, href]);

  const isDirty = (content === TEMPLATE ? "" : content) !== saved;
  useEffect(() => {
    if (!isDirty) return;
    const timer = setTimeout(() => void save(), AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [content, isDirty, save]);

  // Unsaved text is flushed when the lesson is left.
  useEffect(() => () => void save(), [save]);

  const startNote = () => {
    const hasContent = content.trim() !== "";
    if (!hasContent) setContent(TEMPLATE);
    setIsPreview(false);
    setIsEditing(true);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      const cursor = hasContent ? el.value.length : el.value.indexOf("- ") + 2;
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  const finish = () => {
    void save();
    setIsEditing(false);
  };

  const run = (build: EditBuilder) => {
    const el = textareaRef.current;
    if (el) applyEdit(el, build(el.value, el.selectionStart, el.selectionEnd));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const el = event.currentTarget;
    const key = event.key.toLowerCase();
    const isMod = event.metaKey || event.ctrlKey;
    if (isMod && key === "s") {
      event.preventDefault();
      void save();
      return;
    }
    const shortcut = isMod ? SHORTCUTS[key] : undefined;
    if (shortcut) {
      event.preventDefault();
      applyEdit(el, wrapSelection(el.value, el.selectionStart, el.selectionEnd, ...shortcut));
      return;
    }
    if (event.key === "Enter" && !event.shiftKey && !isMod && !event.nativeEvent.isComposing && el.selectionStart === el.selectionEnd) {
      const edit = continueList(el.value, el.selectionStart);
      if (edit) {
        event.preventDefault();
        applyEdit(el, edit);
      }
    }
  };

  const statusText = hasError ? "Couldn't save. Tap to retry" : isSaving ? "Saving…" : isDirty ? "Unsaved" : "Saved";
  const tab = (isActive: boolean) => `rounded-lg px-3 py-1 text-xs font-bold transition-colors ${isActive ? "bg-brand text-on-brand" : "text-muted hover:text-ink"}`;

  return (
    <section aria-label="My notes" className={`rounded-3xl border border-line bg-surface p-4 sm:p-5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-extrabold text-ink">My notes</h2>
          <p className="text-sm text-muted">Write down what you learned in this lesson.</p>
        </div>
        {loadState === "ready" && !isEditing && content.trim() && (
          <button type="button" onClick={startNote} className="btn-3d px-4 py-2 text-sm">
            Edit note
          </button>
        )}
      </div>

      {loadState === "loading" && <div className="mt-3 h-20 animate-pulse rounded-2xl bg-cream" />}
      {loadState === "failed" && <p className="mt-3 text-sm text-red-600">Couldn&apos;t load your note. Please try again later.</p>}
      {loadState === "signed-out" && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl bg-cream p-3">
          <p className="flex-1 text-sm text-muted">Sign in to keep notes for every lesson, on all your devices.</p>
          <button type="button" onClick={signInWithGoogle} className="btn-3d btn-brand px-4 py-2 text-sm">
            Sign in
          </button>
        </div>
      )}

      {loadState === "ready" &&
        (isEditing ? (
          <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-cream">
            <div className="flex items-center gap-1 border-b border-line px-2 py-1.5">
              <div className="flex flex-1 items-center gap-0.5 overflow-x-auto [scrollbar-width:none]">
                {TOOLS.map((tool) => (
                  <button
                    key={tool.label}
                    type="button"
                    title={tool.label}
                    aria-label={tool.label}
                    disabled={isPreview}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => run(tool.edit)}
                    className={`grid size-8 shrink-0 place-items-center rounded-lg text-sm text-muted transition-colors hover:bg-surface hover:text-ink disabled:opacity-40 ${tool.className ?? "font-bold"}`}
                  >
                    {tool.text}
                  </button>
                ))}
              </div>
              <div role="tablist" aria-label="Note view" className="flex shrink-0 rounded-xl border border-line bg-surface p-0.5">
                <button type="button" role="tab" aria-selected={!isPreview} onClick={() => setIsPreview(false)} className={tab(!isPreview)}>
                  Write
                </button>
                <button type="button" role="tab" aria-selected={isPreview} onClick={() => setIsPreview(true)} className={tab(isPreview)}>
                  Preview
                </button>
              </div>
            </div>
            {isPreview ? (
              <div className="min-h-48 bg-surface px-4 py-3">
                {content.trim() ? <NoteMarkdown content={content} /> : <p className="text-sm text-muted">Nothing to preview yet.</p>}
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                onBlur={() => void save()}
                onKeyDown={handleKeyDown}
                aria-label="Note"
                lang="en"
                rows={10}
                placeholder="Write in Markdown, or use the buttons above."
                className="block min-h-48 w-full resize-y bg-surface px-4 py-3 text-base leading-relaxed text-ink outline-none placeholder:text-muted"
              />
            )}
            <div className="flex items-center justify-between gap-2 border-t border-line px-3 py-2">
              <p className="text-xs text-muted">
                <button type="button" onClick={() => void save()} className={hasError ? "font-semibold text-red-600" : ""}>
                  {statusText}
                </button>
                <span className="mx-1.5">·</span>
                {countWords(content)} words
              </p>
              <button type="button" onClick={finish} className="btn-3d btn-brand px-4 py-1.5 text-sm">
                Done
              </button>
            </div>
          </div>
        ) : content.trim() ? (
          <div className="mt-3 rounded-2xl bg-cream p-4">
            <NoteMarkdown content={content} />
          </div>
        ) : (
          <button type="button" onClick={startNote} className="btn-3d btn-brand mt-3 px-4 py-2 text-sm">
            Start a note
          </button>
        ))}

      {loadState === "ready" && (
        <Link href="/notes" className="mt-3 inline-block text-sm font-semibold text-brand hover:text-brand-dark">
          All my notes →
        </Link>
      )}
    </section>
  );
}
