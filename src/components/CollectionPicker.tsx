"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { selectCollection } from "@/app/actions";
import { COLLECTIONS, type Collection, type CollectionId } from "@/data/collections";
import type { CollectionCounts } from "@/lib/catalog";
import { speak } from "@/lib/speech";

interface CollectionPickerProps {
  current: CollectionId | null;
  counts: CollectionCounts;
  onDone?: () => void;
  // Inside a bottom sheet the cards stack in one column.
  isStacked?: boolean;
}

const SPEEDS: Collection["speed"][] = ["slow", "medium", "natural"];
const SPEED_BARS: Record<Collection["speed"], number> = { slow: 1, medium: 2, natural: 3 };
const SPEED_TITLE: Record<Collection["speed"], string> = { slow: "Slow", medium: "Medium", natural: "Natural speed" };
const SAMPLE_RATE: Record<Collection["speed"], number> = { slow: 0.7, medium: 0.9, natural: 1.1 };
const SAMPLE = "Hi! Today I'm going to tell you about my morning. I get up at seven and have a coffee.";

// Choose the video collection by speaking speed; the library, favorites and the course follow it.
export function CollectionPicker({ current, counts, onDone, isStacked = false }: CollectionPickerProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<CollectionId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handlePick = (id: CollectionId) => {
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await selectCollection({ collection: id });
      if (!result.ok) {
        setError("Couldn't save your choice. Please try again.");
        return;
      }
      router.refresh();
      onDone?.();
    });
  };

  return (
    <div>
      <div className={`grid gap-5 ${isStacked ? "" : "md:grid-cols-3"}`}>
        {SPEEDS.map((speed) => (
          <section key={speed}>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-extrabold text-ink">
              <span className="flex items-end gap-0.5" aria-hidden="true">
                {[1, 2, 3].map((bar) => (
                  <span
                    key={bar}
                    className={`w-1.5 rounded-full ${bar <= SPEED_BARS[speed] ? "bg-brand" : "bg-line"}`}
                    style={{ height: `${bar * 5 + 4}px` }}
                  />
                ))}
              </span>
              {SPEED_TITLE[speed]}
              <span className="font-semibold text-muted">· {formatVideoCount(sumBySpeed(counts, speed))}</span>
            </h3>
            <ul className="space-y-3">
              {COLLECTIONS.filter((c) => c.speed === speed).map((c) => {
                const isCurrent = c.id === current;
                return (
                  <li key={c.id}>
                    <div
                      className={`flex h-full flex-col rounded-3xl border-2 bg-surface p-4 transition-colors ${
                        isCurrent ? "border-brand" : "border-line"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold uppercase tracking-wide text-accent">
                          {c.levels} · {formatVideoCount(counts[c.id] ?? 0)}
                        </span>
                      </div>
                      <p className="mt-2 text-lg font-extrabold text-ink">{c.name}</p>
                      <p className="mt-1 flex-1 text-sm text-muted">{c.description}</p>
                      <div className="mt-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handlePick(c.id)}
                          disabled={isPending}
                          className={`btn-3d flex-1 px-4 py-2.5 text-sm ${isCurrent ? "" : "btn-brand"}`}
                        >
                          {isPending && pendingId === c.id ? "Saving..." : isCurrent ? "Current choice" : `Choose ${c.speedLabel.toLowerCase()}`}
                        </button>
                        <button
                          type="button"
                          onClick={() => speak(SAMPLE, "uk", SAMPLE_RATE[c.speed])}
                          className="btn-3d shrink-0 px-3 py-2.5 text-sm"
                          aria-label={`Hear how ${c.speedLabel.toLowerCase()} speed sounds`}
                        >
                          Hear speed
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
      <p className="mt-3 text-xs text-muted">
        You can switch any time. Your progress, favorites and course days are kept for each collection.
      </p>
    </div>
  );
}

function sumBySpeed(counts: CollectionCounts, speed: Collection["speed"]): number {
  return COLLECTIONS.filter((c) => c.speed === speed).reduce((total, c) => total + (counts[c.id] ?? 0), 0);
}

function formatVideoCount(count: number): string {
  return `${count} ${count === 1 ? "video" : "videos"}`;
}
