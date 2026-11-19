"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { chooseWeekVideo } from "@/app/actions";
import type { CuratedVideo } from "@/data/curated";
import { getThumbnailUrl } from "@/lib/media";

export type PlanVideo = Pick<CuratedVideo, "videoId" | "title" | "level" | "duration" | "topic">;

interface WeekVideoPickerProps {
  weekStart: string;
  suggestions: PlanVideo[];
  onCancel?: () => void;
}

const PAGE_SIZE = 3;

export function WeekVideoPicker({ weekStart, suggestions, onCancel }: WeekVideoPickerProps) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [choosingId, setChoosingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const pageCount = Math.max(1, Math.ceil(suggestions.length / PAGE_SIZE));
  const shown = suggestions.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const choose = (videoId: string) => {
    setError(null);
    setChoosingId(videoId);
    startTransition(async () => {
      const result = await chooseWeekVideo({ weekStart, videoId }).catch(() => null);
      if (result?.ok) {
        router.refresh();
        onCancel?.();
      } else {
        setError("Couldn't save your choice. Please try again.");
      }
      setChoosingId(null);
    });
  };

  return (
    <section aria-label="Choose this week's video" className="mt-6 rounded-3xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-extrabold text-ink">Choose this week&apos;s video</h2>
          <p className="mt-1 text-sm text-muted">
            One short video for the whole week. Pick one you can follow about 70–80% of without the text.
          </p>
        </div>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-3d px-4 py-2 text-sm">
            Cancel
          </button>
        )}
      </div>

      {suggestions.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No videos to suggest right now. Please try again later.</p>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {shown.map((video) => (
            <li key={video.videoId} className="flex flex-col rounded-2xl border border-line bg-cream p-2.5">
              <div className="relative aspect-video overflow-hidden rounded-xl bg-surface">
                <Image src={getThumbnailUrl(video.videoId)} alt="" fill sizes="(min-width: 640px) 30vw, 90vw" className="object-cover" />
                <span className="absolute bottom-2 right-2 rounded-lg bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">{video.duration}</span>
              </div>
              <p className="mt-2 line-clamp-2 font-bold leading-snug text-ink">{video.title}</p>
              <p className="mt-0.5 text-xs text-muted">
                {video.level} · {video.topic}
              </p>
              <span className="flex-1" />
              <button
                type="button"
                onClick={() => choose(video.videoId)}
                disabled={isPending}
                className="btn-3d btn-brand mt-3 w-full px-3 py-2 text-sm"
              >
                {choosingId === video.videoId ? "Saving…" : "Study this video"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
      {pageCount > 1 && (
        <button type="button" onClick={() => setPage((page + 1) % pageCount)} className="mt-3 text-sm font-semibold text-brand hover:text-brand-dark">
          Show other videos
        </button>
      )}
    </section>
  );
}
