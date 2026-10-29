// "Save for offline" for lessons with hosted audio (VOA news and lessons): the page, its audio and cover
// go into a cache that public/sw.js serves when there is no network. YouTube videos can't be saved.

const OFFLINE_CACHE = "offline-lessons-v1";
const STATIC_CACHE = "static-v1";
const LIST_KEY = "offline-lessons";

export interface OfflineLesson {
  path: string;
  title: string;
  audioUrl: string;
  imageUrl: string;
  savedAt: string;
}

export function isOfflineSupported(): boolean {
  return typeof window !== "undefined" && "caches" in window && "serviceWorker" in navigator;
}

export function listOfflineLessons(): OfflineLesson[] {
  try {
    return JSON.parse(localStorage.getItem(LIST_KEY) ?? "[]") as OfflineLesson[];
  } catch {
    return [];
  }
}

function writeList(lessons: OfflineLesson[]) {
  try {
    localStorage.setItem(LIST_KEY, JSON.stringify(lessons));
  } catch {
    // The files stay cached; only the list on the Offline page is lost.
  }
}

export async function saveLessonOffline(lesson: { path: string; title: string; audioUrl: string; imageUrl: string }): Promise<void> {
  await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  const cache = await caches.open(OFFLINE_CACHE);
  await Promise.all([cache.add(lesson.path), cache.add(lesson.audioUrl), cache.add(lesson.imageUrl).catch(() => undefined)]);
  // The scripts this page already loaded, so it can start again without a network.
  const scripts = performance
    .getEntriesByType("resource")
    .map((entry) => entry.name)
    .filter((name) => new URL(name).pathname.startsWith("/_next/static/"));
  const staticCache = await caches.open(STATIC_CACHE);
  await Promise.all(scripts.map((src) => staticCache.add(src).catch(() => undefined)));
  // The cover as the page shows it (resized by /_next/image).
  const images = performance
    .getEntriesByType("resource")
    .map((entry) => entry.name)
    .filter((name) => new URL(name).pathname === "/_next/image" && name.includes(encodeURIComponent(lesson.imageUrl.split("/").pop() ?? "")));
  await Promise.all(images.map((src) => cache.add(src).catch(() => undefined)));
  writeList([
    { ...lesson, savedAt: new Date().toISOString() },
    ...listOfflineLessons().filter((l) => l.path !== lesson.path),
  ]);
}

export async function removeLessonOffline(lesson: Pick<OfflineLesson, "path" | "audioUrl" | "imageUrl">): Promise<void> {
  const cache = await caches.open(OFFLINE_CACHE);
  await Promise.all([cache.delete(lesson.path), cache.delete(lesson.audioUrl), cache.delete(lesson.imageUrl)]);
  writeList(listOfflineLessons().filter((l) => l.path !== lesson.path));
}
