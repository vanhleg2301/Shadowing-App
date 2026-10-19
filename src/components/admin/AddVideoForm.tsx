"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { addVideo } from "@/app/admin/actions";
import { LEVELS, type Level } from "@/data/curated";

interface AddVideoFormProps {
  topics: string[];
}

export function AddVideoForm({ topics }: AddVideoFormProps) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [level, setLevel] = useState<Level>("A2");
  const [topic, setTopic] = useState(topics[0] ?? "");
  const [message, setMessage] = useState<{ isError: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await addVideo({ url, level, topic });
      if (!result.ok) {
        setMessage({ isError: true, text: result.error });
        return;
      }
      setUrl("");
      setMessage({ isError: false, text: "Video added with its transcript." });
      router.refresh();
    });
  };

  const fieldClass =
    "rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft";

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-line bg-white p-5">
      <h2 className="font-bold text-ink">Add a video</h2>
      <p className="mt-1 text-xs text-muted">
        Paste a YouTube link with English subtitles. The transcript is fetched and stored right away.
      </p>
      <div className="mt-3 flex flex-col gap-2 md:flex-row">
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          required
          className={`${fieldClass} min-w-0 flex-1`}
        />
        <select value={level} onChange={(event) => setLevel(event.target.value as Level)} className={fieldClass}>
          {LEVELS.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
        <input
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          list="admin-topics"
          placeholder="Topic"
          required
          className={`${fieldClass} md:w-48`}
        />
        <datalist id="admin-topics">
          {topics.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
        <button type="submit" disabled={isPending} className="btn-3d btn-brand px-5 py-2 text-sm">
          {isPending ? "Adding..." : "Add"}
        </button>
      </div>
      {message && (
        <p className={`mt-2 text-sm ${message.isError ? "text-red-600" : "text-brand"}`}>{message.text}</p>
      )}
    </form>
  );
}
