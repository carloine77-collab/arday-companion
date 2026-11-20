const CACHE_NAME = "arday-shell-v154";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/css/game.css?v=20261121-modular-css1",
  "./assets/css/game-panels.css?v=20261121-modular-css1",
  "./assets/css/game-interactions.css?v=20261121-modular-css1",
  "./assets/css/game-world.css?v=20261121-modular-css1",
  "./assets/css/game-career.css?v=20261121-modular-css1",
  "./assets/css/dungeon-board.css?v=20261121-modular-css1",
  "./assets/js/game-config.js",
  "./assets/js/furniture-catalog.js?v=20261121-modular-js1",
  "./assets/js/game-data/dungeon-data.js?v=20261121-modular-js1",
  "./assets/js/game-data/career-data.js?v=20261121-modular-js1",
  "./assets/js/schedule-engine.js?v=20261121-modular-js3",
  "./assets/js/furniture-models-bedroom.js?v=20261121-furniture-categories1",
  "./assets/js/furniture-models-living.js?v=20261121-furniture-categories1",
  "./assets/js/furniture-models-kitchen.js?v=20261121-furniture-categories1",
  "./assets/js/furniture-models-lighting.js?v=20261121-furniture-categories1",
  "./assets/js/furniture-models-office.js?v=20261121-furniture-categories1",
  "./assets/js/furniture-models-bathroom.js?v=20261121-furniture-categories1",
  "./assets/js/furniture-models.js?v=20261121-furniture-categories2",
  "./assets/js/furniture-placement.js",
  "./assets/js/economy.js",
  "./assets/js/chat-copy.js",
  "./assets/js/chat-system.js",
  "./assets/js/character-tap-lines.js",
  "./assets/js/hall/hall-scene.js",
  "./assets/js/dungeon-board.js?v=20261121-campus-poster-title1",
  "./assets/js/game.js?v=20261121-furniture-models3",
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