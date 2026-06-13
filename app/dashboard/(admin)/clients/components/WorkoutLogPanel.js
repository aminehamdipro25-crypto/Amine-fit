'use client'
import { useState, useEffect, useRef } from 'react'
import { Dumbbell, RefreshCw, ChevronDown, ChevronUp, Star, Clock } from 'lucide-react'

const MONTHS = [
  'يناير','فبراير','مارس','أبريل','مايو','يونيو',
  'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر',
]

function formatDateAr(iso) {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

function toArabicDigits(n) {
  return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d])
}

function RatingStars({ rating }) {
  if (!rating) return null
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
        />
      ))}
    </span>
  )
}

function ExercisesList({ exercises }) {
  if (!exercises || exercises.length === 0) return null
  return (
    <div className="mt-3 space-y-1.5">
      {exercises.map((ex, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-100 px-3 py-2">
          <p className="text-xs font-bold text-slate-700 mb-1">{ex.name}</p>
          <div className="flex flex-wrap gap-1.5">
            {Array.isArray(ex.sets) && ex.sets.map((s, j) => (
              <span
                key={j}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${
                  s.done
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                {s.weight}{s.unit || 'kg'} × {s.reps}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function SessionCard({ session }) {
  const [open, setOpen] = useState(false)
  const exerciseCount = Array.isArray(session.exercises) ? session.exercises.length : 0

  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full text-right px-3 py-2.5 flex items-start gap-2 hover:bg-slate-50 transition"
      >
        {/* Date */}
        <div className="flex-shrink-0 text-center bg-slate-100 rounded-lg px-2 py-1 min-w-[44px]">
          <p className="text-[10px] font-bold text-slate-500 leading-tight">
            {formatDateAr(session.date)}
          </p>
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-800">{session.dayName}</span>
            {session.focus && (
              <span className="text-[10px] font-semibold bg-violet-50 text-violet-600 border border-violet-100 px-1.5 py-0.5 rounded-lg">
                {session.focus}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400 font-medium">
              <Clock className="w-3 h-3" />
              {toArabicDigits(session.durationMins)} دقيقة
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {toArabicDigits(exerciseCount)} تمرين
            </span>
            <RatingStars rating={session.rating} />
          </div>
        </div>

        {/* Expand icon */}
        <div className="flex-shrink-0 text-slate-300 mt-0.5">
          {open
            ? <ChevronUp className="w-3.5 h-3.5" />
            : <ChevronDown className="w-3.5 h-3.5" />
          }
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 border-t border-slate-100">
          <ExercisesList exercises={session.exercises} />
          {session.notes ? (
            <p className="mt-2 text-[10px] text-slate-500 italic bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-100">
              "{session.notes}"
            </p>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default function WorkoutLogPanel({ clientId }) {
  const [logs,    setLogs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [refresh, setRefresh] = useState(0)
  const abortRef = useRef(null)

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setLoading(true)
    fetch(`/api/admin/clients/${clientId}/workout-logs`, { signal: ctrl.signal })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (ctrl.signal.aborted) return
        const arr = Array.isArray(data) ? data : []
        // Sort newest first
        arr.sort((a, b) => new Date(b.date) - new Date(a.date))
        setLogs(arr)
        setLoading(false)
      })
      .catch(err => {
        if (err.name === 'AbortError') return
        setLoading(false)
      })

    return () => ctrl.abort()
  }, [clientId, refresh])

  const visible = logs.slice(0, 8)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-amber-50 rounded-xl flex items-center justify-center">
          <Dumbbell className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex-1">
          سجل التمارين
        </h3>
        {!loading && logs.length > 0 && (
          <span className="text-[10px] text-slate-400 font-medium">
            {toArabicDigits(logs.length)} جلسة
          </span>
        )}
        <button
          onClick={() => setRefresh(v => v + 1)}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400 hover:text-slate-600 disabled:opacity-40"
          title="تحديث"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Body */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3">
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-4">جاري التحميل...</p>
        ) : visible.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">لا توجد جلسات مسجلة بعد</p>
        ) : (
          <div className="space-y-1.5">
            {visible.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
            {logs.length > 8 && (
              <p className="text-[10px] text-slate-400 text-center pt-1 font-medium">
                + {toArabicDigits(logs.length - 8)} جلسة أقدم
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
