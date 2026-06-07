const CACHE = 'af-v1'
const PRE_CACHE = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRE_CACHE)))
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  const { request } = e
  const url = new URL(request.url)

  // Only handle same-origin GET — skip API calls
  if (url.origin !== location.origin) return
  if (url.pathname.startsWith('/api/')) return
  if (request.method !== 'GET') return

  // Network-first for HTML pages, cache-first for assets
  const isAsset = /\.(js|css|png|jpg|jpeg|svg|ico|woff2?)$/.test(url.pathname)

  if (isAsset) {
    e.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(request, res.clone()))
        return res
      }))
    )
  } else {
    e.respondWith(
      fetch(request).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(request, res.clone()))
        return res
      }).catch(() => caches.match(request))
    )
  }
})
