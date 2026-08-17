// Bump VERSION on every release. The cache name derives from it, so a new
// version installs into a fresh cache and activate() deletes the old ones.
const VERSION = "v2";
const CACHE = `circuit-codex-${VERSION}`;

const ASSETS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/data.js",
  "./js/app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// The app shell changes on every deploy, so it must not be served from cache
// first — that pins an installed user to whatever version they first got.
function isAppShell(request, url) {
  return (
    request.mode === "navigate" ||
    /\.(?:html|css|js|json)$/.test(url.pathname) ||
    url.pathname.endsWith("/")
  );
}

async function put(request, response) {
  // Only cache real same-origin hits. An opaque or error response would
  // poison the cache and be served back as if it were the app.
  if (!response || !response.ok || response.type === "opaque") return response;
  const cache = await caches.open(CACHE);
  cache.put(request, response.clone());
  return response;
}

// Network first, cache as offline fallback.
async function networkFirst(request) {
  try {
    return await put(request, await fetch(request));
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Hash routing means any deep link is really the shell.
    if (request.mode === "navigate") {
      const shell = await caches.match("./index.html");
      if (shell) return shell;
    }
    throw err;
  }
}

// Cache first — icons are content-addressed by filename and rarely change.
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  return put(request, await fetch(request));
}

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Leave cross-origin and non-GET traffic (form posts, APIs) alone.
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  e.respondWith(isAppShell(e.request, url) ? networkFirst(e.request) : cacheFirst(e.request));
});
