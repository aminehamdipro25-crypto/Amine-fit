'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Utensils, Dumbbell, Plus, Trash2, Save, ArrowRight,
  ChevronDown, ChevronUp, Loader2, CheckCircle2, Flame, Zap, Droplets
} from 'lucide-react'

const emptyMeal = () => ({ name: '', time: '', calories: '', description: '', items: [], macros: { protein: '', carbs: '', fats: '' } })
const emptyItem = () => ({ food: '', amount: '' })
const emptyExercise = () => ({ name: '', sets: '', reps: '', rest: '', note: '' })
const emptyDay = () => ({ name: '', focus: '', description: '', exercises: [] })

function MealCard({ meal, idx, onChange, onRemove }) {
  const [open, setOpen] = useState(true)
  const update = (field, val) => onChange({ ...meal, [field]: val })
  const updateMacro = (field, val) => onChange({ ...meal, macros: { ...meal.macros, [field]: val } })
  const addItem = () => onChange({ ...meal, items: [...(meal.items || []), emptyItem()] })
  const updateItem = (i, f, v) => {
    const items = [...(meal.items || [])]
    items[i] = { ...items[i], [f]: v }
    onChange({ ...meal, items })
  }
  const removeItem = (i) => onChange({ ...meal, items: meal.items.filter((_, j) => j !== i) })

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 p-4 bg-slate-50 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="w-8 h-8 bg-[#0a0a0a] rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-gold-400 font-extrabold text-xs">{idx + 1}</span>
        </div>
        <span className="font-bold text-slate-800 flex-1 text-sm">{meal.name || `وجبة ${idx + 1}`}</span>
        <button type="button" onClick={e => { e.stopPropagation(); onRemove() }} className="p-1 text-red-400 hover:text-red-600 transition">
          <Trash2 className="w-4 h-4" />
        </button>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </div>

      {open && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">اسم الوجبة</label>
              <input value={meal.name} onChange={e => update('name', e.target.value)} placeholder="فطور، غداء..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">الوقت</label>
              <input value={meal.time} onChange={e => update('time', e.target.value)} placeholder="7:00 صباحاً"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">وصف الوجبة</label>
            <textarea value={meal.description} onChange={e => update('description', e.target.value)} rows={2} placeholder="وصف مختصر..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium resize-none" />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { f: 'calories', label: 'سعرات', placeholder: '500' },
              { f: 'protein',  label: 'بروتين (غ)', placeholder: '40', macro: true },
              { f: 'carbs',    label: 'كارب (غ)',   placeholder: '60', macro: true },
              { f: 'fats',     label: 'دهون (غ)',   placeholder: '15', macro: true },
            ].map(({ f, label, placeholder, macro }) => (
              <div key={f}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">{label}</label>
                <input type="number" value={macro ? meal.macros?.[f] : meal[f]}
                  onChange={e => macro ? updateMacro(f, e.target.value) : update(f, e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-2 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
              </div>
            ))}
          </div>

          {/* Food items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">الأطعمة</label>
              <button type="button" onClick={addItem}
                className="flex items-center gap-1 text-xs font-bold text-gold-600 hover:text-gold-700 transition">
                <Plus className="w-3.5 h-3.5" /> إضافة
              </button>
            </div>
            {(meal.items || []).map((item, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={item.food} onChange={e => updateItem(i, 'food', e.target.value)} placeholder="الطعام"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
                <input value={item.amount} onChange={e => updateItem(i, 'amount', e.target.value)} placeholder="الكمية"
                  className="w-28 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
                <button type="button" onClick={() => removeItem(i)} className="p-2 text-red-300 hover:text-red-500 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DayCard({ day, idx, onChange, onRemove }) {
  const [open, setOpen] = useState(true)
  const update = (field, val) => onChange({ ...day, [field]: val })
  const addExercise = () => onChange({ ...day, exercises: [...(day.exercises || []), emptyExercise()] })
  const updateEx = (i, f, v) => {
    const exercises = [...(day.exercises || [])]
    exercises[i] = { ...exercises[i], [f]: v }
    onChange({ ...day, exercises })
  }
  const removeEx = (i) => onChange({ ...day, exercises: day.exercises.filter((_, j) => j !== i) })

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 p-4 bg-slate-50 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="w-8 h-8 bg-[#0a0a0a] rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-gold-400 font-extrabold text-xs">{idx + 1}</span>
        </div>
        <span className="font-bold text-slate-800 flex-1 text-sm">{day.name || `اليوم ${idx + 1}`}</span>
        <button type="button" onClick={e => { e.stopPropagation(); onRemove() }} className="p-1 text-red-400 hover:text-red-600 transition">
          <Trash2 className="w-4 h-4" />
        </button>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </div>

      {open && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">اسم اليوم</label>
              <input value={day.name} onChange={e => update('name', e.target.value)} placeholder="يوم الصدر..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">التركيز</label>
              <input value={day.focus} onChange={e => update('focus', e.target.value)} placeholder="صدر وكتف..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">وصف اليوم</label>
            <textarea value={day.description} onChange={e => update('description', e.target.value)} rows={2} placeholder="وصف..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium resize-none" />
          </div>

          {/* Exercises */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">التمارين</label>
              <button type="button" onClick={addExercise}
                className="flex items-center gap-1 text-xs font-bold text-gold-600 hover:text-gold-700 transition">
                <Plus className="w-3.5 h-3.5" /> إضافة تمرين
              </button>
            </div>
            {(day.exercises || []).map((ex, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-xl p-3 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-slate-400">تمرين {i + 1}</span>
                  <button type="button" onClick={() => removeEx(i)} className="p-1 text-red-300 hover:text-red-500 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input value={ex.name} onChange={e => updateEx(i, 'name', e.target.value)} placeholder="اسم التمرين"
                    className="col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
                  <input value={ex.sets} onChange={e => updateEx(i, 'sets', e.target.value)} placeholder="مجموعات (3)"
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
                  <input value={ex.reps} onChange={e => updateEx(i, 'reps', e.target.value)} placeholder="تكرارات (12)"
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
                  <input value={ex.rest} onChange={e => updateEx(i, 'rest', e.target.value)} placeholder="الراحة (60 ثانية)"
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
                  <input value={ex.note} onChange={e => updateEx(i, 'note', e.target.value)} placeholder="ملاحظة"
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PlanBuilder({ client }) {
  const router = useRouter()
  const existing = client.plan || {}

  const [tab, setTab] = useState('nutrition')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Nutrition state
  const [calories, setCalories] = useState(existing.nutrition?.calories || '')
  const [protein, setProtein]   = useState(existing.nutrition?.protein  || '')
  const [carbs, setCarbs]       = useState(existing.nutrition?.carbs    || '')
  const [fats, setFats]         = useState(existing.nutrition?.fats     || '')
  const [nutritionNote, setNNote] = useState(existing.nutrition?.note   || '')
  const [nutritionTips, setNTips] = useState(existing.nutrition?.tips?.join('\n') || '')
  const [meals, setMeals]       = useState(existing.nutrition?.meals    || [])

  // Training state
  const [daysPerWeek, setDPW]   = useState(existing.training?.daysPerWeek || '')
  const [duration, setDuration] = useState(existing.training?.duration    || '')
  const [level, setLevel]       = useState(existing.training?.level       || '')
  const [trainingNote, setTNote] = useState(existing.training?.note       || '')
  const [trainingTips, setTTips] = useState(existing.training?.tips?.join('\n') || '')
  const [days, setDays]         = useState(existing.training?.days        || [])

  const updateMeal = (i, val) => { const m = [...meals]; m[i] = val; setMeals(m) }
  const removeMeal = (i) => setMeals(meals.filter((_, j) => j !== i))
  const updateDay  = (i, val) => { const d = [...days]; d[i] = val; setDays(d) }
  const removeDay  = (i) => setDays(days.filter((_, j) => j !== i))

  async function save() {
    setSaving(true)
    setSaved(false)
    const plan = {
      nutrition: {
        calories, protein, carbs, fats,
        note: nutritionNote,
        tips: nutritionTips.split('\n').map(t => t.trim()).filter(Boolean),
        meals,
      },
      training: {
        daysPerWeek, duration, level,
        note: trainingNote,
        tips: trainingTips.split('\n').map(t => t.trim()).filter(Boolean),
        days,
      },
    }
    try {
      await fetch(`/api/register/${client.id}/plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition text-slate-600">
          <ArrowRight className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">بناء الخطة</p>
          <h1 className="text-xl font-extrabold text-slate-900">{client.name}</h1>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] text-white rounded-xl font-bold text-sm hover:bg-black transition disabled:opacity-50 shadow-sm">
          {saving
            ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...</>
            : saved
              ? <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> تم الحفظ</>
              : <><Save className="w-4 h-4" /> حفظ الخطة</>
          }
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'nutrition', label: 'الخطة الغذائية', icon: Utensils },
          { key: 'training',  label: 'الخطة التدريبية', icon: Dumbbell },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all border
              ${tab === key
                ? 'bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-sm'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Nutrition tab */}
      {tab === 'nutrition' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h2 className="font-extrabold text-slate-800 flex items-center gap-2">
              <Flame className="w-4 h-4 text-gold-500" /> الماكرو اليومي
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { f: calories, set: setCalories, label: 'السعرات (kcal)', ph: '2000' },
                { f: protein,  set: setProtein,  label: 'بروتين (غ)',     ph: '150' },
                { f: carbs,    set: setCarbs,    label: 'كربوهيدرات (غ)', ph: '250' },
                { f: fats,     set: setFats,     label: 'دهون (غ)',        ph: '60' },
              ].map(({ f, set, label, ph }) => (
                <div key={label}>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">{label}</label>
                  <input type="number" value={f} onChange={e => set(e.target.value)} placeholder={ph}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">ملاحظة للعميل</label>
              <textarea value={nutritionNote} onChange={e => setNNote(e.target.value)} rows={2} placeholder="ملاحظة تظهر في أعلى صفحة الخطة..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium resize-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">نصائح (سطر لكل نصيحة)</label>
              <textarea value={nutritionTips} onChange={e => setNTips(e.target.value)} rows={3} placeholder="اشرب 3 لتر ماء يومياً&#10;لا تتخطى وجبة الفطور..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium resize-none" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-slate-800 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-gold-500" /> الوجبات ({meals.length})
              </h2>
              <button onClick={() => setMeals(m => [...m, emptyMeal()])}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gold-400 text-black font-bold text-xs hover:bg-gold-300 transition">
                <Plus className="w-3.5 h-3.5" /> إضافة وجبة
              </button>
            </div>
            {meals.map((meal, i) => (
              <MealCard key={i} meal={meal} idx={i} onChange={v => updateMeal(i, v)} onRemove={() => removeMeal(i)} />
            ))}
            {meals.length === 0 && (
              <div className="text-center py-8 text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">
                <p className="text-sm font-medium">لا توجد وجبات بعد</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Training tab */}
      {tab === 'training' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h2 className="font-extrabold text-slate-800 flex items-center gap-2">
              <Zap className="w-4 h-4 text-slate-600" /> إعدادات البرنامج
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">أيام/أسبوع</label>
                <input type="number" value={daysPerWeek} onChange={e => setDPW(e.target.value)} placeholder="5"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">المدة (دقيقة)</label>
                <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="60"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">المستوى</label>
                <select value={level} onChange={e => setLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium bg-white appearance-none">
                  <option value="">اختر...</option>
                  <option value="مبتدئ">مبتدئ</option>
                  <option value="متوسط">متوسط</option>
                  <option value="متقدم">متقدم</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">ملاحظة للعميل</label>
              <textarea value={trainingNote} onChange={e => setTNote(e.target.value)} rows={2} placeholder="ملاحظة تظهر في أعلى صفحة الخطة..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium resize-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">نصائح (سطر لكل نصيحة)</label>
              <textarea value={trainingTips} onChange={e => setTTips(e.target.value)} rows={3} placeholder="احمِّ عضلاتك قبل التمرين&#10;اشرب ماء كافياً..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium resize-none" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-slate-800 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-slate-600" /> أيام التدريب ({days.length})
              </h2>
              <button onClick={() => setDays(d => [...d, emptyDay()])}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0a0a0a] text-white font-bold text-xs hover:bg-black transition">
                <Plus className="w-3.5 h-3.5" /> إضافة يوم
              </button>
            </div>
            {days.map((day, i) => (
              <DayCard key={i} day={day} idx={i} onChange={v => updateDay(i, v)} onRemove={() => removeDay(i)} />
            ))}
            {days.length === 0 && (
              <div className="text-center py-8 text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">
                <p className="text-sm font-medium">لا توجد أيام بعد</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save button (bottom) */}
      <div className="flex justify-end pb-6">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-[#0a0a0a] text-white rounded-xl font-bold hover:bg-black transition disabled:opacity-50 shadow-sm">
          {saving
            ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...</>
            : saved
              ? <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> تم الحفظ بنجاح ✓</>
              : <><Save className="w-4 h-4" /> حفظ الخطة</>
          }
        </button>
      </div>
    </div>
  )
}
