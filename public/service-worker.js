const SPOTIT_CACHE = "spotit-shell-v31";
const SHELL_ASSETS = [
  "/manifest.webmanifest?v=31",
  "/assets/brand/spotit-app-logo-v31.png?v=31",
  "/spotit-domain-logo-v31.png?v=31",
  "/spotit-share-logo-v31.png?v=31",
  "/spotit-icon-v31.png?v=31"
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
