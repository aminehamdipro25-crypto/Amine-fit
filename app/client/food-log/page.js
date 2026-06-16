'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ChevronLeft, ChevronRight, X, Loader2, Flame } from 'lucide-react'

const MEALS = [
  { key: 'breakfast', label: 'الإفطار',       emoji: '🍳', color: 'bg-amber-50 border-amber-200' },
  { key: 'lunch',     label: 'الغداء',         emoji: '🍽️', color: 'bg-emerald-50 border-emerald-200' },
  { key: 'dinner',    label: 'العشاء',          emoji: '🌙', color: 'bg-indigo-50 border-indigo-200' },
  { key: 'snack',     label: 'وجبات خفيفة',   emoji: '🍎', color: 'bg-pink-50 border-pink-200' },
]

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ar', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

/* ── Add Food Modal ───────────────────────────────────────────────────── */
function AddModal({ date, meal, onClose, onAdded }) {
  const [name,     setName]     = useState('')
  const [calories, setCalories] = useState('')
  const [protein,  setProtein]  = useState('')
  const [carbs,    setCarbs]    = useState('')
  const [fat,      setFat]      = useState('')
  const [saving,   setSaving]   = useState(false)
  const [err,      setErr]      = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!name.trim() || !calories) { setErr('الاسم والسعرات مطلوبان'); return }
    setSaving(true); setErr('')
    try {
      const res = await fetch('/api/client/food-log', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ date, meal, name, calories: +calories, protein: protein ? +protein : null, carbs: carbs ? +carbs : null, fat: fat ? +fat : null }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      onAdded(d.entries)
      onClose()
    } catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  const info = MEALS.find(m => m.key === meal)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">{info?.emoji} إضافة طعام</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{info?.label} — {fmtDate(date)}</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wide block mb-1.5">اسم الطعام *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} maxLength={100}
              placeholder="مثال: صدر دجاج مشوي، أرز بالخضار..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-amber-400 transition" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wide block mb-1.5">السعرات الحرارية *</label>
              <div className="relative">
                <input type="number" value={calories} onChange={e => setCalories(e.target.value)} min="0" max="5000"
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-amber-400 transition pl-12" />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">kcal</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wide block mb-1.5">بروتين (اختياري)</label>
              <div className="relative">
                <input type="number" value={protein} onChange={e => setProtein(e.target.value)} min="0"
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 transition pl-8" />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">g</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wide block mb-1.5">كربوهيدرات</label>
              <div className="relative">
                <input type="number" value={carbs} onChange={e => setCarbs(e.target.value)} min="0"
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 transition pl-8" />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">g</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wide block mb-1.5">دهون</label>
              <div className="relative">
                <input type="number" value={fat} onChange={e => setFat(e.target.value)} min="0"
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-rose-400 transition pl-8" />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">g</span>
              </div>
            </div>
          </div>

          {err && <p className="text-red-500 text-xs font-medium">{err}</p>}

          <button type="submit" disabled={saving}
            className="w-full py-3 bg-amber-400 text-black font-extrabold rounded-xl text-sm hover:bg-amber-300 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? 'جاري الحفظ...' : 'إضافة'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ── Meal Section ─────────────────────────────────────────────────────── */
function MealSection({ meal, entries, date, onAdd, onDelete }) {
  const [deleting, setDeleting] = useState(null)

  const mealEntries = entries.filter(e => e.meal === meal.key)
  const total       = mealEntries.reduce((s, e) => s + (e.calories || 0), 0)
  const protein     = mealEntries.reduce((s, e) => s + (e.protein || 0), 0)

  async function del(id) {
    setDeleting(id)
    const res = await fetch(`/api/client/food-log?date=${date}&id=${id}`, { method: 'DELETE' })
    if (res.ok) { const d = await res.json(); onDelete(d.entries) }
    setDeleting(null)
  }

  return (
    <div className={`rounded-2xl border p-4 ${meal.color}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{meal.emoji}</span>
          <div>
            <p className="font-extrabold text-slate-800 text-sm">{meal.label}</p>
            {mealEntries.length > 0 && (
              <p className="text-[11px] text-slate-500 font-medium">
                {total} kcal{protein > 0 ? ` · ${protein}g بروتين` : ''}
              </p>
            )}
          </div>
        </div>
        <button onClick={() => onAdd(meal.key)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:border-amber-400 hover:text-amber-600 transition shadow-sm">
          <Plus className="w-3.5 h-3.5" /> إضافة
        </button>
      </div>

      {mealEntries.length > 0 ? (
        <div className="space-y-1.5">
          {mealEntries.map(e => (
            <div key={e.id} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border border-white/80">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{e.name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs font-extrabold text-amber-600">{e.calories} kcal</span>
                  {e.protein != null && <span className="text-[11px] text-blue-500 font-medium">{e.protein}g بروتين</span>}
                  {e.carbs   != null && <span className="text-[11px] text-emerald-500 font-medium">{e.carbs}g كربوهيدرات</span>}
                  {e.fat     != null && <span className="text-[11px] text-rose-400 font-medium">{e.fat}g دهون</span>}
                </div>
              </div>
              <button onClick={() => del(e.id)} disabled={deleting === e.id}
                className="text-slate-300 hover:text-red-400 transition flex-shrink-0 p-1">
                {deleting === e.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 text-center py-2 font-medium">لا يوجد إدخال بعد</p>
      )}
    </div>
  )
}

/* ── Main Page ────────────────────────────────────────────────────────── */
export default function FoodLogPage() {
  const router = useRouter()
  const [client,   setClient]   = useState(null)
  const [date,     setDate]     = useState(todayStr)
  const [entries,  setEntries]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [addMeal,  setAddMeal]  = useState(null)  // meal key when modal open

  // Auth check
  useEffect(() => {
    fetch('/api/client/me')
      .then(r => { if (r.status === 401) { router.push('/client/login'); return null } return r.json() })
      .then(d => { if (d) setClient(d) })
  }, [router])

  // Load entries for selected date
  useEffect(() => {
    setLoading(true)
    fetch(`/api/client/food-log?date=${date}`)
      .then(r => r.ok ? r.json() : { entries: [] })
      .then(d => setEntries(d.entries || []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [date])

  const totalCalories = entries.reduce((s, e) => s + (e.calories || 0), 0)
  const totalProtein  = entries.reduce((s, e) => s + (e.protein  || 0), 0)
  const totalCarbs    = entries.reduce((s, e) => s + (e.carbs    || 0), 0)
  const totalFat      = entries.reduce((s, e) => s + (e.fat      || 0), 0)

  const calorieTarget = client?.plan?.nutrition?.calories || client?.nutritionCalcPlan?.target || 0
  const pct = calorieTarget > 0 ? Math.min(100, Math.round((totalCalories / calorieTarget) * 100)) : 0

  const isToday = date === todayStr()

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-8">

      {/* Header */}
      <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg,#0a0a0a 0%,#111827 100%)', minHeight: 140 }}>
        <div className="px-6 py-6">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold bg-amber-400 text-black px-3 py-1 rounded-full uppercase tracking-widest mb-3">
            🍽️ سجل الطعام اليومي
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <button onClick={() => setDate(d => addDays(d, -1))}
                  className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div>
                  <p className="text-white font-extrabold text-sm">{fmtDate(date)}</p>
                  {isToday && <p className="text-amber-400 text-[11px] font-bold mt-0.5">اليوم</p>}
                </div>
                <button onClick={() => setDate(d => addDays(d, 1))} disabled={isToday}
                  className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-amber-400 leading-none">{totalCalories}</p>
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide mt-0.5">kcal اليوم</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calorie progress */}
      {calorieTarget > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-extrabold text-slate-800">استهلاك السعرات</p>
            <p className="text-xs font-extrabold text-slate-500">{totalCalories} / {calorieTarget} kcal</p>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${pct > 105 ? 'bg-red-400' : pct > 90 ? 'bg-amber-400' : 'bg-emerald-400'}`}
              style={{ width: `${pct}%` }} />
          </div>
          <p className={`text-xs font-bold mt-1.5 ${pct > 105 ? 'text-red-500' : pct > 90 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {pct > 105 ? `تجاوزت الهدف بـ ${totalCalories - calorieTarget} kcal` :
             pct > 90  ? `اقتربت من الهدف — تبقى ${calorieTarget - totalCalories} kcal` :
             `تبقى ${calorieTarget - totalCalories} kcal`}
          </p>

          {/* Macros summary */}
          {(totalProtein > 0 || totalCarbs > 0 || totalFat > 0) && (
            <div className="flex gap-3 mt-3 pt-3 border-t border-slate-100">
              {[
                { label: 'بروتين', val: totalProtein, color: 'text-blue-600', unit: 'g' },
                { label: 'كربوهيدرات', val: totalCarbs, color: 'text-emerald-600', unit: 'g' },
                { label: 'دهون', val: totalFat, color: 'text-rose-500', unit: 'g' },
              ].map(m => (
                <div key={m.label} className="flex-1 text-center">
                  <p className={`text-base font-extrabold ${m.color}`}>{m.val}{m.unit}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{m.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Meal sections */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {MEALS.map(meal => (
            <MealSection key={meal.key} meal={meal} entries={entries} date={date}
              onAdd={setAddMeal}
              onDelete={setEntries}
            />
          ))}
        </div>
      )}

      {/* Empty state CTA */}
      {!loading && entries.length === 0 && (
        <div className="text-center py-4 text-slate-400 text-xs font-medium">
          ابدأ بتسجيل وجباتك لمتابعة سعراتك الحرارية يومياً
        </div>
      )}

      {addMeal && (
        <AddModal date={date} meal={addMeal} onClose={() => setAddMeal(null)} onAdded={setEntries} />
      )}
    </div>
  )
}
