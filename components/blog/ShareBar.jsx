'use client'
import { useState } from 'react'
import { Share2, Link2, Check } from 'lucide-react'

export default function ShareBar({ title, url }) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366]/10 text-[#1aa251] text-sm font-bold hover:bg-[#25D366]/20 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        مشاركة واتساب
      </a>
      <button
        onClick={copyLink}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-colors"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Link2 className="w-4 h-4" />}
        {copied ? 'تم النسخ' : 'نسخ الرابط'}
      </button>
    </div>
  )
}
