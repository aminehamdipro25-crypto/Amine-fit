'use client'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Flame, Zap, Droplets, ChevronDown, ChevronUp, Clock, Printer, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'

// ─── Date helpers ─────────────────────────────────────────────────────────────
function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
function isSameDay(a, b) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
}
function getWeekStart(date) { const d = startOfDay(date); d.setDate(d.getDate() - d.getDay()); return d }
function getWeekDays(ws) {
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(ws); d.setDate(d.getDate() + i); return d })
}

const DAY_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS_MAGHREBI = [
  'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان',
  'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
]
function fmtDate(d) { return `${d.getDate()} ${MONTHS_MAGHREBI[d.getMonth()]} ${d.getFullYear()}` }

// ─── Week navigator — anchored to planDate, can't go before plan issue week ────
function WeekNav({ today, planDate, selectedDate, onSelect }) {
  const [weekOffset, setWeekOffset] = useState(0)

  // How many weeks back from today's week to planDate's week (negative or 0)
  const minOffset = useMemo(() => {
    if (!planDate) return 0
    const todayWeek = getWeekStart(today).getTime()
    const planWeek  = getWeekStart(planDate).getTime()
    return Math.round((planWeek - todayWeek) / (7 * 24 * 60 * 60 * 1000))
  }, [today, planDate])

  const weekStart = useMemo(() => {
    const ws = getWeekStart(today); ws.setDate(ws.getDate() + weekOffset * 7); return ws
  }, [today, weekOffset])

  const days = useMemo(() => getWeekDays(weekStart), [weekStart])

  const monthLabel = useMemo(() => {
    const mid = days[3]
    return `${MONTHS_MAGHREBI[mid.getMonth()]} ${mid.getFullYear()}`
  }, [days])

  const canGoBack = weekOffset > minOffset

  return (
    <div className="no-print rounded-2xl px-4 py-4 select-none" style={{ background: 'linear-gradient(135deg,#064e3b 0%,#065f46 100%)' }}>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => canGoBack && setWeekOffset(o => o - 1)}
          disabled={!canGoBack}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 ${canGoBack ? 'bg-white/10 text-white/50 hover:text-white hover:bg-white/20' : 'bg-white/5 text-white/15 cursor-not-allowed'}`}>
          <ChevronRight className="w-4 h-4" />
        </button>
        <p className="text-white/50 text-xs font-bold tracking-wider">{monthLabel}</p>
        <button onClick={() => setWeekOffset(o => o + 1)}
          className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-all active:scale-90">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const isToday    = isSameDay(day, today)
          const isSelected = isSameDay(day, selectedDate)
          return (
            <button key={i} onClick={() => onSelect(startOfDay(day))}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all duration-200 active:scale-95
                ${isSelected ? 'bg-emerald-400' : isToday ? 'bg-white/10 ring-1 ring-emerald-400/50' : 'hover:bg-white/5'}`}>
              <span className={`text-[9px] font-bold uppercase tracking-wide ${isSelected ? 'text-black' : 'text-white/35'}`}>
                {DAY_SHORT[day.getDay()]}
              </span>
              <span className={`text-sm font-extrabold leading-none
                ${isSelected ? 'text-black' : isToday ? 'text-emerald-400' : 'text-white/75'}`}>
                {day.getDate()}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full transition-colors
                ${isSelected ? 'bg-black/25' : 'bg-emerald-400/60'}`} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Meal card ────────────────────────────────────────────────────────────────
const MEAL_ICONS = ['☀️', '🕑', '🌆', '🌙', '🥤', '🍽️']

function MealCard({ meal, idx, open, onToggle }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden print-meal-card">
      <button onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-right hover:bg-slate-50 transition">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
          style={{ background: 'linear-gradient(135deg,#064e3b,#059669)' }}>
          <span>{MEAL_ICONS[idx % MEAL_ICONS.length]}</span>
        </div>
        <div className="flex-1 min-w-0 text-right">
          <p className="font-extrabold text-slate-900 text-sm">{meal.name || `وجبة ${idx + 1}`}</p>
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
        <span className="no-print">
          {open
            ? <ChevronUp className="w-4 h-4 text-slate-300 flex-shrink-0" />
            : <ChevronDown className="w-4 h-4 text-slate-300 flex-shrink-0" />
          }
        </span>
      </button>

      {/* Items always shown in print mode, toggleable otherwise */}
      <div className={open ? '' : 'hidden print:block'}>
        <div className="px-5 pb-5 border-t border-slate-50">
          {meal.description && (
            <p className="text-sm text-slate-600 font-medium mt-4 mb-3 leading-relaxed">{meal.description}</p>
          )}
          {meal.items?.length > 0 ? (
            <div className="space-y-1.5 mt-3">
              {meal.items.map((item, j) => (
                <div key={j} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-700 font-semibold">{item.food}</span>
                  <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2.5 py-1 rounded-full">{item.amount}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-3 text-center py-2">يتم تحديث الخطة قريباً</p>
          )}
          {meal.macros && (meal.macros.protein || meal.macros.carbs || meal.macros.fats) && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {meal.macros.protein && <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">بروتين: {meal.macros.protein}غ</span>}
              {meal.macros.carbs   && <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-100">كارب: {meal.macros.carbs}غ</span>}
              {meal.macros.fats    && <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">دهون: {meal.macros.fats}غ</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Normalize calculator-format meal ─────────────────────────────────────────
// server-side fixMeal() extracts vegetables → meal.salad and nuts → meal.nuts
// so we must re-include them here, otherwise meals with only veg/nuts show empty
function normCalcMeal(m) {
  const baseItems = (m.items || []).map(i => ({ food: i.food, amount: i.amount }))

  const saladItems = []
  if (m.salad?.vegetables?.length > 0) {
    saladItems.push({
      food:   '🥗 ' + m.salad.vegetables.join(' + '),
      amount: m.salad.grams ? `${m.salad.grams} غ` : '',
    })
  }

  const nutsItems = []
  if (m.nuts?.type) {
    nutsItems.push({
      food:   '🥜 ' + m.nuts.type,
      amount: m.nuts.grams ? `${m.nuts.grams} غ` : '',
    })
  }

  return {
    name:     m.name,
    time:     m.time,
    calories: m.kcal,
    items:    [...baseItems, ...saladItems, ...nutsItems],
    macros:   { protein: m.protein, carbs: m.carbs, fats: m.fat },
  }
}

// ─── Macros bar (shared between day and print-week views) ─────────────────────
function MacrosBar({ plan }) {
  const items = [
    { label: 'السعرات',    val: plan.calories, unit: 'kcal', color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-100',  icon: Flame },
    { label: 'بروتين',     val: plan.protein,  unit: 'غ',    color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-100',   icon: Zap },
    { label: 'كربوهيدرات', val: plan.carbs,    unit: 'غ',    color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-100', icon: Zap },
    { label: 'دهون',       val: plan.fats,     unit: 'غ',    color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-100', icon: Droplets },
  ].filter(m => m.val)
  if (!items.length) return null
  return (
    <div className={`grid gap-3 ${items.length >= 4 ? 'grid-cols-2 sm:grid-cols-4' : `grid-cols-${items.length}`}`}>
      {items.map(m => (
        <div key={m.label} className={`${m.bg} rounded-2xl p-4 border ${m.border} text-center`}>
          <m.icon className={`w-5 h-5 ${m.color} mx-auto mb-2`} />
          <p className={`text-2xl font-extrabold ${m.color}`}>{m.val}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{m.unit}</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">{m.label}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NutritionPlan() {
  const router = useRouter()
  const [client, setClient]         = useState(null)
  const [loading, setLoading]       = useState(true)
  const [openMeal, setOpenMeal]     = useState(0)
  const [selectedWeek, setSelectedWeek] = useState(0)
  const [printAllDays, setPrintAllDays] = useState(false)

  const today        = useMemo(() => startOfDay(new Date()), [])
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()))

  useEffect(() => {
    fetch('/api/client/me')
      .then(r => {
        if (r.status === 401) { router.push('/client/login'); return null }
        return r.json()
      })
      .then(d => { if (d) setClient(d) })
      .finally(() => setLoading(false))
  }, [router])

  // Reset printAllDays after printing
  useEffect(() => {
    const handler = () => setPrintAllDays(false)
    window.addEventListener('afterprint', handler)
    return () => window.removeEventListener('afterprint', handler)
  }, [])

  const handleSelectDate = useCallback((d) => {
    setSelectedDate(d)
    setOpenMeal(0)
  }, [])

  function printDay() {
    setPrintAllDays(false)
    setTimeout(() => window.print(), 50)
  }

  function printWeek() {
    setPrintAllDays(true)
    setTimeout(() => window.print(), 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!client) return null

  const plan     = client.plan?.nutrition
  const calcPlan = client.nutritionCalcPlan

  const effectivePlan = plan || (calcPlan ? {
    calories:  calcPlan.target,
    protein:   calcPlan.ex?.macros?.protein,
    carbs:     calcPlan.ex?.macros?.carbs,
    fats:      calcPlan.ex?.macros?.fat,
    waterGoal: calcPlan.water?.liters,
    fiberG:    calcPlan.ex?.fiber?.g ?? calcPlan.ex?.fiber,
    note:      null,
    tips:      [],
  } : null)

  if (!effectivePlan) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden mb-6" style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 100%)', minHeight: 260
        }}>
          <div className="relative z-10 flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="text-6xl mb-4">🥗</div>
            <h2 className="text-2xl font-extrabold text-white mb-2">الخطة الغذائية قيد الإعداد</h2>
            <p className="text-emerald-200 font-medium text-sm max-w-sm">يعمل المدرب أمين على تجهيز خطتك الغذائية المخصصة. ستظهر هنا قريباً.</p>
          </div>
        </div>
      </div>
    )
  }

  // ─── Resolve meals ────────────────────────────────────────────────────────
  const isWeeklyCalc  = calcPlan?.duration === 'week'
  const isMonthlyCalc = !isWeeklyCalc && calcPlan?.duration === 'month'
  const hasPlanMeals  = !isWeeklyCalc && !isMonthlyCalc && plan?.meals?.length > 0

  let meals = []
  let dayLabel = ''

  if (hasPlanMeals) {
    meals = plan.meals
  } else if (isWeeklyCalc) {
    const calcDays = calcPlan.days || []
    const dayIdx = selectedDate.getDay()   // 0=Sun … 6=Sat matches DAY_NAMES order
    meals    = (calcDays[dayIdx]?.menu || []).map(normCalcMeal)
    dayLabel = calcDays[dayIdx]?.name || ''
  } else if (isMonthlyCalc) {
    const calcWeeks = calcPlan.weeks || []
    meals = (calcWeeks[selectedWeek]?.menu || []).map(normCalcMeal)
  } else if (calcPlan) {
    meals = (calcPlan.menu || []).map(normCalcMeal)
  }

  // All 7 days for full-week print
  const allCalcDays = isWeeklyCalc ? (calcPlan.days || []) : []

  return (
    <div className="space-y-5 max-w-2xl mx-auto">

      {/* ── Print styles ── */}
      <style>{`
        @media print {
          .no-print { display: none !important }
          aside, header, nav { display: none !important }
          body { background: white }
          .print-meal-card button { pointer-events: none }
          .print-day-only { display: block !important }
          .print-week-all { display: block !important }
        }
        .print-week-all { display: none }
      `}</style>

      {/* ── Hero banner ── */}
      <div className="no-print relative rounded-3xl overflow-hidden" style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #059669 100%)', minHeight: 200
      }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {[
            { e: '🥗', top: '5%', left: '2%', size: 72, deg: -15 },
            { e: '🍎', top: '8%', right: '4%', size: 60, deg: 20 },
            { e: '🥦', top: '55%', left: '1%', size: 56, deg: 10 },
            { e: '🥑', top: '58%', right: '3%', size: 64, deg: -12 },
            { e: '🍗', top: '25%', left: '42%', size: 90, deg: 8 },
          ].map((item, i) => (
            <span key={i} className="absolute opacity-[0.12]" style={{
              top: item.top, left: item.left, right: item.right,
              fontSize: item.size, lineHeight: 1, transform: `rotate(${item.deg}deg)`,
            }}>{item.e}</span>
          ))}
        </div>
        <div className="relative z-10 px-6 py-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-emerald-300 text-xs font-extrabold uppercase tracking-widest mb-2">برنامجك المخصص</p>
              <h1 className="text-3xl font-extrabold text-white leading-tight">
                الخطة<br /><span className="text-emerald-300">الغذائية</span>
              </h1>
              {isWeeklyCalc && (
                <p className="text-emerald-200 text-sm font-bold mt-2">{fmtDate(selectedDate)}</p>
              )}
              {effectivePlan.note && (
                <p className="text-emerald-200/80 text-sm font-medium mt-2 max-w-xs leading-relaxed">{effectivePlan.note}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-6xl opacity-70 select-none">🥗</div>
              {/* Print buttons */}
              <div className="flex gap-2">
                <button onClick={printDay}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white/80 text-xs font-bold rounded-xl transition border border-white/10">
                  <Printer className="w-3.5 h-3.5" />
                  اليوم
                </button>
                {isWeeklyCalc && allCalcDays.length > 0 && (
                  <button onClick={printWeek}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-200 text-xs font-bold rounded-xl transition border border-emerald-400/30">
                    <CalendarDays className="w-3.5 h-3.5" />
                    الأسبوع
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Print header (only in print mode) ── */}
      <div className="hidden print:block mb-4">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">برنامج التغذية المخصص</p>
        <h1 className="text-2xl font-extrabold text-slate-900">الخطة الغذائية</h1>
        {isWeeklyCalc && !printAllDays && dayLabel && (
          <p className="text-sm text-slate-600 mt-1">{dayLabel} — {fmtDate(selectedDate)}</p>
        )}
        {isWeeklyCalc && printAllDays && (
          <p className="text-sm text-slate-600 mt-1">الأسبوع الكامل — {fmtDate(today)}</p>
        )}
      </div>

      {/* ── Week calendar (hidden in print) ── */}
      {isWeeklyCalc && (
        <WeekNav today={today} planDate={calcPlan?.date ? new Date(calcPlan.date) : today} selectedDate={selectedDate} onSelect={handleSelectDate} />
      )}

      {/* ── Month week tabs ── */}
      {isMonthlyCalc && (calcPlan.weeks || []).length > 1 && (
        <div className="no-print flex flex-wrap gap-2">
          {(calcPlan.weeks || []).map((w, i) => (
            <button key={i} onClick={() => { setSelectedWeek(i); setOpenMeal(0) }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedWeek === i ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}>
              {w.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Day label banner ── */}
      {isWeeklyCalc && dayLabel && meals.length > 0 && (
        <div className="no-print flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: 'linear-gradient(135deg,#064e3b,#065f46)' }}>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold bg-emerald-400 text-black px-3 py-1 rounded-full uppercase tracking-widest flex-shrink-0">
            {isSameDay(selectedDate, today) ? '✦ اليوم' : '✦ وجبات اليوم'}
          </div>
          <p className="text-white font-extrabold text-sm">{dayLabel}</p>
        </div>
      )}

      {/* ── Macros ── */}
      <MacrosBar plan={effectivePlan} />

      {/* ── Water & Fiber ── */}
      {(effectivePlan.waterGoal || effectivePlan.fiberG) && (
        <div className="grid grid-cols-2 gap-3">
          {effectivePlan.waterGoal && (
            <div className="bg-cyan-50 rounded-2xl p-4 border border-cyan-100 text-center">
              <div className="text-3xl mb-1">💧</div>
              <p className="text-2xl font-extrabold text-cyan-700">{effectivePlan.waterGoal} L</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">يومياً</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">هدف الماء</p>
            </div>
          )}
          {effectivePlan.fiberG && (
            <div className="bg-green-50 rounded-2xl p-4 border border-green-100 text-center">
              <div className="text-3xl mb-1">🌿</div>
              <p className="text-2xl font-extrabold text-green-700">{effectivePlan.fiberG} غ</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">يومياً</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">الألياف الغذائية</p>
            </div>
          )}
        </div>
      )}

      {/* ══ SINGLE DAY VIEW (normal + single-day print) ═══════════════════════ */}
      <div className={printAllDays ? 'print:hidden' : ''}>
        {meals.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
              <span>🍽️</span> {isWeeklyCalc && dayLabel ? `وجبات ${dayLabel}` : 'الوجبات اليومية'}
            </h2>
            {meals.map((meal, i) => (
              <MealCard
                key={`${selectedDate.toISOString()}-${i}`}
                meal={meal} idx={i}
                open={openMeal === i}
                onToggle={() => setOpenMeal(openMeal === i ? -1 : i)}
              />
            ))}
          </div>
        )}

        {/* Rest day */}
        {meals.length === 0 && isWeeklyCalc && (
          <div className="no-print rounded-3xl overflow-hidden">
            <div className="relative px-6 py-12 text-center" style={{ background: 'linear-gradient(135deg,#064e3b 0%,#065f46 100%)' }}>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold bg-white/10 text-white/50 px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                  {isSameDay(selectedDate, today) ? '✦ اليوم' : '✦ يوم راحة'}
                </div>
                <h2 className="text-3xl font-black text-white leading-none tracking-tighter">راحة</h2>
                <p className="text-white/50 font-bold text-sm mt-2">{dayLabel || fmtDate(selectedDate)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══ FULL WEEK PRINT VIEW ═════════════════════════════════════════════ */}
      {isWeeklyCalc && (
        <div className="print-week-all space-y-8">
          {allCalcDays.map((day, di) => {
            const dayMeals = (day.menu || []).map(normCalcMeal)
            if (!dayMeals.length) return null
            return (
              <div key={di} className="break-inside-avoid">
                <div className="flex items-center gap-3 mb-3 pb-2 border-b-2 border-emerald-600">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#064e3b,#059669)' }}>
                    {di + 1}
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900">{day.name}</h2>
                </div>
                <div className="space-y-2">
                  {dayMeals.map((meal, mi) => (
                    <div key={mi} className="bg-white rounded-xl border border-slate-100 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {meal.calories ? `${meal.calories} kcal` : ''}
                        </span>
                        <div className="text-right">
                          <p className="font-extrabold text-slate-900 text-sm">{meal.name || `وجبة ${mi + 1}`}</p>
                          {meal.time && <p className="text-xs text-slate-400">{meal.time}</p>}
                        </div>
                      </div>
                      {meal.items?.length > 0 && (
                        <div className="space-y-1 mt-2">
                          {meal.items.map((item, ji) => (
                            <div key={ji} className="flex items-center justify-between text-sm py-1 border-b border-slate-50 last:border-0">
                              <span className="text-slate-400 text-xs">{item.amount}</span>
                              <span className="text-slate-700 font-semibold">{item.food}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {meal.macros && (meal.macros.protein || meal.macros.carbs || meal.macros.fats) && (
                        <div className="flex gap-2 mt-2 flex-wrap justify-end">
                          {meal.macros.protein && <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">بروتين: {meal.macros.protein}غ</span>}
                          {meal.macros.carbs   && <span className="text-[11px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">كارب: {meal.macros.carbs}غ</span>}
                          {meal.macros.fats    && <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full">دهون: {meal.macros.fats}غ</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Tips ── */}
      {effectivePlan.tips?.length > 0 && (
        <div className="rounded-2xl overflow-hidden border border-emerald-100">
          <div className="px-5 py-4 flex items-center gap-2" style={{ background: 'linear-gradient(135deg,#064e3b,#065f46)' }}>
            <span className="text-xl">💡</span>
            <h2 className="text-sm font-extrabold text-white uppercase tracking-widest">نصائح التغذية</h2>
          </div>
          <div className="bg-emerald-50 px-5 py-4 space-y-3">
            {effectivePlan.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[11px] font-extrabold flex-shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-sm text-emerald-900 font-medium leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="no-print text-center text-slate-400 text-xs font-medium pb-4">
        أسئلة عن خطتك؟{' '}
        <a href="tel:+97430653759" className="text-emerald-600 font-bold hover:text-emerald-500 transition">
          تواصل مع المدرب أمين
        </a>
      </p>
    </div>
  )
}
