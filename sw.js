
const CACHE_NAME = 'hypercubesplanet-dev-v9';

const urlsToCache = [
  './',
  './index.html',
  './main.js',
  './manifest.json',
  './style.css',
  
  // Skrypty
  './ui.js',
  './scene.js',
  './controls.js',
  './character.js',
  './multiplayer.js',
  './CoinManager.js',
  './BlockManager.js',
  './IntroManager.js',
  './StarterSkins.js',
  './BuildManager.js',
  './SkinBuilderManager.js',
  './PrefabBuilderManager.js',
  './HyperCubePartBuilderManager.js',
  './BuildCameraController.js',
  './FriendsManager.js',
  './MailManager.js',
  './NewsManager.js',
  './HighScoresManager.js',
  './WallManager.js',
  './AudioManager.js',
  './WorldStorage.js',
  './SkinStorage.js',
  './PrefabStorage.js',
  './HyperCubePartStorage.js',
  './Config.js',
  './GameCore.js',
  './GameStateManager.js',
  './AssetLoader.js',

  // Muzyka
  'music/nexus.mp3',

  // Grafiki
  'icons/nereidastudio.png',
  'icons/favicon.png',
  'icons/icon-play.png',
  'icons/icon-build.png',
  'icons/icon-shop.png',
  'icons/icon-discover.png',
  'icons/icon-more.png',
  'icons/icon-coin.png',
  'icons/icon-friends.png',
  'icons/icon-jump.png',
  'icons/icon-back.png',
  'icons/icon-like.png',
  'icons/icon-chat.png',
  'icons/icon-share.png',
  'icons/icon-level.png',
  'icons/icon-check.png',
  'icons/icon-home.png',
  'icons/icon-restart.png',
  'icons/icon-next.png',
  'icons/logo-poczta.png',
  'icons/icon-newhypercube.png',
  'icons/icon-newhypercubepart.png',
  'icons/icon-newworld.png',
  'icons/icon-newprefab.png',
  'icons/icon-smallworld.png',
  'icons/icon-mediumworld.png',
  'icons/icon-bigworld.png',
  'icons/icon-download.png',
  'icons/icon-bar.png',
  'icons/alert.png',
  'icons/usmiech.png',
  'icons/gamepad.png',
  'icons/NavigationButton.png',
  'icons/sciana.png',
  'icons/arrow-left.png',
  'icons/arrow-right.png',
  'icons/vip.png',
  'icons/vip_badge.png',
  'icons/szukaj.png',
  'icons/wtymswiecie.png',
  'icons/grazinnymi.png',
  'icons/misje.png',
  'icons/nagrody.png',
  'icons/highscores.png',
  'icons/tworzenie.png',
  'icons/bezpieczenstwo.png',
  'icons/opcje.png',
  'icons/wyloguj.png',

  // Tekstury
  'textures/ziemia.png',
  'textures/trawa.png',
  'textures/drewno.png',
  'textures/piasek.png',
  'textures/beton.png',
  'textures/dzins.png',
  'textures/karton.png',
  'textures/cegla.png',
  'textures/drewnianapodloga.png',
  'textures/metalowasiatka.png',
  'textures/bruk.png',
  'textures/kamien.png',
  'textures/otoczak.png',
  'textures/metalowaplyta.png',
  'textures/granit.png',
  'textures/cukierek.png',
  'textures/gladki.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/api/') || url.protocol === 'ws:' || url.protocol === 'wss:') {
    return; 
  }

  if (event.request.method === 'GET') {
      if (url.pathname.endsWith('.html') || url.pathname.endsWith('.js') || url.pathname.endsWith('.json')) {
        event.respondWith(
          fetch(event.request).then(response => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            return response;
          }).catch(() => caches.match(event.request))
        );
      } else {
        event.respondWith(
          caches.match(event.request).then(cached => cached || fetch(event.request))
        );
      }
  }
});