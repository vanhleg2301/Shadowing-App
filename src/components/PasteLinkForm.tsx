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
    if (!value.trim()) {
      setError("Paste a YouTube link first");
      return;
    }
    const videoId = parseVideoId(value);
    if (!videoId) {
      setError("That's not a valid YouTube link");
      return;
    }
    router.push(`/watch/${videoId}`);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setValue(text);
      setError(null);
    } catch {
      setError("Couldn't read the clipboard. Long-press the box and choose Paste.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center gap-2 rounded-2xl border border-line bg-cream px-3 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand-soft">
        <Icon name="link" className="size-5 shrink-0 text-muted" />
        <input
          type="url"
          inputMode="url"
          autoFocus
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
          }}
          placeholder="youtube.com/watch?v=..."
          className="min-w-0 flex-1 bg-transparent py-3.5 text-ink outline-none placeholder:text-muted"
        />
        <button type="button" onClick={handlePaste} className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-brand hover:bg-brand-soft">
          Paste
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button type="submit" className="btn-3d btn-brand mt-4 w-full py-3.5">
        Start learning
      </button>
    </form>
  );
}
