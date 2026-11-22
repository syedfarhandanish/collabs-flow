/* Collabs Flow service worker – offline support for the app shell. */
const VERSION = "cf-v1";
const SHELL = `${VERSION}-shell`;
const ASSETS = `${VERSION}-assets`;
const PRECACHE = ["/", "/manifest.webmanifest", "/logo.svg", "/icons/icon-192.png", "/icons/icon-512.png", "/bell1.wav"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  // Never touch cross-origin requests (YouTube, analytics, etc.).
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/_vercel") || url.pathname.startsWith("/api")) return;

  // Pages: network first so updates arrive immediately, cached copy when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put("/", copy));
          return res;
        })
        .catch(() => caches.match("/").then((r) => r || caches.match(request)))
    );
    return;
  }

  // Hashed build assets, fonts, icons, sounds: cache first, then network.
  if (url.pathname.startsWith("/_next/static") || /\.(?:js|css|woff2?|png|svg|ico|wav|webmanifest)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(ASSETS).then((c) => c.put(request, copy));
            }
            return res;
          })
      )
    );
  }
});
