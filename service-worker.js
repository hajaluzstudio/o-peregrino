/* ==========================================================================
   SERVICE WORKER PWA — PEREGRINO SISTEMA DE INVESTIDORES & GOVERNANÇA
   Cache inteligente, instalação de app mobile e resiliência offline
   ========================================================================== */

const CACHE_NAME = "peregrino-pwa-v9";
const OFFLINE_URL = "index.html";

const PRECACHE_ASSETS = [
  "./",
  "index.html",
  "dossie_comercial.html",
  "manifest.json",
  "assets/css/style.css",
  "assets/js/app.js",
  "assets/js/store.js",
  "assets/js/supabase.js",
  "assets/js/icons.js",
  "assets/js/config.js",
  "assets/js/qrcode.min.js",
  "assets/img/icon-192.png",
  "assets/img/icon-512.png",
  "assets/img/apple-touch-icon.png",
  "assets/img/logo_peregrino.png",
  "assets/img/logo_hajaluz_02.png",
  "assets/img/logo_hajaluz_vertical.png",
  "assets/img/favicon.png",
  "favicon_logo_PPrancheta-1.png"
];

// Instalação do Service Worker e pré-carregamento dos assets vitais
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Adiciona individualmente para que falha em um asset não impeça os demais
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn("[PWA SW] Precache falhou para:", url, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Ativação e limpeza de versões antigas de cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("[PWA SW] Removendo cache obsoleto:", name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de requisições: Network First para HTML/Navegação, Cache First para estáticos
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Não intercepta chamadas POST/PUT nem domínios de API de terceiros (Supabase)
  if (req.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Requisições de navegação (páginas HTML): Network First, com fallback para o cache
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(() => {
          return caches.match(req).then((cachedRes) => {
            if (cachedRes) return cachedRes;
            return caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Requisições de CSS, JS, Imagens: Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const fetchPromise = fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch((err) => {
          // Offline ou erro de rede
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
