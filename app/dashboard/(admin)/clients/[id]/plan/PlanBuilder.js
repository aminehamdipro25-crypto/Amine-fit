'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Utensils, Dumbbell, Plus, Trash2, Save, ArrowRight,
  ChevronDown, ChevronUp, Loader2, CheckCircle2, Flame, Zap,
  Sparkles, LogIn, Download, Info, X, Brain, Wand2,
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
    desc: '٣ أيام — صدر/ظهر/أرجل',
    days: [
      { name:'يوم الدفع (Push)', focus:'صدر وكتف', description:'', exercises:[
        { name:'بنش بريس',           sets:'4', reps:'10-12', rest:'90 ثانية', note:'احرص على لمس الصدر في كل تكرار', videoUrl:'' },
        { name:'الدمبل الإمالة',     sets:'3', reps:'12',    rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'ضغط الكتف بالبار',   sets:'4', reps:'10',    rest:'90 ثانية', note:'', videoUrl:'' },
        { name:'رفع جانبي دمبل',     sets:'3', reps:'15',    rest:'45 ثانية', note:'', videoUrl:'' },
        { name:'ترايسبس كيبل',       sets:'3', reps:'15',    rest:'45 ثانية', note:'', videoUrl:'' },
      ]},
      { name:'يوم السحب (Pull)', focus:'ظهر وبايسبس', description:'', exercises:[
        { name:'سحب بار عريض',       sets:'4', reps:'8-10',  rest:'90 ثانية', note:'ابدأ بالعضلة لا الذراع', videoUrl:'' },
        { name:'رو بار',             sets:'4', reps:'10',    rest:'90 ثانية', note:'', videoUrl:'' },
        { name:'سحب كيبل ضيق',       sets:'3', reps:'12',    rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'بايسبس كيبل',        sets:'3', reps:'15',    rest:'45 ثانية', note:'', videoUrl:'' },
        { name:'هامر كيرل دمبل',     sets:'3', reps:'12',    rest:'45 ثانية', note:'', videoUrl:'' },
      ]},
      { name:'يوم الأرجل (Legs)', focus:'أرجل', description:'', exercises:[
        { name:'سكوات',              sets:'5', reps:'8-10',  rest:'2 دقيقة',  note:'ظهر مستقيم، ركبة لا تتجاوز القدم', videoUrl:'' },
        { name:'ليغ بريس',           sets:'4', reps:'12',    rest:'90 ثانية', note:'', videoUrl:'' },
        { name:'ليغ كيرل',           sets:'3', reps:'15',    rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'كاف ريز',            sets:'4', reps:'20',    rest:'45 ثانية', note:'', videoUrl:'' },
        { name:'بلانك',              sets:'3', reps:'60 ثانية', rest:'30 ثانية', note:'', videoUrl:'' },
      ]},
    ],
  },
  upper_lower: {
    label: 'Upper / Lower',
    emoji: '🔄',
    desc: '٤ أيام — علوي/سفلي',
    days: [
      { name:'يوم الجزء العلوي (أ)', focus:'صدر وظهر', description:'', exercises:[
        { name:'بنش بريس',           sets:'4', reps:'8-10',  rest:'90 ثانية', note:'', videoUrl:'' },
        { name:'سحب بار',            sets:'4', reps:'8-10',  rest:'90 ثانية', note:'', videoUrl:'' },
        { name:'دمبل كتف',           sets:'3', reps:'12',    rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'رو دمبل',            sets:'3', reps:'12',    rest:'60 ثانية', note:'', videoUrl:'' },
      ]},
      { name:'يوم الجزء السفلي (أ)', focus:'أرجل', description:'', exercises:[
        { name:'سكوات',              sets:'4', reps:'8-10',  rest:'2 دقيقة',  note:'', videoUrl:'' },
        { name:'ليغ بريس',           sets:'3', reps:'12',    rest:'90 ثانية', note:'', videoUrl:'' },
        { name:'ليغ كيرل',           sets:'3', reps:'12',    rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'كاف ريز',            sets:'4', reps:'15',    rest:'45 ثانية', note:'', videoUrl:'' },
      ]},
      { name:'يوم الجزء العلوي (ب)', focus:'كتف وذراعين', description:'', exercises:[
        { name:'ضغط الكتف أوفر هيد', sets:'4', reps:'10',    rest:'90 ثانية', note:'', videoUrl:'' },
        { name:'رفع جانبي',          sets:'3', reps:'15',    rest:'45 ثانية', note:'', videoUrl:'' },
        { name:'بايسبس بار',         sets:'3', reps:'10',    rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'ترايسبس دمبل',       sets:'3', reps:'12',    rest:'60 ثانية', note:'', videoUrl:'' },
      ]},
      { name:'يوم الجزء السفلي (ب)', focus:'أرجل وبطن', description:'', exercises:[
        { name:'ديدليفت',            sets:'4', reps:'5-6',   rest:'2 دقيقة',  note:'ظهر مستقيم', videoUrl:'' },
        { name:'لانج',               sets:'3', reps:'12 لكل رجل', rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'بطن جهاز',           sets:'3', reps:'20',    rest:'45 ثانية', note:'', videoUrl:'' },
        { name:'هايبر اكستنشن',      sets:'3', reps:'15',    rest:'45 ثانية', note:'', videoUrl:'' },
      ]},
    ],
  },
  full_body: {
    label: 'Full Body 3×',
    emoji: '⚡',
    desc: '٣ أيام — جسم كامل',
    days: [
      { name:'اليوم الكامل (أ)', focus:'كامل', description:'', exercises:[
        { name:'سكوات',              sets:'3', reps:'8',     rest:'2 دقيقة',  note:'', videoUrl:'' },
        { name:'بنش بريس',           sets:'3', reps:'8',     rest:'90 ثانية', note:'', videoUrl:'' },
        { name:'سحب بار',            sets:'3', reps:'8',     rest:'90 ثانية', note:'', videoUrl:'' },
        { name:'ضغط الكتف',          sets:'3', reps:'10',    rest:'90 ثانية', note:'', videoUrl:'' },
        { name:'بلانك',              sets:'3', reps:'45 ثانية', rest:'30 ثانية', note:'', videoUrl:'' },
      ]},
      { name:'اليوم الكامل (ب)', focus:'كامل', description:'', exercises:[
        { name:'ديدليفت رومانياني',  sets:'3', reps:'10',    rest:'90 ثانية', note:'', videoUrl:'' },
        { name:'دمبل إمالة',         sets:'3', reps:'12',    rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'رو كيبل',            sets:'3', reps:'12',    rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'رفع جانبي',          sets:'3', reps:'15',    rest:'45 ثانية', note:'', videoUrl:'' },
        { name:'كرانش',              sets:'3', reps:'20',    rest:'30 ثانية', note:'', videoUrl:'' },
      ]},
      { name:'اليوم الكامل (ج)', focus:'كامل', description:'', exercises:[
        { name:'لانج',               sets:'3', reps:'12 لكل رجل', rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'بنش دمبل',           sets:'3', reps:'15',    rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'سحب كيبل',           sets:'3', reps:'15',    rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'برباج',              sets:'3', reps:'12',    rest:'60 ثانية', note:'', videoUrl:'' },
        { name:'ليغ ريز',            sets:'3', reps:'15',    rest:'45 ثانية', note:'', videoUrl:'' },
      ]},
    ],
  },
}

const FOCUS_OPTIONS = ['صدر', 'ظهر', 'كتف', 'ذراعين', 'أرجل', 'بطن', 'كارديو', 'كامل', 'صدر وكتف', 'ظهر وبايسبس']
const FOCUS_ICONS   = { 'صدر':'🫀','ظهر':'🔙','كتف':'💪','ذراعين':'💪','أرجل':'🦵','بطن':'⚡','كارديو':'🏃','كامل':'⚡','صدر وكتف':'🫀','ظهر وبايسبس':'🔙' }

/* ── ExerciseRow — compact inline edit ───────────────────────────────────── */
function ExerciseRow({ ex, idx, onChange, onRemove }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      {/* Compact row */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="w-6 h-6 bg-slate-100 rounded-lg text-slate-500 text-[10px] font-extrabold flex items-center justify-center flex-shrink-0">
          {idx + 1}
        </span>
        <input
          value={ex.name}
          onChange={e => onChange({ ...ex, name: e.target.value })}
          placeholder="اسم التمرين..."
          className="flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-300 min-w-0"
        />
        <input
          value={ex.sets}
          onChange={e => onChange({ ...ex, sets: e.target.value })}
          placeholder="3"
          title="عدد المجموعات"
          className="w-9 text-center text-xs font-bold text-slate-700 bg-slate-50 rounded-lg py-1 border border-slate-200 outline-none focus:border-gold-400 transition"
        />
        <span className="text-slate-300 text-xs font-bold select-none">×</span>
        <input
          value={ex.reps}
          onChange={e => onChange({ ...ex, reps: e.target.value })}
          placeholder="12"
          title="عدد التكرارات"
          className="w-12 text-center text-xs font-bold text-slate-700 bg-slate-50 rounded-lg py-1 border border-slate-200 outline-none focus:border-gold-400 transition"
        />
        <input
          value={ex.rest}
          onChange={e => onChange({ ...ex, rest: e.target.value })}
          placeholder="60ث"
          title="الراحة"
          className="w-14 text-center text-[11px] text-slate-500 bg-slate-50 rounded-lg py-1 border border-slate-200 outline-none focus:border-gold-400 transition"
        />
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          title="ملاحظة / فيديو"
          className={`p-1 rounded-lg transition flex-shrink-0 ${open ? 'bg-slate-100 text-slate-600' : 'text-slate-300 hover:text-slate-500'}`}
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
        <button type="button" onClick={onRemove} className="p-1 text-red-200 hover:text-red-500 transition flex-shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Expandable details */}
      {open && (
        <div className="border-t border-slate-50 bg-slate-50/50 px-3 pb-3 pt-2 space-y-2">
          <input
            value={ex.note || ''}
            onChange={e => onChange({ ...ex, note: e.target.value })}
            placeholder="ملاحظة للعميل — اختياري"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-gold-400 transition font-medium"
          />
          <input
            value={ex.videoUrl || ''}
            onChange={e => onChange({ ...ex, videoUrl: e.target.value })}
            placeholder="رابط YouTube للشرح — اختياري"
            dir="ltr"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-gold-400 transition font-medium"
          />
        </div>
      )}
    </div>
  )
}

/* ── MealCard ─────────────────────────────────────────────────────────────── */
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
        {meal.calories && <span className="text-xs font-bold text-slate-400">{meal.calories} kcal</span>}
        <button type="button" onClick={e => { e.stopPropagation(); onRemove() }} className="p-1 text-red-400 hover:text-red-600 transition">
          <Trash2 className="w-4 h-4" />
        </button>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </div>

      {open && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">اسم الوجبة</label>
              <input value={meal.name} onChange={e => update('name', e.target.value)} placeholder="فطور، غداء..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">الوقت</label>
              <input value={meal.time} onChange={e => update('time', e.target.value)} placeholder="7:00 صباحاً"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { f: 'calories', label: 'سعرات', placeholder: '500' },
              { f: 'protein',  label: 'بروتين غ', placeholder: '40', macro: true },
              { f: 'carbs',    label: 'كارب غ',   placeholder: '60', macro: true },
              { f: 'fats',     label: 'دهون غ',   placeholder: '15', macro: true },
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

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">وصف اختياري</label>
            <textarea value={meal.description} onChange={e => update('description', e.target.value)} rows={2} placeholder="وصف مختصر..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium resize-none" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">الأطعمة</label>
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

/* ── DayCard ──────────────────────────────────────────────────────────────── */
function DayCard({ day, idx, onChange, onRemove }) {
  const [open, setOpen] = useState(true)
  const update = (field, val) => onChange({ ...day, [field]: val })
  const addExercise = () => onChange({ ...day, exercises: [...(day.exercises || []), emptyExercise()] })
  const updateEx = (i, val) => {
    const exercises = [...(day.exercises || [])]
    exercises[i] = val
    onChange({ ...day, exercises })
  }
  const removeEx = (i) => onChange({ ...day, exercises: day.exercises.filter((_, j) => j !== i) })
  const focusIcon = FOCUS_ICONS[day.focus] || '🏋️'

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 p-4 bg-slate-50 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="w-8 h-8 bg-[#0a0a0a] rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-gold-400 font-extrabold text-xs">{idx + 1}</span>
        </div>
        <span className="text-lg">{focusIcon}</span>
        <div className="flex-1 min-w-0">
          <span className="font-bold text-slate-800 text-sm block truncate">{day.name || `اليوم ${idx + 1}`}</span>
          {day.focus && <span className="text-xs text-slate-400">{day.focus} · {day.exercises?.length || 0} تمارين</span>}
        </div>
        <button type="button" onClick={e => { e.stopPropagation(); onRemove() }} className="p-1 text-red-400 hover:text-red-600 transition">
          <Trash2 className="w-4 h-4" />
        </button>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </div>

      {open && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">اسم اليوم</label>
              <input value={day.name} onChange={e => update('name', e.target.value)} placeholder="يوم الصدر..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">العضلة المستهدفة</label>
              <select value={day.focus} onChange={e => update('focus', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium bg-white">
                <option value="">اختر...</option>
                {FOCUS_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* Exercises header */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-xs font-extrabold text-slate-600">التمارين</p>
              <p className="text-[10px] text-slate-400">المجموعات × التكرارات · الراحة — اضغط ↓ لإضافة ملاحظة أو فيديو</p>
            </div>
            <button type="button" onClick={addExercise}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0a0a0a] text-white font-bold text-[11px] hover:bg-black transition">
              <Plus className="w-3 h-3" /> إضافة
            </button>
          </div>

          {(day.exercises || []).length === 0 ? (
            <div className="text-center py-5 border-2 border-dashed border-slate-100 rounded-xl">
              <p className="text-xs text-slate-300 font-medium">لا تمارين — اضغط "إضافة" أو اختر قالباً</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {(day.exercises || []).map((ex, i) => (
                <ExerciseRow key={i} ex={ex} idx={i} onChange={v => updateEx(i, v)} onRemove={() => removeEx(i)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Toast ───────────────────────────────────────────────────────────────── */
function Toast({ msg, onClose }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#0a0a0a] text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold animate-fade-in">
      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
      {msg}
      <button onClick={onClose} className="mr-2 text-white/40 hover:text-white/80 transition"><X className="w-3.5 h-3.5" /></button>
    </div>
  )
}

/* ── Main PlanBuilder ─────────────────────────────────────────────────────── */
export default function PlanBuilder({ client }) {
  const router = useRouter()
  const existing = client.plan || {}
  const [previewing, setPreviewing] = useState(false)

  async function previewAsClient() {
    if (!confirm(`ستدخل كالعميل "${client.name}" وستُفتح بوابته في تبويب جديد. هل تريد المتابعة؟`)) return
    setPreviewing(true)
    try {
      const res  = await fetch(`/api/admin/preview-client/${client.id}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { alert(data.error || 'فشل تسجيل الدخول كالعميل'); return }
      if (data.success) {
        const tab = window.open('/client/dashboard', '_blank')
        if (!tab) alert('يرجى السماح بفتح النوافذ المنبثقة في المتصفح')
      }
    } catch { alert('حدث خطأ، تحقق من الاتصال') }
    finally { setPreviewing(false) }
  }

  const [tab, setTab]     = useState('nutrition')
  const [saving, setSaving] = useState(false)
  const [toast, setToast]   = useState('')

  // Nutrition state
  const [calories, setCalories] = useState(existing.nutrition?.calories || '')
  const [protein, setProtein]   = useState(existing.nutrition?.protein  || '')
  const [carbs, setCarbs]       = useState(existing.nutrition?.carbs    || '')
  const [fats, setFats]         = useState(existing.nutrition?.fats     || '')
  const [nutritionNote, setNNote] = useState(existing.nutrition?.note   || '')
  const [nutritionTips, setNTips] = useState(existing.nutrition?.tips?.join('\n') || '')
  const [meals, setMeals]       = useState(existing.nutrition?.meals    || [])
  const [importStatus, setImportStatus] = useState('')

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

  /* Import macros + meals from the calculator (localStorage) */
  function importFromCalculator() {
    try {
      const raw = localStorage.getItem('amineFitPlan')
      if (!raw) {
        setImportStatus('لم تُنشئ خطة في الحاسبة بعد — اذهب إلى الحاسبة أولاً ثم ارجع هنا.')
        return
      }
      const plan = JSON.parse(raw)
      const { target, ex, menu } = plan

      // Macros
      if (target)      setCalories(String(Math.round(target)))
      if (ex?.macros) {
        setProtein(String(Math.round(ex.macros.protein || 0)))
        setCarbs(String(Math.round(ex.macros.carbs    || 0)))
        setFats(String(Math.round(ex.macros.fat       || 0)))
      }

      // Meals
      if (Array.isArray(menu) && menu.length > 0) {
        setMeals(menu.map(m => ({
          name:        m.name        || '',
          time:        m.time        || '',
          calories:    String(Math.round(m.kcal    || 0)),
          description: '',
          macros: {
            protein: String(Math.round(m.protein || 0)),
            carbs:   String(Math.round(m.carbs   || 0)),
            fats:    String(Math.round(m.fat     || 0)),
          },
          items: (m.items || []).map(item => ({
            food:   item.food   || '',
            amount: item.amount || '',
          })),
        })))
      }

      setImportStatus('ok')
      setTimeout(() => setImportStatus(''), 4000)
    } catch {
      setImportStatus('حدث خطأ أثناء الاستيراد.')
    }
  }

  async function save() {
    setSaving(true)
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
      setToast('تم حفظ الخطة بنجاح ✓')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()}
          className="p-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition text-slate-600">
          <ArrowRight className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">بناء الخطة</p>
          <h1 className="text-xl font-extrabold text-slate-900">{client.name}</h1>
          <p className="text-xs text-slate-400 mt-0.5" dir="ltr">{client.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={previewAsClient} disabled={previewing}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition disabled:opacity-50 shadow-sm">
            {previewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            دخول كالعميل
          </button>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] text-white rounded-xl font-bold text-sm hover:bg-black transition disabled:opacity-50 shadow-sm">
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...</>
              : <><Save className="w-4 h-4" /> حفظ الخطة</>
            }
          </button>
        </div>
      </div>

      {/* How it works banner */}
      <div className="bg-[#0a0a0a] rounded-2xl px-5 py-4 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-white text-xs font-extrabold mb-1">كيف تصل الخطة للعميل؟</p>
          <p className="text-white/40 text-xs leading-relaxed">
            ابنِ الخطة ثم اضغط <span className="text-gold-400 font-bold">حفظ الخطة</span> — سيجدها العميل فوراً في بوابته على{' '}
            <span className="text-gold-400 font-bold" dir="ltr">amine-fit.vercel.app/client/login</span>{' '}
            ببريده وكلمة المرور التي ضبطتها له.
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

      {/* ═══ NUTRITION TAB ═══ */}
      {tab === 'nutrition' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-slate-800 flex items-center gap-2">
                <Flame className="w-4 h-4 text-gold-500" /> الماكرو اليومي
              </h2>
              {/* Import from Calculator */}
              <button
                type="button"
                onClick={importFromCalculator}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-gold-400 text-gold-600 text-xs font-bold hover:bg-gold-50 transition"
              >
                <Download className="w-3.5 h-3.5" />
                استيراد من الحاسبة
              </button>
            </div>

            {/* Import status message */}
            {importStatus && importStatus !== 'ok' && (
              <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-medium">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {importStatus}
              </div>
            )}
            {importStatus === 'ok' && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                تم استيراد البيانات من الحاسبة بنجاح
              </div>
            )}

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
              <textarea value={nutritionNote} onChange={e => setNNote(e.target.value)} rows={2}
                placeholder="ملاحظة تظهر في أعلى صفحة الخطة..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium resize-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">نصائح (سطر لكل نصيحة)</label>
              <textarea value={nutritionTips} onChange={e => setNTips(e.target.value)} rows={3}
                placeholder={"اشرب 3 لتر ماء يومياً\nلا تتخطى وجبة الفطور..."}
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
                <p className="text-sm font-medium">لا توجد وجبات — أضفها يدوياً أو استوردها من الحاسبة</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ TRAINING TAB ═══ */}
      {tab === 'training' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h2 className="font-extrabold text-slate-800 flex items-center gap-2">
              <Zap className="w-4 h-4 text-slate-600" /> إعدادات البرنامج
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">أيام/أسبوع</label>
                <input type="number" value={daysPerWeek} onChange={e => setDPW(e.target.value)} placeholder="5"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">المدة (دقيقة)</label>
                <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="60"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">المستوى</label>
                <select value={level} onChange={e => setLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium bg-white">
                  <option value="">اختر...</option>
                  <option value="مبتدئ">مبتدئ</option>
                  <option value="متوسط">متوسط</option>
                  <option value="متقدم">متقدم</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">ملاحظة للعميل</label>
              <textarea value={trainingNote} onChange={e => setTNote(e.target.value)} rows={2}
                placeholder="ملاحظة تظهر في أعلى صفحة الخطة..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium resize-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">نصائح (سطر لكل نصيحة)</label>
              <textarea value={trainingTips} onChange={e => setTTips(e.target.value)} rows={3}
                placeholder={"احمِّ عضلاتك قبل التمرين\nاشرب ماء كافياً..."}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium resize-none" />
            </div>
          </div>

          {/* Templates */}
          <div className="bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-gold-500" />
              <h3 className="font-extrabold text-slate-700 text-sm">قوالب جاهزة</h3>
              <span className="text-xs text-slate-400 font-medium">— اختر وعدّل بعدها</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(TEMPLATES).map(([key, tpl]) => (
                <button key={key} type="button"
                  onClick={() => {
                    if (confirm(`تحميل قالب "${tpl.label}"؟ سيُستبدل الأيام الحالية.`))
                      setDays(tpl.days.map(d => ({ ...d, exercises: d.exercises.map(e => ({ ...e })) })))
                  }}
                  className="flex flex-col items-center gap-1.5 p-4 rounded-xl border border-slate-200 hover:border-gold-400 hover:bg-gold-50 transition text-center group">
                  <span className="text-3xl group-hover:scale-110 transition-transform">{tpl.emoji}</span>
                  <span className="text-xs font-extrabold text-slate-700 leading-tight">{tpl.label}</span>
                  <span className="text-[10px] text-slate-400">{tpl.desc}</span>
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
              <div className="text-center py-10 text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">
                <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">اختر قالباً جاهزاً أو أضف يوماً يدوياً</p>
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
            : <><Save className="w-4 h-4" /> حفظ الخطة</>
          }
        </button>
      </div>

      {/* Toast */}
      {toast && <Toast msg={toast} onClose={() => setToast('')} />}
    </div>
  )
}
