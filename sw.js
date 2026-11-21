/* Service Worker — Clima Balsas */
const CACHE = 'clima-balsas-v63';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icone_app.png',
  './av_est00.png',
  './av_est01.png',
  './av_est02.png',
  './av_est03.png',
  './av_est04.png',
  './av_est05.png',
  './av_est06.png',
  './av_est07.png',
  './av_est08.png',
  './av_est09.png',
  './av_est10.png',
  './av_est11.png',
  './av_est12.png',
  './av_est13.png',
  './av_est14.png',
  './av_est15.png',
  './av_est16.png',
  './av_est17.png',
  './av_est18.png',
  './av_est19.png',
  './av_est20.png',
  './av_est21.png',
  './av_est22.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // API: sempre rede, sem cache
  if (url.hostname.includes('open-meteo.com')) {
    e.respondWith(fetch(req).catch(() => new Response('{}', { headers: { 'Content-Type': 'application/json' } })));
    return;
  }

  // Página: rede primeiro (sem cache HTTP), cache como reserva offline
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req, { cache: 'no-store' })
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Arquivos estáticos: rede primeiro, cache como reserva
  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req))
  );
});
