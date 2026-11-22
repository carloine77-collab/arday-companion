const CACHE_NAME = "arday-shell-v232";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/css/game.css?v=20261121-modular-css1",
  "./assets/css/game-panels.css?v=20261122-recycle-blue-center1",
  "./assets/css/game-interactions.css?v=20261121-kitchen-menu1",
  "./assets/css/game-world.css?v=20261121-modular-css1",
  "./assets/css/game-career.css?v=20261121-guild-icon-fit1",
  "./assets/css/exchange.css?v=20261122-exchange-terminal1",
  "./assets/css/commission.css?v=20261122-special-commissions1",
  "./assets/css/editorial-boards.css?v=20261122-poster3",
  "./assets/css/dungeon-board.css?v=20261121-event-depth1",
  "./assets/js/game-config.js?v=20261122-no-autonomous-cooking1",
  "./assets/js/furniture-catalog.js?v=20261122-window-rebuild1",
  "./assets/js/game-data/dungeon-data.js?v=20261121-long-progression1",
  "./assets/js/commission-data.js?v=20261122-special1",
  "./assets/js/commission-system.js?v=20261122-special2",
  "./assets/js/game-data/career-data.js?v=20261122-entry-jobs1",
  "./assets/js/schedule-engine.js?v=20261122-guild-training1",
  "./assets/js/food-models.js?v=20261122-food-models2",
  "./assets/js/furniture-models.js?v=20261122-furniture-audit8",
  "./assets/js/furniture-placement.js?v=20261118e",
  "./assets/js/economy.js?v=20261122-goals2",
  "./assets/js/chat-copy.js?v=20261119a",
  "./assets/js/chat-system.js?v=20261119a",
  "./assets/js/letter-copy.js?v=20261122-relationship-letters3",
  "./assets/js/character-tap-lines.js?v=20261119a",
  "./assets/js/hall/hall-scene.js?v=20261122-exchange-label2",
  "./assets/js/dungeon-board.js?v=20261121-global-balance4",
  "./assets/js/game-data/exchange-data.js?v=20261122-exchange-terminal1",
  "./assets/js/game.js?v=20261122-autonomous-life1",
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
  // Navigation is network-first so stale cached HTML cannot pair old scripts with new assets.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy)); }
      return response;
    }).catch(() => caches.match("./index.html")));
    return;
  }
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