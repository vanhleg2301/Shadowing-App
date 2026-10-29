"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listOfflineLessons, removeLessonOffline, type OfflineLesson } from "@/lib/offline";

export function OfflineLessons() {
  const [lessons, setLessons] = useState<OfflineLesson[] | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    // Saved lessons are listed from this device's storage, only readable after hydration.
    /* eslint-disable react-hooks/set-state-in-effect */
    setLessons(listOfflineLessons());
    update();
    /* eslint-enable react-hooks/set-state-in-effect */
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (lessons === null) return null;

  const handleRemove = async (lesson: OfflineLesson) => {
    await removeLessonOffline(lesson);
    setLessons(listOfflineLessons());
  };

  return (
    <>
      {!isOnline && (
        <p className="mt-5 rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm font-semibold text-ink">
          You&apos;re offline. Your saved lessons still work.
        </p>
      )}
      {lessons.length === 0 ? (
        <p className="mt-8 text-muted">
          Nothing saved yet. Open a story in{" "}
          <Link href="/news" className="font-semibold text-brand">
            News
          </Link>{" "}
          and tap &ldquo;Save for offline&rdquo;.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {lessons.map((lesson) => (
            <li key={lesson.path} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-2.5">
              <Link href={lesson.path} className="flex min-w-0 flex-1 items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- the original cover is what's cached offline */}
                <img src={lesson.imageUrl} alt="" className="aspect-[4/3] w-24 shrink-0 rounded-xl bg-cream object-cover" />
                <span className="min-w-0">
                  <span className="line-clamp-2 font-bold text-ink">{lesson.title}</span>
                  <span className="text-xs text-muted">Saved {new Date(lesson.savedAt).toLocaleDateString()}</span>
                </span>
              </Link>
              <button type="button" onClick={() => handleRemove(lesson)} className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-muted hover:text-red-600">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
