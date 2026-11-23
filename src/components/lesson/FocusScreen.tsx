"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/Icon";

interface FocusScreenProps {
  title: string;
  // 0 to 1.
  progress: number;
  onClose: () => void;
  children: ReactNode;
  // Stays at the bottom: the button that moves the lesson on, or the answer's feedback.
  footer?: ReactNode;
}

// One part of a lesson on the whole screen: a close button and a progress bar at the top, one card or
// question in the middle, and the action at the bottom where the thumb is.
export function FocusScreen({ title, progress, onClose, children, footer }: FocusScreenProps) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  // On document.body, so no stacking context of the page (or the tab bar) can sit on top of it. It only
  // opens after a tap, so it never renders on the server.
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[60] flex animate-fade-in flex-col bg-cream">
      <header className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <button type="button" onClick={onClose} aria-label="Close" className="grid size-10 shrink-0 place-items-center rounded-full text-muted hover:bg-surface hover:text-ink">
          <Icon name="close" className="size-6" />
        </button>
        <div
          role="progressbar"
          aria-label={`${title} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          className="h-3 flex-1 overflow-hidden rounded-full bg-line"
        >
          <div className="h-full rounded-full bg-brand transition-[width] duration-300" style={{ width: `${Math.min(1, Math.max(0, progress)) * 100}%` }} />
        </div>
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 pb-6 pt-2">{children}</div>
      </main>
      {footer && (
        <footer className="shrink-0 border-t border-line bg-surface">
          <div className="mx-auto w-full max-w-2xl px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3">{footer}</div>
        </footer>
      )}
    </div>,
    document.body,
  );
}

// The end of a part: the score, and what to do next.
export function FocusSummary({ title, detail, isPassed = true, children }: { title: string; detail?: string; isPassed?: boolean; children?: ReactNode }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <span className={`grid size-16 place-items-center rounded-full ${isPassed ? "bg-brand text-on-brand" : "bg-accent-soft text-accent"}`}>
        <Icon name={isPassed ? "check" : "repeat"} className="size-8" />
      </span>
      <p className="mt-4 text-3xl font-extrabold text-ink">{title}</p>
      {detail && <p className="mt-2 max-w-sm text-muted">{detail}</p>}
      {children && <div className="mt-6 flex w-full max-w-sm flex-col gap-2">{children}</div>}
    </div>
  );
}
