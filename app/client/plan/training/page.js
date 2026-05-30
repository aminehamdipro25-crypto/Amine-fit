'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dumbbell, Calendar, ChevronDown, ChevronUp, Zap, Clock, RotateCcw } from 'lucide-react'

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
      <div className="max-w-2xl mx-auto text-center py-24">
        <div className="w-20 h-20 bg-[#0a0a0a] rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Dumbbell className="w-10 h-10 text-white/20" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">الخطة التدريبية قيد الإعداد</h2>
        <p className="text-slate-400 font-medium">يعمل المدرب أمين على تجهيز برنامجك التدريبي المخصص. ستظهر هنا قريباً.</p>
      </div>
    )
  }

  const stats = [
    { label: 'أيام/أسبوع',   val: plan.daysPerWeek, icon: Calendar },
    { label: 'المدة',         val: plan.duration ? `${plan.duration} دقيقة` : null, icon: Clock },
    { label: 'المستوى',       val: plan.level,       icon: Zap },
  ].filter(s => s.val)

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="bg-[#0a0a0a] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-gold-400/5 rounded-full" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/30 text-xs font-bold uppercase tracking-widest">برنامجك المخصص</p>
              <h1 className="text-xl font-extrabold text-white">الخطة التدريبية</h1>
            </div>
          </div>
          {plan.note && (
            <p className="text-white/50 text-sm font-medium bg-white/5 rounded-xl px-4 py-3 border border-white/5">
              {plan.note}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats.length > 0 && (
        <div className={`grid gap-3 ${stats.length === 3 ? 'grid-cols-3' : stats.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
              <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <s.icon className="w-4 h-4 text-slate-600" />
              </div>
              <p className="text-xl font-extrabold text-slate-900">{s.val}</p>
              <p className="text-xs text-slate-400 font-semibold mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Days */}
      {plan.days?.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest px-1">أيام التدريب</h2>
          {plan.days.map((day, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenDay(openDay === i ? -1 : i)}
                className="w-full flex items-center gap-4 p-5 text-right hover:bg-slate-50 transition">
                <div className="w-10 h-10 bg-[#0a0a0a] rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-gold-400 font-extrabold text-sm">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-slate-900 text-sm">{day.name || `اليوم ${i + 1}`}</p>
                  {day.focus && (
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{day.focus}</p>
                  )}
                </div>
                {day.exercises?.length > 0 && (
                  <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {day.exercises.length} تمرين
                  </span>
                )}
                {openDay === i
                  ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
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
                        <div key={j} className="bg-slate-50 rounded-xl p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="font-extrabold text-slate-900 text-sm">{ex.name}</p>
                            <span className="text-xs font-bold text-[#0a0a0a] bg-gold-400 px-2 py-0.5 rounded-full flex-shrink-0">
                              {j + 1}
                            </span>
                          </div>
                          <div className="flex gap-3 flex-wrap">
                            {ex.sets && (
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                <RotateCcw className="w-3 h-3" />
                                {ex.sets} مجموعات
                              </div>
                            )}
                            {ex.reps && (
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                <Zap className="w-3 h-3" />
                                {ex.reps} تكرارات
                              </div>
                            )}
                            {ex.rest && (
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                <Clock className="w-3 h-3" />
                                راحة: {ex.rest}
                              </div>
                            )}
                          </div>
                          {ex.note && (
                            <p className="text-xs text-slate-500 mt-2 font-medium">{ex.note}</p>
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
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest mb-4">نصائح التدريب</h2>
          <ul className="space-y-2.5">
            {plan.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 bg-[#0a0a0a] rounded-full flex items-center justify-center text-gold-400 text-[10px] font-extrabold flex-shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-sm text-slate-700 font-medium leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-center text-slate-400 text-xs font-medium pb-2">
        أسئلة عن خطتك؟{' '}
        <a href="tel:+97430653759" className="text-gold-600 font-bold hover:text-gold-500 transition">
          تواصل مع المدرب أمين
        </a>
      </p>
    </div>
  )
}
