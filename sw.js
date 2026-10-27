// Khobgoh Modern Service Worker v2.3 (Updated with custom tree-home logo)
const CACHE_NAME = "khobgoh-pwa-v2.3";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/main.css",
  "./js/app.js",
  "./js/store.js",
  "./js/data.js",
  "./js/translations.js",
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
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
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
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request).catch(() => caches.match("./index.html"));
    })
  );
});
