const CACHE_NAME = "arday-shell-v199";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/css/game.css?v=20261121-modular-css1",
  "./assets/css/game-panels.css?v=20261121-compact-panels2",
  "./assets/css/game-interactions.css?v=20261121-kitchen-menu1",
  "./assets/css/game-world.css?v=20261121-modular-css1",
  "./assets/css/game-career.css?v=20261121-guild-icon-fit1",
  "./assets/css/commission.css?v=20261122-commission-hall1",
  "./assets/css/dungeon-board.css?v=20261121-event-depth1",
  "./assets/js/game-config.js?v=20261121-furniture-taxonomy1",
  "./assets/js/furniture-catalog.js?v=20261121-furniture-taxonomy1",
  "./assets/js/game-data/dungeon-data.js?v=20261121-long-progression1",
  "./assets/js/commission-data.js?v=20261122-commission2",
  "./assets/js/commission-system.js?v=20261122-commission2",
  "./assets/js/game-data/career-data.js?v=20261121-career-rebuild5",
  "./assets/js/schedule-engine.js?v=20261121-neutral-items1",
  "./assets/js/furniture-models.js?v=20261121-furniture-expansion1",
  "./assets/js/furniture-placement.js",
  "./assets/js/economy.js?v=20261121-economy-balance1",
  "./assets/js/chat-copy.js",
  "./assets/js/chat-system.js",
  "./assets/js/letter-copy.js?v=20261121-letters1",
  "./assets/js/character-tap-lines.js",
  "./assets/js/hall/hall-scene.js?v=20261122-supply-archive1",
  "./assets/js/dungeon-board.js?v=20261121-global-balance4",
  "./assets/js/game.js?v=20261122-commission-hall1",
  "./assets/icons/arday-icon.svg"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  const isScript = request.destination === "script" || /\.js$/i.test(new URL(request.url).pathname);
  if (isScript) {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(request, copy)); }
      return response;
    }).catch(() => caches.match(request,{ignoreSearch:true}).then(cached => cached || caches.match("./index.html"))));
    return;
  }
  event.respondWith(caches.match(request,{ignoreSearch:true}).then(cached => cached || fetch(request).then(response => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(request, copy)); }
    return response;
  }).catch(() => caches.match("./index.html"))));
});