'use client'
import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'

function urlB64ToUint8(b64) {
  const pad = '='.repeat((4 - b64.length % 4) % 4)
  const raw = window.atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

export default function PushSubscriber() {
  const [status, setStatus]   = useState('idle')   // idle | granted | denied | unsupported
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    const perm = Notification.permission
    setStatus(perm === 'granted' ? 'granted' : perm === 'denied' ? 'denied' : 'idle')
  }, [])

  async function subscribe() {
    setLoading(true)
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { setStatus('denied'); return }

      const keyRes = await fetch('/api/push/vapid-key')
      if (!keyRes.ok) return
      const { key } = await keyRes.json()

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8(key),
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })
      setStatus('granted')
    } catch (err) {
      console.error('[PushSubscriber]', err)
    } finally {
      setLoading(false)
    }
  }

  async function unsubscribe() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) await sub.unsubscribe()
      await fetch('/api/push/subscribe', { method: 'DELETE' })
      setStatus('idle')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'unsupported' || status === 'denied') return null

  if (status === 'granted') {
    return (
      <button onClick={unsubscribe} disabled={loading}
        title="الإشعارات مفعّلة — اضغط للإيقاف"
        className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold hover:text-red-400 transition">
        <Bell className="w-3.5 h-3.5" fill="currentColor" />
        إشعارات مفعّلة
      </button>
    )
  }

  return (
    <button onClick={subscribe} disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fbbf24]/10 border border-[#fbbf24]/40 rounded-lg text-xs font-bold text-[#fbbf24] hover:bg-[#fbbf24]/20 transition">
      <Bell className="w-3.5 h-3.5" />
      {loading ? 'جاري...' : 'فعّل الإشعارات'}
    </button>
  )
}
