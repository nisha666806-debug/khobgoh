// Khobgoh Modern Service Worker v2.7 (Network-first for scripts & updates)
const CACHE_NAME = "khobgoh-pwa-v2.7";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/main.css",
  "./js/app.js",
  "./js/store.js",
  "./js/data.js",
  "./js/translations.js",
  "./js/sync.js",
  "./js/firebase.js",
  "./js/views/dashboard.js",
  "./js/views/students.js",
  "./js/views/rooms.js",
  "./js/views/attendance.js",
  "./js/views/activities.js",
  "./js/views/violations.js",
  "./js/views/cleanliness.js",
  "./js/views/roster.js",
  "./js/views/tea.js",
  "./js/views/settings.js",
  "./assets/dormitory-logo.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/apple-touch-icon.png",
  "./assets/favicon.png"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(err => console.debug("Asset caching error:", err));
    })
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  // If fetching Firebase/Google APIs, bypass service worker cache
  if (
    e.request.url.includes("firestore.googleapis.com") ||
    e.request.url.includes("identitytoolkit.googleapis.com") ||
    e.request.url.includes("gstatic.com")
  ) {
    return;
  }

  // Network-first for scripts, styles and html to avoid getting stuck with stale/broken code
  const isCodeOrHtml = e.request.destination === "script" ||
                       e.request.destination === "document" ||
                       e.request.destination === "style";

  if (isCodeOrHtml) {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for images and icons
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request).catch(() => caches.match("./index.html"));
    })
  );
});
