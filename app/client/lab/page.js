'use client'
import { useState, useEffect } from 'react'
import { Zap, FlaskConical, ChevronDown, ChevronUp, Clock, Flame, Heart, BarChart3, Lightbulb, Shield, RefreshCw } from 'lucide-react'

const INTENSITY_CONFIG = {
  'low':       { label: 'منخفضة',      color: 'bg-blue-100 text-blue-700 border-blue-200',     dot: 'bg-blue-400' },
  'moderate':  { label: 'متوسطة',      color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
  'high':      { label: 'عالية',        color: 'bg-amber-100 text-amber-700 border-amber-200',   dot: 'bg-amber-400' },
  'very-high': { label: 'عالية جداً',  color: 'bg-red-100 text-red-700 border-red-200',         dot: 'bg-red-400' },
}

function IntensityBadge({ level }) {
  const cfg = INTENSITY_CONFIG[level] || INTENSITY_CONFIG.moderate
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function SessionCard({ session, index }) {
  const [open, setOpen] = useState(index === 0)
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 text-right hover:bg-slate-50 transition">
        <div className="w-10 h-10 rounded-xl bg-[#0a0a0a] text-gold-400 flex items-center justify-center font-extrabold text-sm flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-slate-900 text-sm">{session.type}</p>
          <p className="text-slate-400 text-xs mt-0.5">{session.day} · {session.duration}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <IntensityBadge level={session.intensityLevel} />
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-100">
          {session.description && (
            <p className="text-slate-600 text-sm leading-relaxed pt-4">{session.description}</p>
          )}

          {session.heartRateZone && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              <Heart className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-xs font-bold text-red-700" dir="ltr">{session.heartRateZone}</span>
            </div>
          )}

          {session.exercises?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">EXERCISES</p>
              <div className="flex flex-wrap gap-2">
                {session.exercises.map((ex, i) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg" dir="ltr">
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          )}

          {session.notes && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
              <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 font-medium leading-relaxed">{session.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-5">
        <FlaskConical className="w-10 h-10 text-slate-300" />
      </div>
      <h2 className="text-xl font-extrabold text-slate-800 mb-2">المختبر قيد الإعداد</h2>
      <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
        يعمل المدرب أمين على إعداد بروتوكولك التدريبي المخصص.
        ستجده هنا فور اكتماله.
      </p>
      <a href="https://wa.me/97430653759"
        className="mt-6 px-5 py-2.5 bg-[#0a0a0a] text-gold-400 font-bold text-sm rounded-xl hover:bg-black transition">
        تواصل مع المدرب
      </a>
    </div>
  )
}

export default function LabPage() {
  const [protocol, setProtocol] = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetch('/api/client/protocol')
      .then(r => r.ok ? r.json() : null)
      .then(data => { setProtocol(data?.protocol || null) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <RefreshCw className="w-6 h-6 text-slate-300 animate-spin" />
    </div>
  )

  if (!protocol) return <EmptyState />

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">

      {/* Hero card */}
      <div className="relative rounded-3xl overflow-hidden bg-[#0a0a0a] p-6 shadow-xl">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #fbbf24 0%, transparent 60%), radial-gradient(circle at 80% 50%, #fbbf24 0%, transparent 60%)' }} />
        <div className="relative">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-3xl">
              {protocol.emoji}
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              مفعّل
            </span>
          </div>

          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">بروتوكول المختبر</p>
          <h1 className="text-white font-extrabold text-2xl mb-1" dir="ltr">{protocol.methodName}</h1>
          <p className="text-gold-400 font-bold text-sm mb-5">{protocol.tagline}</p>

          {/* Weekly stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-2xl p-3 text-center">
              <Zap className="w-4 h-4 text-gold-400 mx-auto mb-1" />
              <p className="text-white font-extrabold text-lg">{protocol.weeklyStats?.sessions || '—'}</p>
              <p className="text-white/30 text-xs">جلسات/أسبوع</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 text-center">
              <Clock className="w-4 h-4 text-gold-400 mx-auto mb-1" />
              <p className="text-white font-extrabold text-lg">{protocol.weeklyStats?.totalMinutes || '—'}</p>
              <p className="text-white/30 text-xs">دقيقة/أسبوع</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 text-center">
              <Flame className="w-4 h-4 text-gold-400 mx-auto mb-1" />
              <p className="text-white font-extrabold text-xs leading-tight">{protocol.weeklyStats?.intensityProfile || '—'}</p>
              <p className="text-white/30 text-xs mt-0.5">توزيع الشدة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Why You */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-5 h-5 text-amber-600" />
          <p className="font-extrabold text-amber-900 text-sm">لماذا هذا البروتوكول لك تحديداً؟</p>
        </div>
        <p className="text-amber-800 text-sm leading-relaxed">{protocol.whyYou}</p>
        {protocol.science && (
          <p className="text-amber-600 text-xs mt-3 leading-relaxed border-t border-amber-200 pt-3">
            🔬 {protocol.science}
          </p>
        )}
      </div>

      {/* Weekly structure */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">WEEKLY STRUCTURE</p>
        <div className="space-y-3">
          {protocol.weeklyStructure?.map((session, i) => (
            <SessionCard key={i} session={session} index={i} />
          ))}
        </div>
      </div>

      {/* Key principles */}
      {protocol.keyPrinciples?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">KEY PRINCIPLES</p>
          <div className="space-y-2">
            {protocol.keyPrinciples.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 px-4 py-3 flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-slate-900 text-gold-400 flex items-center justify-center text-xs font-extrabold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm" dir="ltr">{p.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recovery tips */}
      {protocol.recoveryTips?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-emerald-500" />
            <p className="font-extrabold text-slate-900 text-sm">نصائح التعافي</p>
          </div>
          <div className="space-y-2">
            {protocol.recoveryTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold text-sm mt-0.5 flex-shrink-0">✓</span>
                <p className="text-slate-600 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coach note */}
      {protocol.weekNotes && (
        <div className="bg-[#0a0a0a] rounded-2xl p-5">
          <p className="text-white/40 text-xs font-bold uppercase tracking-wide mb-2">ملاحظة المدرب</p>
          <p className="text-white/80 text-sm leading-relaxed">{protocol.weekNotes}</p>
        </div>
      )}

    </div>
  )
}
