'use client'
import { useEffect, useState } from 'react'
import { Star, CheckCircle2, X, Trash2, Clock } from 'lucide-react'

export default function TestimonialsAdminPage() {
  const [list,    setList]    = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await fetch('/api/admin/testimonials')
    if (res.ok) setList(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function approve(id, approved) {
    await fetch('/api/admin/testimonials', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved }),
    })
    setList(prev => prev.map(t => t.id === id ? { ...t, approved, approvedAt: approved ? new Date().toISOString() : null } : t))
  }

  async function remove(id) {
    if (!confirm('حذف هذا التقييم نهائياً؟')) return
    await fetch('/api/admin/testimonials', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setList(prev => prev.filter(t => t.id !== id))
  }

  const pending  = list.filter(t => !t.approved)
  const approved = list.filter(t =>  t.approved)

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">تقييمات العملاء</h1>
        <p className="text-slate-400 text-sm mt-1">راجع وأدر التقييمات المقدمة من العملاء</p>
      </div>

      {loading && <p className="text-slate-400 text-center py-8">جاري التحميل...</p>}

      {!loading && pending.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">في انتظار الموافقة ({pending.length})</h2>
          </div>
          <div className="space-y-3">
            {pending.map(t => (
              <TestimonialCard key={t.id} t={t} onApprove={() => approve(t.id, true)} onDelete={() => remove(t.id)} />
            ))}
          </div>
        </section>
      )}

      {!loading && approved.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">ظاهرة في الموقع ({approved.length})</h2>
          </div>
          <div className="space-y-3">
            {approved.map(t => (
              <TestimonialCard key={t.id} t={t} isApproved onReject={() => approve(t.id, false)} onDelete={() => remove(t.id)} />
            ))}
          </div>
        </section>
      )}

      {!loading && list.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">لا توجد تقييمات بعد</p>
          <p className="text-xs mt-1">ستظهر هنا عندما يشارك العملاء تجاربهم</p>
        </div>
      )}
    </div>
  )
}

function TestimonialCard({ t, isApproved, onApprove, onReject, onDelete }) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 ${isApproved ? 'border-emerald-100' : 'border-slate-100'}`}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-black font-extrabold text-lg flex-shrink-0">
          {t.name?.[0] || '؟'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-slate-900 text-sm">{t.shareName ? t.name : (t.name?.[0] + '. ···')}</p>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
              ))}
            </div>
            {isApproved && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">ظاهر</span>
            )}
          </div>
          {t.result && (
            <p className="text-xs font-bold text-amber-600 mt-0.5">🏆 {t.result}</p>
          )}
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">"{t.text}"</p>
          <p className="text-xs text-slate-400 mt-2">
            {new Date(t.submittedAt).toLocaleString('ar', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {!isApproved ? (
            <button onClick={onApprove}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition">
              <CheckCircle2 className="w-3.5 h-3.5" />
              نشر
            </button>
          ) : (
            <button onClick={onReject}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold hover:bg-amber-100 transition">
              <X className="w-3.5 h-3.5" />
              إخفاء
            </button>
          )}
          <button onClick={onDelete}
            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
