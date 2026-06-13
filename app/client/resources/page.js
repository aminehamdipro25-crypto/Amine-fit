'use client'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { SkeletonList } from '@/components/SkeletonLoader'

const TYPE_META = {
  link:  { icon: '🔗', label: 'رابط',   action: 'فتح' },
  pdf:   { icon: '📄', label: 'PDF',    action: 'تحميل' },
  video: { icon: '🎬', label: 'فيديو',  action: 'فتح' },
  image: { icon: '🖼️', label: 'صورة',   action: 'تحميل' },
}

function ResourceCard({ resource }) {
  const meta = TYPE_META[resource.type] || TYPE_META.link

  function handleAction() {
    if (resource.type === 'pdf' || resource.type === 'image') {
      // Download via an anchor tag
      const a = document.createElement('a')
      a.href = resource.url
      a.download = resource.filename || resource.title
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      a.click()
    } else {
      window.open(resource.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 flex items-start gap-4 hover:border-[#fbbf24]/30 transition-all group">
      {/* Icon */}
      <div className="w-11 h-11 rounded-xl bg-[#fbbf24]/10 border border-[#fbbf24]/20 flex items-center justify-center flex-shrink-0 text-xl">
        {meta.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm truncate">{resource.title}</p>
        {resource.description && (
          <p className="text-xs text-white/40 mt-0.5 line-clamp-2 leading-relaxed">{resource.description}</p>
        )}
        <span className="inline-block mt-1.5 text-[10px] font-bold bg-white/5 text-white/30 px-2 py-0.5 rounded-full">
          {meta.label}
        </span>
      </div>

      {/* Action */}
      <button
        onClick={handleAction}
        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#fbbf24]/10 text-[#fbbf24] text-xs font-bold
          hover:bg-[#fbbf24] hover:text-black transition-all border border-[#fbbf24]/20"
      >
        {meta.action}
      </button>
    </div>
  )
}

function GroupSection({ type, resources }) {
  const meta = TYPE_META[type] || TYPE_META.link
  if (!resources?.length) return null
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-extrabold text-white/30 uppercase tracking-widest flex items-center gap-2">
        <span>{meta.icon}</span>
        {meta.label}
        <span className="text-white/15">({resources.length})</span>
      </h3>
      {resources.map(r => <ResourceCard key={r.id} resource={r} />)}
    </section>
  )
}

export default function ClientResourcesPage() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/client/me')
      .then(r => {
        if (!r.ok) throw new Error('غير مصرح')
        return r.json()
      })
      .then(data => setResources(data.resources || []))
      .catch(err => setError(err.message || 'حدث خطأ في التحميل'))
      .finally(() => setLoading(false))
  }, [])

  // Group by type
  const grouped = resources.reduce((acc, r) => {
    const t = r.type || 'link'
    acc[t] = acc[t] || []
    acc[t].push(r)
    return acc
  }, {})

  const typeOrder = ['link', 'video', 'pdf', 'image']

  return (
    <div className="max-w-2xl mx-auto space-y-6" dir="rtl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#fbbf24]/10 rounded-xl flex items-center justify-center text-xl">
          📎
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-white">ملفاتي</h1>
          <p className="text-xs text-white/30">الملفات والروابط التي شاركها معك المدرب</p>
        </div>
      </div>

      {/* Loading */}
      {loading && <SkeletonList rows={4} />}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && resources.length === 0 && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <p className="font-bold text-white/40 text-sm">لم يتم مشاركة أي ملفات بعد</p>
          <p className="text-xs text-white/20 mt-2">تواصل مع المدرب للحصول على ملفاتك</p>
        </div>
      )}

      {/* Grouped resources */}
      {!loading && !error && resources.length > 0 && (
        <div className="space-y-6">
          {typeOrder.map(type =>
            grouped[type]?.length
              ? <GroupSection key={type} type={type} resources={grouped[type]} />
              : null
          )}
          {/* Any unknown types */}
          {Object.keys(grouped)
            .filter(t => !typeOrder.includes(t))
            .map(type => (
              <GroupSection key={type} type={type} resources={grouped[type]} />
            ))
          }
        </div>
      )}
    </div>
  )
}
