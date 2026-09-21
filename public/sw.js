// Deliberately minimal: caches only the offline fallback shell, never
// dynamic pages or API responses. This is an officer admin tool — a
// cached copy of pending applications or member data shown as if it
// were current could get someone to act on stale information. The
// only thing this ever serves from cache is a "you're offline" page,
// and only when a real page navigation fails outright.
const CACHE = "yhcic-shell-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add(OFFLINE_URL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(OFFLINE_URL))
  );
});
