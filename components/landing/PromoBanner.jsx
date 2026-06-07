'use client'
import { useState, useEffect } from 'react'
import { Flame, X } from 'lucide-react'

export default function PromoBanner() {
  const [visible, setVisible] = useState(false)
  const [label, setLabel]     = useState('خصم 50% على جميع الباقات لفترة محدودة')

  useEffect(() => {
    fetch('/api/offer')
      .then(r => r.ok ? r.json() : null)
      .then(offer => {
        if (offer?.active) {
          setLabel(`خصم ${offer.discount}% على جميع الباقات — ينتهي العرض قريباً`)
          setVisible(true)
        }
      })
      .catch(() => {})
  }, [])

  if (!visible) return null

  return (
    <div className="relative bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white text-center py-2.5 px-10 z-40">
      <div className="flex items-center justify-center gap-2 text-sm font-bold">
        <Flame className="w-4 h-4 animate-pulse flex-shrink-0" />
        <span>🎉 {label}</span>
        <a href="#pricing"
          className="mr-2 border border-white/40 text-white text-xs font-extrabold px-3 py-0.5 rounded-full hover:bg-white/10 transition flex-shrink-0">
          احجز الآن
        </a>
      </div>
      <button onClick={() => setVisible(false)}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
