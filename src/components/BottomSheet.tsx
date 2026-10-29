"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/Icon";

interface BottomSheetProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

// Slides up from the bottom on phones (clear of the home indicator), centred dialog on larger screens.
export function BottomSheet({ title, onClose, children }: BottomSheetProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  // Rendered into <body>: a sheet opened from the sticky sidebar or a blurred bar would otherwise be
  // trapped in that element's stacking context and show up behind the page.
  return createPortal(
    <div className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[88dvh] w-full max-w-lg animate-sheet-up overflow-y-auto rounded-t-[2rem] border border-line bg-surface px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-3 shadow-2xl sm:rounded-[2rem] sm:pb-5"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line sm:hidden" />
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-ink">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-muted hover:bg-cream">
            <Icon name="close" />
          </button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
