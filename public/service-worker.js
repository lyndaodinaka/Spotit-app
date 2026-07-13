const SPOTIT_CACHE = "spotit-shell-v41";
const SHELL_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest?v=41",
  "/assets/brand/spotit-app-logo-v39.png?v=41",
  "/spotit-domain-logo-v41.png?v=41",
  "/spotit-share-logo-v41.png?v=41",
  "/spotit-icon-v41.png?v=41",
  "/spotit-pwa-icon-192.png?v=41",
  "/spotit-pwa-icon-512.png?v=41",
  "/spotit-pwa-maskable-192.png?v=41",
  "/spotit-pwa-maskable-512.png?v=41"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SPOTIT_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== SPOTIT_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin || event.request.method !== "GET") {
    return;
  }

  if (url.pathname.startsWith("/auth") || url.pathname.startsWith("/admin") || url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/patients") || url.pathname.startsWith("/wounds") || url.pathname.startsWith("/reports")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(SPOTIT_CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
