"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/Icon";

interface ScrollRowProps {
  label: string;
  children: ReactNode;
}

// Horizontal carousel: hidden scrollbar, swipe on touch, arrow buttons and edge fades on desktop.
export function ScrollRow({ label, children }: ScrollRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateArrows = () => {
    const el = ref.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 4);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Fires once on observe, which also sets the initial arrow state.
    const observer = new ResizeObserver(updateArrows);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollByPage = (direction: 1 | -1) => {
    const el = ref.current;
    el?.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        onScroll={updateArrows}
        aria-label={label}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-4 pb-3 pt-1 md:mx-0 md:scroll-px-0 md:px-0"
      >
        {children}
      </div>

      <div
        className={`pointer-events-none absolute inset-y-0 left-0 hidden w-16 bg-gradient-to-r from-cream to-transparent transition-opacity md:block ${
          canScrollPrev ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-y-0 right-0 hidden w-16 bg-gradient-to-l from-cream to-transparent transition-opacity md:block ${
          canScrollNext ? "opacity-100" : "opacity-0"
        }`}
      />

      {(["prev", "next"] as const).map((side) => {
        const isVisible = side === "prev" ? canScrollPrev : canScrollNext;
        return (
          <button
            key={side}
            type="button"
            onClick={() => scrollByPage(side === "prev" ? -1 : 1)}
            aria-label={side === "prev" ? "Scroll left" : "Scroll right"}
            tabIndex={isVisible ? 0 : -1}
            className={`btn-3d absolute top-[32%] hidden size-11 -translate-y-1/2 rounded-full transition-opacity duration-200 md:inline-flex ${
              side === "prev" ? "-left-5" : "-right-5"
            } ${isVisible ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            <Icon name={side === "prev" ? "chevronLeft" : "chevronRight"} />
          </button>
        );
      })}
    </div>
  );
}
