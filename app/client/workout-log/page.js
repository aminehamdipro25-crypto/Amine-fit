'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dumbbell, ChevronDown, ChevronUp, Star, Clock, Calendar, TrendingUp, Trash2, Loader2 } from 'lucide-react'
import { SkeletonList } from '@/components/SkeletonLoader'

const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

function fmtDate(iso) {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function fmtShort(iso) {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

function RatingStars({ rating }) {
  if (!rating) return null
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}/>
      ))}
    </span>
  )
}

function SessionCard({ session, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('حذف هذه الجلسة؟')) return
    setDeleting(true)
    try {
      await fetch(`/api/client/workout-log?id=${session.id}`, { method: 'DELETE' })
      onDelete(session.id)
    } catch {} finally { setDeleting(false) }
  }

  const doneSets  = session.exercises?.reduce((a, ex) => a + (ex.sets?.filter(s => s.done).length || 0), 0) || 0
  const totalSets = session.exercises?.reduce((a, ex) => a + (ex.sets?.length || 0), 0) || 0
  const completion = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : null

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-extrabold text-slate-800 truncate">{session.dayName}</span>
              {session.focus && (
                <span className="text-[10px] font-extrabold bg-[#fbbf24]/15 text-amber-700 px-2 py-0.5 rounded-full">{session.focus}</span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{fmtDate(session.date)}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <RatingStars rating={session.rating}/>
            <button onClick={handleDelete} disabled={deleting}
              className="text-slate-300 hover:text-red-400 transition p-1">
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Trash2 className="w-3.5 h-3.5"/>}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3">
          {session.durationMins && (
            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400"/>
              {session.durationMins} دقيقة
            </div>
          )}
          {session.exercises?.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Dumbbell className="w-3.5 h-3.5 text-slate-400"/>
              {session.exercises.length} تمارين
            </div>
          )}
          {completion !== null && (
            <div className="flex items-center gap-1 text-xs font-extrabold text-emerald-600">
              <span>{completion}%</span>
              <span className="text-slate-300 font-normal">منجز</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {completion !== null && (
          <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#fbbf24] to-amber-500 rounded-full transition-all"
              style={{width:`${completion}%`}}/>
          </div>
        )}
      </div>

      {/* Expand toggle */}
      {session.exercises?.length > 0 && (
        <>
          <button onClick={() => setExpanded(e => !e)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-xs font-bold text-slate-400 hover:bg-slate-100 transition">
            <span>{expanded ? 'إخفاء التفاصيل' : 'عرض التمارين'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5"/> : <ChevronDown className="w-3.5 h-3.5"/>}
          </button>

          {expanded && (
            <div className="px-4 pb-4 space-y-2 border-t border-slate-50">
              {session.notes && (
                <p className="text-xs text-slate-500 font-medium bg-amber-50 rounded-xl px-3 py-2 mt-3 leading-relaxed">
                  💬 {session.notes}
                </p>
              )}
              <div className="mt-2 space-y-2">
                {session.exercises.map((ex, i) => {
                  const doneSetsEx  = ex.sets?.filter(s => s.done).length || 0
                  const totalSetsEx = ex.sets?.length || 0
                  const hasWeights  = ex.sets?.some(s => s.weight > 0)
                  return (
                    <div key={i} className="flex items-start justify-between gap-2 py-2 border-b border-slate-50 last:border-0">
                      <span className="text-xs font-medium text-slate-700 leading-relaxed">{ex.name}</span>
                      <div className="flex-shrink-0 text-right">
                        <span className={`text-xs font-extrabold ${doneSetsEx === totalSetsEx && totalSetsEx > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {doneSetsEx}/{totalSetsEx}
                        </span>
                        {hasWeights && (
                          <div className="flex flex-wrap gap-1 justify-end mt-1">
                            {ex.sets?.filter(s => s.done && s.weight > 0).map((s, j) => (
                              <span key={j} className="text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded-full">
                                {s.weight}kg×{s.reps}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function WorkoutLogPage() {
  const router  = useRouter()
  const [logs,    setLogs]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/client/workout-log')
      .then(r => { if (r.status === 401) { router.push('/client/login'); return null } return r.json() })
      .then(d => { if (Array.isArray(d)) setLogs([...d].reverse()) })
      .finally(() => setLoading(false))
  }, [router])

  function handleDelete(id) {
    setLogs(prev => prev.filter(l => l.id !== id))
  }

  // Stats
  const now       = new Date()
  const thisMonth = logs.filter(l => { const d = new Date(l.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() })
  const thisWeekStart = new Date(now); thisWeekStart.setDate(now.getDate() - now.getDay()); thisWeekStart.setHours(0,0,0,0)
  const thisWeek  = logs.filter(l => new Date(l.date) >= thisWeekStart)
  const totalMins = logs.reduce((a, l) => a + (l.durationMins || 0), 0)

  if (loading) return <SkeletonList rows={4} />

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-8" dir="rtl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0a0a0a] rounded-2xl flex items-center justify-center flex-shrink-0">
          <Dumbbell className="w-5 h-5 text-[#fbbf24]"/>
        </div>
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">بوابتك الشخصية</p>
          <h1 className="text-xl font-extrabold text-slate-900">سجل تدريبي 🏋️</h1>
        </div>
      </div>

      {/* Stats */}
      {logs.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '📅', label: 'هذا الأسبوع', value: thisWeek.length + ' جلسة' },
            { icon: '🗓️', label: 'هذا الشهر',   value: thisMonth.length + ' جلسة' },
            { icon: '⏱️', label: 'إجمالي',      value: totalMins > 60 ? `${Math.round(totalMins/60)}س` : `${totalMins}د` },
          ].map(s => (
            <div key={s.label} className="bg-[#0a0a0a] rounded-2xl p-3 text-center">
              <p className="text-xl mb-1">{s.icon}</p>
              <p className="text-sm font-extrabold text-[#fbbf24]">{s.value}</p>
              <p className="text-[10px] text-white/30 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* No logs */}
      {logs.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <p className="text-5xl">🏋️</p>
          <p className="font-extrabold text-slate-700 text-lg">لا توجد جلسات مسجلة بعد</p>
          <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
            بعد إتمام تمرين، انقر على زر "سجّل جلستك" في صفحة الخطة التدريبية
          </p>
          <button onClick={() => router.push('/client/plan/training')}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#0a0a0a] text-[#fbbf24] font-extrabold rounded-2xl text-sm hover:bg-[#1a1a1a] transition">
            <TrendingUp className="w-4 h-4"/>
            اذهب إلى خطة التدريب
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
              {logs.length} جلسة مسجلة
            </p>
          </div>
          {logs.map(session => (
            <SessionCard key={session.id} session={session} onDelete={handleDelete}/>
          ))}
        </div>
      )}
    </div>
  )
}
