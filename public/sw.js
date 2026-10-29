// Service worker: study reminders, and offline use of lessons saved with "Save for offline".
// - App code (/_next/static) is cached as it is used, so saved pages can start without a network.
// - Pages are fetched from the network first; when that fails, a saved copy (or /offline) is shown.
// - Saved audio and images are served from the cache, including the range requests audio players make.

const STATIC_CACHE = "static-v1";
const PAGES_CACHE = "pages-v1";
// Written by the page (src/lib/offline.ts) when a lesson is saved for offline.
const OFFLINE_CACHE = "offline-lessons-v1";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES_CACHE)
      .then((cache) => cache.add(OFFLINE_URL))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const keep = [STATIC_CACHE, PAGES_CACHE, OFFLINE_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !keep.includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// Answers a Range request from a full cached response (Safari needs 206 to play audio).
async function rangeResponse(request, response) {
  const range = request.headers.get("range");
  if (!range) return response;
  const blob = await response.blob();
  const match = /bytes=(\d*)-(\d*)/.exec(range);
  const start = match && match[1] ? Number(match[1]) : 0;
  const end = match && match[2] ? Number(match[2]) : blob.size - 1;
  return new Response(blob.slice(start, end + 1), {
    status: 206,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "application/octet-stream",
      "Content-Range": `bytes ${start}-${end}/${blob.size}`,
      "Content-Length": String(end - start + 1),
      "Accept-Ranges": "bytes",
    },
  });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Saved lesson media (Supabase Storage): from the cache when saved, otherwise the network as usual.
  if (url.pathname.includes("/storage/v1/object/public/lesson-media/")) {
    event.respondWith(
      caches.open(OFFLINE_CACHE).then(async (cache) => {
        const cached = await cache.match(url.href);
        return cached ? rangeResponse(request, cached) : fetch(request);
      }),
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Resized covers of saved lessons.
  if (url.pathname === "/_next/image") {
    event.respondWith(caches.match(request, { cacheName: OFFLINE_CACHE }).then((cached) => cached || fetch(request)));
    return;
  }

  // Hashed build files never change: cache first.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      }),
    );
    return;
  }

  // Full page loads: network first, then a saved copy, then the offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const saved = (await caches.match(url.pathname, { cacheName: OFFLINE_CACHE })) || (await caches.match(request));
        return saved || (await caches.match(OFFLINE_URL)) || Response.error();
      }),
    );
  }
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Time to practise", {
      body: data.body || "A few minutes of shadowing keeps your streak alive.",
      icon: "/pwa-icon/192",
      badge: "/pwa-icon/192",
      tag: "study-reminder",
      data: { url: data.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const existing = windows.find((w) => w.url.startsWith(self.location.origin));
      if (existing) {
        existing.navigate(url);
        return existing.focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});
