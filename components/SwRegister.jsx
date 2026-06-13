'use client'
import { useEffect } from 'react'

const VAPID_PUBLIC = 'BHw8JC1-qFbe4i3Le9oYWj_LVbFYft2X-sYncZd9dqykHcxNkuE7njWyjMzoafvCgdcN8GpJcbnj5hCF-RPcVzU'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export default function SwRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(async reg => {
        if (!window.location.pathname.startsWith('/client/')) return
        if (!('PushManager' in window)) return
        if (Notification.permission === 'denied') return
        // Request permission if not yet granted
        const perm = Notification.permission === 'granted'
          ? 'granted'
          : await Notification.requestPermission()
        if (perm !== 'granted') return
        // Check if already subscribed
        const existing = await reg.pushManager.getSubscription()
        if (existing) return  // already subscribed, no need to re-subscribe
        // Subscribe
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC)
        })
        await fetch('/api/client/push-subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: sub })
        })
      })
      .catch(() => {})
  }, [])
  return null
}
