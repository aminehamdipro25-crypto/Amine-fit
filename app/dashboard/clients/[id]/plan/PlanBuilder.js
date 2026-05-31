'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Utensils, Dumbbell, Plus, Trash2, Save, ArrowRight,
  ChevronDown, ChevronUp, Loader2, CheckCircle2, Flame, Zap, Sparkles,
} from 'lucide-react'

const emptyMeal     = () => ({ name:'', time:'', calories:'', description:'', items:[], macros:{ protein:'', carbs:'', fats:'' } })
const emptyItem     = () => ({ food:'', amount:'' })
const emptyExercise = () => ({ name:'', sets:'', reps:'', rest:'', note:'', videoUrl:'' })
const emptyDay      = () => ({ name:'', focus:'', description:'', exercises:[] })

/* ── Training templates ──────────────────────────────────────────────────── */
const TEMPLATES = {
  ppl: {
    label: 'Push / Pull / Legs',
    emoji: '💪',
    days: [
      { name:'يوم الدفع (Push)', focus:'صدر وكتف وذراعين', description:'تمارين الدفع — صدر، كتف، ترايسبس', exercises:[
        { name:'بنش بريس', sets:'4', reps:'10-12', rest:'90 ثانية', note:'احرص على لمس الصدر في كل تكرار', videoUrl:'' },
        { name:'الدمبل الإمالة', sets:'3', reps:'12', rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'ضغط الكتف بالبار', sets:'4', reps:'10', rest:'90 ثانية', note:'', videoUrl:'' },
        { name:'رفع جانبي دمبل', sets:'3', reps:'15', rest:'45 ثانية', note:'', videoUrl:'' },
        { name:'ترايسبس كيبل', sets:'3', reps:'15', rest:'45 ثانية', note:'', videoUrl:'' },
      ]},
      { name:'يوم السحب (Pull)', focus:'ظهر وبايسبس', description:'تمارين السحب — ظهر، بايسبس', exercises:[
        { name:'سحب بار عريض', sets:'4', reps:'8-10', rest:'90 ثانية', note:'ابدأ بالعضلة لا الذراع', videoUrl:'' },
        { name:'رو بار', sets:'4', reps:'10', rest:'90 ثانية', note:'', videoUrl:'' },
        { name:'سحب كيبل ضيق', sets:'3', reps:'12', rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'بايسبس كيبل', sets:'3', reps:'15', rest:'45 ثانية', note:'', videoUrl:'' },
        { name:'هامر كيرل دمبل', sets:'3', reps:'12', rest:'45 ثانية', note:'', videoUrl:'' },
      ]},
      { name:'يوم الأرجل (Legs)', focus:'أرجل وبطن', description:'تمارين الأرجل والبطن', exercises:[
        { name:'سكوات', sets:'5', reps:'8-10', rest:'2 دقيقة', note:'ظهر مستقيم، ركبة لا تتجاوز القدم', videoUrl:'' },
        { name:'ليغ بريس', sets:'4', reps:'12', rest:'90 ثانية', note:'', videoUrl:'' },
        { name:'ليغ كيرل', sets:'3', reps:'15', rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'كاف ريز', sets:'4', reps:'20', rest:'45 ثانية', note:'', videoUrl:'' },
        { name:'بلانك', sets:'3', reps:'60 ثانية', rest:'30 ثانية', note:'', videoUrl:'' },
      ]},
    ],
  },
  upper_lower: {
    label: 'Upper / Lower',
    emoji: '🔄',
    days: [
      { name:'يوم الجزء العلوي (أ)', focus:'صدر وظهر', description:'صدر وظهر — حجم', exercises:[
        { name:'بنش بريس', sets:'4', reps:'8-10', rest:'90 ثانية', note:'', videoUrl:'' },
        { name:'سحب بار', sets:'4', reps:'8-10', rest:'90 ثانية', note:'', videoUrl:'' },
        { name:'دمبل كتف', sets:'3', reps:'12', rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'رو دمبل', sets:'3', reps:'12', rest:'60 ثانية', note:'', videoUrl:'' },
      ]},
      { name:'يوم الجزء السفلي (أ)', focus:'أرجل', description:'سكوات وتمارين الحجم', exercises:[
        { name:'سكوات', sets:'4', reps:'8-10', rest:'2 دقيقة', note:'', videoUrl:'' },
        { name:'ليغ بريس', sets:'3', reps:'12', rest:'90 ثانية', note:'', videoUrl:'' },
        { name:'ليغ كيرل', sets:'3', reps:'12', rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'كاف ريز', sets:'4', reps:'15', rest:'45 ثانية', note:'', videoUrl:'' },
      ]},
      { name:'يوم الجزء العلوي (ب)', focus:'كتف وذراعين', description:'كتف وذراعين — قوة', exercises:[
        { name:'ضغط الكتف أوفر هيد', sets:'4', reps:'10', rest:'90 ثانية', note:'', videoUrl:'' },
        { name:'رفع جانبي', sets:'3', reps:'15', rest:'45 ثانية', note:'', videoUrl:'' },
        { name:'بايسبس بار', sets:'3', reps:'10', rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'ترايسبس دمبل', sets:'3', reps:'12', rest:'60 ثانية', note:'', videoUrl:'' },
      ]},
      { name:'يوم الجزء السفلي (ب)', focus:'أرجل وبطن', description:'ديدليفت وتمارين الطاقة', exercises:[
        { name:'ديدليفت', sets:'4', reps:'5-6', rest:'2 دقيقة', note:'ظهر مستقيم', videoUrl:'' },
        { name:'لانج', sets:'3', reps:'12 (كل رجل)', rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'بطن جهاز', sets:'3', reps:'20', rest:'45 ثانية', note:'', videoUrl:'' },
        { name:'هايبر اكستنشن', sets:'3', reps:'15', rest:'45 ثانية', note:'', videoUrl:'' },
      ]},
    ],
  },
  full_body: {
    label: 'Full Body 3x',
    emoji: '⚡',
    days: [
      { name:'اليوم الكامل (أ)', focus:'كامل', description:'تمارين كاملة — قوة', exercises:[
        { name:'سكوات', sets:'3', reps:'8', rest:'2 دقيقة', note:'', videoUrl:'' },
        { name:'بنش بريس', sets:'3', reps:'8', rest:'90 ثانية', note:'', videoUrl:'' },
        { name:'سحب بار', sets:'3', reps:'8', rest:'90 ثانية', note:'', videoUrl:'' },
        { name:'ضغط الكتف', sets:'3', reps:'10', rest:'90 ثانية', note:'', videoUrl:'' },
        { name:'بلانك', sets:'3', reps:'45 ثانية', rest:'30 ثانية', note:'', videoUrl:'' },
      ]},
      { name:'اليوم الكامل (ب)', focus:'كامل', description:'تمارين كاملة — حجم', exercises:[
        { name:'ديدليفت رومانياني', sets:'3', reps:'10', rest:'90 ثانية', note:'', videoUrl:'' },
        { name:'دمبل إمالة', sets:'3', reps:'12', rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'رو كيبل', sets:'3', reps:'12', rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'رفع جانبي', sets:'3', reps:'15', rest:'45 ثانية', note:'', videoUrl:'' },
        { name:'كرانش', sets:'3', reps:'20', rest:'30 ثانية', note:'', videoUrl:'' },
      ]},
      { name:'اليوم الكامل (ج)', focus:'كامل', description:'تمارين كاملة — تحمل', exercises:[
        { name:'لانج', sets:'3', reps:'12 (كل رجل)', rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'بنش دمبل', sets:'3', reps:'15', rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'سحب كيبل', sets:'3', reps:'15', rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'برباج', sets:'3', reps:'12', rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'ليغ ريز', sets:'3', reps:'15', rest:'45 ثانية', note:'', videoUrl:'' },
      ]},
    ],
  },
}

const FOCUS_OPTIONS = ['صدر', 'ظهر', 'كتف', 'ذراعين', 'أرجل', 'بطن', 'كارديو', 'كامل', 'صدر وكتف', 'ظهر وبايسبس']

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
              <select value={day.focus} onChange={e => update('focus', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium bg-white">
                <option value="">اختر العضلة...</option>
                {FOCUS_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
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
                  <input value={ex.note} onChange={e => updateEx(i, 'note', e.target.value)} placeholder="ملاحظة للعميل"
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
                  <input value={ex.videoUrl || ''} onChange={e => updateEx(i, 'videoUrl', e.target.value)} placeholder="رابط فيديو (YouTube)"
                    className="col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
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
          <p className="text-xs text-slate-400 mt-0.5" dir="ltr">{client.email}</p>
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

      {/* How it works banner */}
      <div className="bg-[#0a0a0a] rounded-2xl px-5 py-4 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-white text-xs font-extrabold mb-1">كيف تصل الخطة للعميل؟</p>
          <p className="text-white/40 text-xs leading-relaxed">
            ابنِ الخطة الغذائية والتدريبية ثم اضغط <span className="text-gold-400 font-bold">حفظ الخطة</span> — سيجدها العميل فوراً حين يدخل بوابته على{' '}
            <span className="text-gold-400 font-bold" dir="ltr">amine-fit.vercel.app/client/login</span>{' '}
            ببريده الإلكتروني وكلمة المرور التي ضبطتها له.
          </p>
        </div>
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

          {/* Templates */}
          <div className="bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-gold-500" />
              <h3 className="font-extrabold text-slate-700 text-sm">قوالب جاهزة</h3>
              <span className="text-xs text-slate-400 font-medium">— اختر نموذجاً كنقطة انطلاق</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TEMPLATES).map(([key, tpl]) => (
                <button key={key} type="button"
                  onClick={() => { if (confirm(`هل تريد تحميل قالب "${tpl.label}"؟ سيُستبدل الأيام الحالية.`)) setDays(tpl.days.map(d => ({ ...d, exercises: d.exercises.map(e => ({ ...e })) }))) }}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl border border-slate-200 hover:border-gold-400 hover:bg-gold-50 transition text-center">
                  <span className="text-2xl">{tpl.emoji}</span>
                  <span className="text-[10px] font-extrabold text-slate-700 leading-tight">{tpl.label}</span>
                </button>
              ))}
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
