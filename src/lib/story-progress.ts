"use client";

import { useSyncExternalStore } from "react";

// Which daily stories the learner has finished, remembered on this device.
const STORAGE_KEY = "stories-read";
const CHANGE_EVENT = "stories-read-change";
const EMPTY: ReadonlySet<string> = new Set();

let cachedRaw: string | null = null;
let cachedSet: ReadonlySet<string> = EMPTY;

function readSnapshot(): ReadonlySet<string> {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      const ids: unknown = JSON.parse(raw ?? "[]");
      cachedSet = new Set(Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : []);
    } catch {
      cachedSet = EMPTY;
    }
  }
  return cachedSet;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function useReadStories(): ReadonlySet<string> {
  return useSyncExternalStore(subscribe, readSnapshot, () => EMPTY);
}

export function markStoryRead(id: string): void {
  const read = readSnapshot();
  if (read.has(id)) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...read, id]));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Private mode: nothing is remembered.
  }
}

// The story to suggest after this one: an unread one on the same topic, then any unread one after it in the
// list, then simply the next one.
export function pickNextStory<T extends { id: string; topic: string }>(stories: T[], currentId: string, read: ReadonlySet<string>): T | undefined {
  const index = stories.findIndex((s) => s.id === currentId);
  const after = [...stories.slice(index + 1), ...stories.slice(0, Math.max(index, 0))];
  const topic = stories[index]?.topic;
  return (
    after.find((s) => !read.has(s.id) && s.topic === topic) ?? after.find((s) => !read.has(s.id)) ?? after[0]
  );
}
