'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, ChevronDown, ChevronUp, Zap, Clock, RotateCcw } from 'lucide-react'

export default function TrainingPlan() {
  const router = useRouter()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [openDay, setOpenDay] = useState(0)

  useEffect(() => {
    fetch('/api/client/me')
      .then(r => {
        if (r.status === 401) { router.push('/client/login'); return null }
        return r.json()
      })
      .then(d => { if (d) setClient(d) })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!client) return null

  const plan = client.plan?.training

  if (!plan) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden" style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #111827 100%)',
          minHeight: 260
        }}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {[
              { e: '🏋️', t: '10%', l: '5%',  s: 72, d: -15 },
              { e: '💪',  t: '15%', r: '8%',  s: 60, d: 20 },
              { e: '⚡',  t: '55%', l: '3%',  s: 56, d: 0 },
              { e: '🔥',  t: '60%', r: '5%',  s: 60, d: 12 },
              { e: '🏃',  t: '30%', l: '42%', s: 88, d: 8 },
              { e: '🎯',  t: '72%', l: '28%', s: 44, d: 0 },
            ].map((item, i) => (
              <span key={i} className="absolute opacity-10" style={{
                top: item.t, left: item.l, right: item.r,
                fontSize: item.s, lineHeight: 1,
                transform: `rotate(${item.d}deg)`,
              }}>{item.e}</span>
            ))}
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="text-6xl mb-4">🏋️</div>
            <h2 className="text-2xl font-extrabold text-white mb-2">الخطة التدريبية قيد الإعداد</h2>
            <p className="text-white/40 font-medium text-sm max-w-sm">يعمل المدرب أمين على تجهيز برنامجك التدريبي المخصص. ستظهر هنا قريباً.</p>
          </div>
        </div>
      </div>
    )
  }

  const stats = [
    { label: 'أيام/أسبوع', val: plan.daysPerWeek, icon: Calendar, emoji: '📅' },
    { label: 'المدة',       val: plan.duration ? `${plan.duration} د` : null, icon: Clock, emoji: '⏱️' },
    { label: 'المستوى',     val: plan.level,   icon: Zap, emoji: '🎯' },
  ].filter(s => s.val)

  return (
    <div className="space-y-5 max-w-2xl mx-auto">

      {/* Hero banner */}
      <div className="relative rounded-3xl overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #111827 50%, #1f2937 100%)',
        minHeight: 200
      }}>
        {/* Floating gym emojis */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {[
            { e: '🏋️', top: '8%',  left: '2%',  size: 80, deg: -15 },
            { e: '💪',  top: '12%', right: '4%', size: 64, deg: 20 },
            { e: '⚡',  top: '55%', left: '1%',  size: 60, deg: 0 },
            { e: '🔥',  top: '58%', right: '3%', size: 66, deg: 12 },
            { e: '🏃',  top: '22%', left: '40%', size: 96, deg: 8 },
            { e: '🎯',  top: '70%', left: '26%', size: 50, deg: 0 },
            { e: '💥',  top: '18%', left: '20%', size: 46, deg: -8 },
            { e: '🥊',  top: '65%', right: '20%',size: 56, deg: 15 },
            { e: '🏆',  top: '38%', right: '14%',size: 52, deg: -10 },
          ].map((item, i) => (
            <span key={i} className="absolute opacity-[0.12]" style={{
              top: item.top, left: item.left, right: item.right,
              fontSize: item.size, lineHeight: 1,
              transform: `rotate(${item.deg}deg)`,
            }}>{item.e}</span>
          ))}
        </div>

        {/* Diagonal gold stripe */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute opacity-5" style={{
            width: '200%', height: '3px',
            background: 'linear-gradient(90deg,transparent,#fbbf24,transparent)',
            top: '65%', left: '-50%',
            transform: 'rotate(-8deg)',
          }} />
        </div>

        <div className="relative z-10 px-6 py-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-gold-400/60 text-xs font-extrabold uppercase tracking-widest mb-2">برنامجك المخصص</p>
              <h1 className="text-3xl font-extrabold text-white leading-tight">
                الخطة<br /><span className="text-gold-400">التدريبية</span>
              </h1>
              {plan.note && (
                <p className="text-white/40 text-sm font-medium mt-3 max-w-xs leading-relaxed">{plan.note}</p>
              )}
            </div>
            <div className="text-7xl opacity-80 select-none flex-shrink-0">🏋️</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats.length > 0 && (
        <div className={`grid gap-3 ${stats.length === 3 ? 'grid-cols-3' : `grid-cols-${stats.length}`}`}>
          {stats.map(s => (
            <div key={s.label} className="bg-[#0a0a0a] rounded-2xl p-4 text-center border border-white/5">
              <div className="text-2xl mb-1">{s.emoji}</div>
              <p className="text-xl font-extrabold text-gold-400">{s.val}</p>
              <p className="text-xs text-white/30 font-semibold mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Days */}
      {plan.days?.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
            <span>💪</span> أيام التدريب
          </h2>
          {plan.days.map((day, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <button onClick={() => setOpenDay(openDay === i ? -1 : i)}
                className="w-full flex items-center gap-4 p-5 text-right hover:bg-slate-50 transition">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#0a0a0a,#1f2937)' }}>
                  <span className="text-gold-400 font-extrabold text-sm">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <p className="font-extrabold text-slate-900 text-sm">{day.name || `اليوم ${i + 1}`}</p>
                  {day.focus && (
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{day.focus}</p>
                  )}
                </div>
                {day.exercises?.length > 0 && (
                  <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full flex-shrink-0">
                    {day.exercises.length} تمرين
                  </span>
                )}
                {openDay === i
                  ? <ChevronUp className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-slate-300 flex-shrink-0" />
                }
              </button>

              {openDay === i && (
                <div className="px-5 pb-5 border-t border-slate-50">
                  {day.description && (
                    <p className="text-sm text-slate-600 font-medium mt-4 mb-3 leading-relaxed">{day.description}</p>
                  )}
                  {day.exercises?.length > 0 && (
                    <div className="space-y-3 mt-4">
                      {day.exercises.map((ex, j) => (
                        <div key={j} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <p className="font-extrabold text-slate-900 text-sm">{ex.name}</p>
                            <span className="text-[10px] font-extrabold text-black bg-gold-400 px-2 py-0.5 rounded-full flex-shrink-0">{j + 1}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {ex.sets && (
                              <div className="bg-white rounded-lg p-2 text-center border border-slate-100">
                                <p className="text-base font-extrabold text-slate-900">{ex.sets}</p>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5 flex items-center justify-center gap-1">
                                  <RotateCcw className="w-2.5 h-2.5" /> مجموعات
                                </p>
                              </div>
                            )}
                            {ex.reps && (
                              <div className="bg-white rounded-lg p-2 text-center border border-slate-100">
                                <p className="text-base font-extrabold text-slate-900">{ex.reps}</p>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5 flex items-center justify-center gap-1">
                                  <Zap className="w-2.5 h-2.5" /> تكرارات
                                </p>
                              </div>
                            )}
                            {ex.rest && (
                              <div className="bg-white rounded-lg p-2 text-center border border-slate-100">
                                <p className="text-base font-extrabold text-slate-900 text-xs leading-tight">{ex.rest}</p>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5 flex items-center justify-center gap-1">
                                  <Clock className="w-2.5 h-2.5" /> راحة
                                </p>
                              </div>
                            )}
                          </div>
                          {ex.note && (
                            <p className="text-xs text-slate-500 mt-2 font-medium bg-white rounded-lg px-3 py-2 border border-slate-100">{ex.note}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      {plan.tips?.length > 0 && (
        <div className="rounded-2xl overflow-hidden border border-white/5">
          <div className="px-5 py-4 flex items-center gap-2" style={{ background: '#0a0a0a' }}>
            <span className="text-xl">⚡</span>
            <h2 className="text-sm font-extrabold text-white uppercase tracking-widest">نصائح التدريب</h2>
          </div>
          <div className="bg-[#111] px-5 py-4 space-y-3">
            {plan.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-gold-400 text-black rounded-full flex items-center justify-center text-[11px] font-extrabold flex-shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-sm text-white/70 font-medium leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-slate-400 text-xs font-medium pb-4">
        أسئلة عن خطتك؟{' '}
        <a href="tel:+97430653759" className="text-gold-600 font-bold hover:text-gold-500 transition">
          تواصل مع المدرب أمين
        </a>
      </p>
    </div>
  )
}
