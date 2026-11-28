const CACHE_NAME = "arday-shell-v364";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/css/game.css?v=20261123-css-dedupe1",
  "./assets/css/game-panels.css?v=20261122-recycle-blue-center1",
  "./assets/css/game-interactions.css?v=20261123-balloon-poster1",
  "./assets/css/game-world.css?v=20261123-recruit-reply2",
  "./assets/css/game-career.css?v=20261128-guild-referral-quota1",
  "./assets/css/exchange.css?v=20261123-exchange-owned1",
  "./assets/css/commission.css?v=20261123-commission-owned1",

  "./assets/css/dungeon-board.css?v=20261123-board-css-dedupe1",
  "./assets/css/ui-foundation.css?v=20261123-tokens-only1",
  "./assets/js/game-config.js?v=20261128-player-meals1",
  "./assets/js/furniture-catalog.js?v=20261128-decor-aliases1",
  "./assets/js/game-data/dungeon-data.js?v=20261121-long-progression1",
  "./assets/js/commission-data.js?v=20261122-special1",
  "./assets/js/commission-system.js?v=20261122-special2",
  "./assets/js/game-data/career-data.js?v=20261123-infinite-org-team1",
  "./assets/js/schedule-engine.js?v=20261123-org-schedule1",
  "./assets/js/food-models.js?v=20261122-food-models2",
  "./assets/js/furniture-models-bathroom.js?v=20261123-cabinet-top-surfaces2",
  "./assets/js/furniture-models-bedroom.js?v=20261123-seat-cushion1",
  "./assets/js/furniture-models-kitchen.js?v=20261123-cabinet-top-surfaces2",
  "./assets/js/furniture-models-lighting.js?v=20261123-cabinet-top-surfaces2",
  "./assets/js/furniture-models-living.js?v=20261123-bookshelf-tdz-fix1",
  "./assets/js/furniture-models-office.js?v=20261123-cabinet-top-surfaces2",
  "./assets/js/furniture-models-tables.js?v=20261123-table-builder-fix1",
  "./assets/js/furniture-models.js?v=20261123-cabinet-top-surfaces2",
  "./assets/js/furniture-placement.js?v=20261122-full-room-scan1",
  "./assets/js/economy.js?v=20261123-schedule-goals1",
  "./assets/js/chat-copy.js?v=20261119a",
  "./assets/js/chat-system.js?v=20261119a",
  "./assets/js/letter-copy.js?v=20261128-absence-letters2",
  "./assets/js/character-tap-lines.js?v=20261119a",
  "./assets/js/character-model.js?v=20261128-hairline-rebuild2",
  "./assets/js/hall/hall-scene.js?v=20261122-exchange-label2",
  "./assets/js/dungeon-board.js?v=20261121-global-balance4",
  "./assets/js/game-data/exchange-data.js?v=20261122-exchange-terminal1",
  "./assets/js/game.js?v=20261128-status-labels-moods2",
  "./assets/icons/arday-icon.svg"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy)); }
      return response;
    }).catch(() => caches.match("./index.html").then(cached => cached || new Response("Arday is offline.", {status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}}))));
    return;
  }
  const url = new URL(request.url);
  const isScript = request.destination === "script" || /\.js$/i.test(url.pathname);
  const isStyle = request.destination === "style" || /\.css$/i.test(url.pathname);
  const offlineFallback = () => new Response(isScript ? "/* Arday script unavailable offline. */" : isStyle ? "/* Arday stylesheet unavailable offline. */" : "", {
    status: 503,
    headers: {"Content-Type": isScript ? "application/javascript; charset=utf-8" : isStyle ? "text/css; charset=utf-8" : "text/plain; charset=utf-8", "Cache-Control":"no-store"}
  });
  if (isScript) {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(request, copy)); }
      return response;
    }).catch(() => caches.match(request,{ignoreSearch:true}).then(cached => cached || offlineFallback())));
    return;
  }
  event.respondWith(caches.match(request,{ignoreSearch:true}).then(cached => cached || fetch(request).then(response => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(request, copy)); }
    return response;
  }).catch(offlineFallback)));
});