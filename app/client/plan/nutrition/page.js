'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Flame, Zap, Droplets, ChevronDown, ChevronUp, Clock, Printer } from 'lucide-react'

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
        <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!client) return null

  const plan = client.plan?.nutrition

  if (!plan) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Empty state hero */}
        <div className="relative rounded-3xl overflow-hidden mb-6" style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 100%)',
          minHeight: 260
        }}>
          {/* Floating food emojis */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {[
              { e: '🥗', t: '8%',  l: '5%',  s: 64, r: -15 },
              { e: '🍎', t: '12%', r: '8%',  s: 56, rot: 20 },
              { e: '🥦', t: '55%', l: '3%',  s: 52, r: 10 },
              { e: '🥑', t: '60%', r: '5%',  s: 60, rot: -12 },
              { e: '🍗', t: '30%', l: '45%', s: 80, rot: 8 },
              { e: '💧', t: '75%', l: '30%', s: 44, rot: 0 },
              { e: '🥚', t: '20%', l: '25%', s: 40, rot: -5 },
              { e: '🥩', t: '70%', r: '25%', s: 50, rot: 15 },
            ].map((item, i) => (
              <span key={i} className="absolute opacity-10" style={{
                top: item.t, left: item.l, right: item.r,
                fontSize: item.s,
                transform: `rotate(${item.r ?? item.rot ?? 0}deg)`,
                lineHeight: 1
              }}>{item.e}</span>
            ))}
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="text-6xl mb-4">🥗</div>
            <h2 className="text-2xl font-extrabold text-white mb-2">الخطة الغذائية قيد الإعداد</h2>
            <p className="text-emerald-200 font-medium text-sm max-w-sm">يعمل المدرب أمين على تجهيز خطتك الغذائية المخصصة. ستظهر هنا قريباً.</p>
          </div>
        </div>
      </div>
    )
  }

  const macros = [
    { label: 'السعرات',    val: plan.calories, unit: 'kcal', color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-100', icon: Flame },
    { label: 'بروتين',     val: plan.protein,  unit: 'غ',    color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-100',  icon: Zap },
    { label: 'كربوهيدرات', val: plan.carbs,    unit: 'غ',    color: 'text-violet-700',  bg: 'bg-violet-50',  border: 'border-violet-100',icon: Zap },
    { label: 'دهون',       val: plan.fats,     unit: 'غ',    color: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-100',icon: Droplets },
  ].filter(m => m.val)

  return (
    <div className="space-y-5 max-w-2xl mx-auto">

      {/* Hero banner */}
      <div className="relative rounded-3xl overflow-hidden" style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #059669 100%)',
        minHeight: 200
      }}>
        {/* Background food emojis */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {[
            { e: '🥗', top: '5%',  left: '2%',  size: 72, deg: -15 },
            { e: '🍎', top: '8%',  right: '4%', size: 60, deg: 20 },
            { e: '🥦', top: '55%', left: '1%',  size: 56, deg: 10 },
            { e: '🥑', top: '58%', right: '3%', size: 64, deg: -12 },
            { e: '🍗', top: '25%', left: '42%', size: 90, deg: 8 },
            { e: '💧', top: '70%', left: '28%', size: 48, deg: 0 },
            { e: '🥚', top: '15%', left: '22%', size: 44, deg: -5 },
            { e: '🥩', top: '68%', right: '22%',size: 54, deg: 15 },
            { e: '🍌', top: '40%', right: '15%',size: 50, deg: -20 },
            { e: '🫐', top: '45%', left: '15%', size: 42, deg: 5 },
          ].map((item, i) => (
            <span key={i} className="absolute opacity-[0.12]" style={{
              top: item.top, left: item.left, right: item.right,
              fontSize: item.size, lineHeight: 1,
              transform: `rotate(${item.deg}deg)`,
            }}>{item.e}</span>
          ))}
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10 px-6 py-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-emerald-300 text-xs font-extrabold uppercase tracking-widest mb-2">برنامجك المخصص</p>
              <h1 className="text-3xl font-extrabold text-white leading-tight">
                الخطة<br /><span className="text-emerald-300">الغذائية</span>
              </h1>
              {plan.note && (
                <p className="text-emerald-200/80 text-sm font-medium mt-3 max-w-xs leading-relaxed">{plan.note}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="text-7xl opacity-80 select-none">🥗</div>
              <button onClick={() => window.print()}
                className="print:hidden flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white/80 text-xs font-bold rounded-xl transition border border-white/10">
                <Printer className="w-3.5 h-3.5" />
                طباعة / PDF
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media print { .print\\:hidden { display:none !important } aside, header { display:none !important } body { background:white } }`}</style>

      {/* Macros */}
      {macros.length > 0 && (
        <div className={`grid gap-3 ${macros.length >= 4 ? 'grid-cols-2 sm:grid-cols-4' : `grid-cols-${macros.length}`}`}>
          {macros.map(m => (
            <div key={m.label} className={`${m.bg} rounded-2xl p-4 border ${m.border} text-center`}>
              <m.icon className={`w-5 h-5 ${m.color} mx-auto mb-2`} />
              <p className={`text-2xl font-extrabold ${m.color}`}>{m.val}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{m.unit}</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Water & Fiber */}
      {(plan.waterGoal || plan.fiberG) && (
        <div className="grid grid-cols-2 gap-3">
          {plan.waterGoal && (
            <div className="bg-cyan-50 rounded-2xl p-4 border border-cyan-100 text-center">
              <div className="text-3xl mb-1">💧</div>
              <p className="text-2xl font-extrabold text-cyan-700">{plan.waterGoal} L</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">يومياً</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">هدف الماء</p>
            </div>
          )}
          {plan.fiberG && (
            <div className="bg-green-50 rounded-2xl p-4 border border-green-100 text-center">
              <div className="text-3xl mb-1">🌿</div>
              <p className="text-2xl font-extrabold text-green-700">{plan.fiberG} غ</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">يومياً</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">الألياف الغذائية</p>
            </div>
          )}
        </div>
      )}

      {/* Meals */}
      {plan.meals?.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
            <span>🍽️</span> الوجبات اليومية
          </h2>
          {plan.meals.map((meal, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <button onClick={() => setOpenMeal(openMeal === i ? -1 : i)}
                className="w-full flex items-center gap-4 p-5 text-right hover:bg-slate-50 transition">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ background: 'linear-gradient(135deg,#064e3b,#059669)' }}>
                  <span>{['☀️','🕑','🌆','🌙','🥤'][i % 5]}</span>
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <p className="font-extrabold text-slate-900 text-sm">{meal.name || `وجبة ${i + 1}`}</p>
                  {meal.time && (
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {meal.time}
                    </p>
                  )}
                </div>
                {meal.calories && (
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex-shrink-0">
                    {meal.calories} kcal
                  </span>
                )}
                {openMeal === i
                  ? <ChevronUp className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-slate-300 flex-shrink-0" />
                }
              </button>

              {openMeal === i && (
                <div className="px-5 pb-5 border-t border-slate-50">
                  {meal.description && (
                    <p className="text-sm text-slate-600 font-medium mt-4 mb-3 leading-relaxed">{meal.description}</p>
                  )}
                  {meal.items?.length > 0 && (
                    <div className="space-y-1.5 mt-3">
                      {meal.items.map((item, j) => (
                        <div key={j} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                          <span className="text-sm text-slate-700 font-semibold">{item.food}</span>
                          <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2.5 py-1 rounded-full">{item.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {meal.macros && (meal.macros.protein || meal.macros.carbs || meal.macros.fats) && (
                    <div className="flex gap-2 mt-4 flex-wrap">
                      {meal.macros.protein && <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">بروتين: {meal.macros.protein}غ</span>}
                      {meal.macros.carbs   && <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-100">كارب: {meal.macros.carbs}غ</span>}
                      {meal.macros.fats    && <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">دهون: {meal.macros.fats}غ</span>}
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
        <div className="rounded-2xl overflow-hidden border border-emerald-100">
          <div className="px-5 py-4 flex items-center gap-2" style={{ background: 'linear-gradient(135deg,#064e3b,#065f46)' }}>
            <span className="text-xl">💡</span>
            <h2 className="text-sm font-extrabold text-white uppercase tracking-widest">نصائح التغذية</h2>
          </div>
          <div className="bg-emerald-50 px-5 py-4 space-y-3">
            {plan.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[11px] font-extrabold flex-shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-sm text-emerald-900 font-medium leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-slate-400 text-xs font-medium pb-4">
        أسئلة عن خطتك؟{' '}
        <a href="tel:+97430653759" className="text-emerald-600 font-bold hover:text-emerald-500 transition">
          تواصل مع المدرب أمين
        </a>
      </p>
    </div>
  )
}
