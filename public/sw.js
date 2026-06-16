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

self.addEventListener('push', e => {
  let data = { title: 'AmineFit', body: 'رسالة جديدة من مدربك', url: '/client/messages' }
  try { data = { ...data, ...JSON.parse(e.data?.text() || '{}') } } catch {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'coach-message',
      renotify: true,
      data: { url: data.url }
    })
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = e.notification.data?.url || '/client/messages'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes('/client'))
      if (existing) { existing.focus(); existing.navigate(url) }
      else clients.openWindow(url)
    })
  )
})

// Background sync — notify open clients to flush their message queue.
// If no window is open, reject so the browser retries when one opens.
self.addEventListener('sync', e => {
  if (e.tag === 'af-send-messages') {
    e.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
        if (!list.length) throw new Error('no open client windows')
        list.forEach(c => c.postMessage({ type: 'FLUSH_MESSAGE_QUEUE' }))
      })
    )
  }
})
