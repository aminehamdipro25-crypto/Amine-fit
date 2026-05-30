'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Utensils, Flame, Zap, Droplets, ChevronDown, ChevronUp, Clock } from 'lucide-react'

export default function NutritionPlan() {
  const router = useRouter()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [openMeal, setOpenMeal] = useState(0)

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

  const plan = client.plan?.nutrition

  if (!plan) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24">
        <div className="w-20 h-20 bg-[#0a0a0a] rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Utensils className="w-10 h-10 text-white/20" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">الخطة الغذائية قيد الإعداد</h2>
        <p className="text-slate-400 font-medium">يعمل المدرب أمين على تجهيز خطتك الغذائية المخصصة. ستظهر هنا قريباً.</p>
      </div>
    )
  }

  const macros = [
    { label: 'السعرات',   val: plan.calories,  unit: 'kcal', color: 'text-gold-600',    bg: 'bg-gold-50',    icon: Flame },
    { label: 'بروتين',    val: plan.protein,   unit: 'غ',    color: 'text-blue-600',    bg: 'bg-blue-50',    icon: Zap },
    { label: 'كربوهيدرات',val: plan.carbs,     unit: 'غ',    color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Zap },
    { label: 'دهون',      val: plan.fats,      unit: 'غ',    color: 'text-orange-600',  bg: 'bg-orange-50',  icon: Droplets },
  ]

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="bg-[#0a0a0a] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -left-6 -top-6 w-40 h-40 bg-gold-400/5 rounded-full" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-gold-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <Utensils className="w-5 h-5 text-black" />
            </div>
            <div>
              <p className="text-white/30 text-xs font-bold uppercase tracking-widest">برنامجك المخصص</p>
              <h1 className="text-xl font-extrabold text-white">الخطة الغذائية</h1>
            </div>
          </div>
          {plan.note && (
            <p className="text-white/50 text-sm font-medium bg-white/5 rounded-xl px-4 py-3 border border-white/5">
              {plan.note}
            </p>
          )}
        </div>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {macros.map(m => m.val ? (
          <div key={m.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
            <div className={`w-9 h-9 ${m.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
              <m.icon className={`w-4 h-4 ${m.color}`} />
            </div>
            <p className={`text-2xl font-extrabold ${m.color}`}>{m.val}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">{m.unit}</p>
            <p className="text-xs text-slate-500 font-semibold mt-1">{m.label}</p>
          </div>
        ) : null)}
      </div>

      {/* Meals */}
      {plan.meals?.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest px-1">الوجبات اليومية</h2>
          {plan.meals.map((meal, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenMeal(openMeal === i ? -1 : i)}
                className="w-full flex items-center gap-4 p-5 text-right hover:bg-slate-50 transition">
                <div className="w-10 h-10 bg-[#0a0a0a] rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-gold-400 font-extrabold text-sm">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-slate-900 text-sm">{meal.name || `وجبة ${i + 1}`}</p>
                  {meal.time && (
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {meal.time}
                    </p>
                  )}
                </div>
                {meal.calories && (
                  <span className="text-xs font-extrabold text-gold-600 bg-gold-50 px-2.5 py-1 rounded-full border border-gold-100">
                    {meal.calories} kcal
                  </span>
                )}
                {openMeal === i
                  ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                }
              </button>

              {openMeal === i && (
                <div className="px-5 pb-5 border-t border-slate-50">
                  {meal.description && (
                    <p className="text-sm text-slate-600 font-medium mt-4 mb-3 leading-relaxed">{meal.description}</p>
                  )}
                  {meal.items?.length > 0 && (
                    <div className="space-y-2">
                      {meal.items.map((item, j) => (
                        <div key={j} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                          <span className="text-sm text-slate-700 font-semibold">{item.food}</span>
                          <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2.5 py-1 rounded-full">{item.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {meal.macros && (
                    <div className="flex gap-3 mt-4 flex-wrap">
                      {meal.macros.protein && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">بروتين: {meal.macros.protein}غ</span>}
                      {meal.macros.carbs   && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">كارب: {meal.macros.carbs}غ</span>}
                      {meal.macros.fats    && <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">دهون: {meal.macros.fats}غ</span>}
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
          <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest mb-4">نصائح التغذية</h2>
          <ul className="space-y-2.5">
            {plan.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 bg-gold-400 rounded-full flex items-center justify-center text-black text-[10px] font-extrabold flex-shrink-0 mt-0.5">{i + 1}</span>
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
