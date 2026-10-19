"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/Icon";
import { parseVideoId } from "@/lib/youtube-url";

export function PasteLinkForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const videoId = parseVideoId(value);
    if (!videoId) {
      setError("That's not a valid YouTube link");
      return;
    }
    router.push(`/watch/${videoId}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-3">
        <input
          type="text"
          inputMode="url"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
          }}
          placeholder="Paste a YouTube link with English subtitles..."
          className="min-w-0 flex-1 rounded-full border border-line bg-white px-5 py-3 text-ink outline-none placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand-soft"
        />
        <button type="submit" className="btn-3d shrink-0 rounded-full px-4 py-3 sm:px-5">
          <Icon name="plus" />
          <span className="hidden sm:inline">Add video</span>
        </button>
      </div>
      {error && <p className="mt-2 px-5 text-sm text-red-600">{error}</p>}
    </form>
  );
}
