"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/Icon";

interface PracticeNavProps {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onListen: () => void;
  children: ReactNode;
}

export function PracticeNav({ index, total, onPrev, onNext, onListen, children }: PracticeNavProps) {
  return (
    <div className="mt-4 grid grid-cols-[1fr_1.4fr_1.4fr_1fr] gap-2">
      <button type="button" className="btn-3d py-3" onClick={onPrev} disabled={index === 0} aria-label="Previous sentence">
        <Icon name="prev" />
      </button>
      <button type="button" className="btn-3d py-3 text-sm" onClick={onListen}>
        <Icon name="play" className="size-4" />
        Listen
      </button>
      {children}
      <button type="button" className="btn-3d py-3" onClick={onNext} disabled={index >= total - 1} aria-label="Next sentence">
        <Icon name="next" />
      </button>
    </div>
  );
}
