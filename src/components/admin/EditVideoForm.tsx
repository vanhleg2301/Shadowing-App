"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { updateVideo } from "@/app/admin/actions";
import { COLLECTIONS, isCollectionId, type CollectionId } from "@/data/collections";
import { LEVELS, type Level } from "@/data/curated";
import type { VideoRow } from "@/lib/catalog";

interface EditVideoFormProps {
  video: VideoRow;
  topics: string[];
}

export function EditVideoForm({ video, topics }: EditVideoFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(video.title);
  const [level, setLevel] = useState(video.level as Level);
  const [collection, setCollection] = useState<CollectionId>(isCollectionId(video.collection_id) ? video.collection_id : "sponge");
  const [topic, setTopic] = useState(video.topic);
  const [duration, setDuration] = useState(video.duration);
  const [channel, setChannel] = useState(video.channel);
  const [isPublished, setIsPublished] = useState(video.is_published);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateVideo({ videoId: video.video_id, title, level, topic, collection, duration, channel, isPublished });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin/videos");
      router.refresh();
    });
  };

  const fieldClass =
    "w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft";
  const labelClass = "block text-xs font-semibold uppercase tracking-wide text-muted";

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-3xl border border-line bg-surface p-5">
      <label className={labelClass}>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} className={`${fieldClass} mt-1`} />
      </label>
      <label className={labelClass}>
        Collection
        <select value={collection} onChange={(e) => setCollection(e.target.value as CollectionId)} className={`${fieldClass} mt-1`}>
          {COLLECTIONS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className={labelClass}>
          Level
          <select value={level} onChange={(e) => setLevel(e.target.value as Level)} className={`${fieldClass} mt-1`}>
            {LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Topic
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            list="edit-topics"
            required
            maxLength={60}
            className={`${fieldClass} mt-1`}
          />
          <datalist id="edit-topics">
            {topics.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </label>
        <label className={labelClass}>
          Duration
          <input value={duration} onChange={(e) => setDuration(e.target.value)} maxLength={10} className={`${fieldClass} mt-1`} />
        </label>
        <label className={labelClass}>
          Channel
          <input value={channel} onChange={(e) => setChannel(e.target.value)} maxLength={100} className={`${fieldClass} mt-1`} />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold text-ink">
        <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="size-4" />
        Published (visible to learners)
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="btn-3d btn-brand px-5 py-2 text-sm">
          {isPending ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={() => router.push("/admin/videos")} className="btn-3d px-5 py-2 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}
