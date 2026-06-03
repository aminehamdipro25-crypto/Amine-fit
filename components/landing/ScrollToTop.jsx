'use client'
import { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 350)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="العودة إلى الأعلى"
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full
                 bg-gradient-to-br from-amber-400 to-amber-600
                 shadow-lg shadow-amber-500/30
                 flex items-center justify-center
                 hover:scale-110 active:scale-95
                 transition-all duration-200"
    >
      <ChevronUp className="w-6 h-6 text-black" strokeWidth={2.5} />
    </button>
  )
}
