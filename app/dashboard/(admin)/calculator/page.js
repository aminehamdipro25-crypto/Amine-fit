'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calculator, RefreshCw, FileText, ChevronDown, ChevronUp, Sparkles, Info, Users, Search, X, CheckCircle2, Pencil, Check } from 'lucide-react'
import { ACTIVITY_FACTORS, GOALS, EX, getGoal, getActivity } from '@/lib/nutritionEngine'
import { COUNTRIES } from '@/lib/countries'

/* ─── small helpers ─────────────────────────────────────────────────────── */
const inp = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition'
const sel = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:border-primary-400 outline-none transition appearance-none'

const EX_COLORS = {
  starches:   'bg-amber-50  border-amber-200  text-amber-800',
  meats:      'bg-red-50    border-red-200    text-red-800',
  dairy:      'bg-blue-50   border-blue-200   text-blue-800',
  fats:       'bg-yellow-50 border-yellow-200 text-yellow-800',
  fruits:     'bg-green-50  border-green-200  text-green-800',
  vegetables: 'bg-emerald-50 border-emerald-200 text-emerald-800',
}

function Row({ label, val, bold, highlight }) {
  return (
    <div className={`flex justify-between py-2.5 border-b border-slate-100 last:border-0 ${highlight ? 'bg-primary-50 -mx-4 px-4 rounded-lg' : ''}`}>
      <span className={`text-sm ${bold ? 'font-bold text-slate-800' : 'text-slate-500'}`}>{label}</span>
      <span className={`text-sm font-bold ${highlight ? 'text-primary-700' : 'text-slate-800'}`}>{val}</span>
    </div>
  )
}

function StepCard({ num, title, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white hover:from-primary-50 transition-colors text-right">
        <div className="w-8 h-8 rounded-xl bg-primary-600 text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0">
          {num}
        </div>
        <span className="flex-1 font-bold text-slate-800">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  )
}

const INIT = { name:'', age:'', weight:'', height:'', gender:'male', activity:'moderate', goal:'maintain', preferred:'', avoided:'', targetWeight:'', bodyFatPct:'', duration:'day', meals:5, country:'', manualAdj:'', weeklyRate:'', weeklyProtein: null }

const LS_KEY = 'amine_calc_draft'

// ── Client-side meal normalizer — runs at render time regardless of data source ──
// Guarantees correct grouping for any plan (AI, local engine, or cached old data)
const _VEG = ['طماطم', 'خيار', 'فلفل', 'خس', 'جزر', 'بروكلي', 'كوسة', 'كوسا', 'سبانخ', 'باذنجان', 'قرنبيط', 'فاصوليا خضراء', 'كرفس', 'ملفوف', 'فجل', 'زعتر']
const _NUT = ['لوز', 'كاجو', 'جوز', 'فستق', 'بذر كتان', 'بذر شيا', 'سمسم', 'بذر عباد']

function normalizeMeal(meal) {
  if (!meal || !Array.isArray(meal.items)) return meal
  const cleanItems  = []
  const vegNames    = []
  const nutParts    = []
  let   vegGrams    = 0
  let   nutGrams    = 0
  let   vegServings = 0
  let   nutServings = 0
  let   vegPrep     = null  // detected from food names

  for (const item of meal.items) {
    const g = item.group || ''
    const f = item.food  || ''
    const isVeg = g.includes('خضروات') || _VEG.some(k => f.includes(k))
    const isNut = _NUT.some(k => f.includes(k))

    if (isVeg) {
      // Detect preparation method from food name keywords
      if (!vegPrep) {
        if (f.includes('مشوي') || f.includes('مشوية') || f.includes('مشوو') || g.includes('مشوي')) vegPrep = 'خضار مشوية'
        else if (f.includes('بخار') || f.includes('مطهو') || f.includes('مسلوق'))                  vegPrep = 'خضار على البخار'
      }
      vegNames.push(f)
      const m = String(item.amount || '').match(/^(\d+)/)
      vegGrams    += m ? +m[1] : 80
      vegServings += item.servings || 1
    } else if (isNut) {
      nutParts.push(f)
      const m = String(item.amount || '').match(/^(\d+)/)
      nutGrams    += m ? +m[1] : 0
      nutServings += item.servings || 1
    } else {
      // Egg count formatting: "بيضة مسلوقة" × 3 → "3 بيضات مسلوقة"
      let processed = item
      if (f.includes('بيضة') && (item.servings || 1) > 1) {
        const count  = item.servings
        const suffix = f.replace(/^بيضة\s*/u, '').trim()
        const plural = count === 2 ? 'بيضتان' : `${count} بيضات`
        processed = { ...item, food: suffix ? `${plural} ${suffix}` : plural }
      }
      cleanItems.push(processed)
    }
  }

  const result = { ...meal, items: cleanItems }

  if (vegNames.length > 0) {
    const prev        = meal.salad || {}
    // Respect AI-provided preparation if specific; otherwise use detected or default
    const preparation = (prev.preparation && !prev.preparation.includes('طازجة بزيت'))
      ? prev.preparation
      : (vegPrep || prev.preparation || 'سلطة طازجة بزيت الزيتون والليمون')
    result.salad = {
      has_salad:   true,
      vegetables:  prev.has_salad ? (prev.vegetables || vegNames) : vegNames,
      preparation,
      grams:       prev.grams || vegGrams || vegNames.length * 80,
      kcal:        (vegServings || vegNames.length) * 25,  // ADA: 25 kcal / vegetable serving
    }
  } else if (meal.salad) {
    const s      = meal.salad
    result.salad = { ...s, kcal: s.kcal || (s.vegetables?.length || 1) * 25 }
  }

  if (nutParts.length > 0) {
    const prev = meal.nuts || {}
    result.nuts = {
      has_nuts: true,
      type:     prev.has_nuts ? (prev.type || nutParts.join(' + ')) : nutParts.join(' + '),
      grams:    nutGrams || prev.grams || 30,
      kcal:     (nutServings || 1) * 45,  // ADA fat exchange: 45 kcal / serving
    }
  } else if (meal.nuts) {
    const n      = meal.nuts
    const grams  = n.grams || 30
    result.nuts  = { ...n, kcal: n.kcal || Math.round(grams * 6) }  // ~6 kcal/g for mixed nuts
  }

  return result
}

// Map registration goal values → calculator goal keys
const GOAL_MAP = { loss:'loss', gain:'gain', maintain:'maintain', performance:'maintain' }

const WEEK_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

const PROTEIN_TYPES = [
  { key: 'mixed',      icon: '🔄', label: 'مختلط' },
  { key: 'chicken',   icon: '🍗', label: 'دجاج' },
  { key: 'fish',      icon: '🐟', label: 'سمك' },
  { key: 'red_meat',  icon: '🥩', label: 'لحم أحمر' },
  { key: 'liver',     icon: '🫀', label: 'كبدة' },
  { key: 'tuna',      icon: '🐠', label: 'تونة' },
  { key: 'eggs',      icon: '🥚', label: 'بيض' },
  { key: 'plant',     icon: '🌿', label: 'نباتي (بقوليات)' },
  { key: 'eggs_plant',icon: '🥚', label: 'بيض + بقوليات' },
  { key: 'dairy',     icon: '🧀', label: 'ألبان + جبن' },
]

function ClientPicker({ onSelect }) {
  const [clients, setClients]   = useState([])
  const [search,  setSearch]    = useState('')
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetch('/api/admin/clients')
      .then(r => r.json())
      .then(d => setClients(d.clients || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const q = search.trim().toLowerCase()
  const filtered = q
    ? clients.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
    : clients

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          autoFocus
          placeholder="ابحث بالاسم أو البريد..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition"
        />
      </div>
      {loading ? (
        <div className="text-center py-6 text-slate-400 text-sm">جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-sm">لا يوجد عملاء مطابقون</div>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
          {filtered.map(c => (
            <button key={c.id} onClick={() => onSelect(c)}
              className="w-full text-right flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 hover:border-primary-300 hover:bg-primary-50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                {c.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate group-hover:text-primary-700">{c.name}</p>
                <p className="text-xs text-slate-400 truncate">{c.email}</p>
              </div>
              <div className="flex gap-3 text-xs text-slate-500 flex-shrink-0">
                {c.age   && <span>{c.age}س</span>}
                {c.weight && <span>{c.weight}كغ</span>}
                {c.height && <span>{c.height}سم</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const DURATION_OPTIONS = [
  { key: 'day',   label: 'يوم واحد',   icon: '📅' },
  { key: 'week',  label: 'أسبوع كامل', icon: '📆' },
  { key: 'month', label: 'شهر كامل',   icon: '🗓️' },
]

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function CalculatorPage() {
  const router   = useRouter()
  const [form, setForm] = useState(INIT)
  const [result, setRes] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isAI, setIsAI] = useState(false)
  const [selectedDay, setSelectedDay] = useState(0)
  const [selectedWeek, setSelectedWeek] = useState(0)
  const [showPicker, setShowPicker]   = useState(false)
  const [pickedClient, setPickedClient] = useState(null)
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // null | 'saved' | 'error'
  const [savedPlan, setSavedPlan] = useState(null) // plan fetched from Redis for picked client
  const [initialized, setInitialized] = useState(false) // true after localStorage restore
  const [draftRestored, setDraftRestored] = useState(false)

  // ── Inline editing for food items ────────────────────────────────────────
  const [editKey, setEditKey] = useState(null) // "mealI-itemI"
  const [editVal, setEditVal] = useState('')
  const [itemEdits, setItemEdits] = useState({}) // persists edits for current result

  useEffect(() => { setItemEdits({}) }, [result])

  function startEdit(key, currentVal) {
    setEditKey(key)
    setEditVal(currentVal)
  }
  function commitEdit(key) {
    setItemEdits(e => ({ ...e, [key]: editVal }))
    setEditKey(null)
  }
  function getDisplayFood(key, originalFood) {
    return itemEdits[key] ?? originalFood
  }

  // ── Restore draft from localStorage on mount ─────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const draft = JSON.parse(raw)
        if (draft.form)   setForm(draft.form)
        if (draft.result) {
          setRes(draft.result)
          setIsAI(!!draft.isAI)
          setSelectedDay(draft.selectedDay  || 0)
          setSelectedWeek(draft.selectedWeek || 0)
          setDraftRestored(true)
        }
        if (draft.pickedClient) setPickedClient(draft.pickedClient)
      }
    } catch {}
    setInitialized(true) // enable auto-save after restore
  }, []) // mount only

  // ── Auto-save draft to localStorage after each change ────────────────────
  useEffect(() => {
    if (!initialized) return
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        form, result, isAI, selectedDay, selectedWeek,
        pickedClient: pickedClient
          ? { id: pickedClient.id, name: pickedClient.name, email: pickedClient.email }
          : null,
      }))
      if (result) localStorage.setItem('amineFitPlan', JSON.stringify(result))
    } catch {}
  }, [form, result, isAI, selectedDay, selectedWeek, pickedClient, initialized]) // eslint-disable-line

  function clearDraft() {
    setForm(INIT); setRes(null); setPickedClient(null); setSavedPlan(null)
    setSaveStatus(null); setDraftRestored(false)
    try { localStorage.removeItem(LS_KEY); localStorage.removeItem('amineFitPlan') } catch {}
  }

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setRes(null) }

  function fillFromClient(c) {
    const avoided = [c.dislikedFoods, c.foodAllergy].filter(Boolean).join('، ')
    setForm({
      name:         c.name         || '',
      age:          c.age          || '',
      gender:       c.gender       || 'male',
      weight:       c.weight       || '',
      height:       c.height       || '',
      targetWeight: c.targetWeight || '',
      bodyFatPct:   c.bodyFatPct   || '',
      activity:     c.activityLevel || 'moderate',
      goal:         GOAL_MAP[c.goal] || 'maintain',
      preferred:    c.preferredFoods || '',
      avoided,
      duration:     'day',
      meals:        5,
      country:      c.country        || '',
      manualAdj:    '',
      weeklyRate:   '',
    })
    setPickedClient(c)
    setShowPicker(false)
    setRes(null)
    setSavedPlan(null)
    // Fetch any previously saved calc plan for this client
    fetch(`/api/admin/clients/${c.id}/calc-plan`)
      .then(r => r.json())
      .then(d => { if (d.plan) setSavedPlan(d.plan) })
      .catch(() => {})
  }

  function loadSavedPlan() {
    if (!savedPlan) return
    setRes(savedPlan)
    if (savedPlan.form) setForm(savedPlan.form)
    setSelectedDay(0)
    setSelectedWeek(0)
    setSaveStatus(null)
    setIsAI(!!savedPlan.ai)
    // Sync to localStorage so "تقرير PDF" reads the saved (AI-modified) version
    try { localStorage.setItem('amineFitPlan', JSON.stringify(savedPlan)) } catch {}
  }

  const valid = +form.age > 0 && +form.weight > 0 && +form.height > 0

  const currentMenu = result
    ? (result.duration === 'day'
        ? result.menu
        : result.duration === 'week'
          ? result.days?.[selectedDay]?.menu
          : result.weeks?.[selectedWeek]?.menu)
    : null

  async function calculate() {
    if (!valid || loading) return
    setLoading(true)
    setRes(null)
    setSelectedDay(0)
    setSelectedWeek(0)
    setSaveStatus(null)
    try {
      const res  = await fetch('/api/ai-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const plan = await res.json()
      setIsAI(!!plan.ai)
      setRes(plan)
    } catch {
      // silent — should not happen since API always returns local fallback
    } finally {
      setLoading(false)
    }
  }

  function openReport() {
    if (!result) return
    localStorage.setItem('amineFitPlan', JSON.stringify(result))
    window.open('/plan-report', '_blank')
  }

  async function savePlan() {
    if (!pickedClient || !result) return
    setSaveLoading(true)
    setSaveStatus(null)
    try {
      const res = await fetch(`/api/admin/clients/${pickedClient.id}/calc-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: result }),
      })
      setSaveStatus(res.ok ? 'saved' : 'error')
    } catch {
      setSaveStatus('error')
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* ── Input Card ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-white">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-primary-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">بيانات المشترك</h2>
            <p className="text-xs text-slate-500">Mifflin-St Jeor + نظام التبادل الغذائي ADA 2019</p>
          </div>
          <span className="mr-auto text-[10px] font-extrabold bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full">AI ✦</span>
        </div>

        <div className="p-5 space-y-4">

          {/* ── Client Picker ── */}
          <div className="rounded-xl border border-dashed border-primary-300 bg-primary-50/50 p-3 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Users className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-bold text-primary-700">تعبئة من العملاء</span>
                {pickedClient && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> {pickedClient.name}
                  </span>
                )}
                {savedPlan && (
                  <button onClick={loadSavedPlan}
                    className="flex items-center gap-1 text-xs font-bold text-violet-700 bg-violet-100 border border-violet-200 hover:bg-violet-200 px-2.5 py-1 rounded-full transition">
                    📂 تحميل الخطة المحفوظة
                    {savedPlan.savedAt && (
                      <span className="font-normal text-violet-400 mr-1">
                        {new Date(savedPlan.savedAt).toLocaleDateString('ar-TN', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {pickedClient && (
                  <button onClick={clearDraft}
                    className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                    <X className="w-3 h-3" /> مسح
                  </button>
                )}
                <button onClick={() => setShowPicker(p => !p)}
                  className="text-xs font-bold text-primary-600 hover:text-primary-800 bg-white border border-primary-200 hover:border-primary-400 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {showPicker ? 'إغلاق' : (pickedClient ? 'تغيير العميل' : 'اختر عميل')}
                </button>
              </div>
            </div>
            {showPicker && <ClientPicker onSelect={fillFromClient} />}
            {!showPicker && !pickedClient && (
              <p className="text-xs text-slate-500">اختر عميلاً لتعبئة البيانات تلقائياً من استبيانه</p>
            )}
          </div>

          {/* Row 1: Name, Age, Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">الاسم (اختياري)</label>
              <input className={inp} placeholder="أحمد بن علي" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">العمر *</label>
              <input className={inp} type="number" placeholder="28" min="10" max="90" value={form.age} onChange={e => set('age', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">الجنس</label>
              <select className={sel} value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
          </div>

          {/* Row 2: Weight, Target Weight, Height, Body Fat */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">الوزن الحالي (كغ) *</label>
              <input className={inp} type="number" placeholder="75" value={form.weight} onChange={e => set('weight', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">الوزن المستهدف (كغ)</label>
              <input className={inp} type="number" placeholder="70" value={form.targetWeight} onChange={e => set('targetWeight', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">الطول (سم) *</label>
              <input className={inp} type="number" placeholder="175" value={form.height} onChange={e => set('height', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">نسبة الدهون % <span className="text-slate-400 font-normal">(اختياري)</span></label>
              <input className={inp} type="number" placeholder="20" min="3" max="70" value={form.bodyFatPct} onChange={e => set('bodyFatPct', e.target.value)} />
            </div>
          </div>

          {/* Row 3: Activity + Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">مستوى النشاط</label>
              <select className={sel} value={form.activity} onChange={e => set('activity', e.target.value)}>
                {ACTIVITY_FACTORS.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">
                البلد
                <span className="mr-1.5 text-xs font-normal text-violet-500">يكيّف الأطعمة تلقائياً</span>
              </label>
              <select className={sel} value={form.country} onChange={e => set('country', e.target.value)}>
                <option value="">— غير محدد (عالمي) —</option>
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">الهدف</label>
            <div className="grid grid-cols-3 gap-3">
              {GOALS.map(g => (
                <button key={g.key} onClick={() => set('goal', g.key)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-semibold
                    ${form.goal === g.key ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'}`}>
                  <span className="text-2xl">{g.icon}</span>{g.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Precision Goal Control ──────────────────────────────────────── */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-50/80 border border-slate-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-700">تخصيص دقيق للسعرات</span>
              <span className="text-[10px] bg-violet-100 text-violet-600 font-bold px-2 py-0.5 rounded-full">يتجاوز الهدف أعلاه إذا مُلئ</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Manual adj */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">عجز/فائض يدوي (سعرة/يوم)</label>
                <input
                  type="number" min="-1000" max="1000" step="50"
                  placeholder="مثال: −500 أو +300"
                  value={form.manualAdj}
                  onChange={e => { setForm(f => ({ ...f, manualAdj: e.target.value, weeklyRate: '' })); setRes(null) }}
                  className={`${inp} ${form.manualAdj && (Math.abs(+form.manualAdj) > 1000) ? 'border-red-400' : ''}`}
                />
                {form.manualAdj !== '' && !isNaN(+form.manualAdj) && Math.abs(+form.manualAdj) <= 1000 && (
                  <p className="text-[10px] text-violet-600 font-medium">
                    ≈ {(Math.abs(+form.manualAdj) * 7 / 7700).toFixed(2)} كغ/أسبوع · {Math.abs(+form.manualAdj) * 30 / 7700 > 0 ? (Math.abs(+form.manualAdj) * 30 / 7700).toFixed(1) : 0} كغ/شهر
                  </p>
                )}
                {form.manualAdj !== '' && Math.abs(+form.manualAdj) > 1000 && (
                  <p className="text-[10px] text-red-500 font-bold">⚠️ الحد الأقصى الآمن ±1000 سعرة/يوم</p>
                )}
              </div>
              {/* Weekly rate */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">معدل تغيير الوزن (كغ/أسبوع)</label>
                <input
                  type="number" min="-1" max="1" step="0.05"
                  placeholder="مثال: −0.5 أو +0.3"
                  value={form.weeklyRate}
                  onChange={e => { setForm(f => ({ ...f, weeklyRate: e.target.value, manualAdj: '' })); setRes(null) }}
                  className={`${inp} ${form.weeklyRate && Math.abs(+form.weeklyRate) > 1 ? 'border-red-400' : ''}`}
                />
                {form.weeklyRate !== '' && !isNaN(+form.weeklyRate) && Math.abs(+form.weeklyRate) <= 1 && (
                  <p className="text-[10px] text-violet-600 font-medium">
                    ≈ {Math.round(Math.abs(+form.weeklyRate) * 7700 / 7)} سعرة/يوم · {(Math.abs(+form.weeklyRate) * 4.3).toFixed(1)} كغ/شهر
                  </p>
                )}
                {form.weeklyRate !== '' && Math.abs(+form.weeklyRate) > 1 && (
                  <p className="text-[10px] text-red-500 font-bold">⚠️ الحد الأقصى الآمن ±1 كغ/أسبوع</p>
                )}
              </div>
            </div>
            {/* Auto mode hint */}
            {!form.manualAdj && !form.weeklyRate && (
              <p className="text-[10px] text-slate-500">
                {form.targetWeight && +form.weight > 0 && +form.targetWeight > 0
                  ? +form.weight > +form.targetWeight
                    ? `🤖 وضع تلقائي: عجز −500 سعرة/يوم (الوزن الحالي ${form.weight} كغ > المستهدف ${form.targetWeight} كغ)`
                    : +form.weight < +form.targetWeight
                      ? `🤖 وضع تلقائي: فائض +300 سعرة/يوم (الوزن الحالي ${form.weight} كغ < المستهدف ${form.targetWeight} كغ)`
                      : `🤖 وضع تلقائي: الأوزان متساوية — يُطبَّق الهدف المختار`
                  : '💡 بدون تخصيص: يُطبَّق الهدف المختار أعلاه مباشرة'}
              </p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">مدة البرنامج</label>
            <div className="grid grid-cols-3 gap-3">
              {DURATION_OPTIONS.map(d => (
                <button key={d.key} onClick={() => set('duration', d.key)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-semibold
                    ${form.duration === d.key ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'}`}>
                  <span className="text-2xl">{d.icon}</span>{d.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Weekly Protein Distribution — week plans only ── */}
          {form.duration === 'week' && (
            <div className="space-y-3 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-emerald-800">🥩 توزيع البروتين الأسبوعي</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">اختياري — لمراعاة ميزانية العميل</span>
                {form.weeklyProtein?.some(p => p !== 'mixed') && (
                  <button onClick={() => set('weeklyProtein', null)} className="text-[10px] text-slate-400 hover:text-red-500 mr-auto transition">✕ إعادة تعيين</button>
                )}
              </div>
              <p className="text-xs text-slate-500">حدِّد مصدر البروتين لكل يوم — يُعيد النظام حساب الماكروز تلقائياً (كربوهيدرات البقوليات + دهون البيض) للحفاظ على الهدف اليومي</p>
              <div className="grid grid-cols-7 gap-1.5">
                {WEEK_DAYS.map((day, i) => {
                  const val = form.weeklyProtein?.[i] || 'mixed'
                  const pt  = PROTEIN_TYPES.find(p => p.key === val) || PROTEIN_TYPES[0]
                  return (
                    <div key={i} className={`flex flex-col items-center gap-1 rounded-xl p-2 border-2 transition-all ${val !== 'mixed' ? 'border-emerald-400 bg-white shadow-sm' : 'border-slate-200 bg-white/60'}`}>
                      <p className="text-[10px] font-bold text-slate-600">{day}</p>
                      <span className="text-lg leading-none">{pt.icon}</span>
                      <select
                        value={val}
                        onChange={e => {
                          const arr = [...(form.weeklyProtein || Array(7).fill('mixed'))]
                          arr[i] = e.target.value
                          set('weeklyProtein', arr)
                        }}
                        className="w-full text-[9px] py-1 px-0.5 rounded-lg border border-slate-200 bg-white text-slate-700 outline-none focus:border-emerald-400 text-center leading-tight">
                        {PROTEIN_TYPES.map(p => <option key={p.key} value={p.key}>{p.icon} {p.label}</option>)}
                      </select>
                    </div>
                  )
                })}
              </div>
              {/* Summary chips */}
              {form.weeklyProtein?.some(p => p !== 'mixed') && (() => {
                const counts = {}
                form.weeklyProtein.forEach(p => {
                  const lbl = PROTEIN_TYPES.find(pt => pt.key === p)?.label || 'مختلط'
                  counts[lbl] = (counts[lbl] || 0) + 1
                })
                return (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Object.entries(counts).map(([lbl, n]) => (
                      <span key={lbl} className="text-[10px] font-bold bg-white border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full">
                        {n} × {lbl}
                      </span>
                    ))}
                  </div>
                )
              })()}
            </div>
          )}

          {/* Preferred / avoided / meals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">📋 قائمة الأطعمة المسموحة</label>
              <input className={inp} placeholder="دجاج، أرز، تونة، بيض، زبادي..." value={form.preferred} onChange={e => set('preferred', e.target.value)} />
              <p className="text-xs text-slate-400">الخطة ستستخدم هذه الأطعمة فقط — اتركها فارغة للتنويع التلقائي</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-red-600">🚫 الأطعمة الممنوعة</label>
              <input className={`${inp} border-red-200 focus:border-red-400 focus:ring-red-100`} placeholder="لحم أحمر، حليب، مكسرات..." value={form.avoided} onChange={e => set('avoided', e.target.value)} />
              <p className="text-xs text-red-400">لن تظهر في البرنامج الغذائي</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">عدد الوجبات</label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 4, 5].map(n => (
                  <button key={n} onClick={() => set('meals', n)}
                    className={`py-2.5 rounded-xl border-2 font-bold text-sm transition-all
                      ${+form.meals === n ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'}`}>
                    {n} وجبات
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <button onClick={calculate} disabled={!valid || loading}
            className="flex-1 bg-gradient-to-r from-violet-600 to-primary-600 hover:from-violet-700 hover:to-primary-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>الذكاء الاصطناعي يولّد الخطة...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>توليد البرنامج بالذكاء الاصطناعي</span>
              </>
            )}
          </button>
          <button onClick={clearDraft} title="إعادة تعيين وحذف المسودة"
            className="px-4 py-3 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* AI Loading shimmer */}
        {loading && (
          <div className="mx-5 mb-5 bg-gradient-to-r from-violet-50 to-primary-50 border border-violet-200 rounded-xl p-5 text-center space-y-2">
            <div className="w-10 h-10 mx-auto bg-violet-100 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="w-5 h-5 text-violet-600" />
            </div>
            <p className="font-bold text-violet-700">الذكاء الاصطناعي يحلّل البيانات...</p>
            <p className="text-xs text-slate-500">يحسب السعرات • يوزع وحدات التبادل • يبني القائمة الغذائية المثالية</p>
            <div className="flex justify-center gap-1 pt-1">
              {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
            </div>
          </div>
        )}
      </div>

      {/* ── Draft restored banner ── */}
      {draftRestored && result && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm">
          <span className="text-amber-600">📂</span>
          <span className="flex-1 font-medium text-amber-800">تم استعادة مسودتك السابقة تلقائياً</span>
          <button onClick={clearDraft}
            className="text-xs font-bold text-amber-600 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition">
            مسح المسودة
          </button>
        </div>
      )}

      {/* ── Results ── */}
      {result && (<>
        {/* AI/Local badge */}
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold ${isAI ? 'bg-violet-50 text-violet-700 border border-violet-200' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
          {isAI ? <><Sparkles className="w-4 h-4" /> تم التوليد بالذكاء الاصطناعي Claude</> : <><Calculator className="w-4 h-4" /> تم التوليد بالمحرك المحلي (المجاني)</>}
          {isAI && result.cached && <span className="mr-auto text-xs font-normal text-violet-400 bg-violet-100 px-2 py-0.5 rounded-full">من الكاش (24 ساعة)</span>}
          {!isAI && !result.aiError && <span className="mr-auto text-xs font-normal text-slate-400">{result.duration === 'month' ? 'الشهر بالمحرك المحلي — اليوم والأسبوع بـ Claude AI' : 'أضف ANTHROPIC_API_KEY في Vercel لتفعيل AI'}</span>}
          {result.aiError && <span className="mr-auto text-xs font-normal text-red-500">خطأ AI: {result.aiError}</span>}
        </div>

        {/* Step 1 — Energy */}
        <StepCard num="1" title="حسابات الطاقة — BMR & TDEE">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {[
              { label: 'معدل الأيض الأساسي (BMR)',   val: result.bmr.toLocaleString() + ' سعرة',   sub: 'Mifflin-St Jeor',          hi: false },
              { label: 'إجمالي الطاقة اليومية (TDEE)', val: result.tdee.toLocaleString() + ' سعرة', sub: getActivity(form.activity).label, hi: false },
              { label: 'السعرات المستهدفة',           val: result.target.toLocaleString() + ' سعرة', sub: getGoal(form.goal).label,   hi: true  },
            ].map(b => (
              <div key={b.label} className={`rounded-2xl p-4 text-center border ${b.hi ? 'bg-primary-600 border-primary-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-800'}`}>
                <p className="text-2xl font-extrabold">{b.val}</p>
                <p className={`text-xs font-semibold mt-1 ${b.hi ? 'text-primary-200' : 'text-slate-500'}`}>{b.label}</p>
                <p className={`text-[10px] mt-0.5 ${b.hi ? 'text-primary-300' : 'text-slate-400'}`}>{b.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Extra Metrics Strip ── */}
          {(() => {
            const w = +form.weight, h = +form.height, age = +form.age
            const bmi = h > 0 ? +(w / ((h / 100) ** 2)).toFixed(1) : null
            const bmiCat = !bmi ? null
              : bmi < 18.5 ? { label: 'نقص وزن', color: 'text-blue-700 bg-blue-50 border-blue-200' }
              : bmi < 25   ? { label: 'طبيعي ✓',  color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
              : bmi < 30   ? { label: 'زيادة وزن', color: 'text-amber-700 bg-amber-50 border-amber-200' }
              :               { label: 'سمنة',      color: 'text-red-700 bg-red-50 border-red-200' }
            const proteinG = result.ex.macros.protein
            const proteinPerKg = w > 0 ? (proteinG / w).toFixed(2) : null
            // Use server-calculated water if available, else derive client-side
            const waterData = result.water || (w > 0 ? { liters: (w * 0.035).toFixed(1), glasses: Math.round(w * 35 / 250) } : null)
            // Fiber from exchanges (engine v4)
            const fiberActual = result.ex.fiber?.g || result.ex.fiber
            const fiberRecommended = result.ex.fiber?.recommended || (age > 50 ? 30 : 25)
            // FFM protein target if body fat was provided
            const proteinTarget = result.ex.proteinTarget
            const goalAdj = result.target - result.tdee
            const weeklyChange = Math.abs(goalAdj) > 0 ? (Math.abs(goalAdj) * 7 / 7700).toFixed(2) : null
            const weightDiff = form.targetWeight ? Math.abs(+form.weight - +form.targetWeight) : null
            const weeksToGoal = weeklyChange && weightDiff > 0 ? Math.round(weightDiff / weeklyChange) : null
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {bmi && bmiCat && (
                  <div className={`rounded-xl p-3 text-center border ${bmiCat.color}`}>
                    <p className="text-xl font-extrabold">{bmi}</p>
                    <p className="text-xs font-bold mt-0.5">BMI</p>
                    <p className="text-[10px] mt-0.5 font-semibold">{bmiCat.label}</p>
                  </div>
                )}
                {proteinTarget ? (
                  <div className="rounded-xl p-3 text-center border bg-red-50 border-red-200 text-red-800">
                    <p className="text-xl font-extrabold">{Math.round(proteinTarget)} غ</p>
                    <p className="text-xs font-bold mt-0.5">هدف البروتين (FFM)</p>
                    <p className="text-[10px] mt-0.5 text-red-500">{proteinPerKg} غ/كغ · نسبة دهون {form.bodyFatPct}%</p>
                  </div>
                ) : proteinPerKg ? (
                  <div className="rounded-xl p-3 text-center border bg-red-50 border-red-100 text-red-800">
                    <p className="text-xl font-extrabold">{proteinPerKg}</p>
                    <p className="text-xs font-bold mt-0.5">غ بروتين / كغ</p>
                    <p className="text-[10px] mt-0.5 text-red-500">الموصى: 1.6–2.4</p>
                  </div>
                ) : null}
                {waterData && (
                  <div className="rounded-xl p-3 text-center border bg-cyan-50 border-cyan-100 text-cyan-800">
                    <p className="text-xl font-extrabold">{waterData.liters} L</p>
                    <p className="text-xs font-bold mt-0.5">ماء موصى به</p>
                    <p className="text-[10px] mt-0.5 text-cyan-500">{waterData.glasses} كوب يومياً</p>
                  </div>
                )}
                <div className="rounded-xl p-3 text-center border bg-green-50 border-green-100 text-green-800">
                  <p className="text-xl font-extrabold">{fiberActual || '—'} غ</p>
                  <p className="text-xs font-bold mt-0.5">ألياف من الوجبات</p>
                  <p className="text-[10px] mt-0.5 text-green-500">الموصى: {fiberRecommended} غ/يوم</p>
                </div>
                {weeksToGoal && goalAdj !== 0 && (
                  <div className="rounded-xl p-3 text-center border bg-violet-50 border-violet-100 text-violet-800 col-span-2 sm:col-span-4">
                    <p className="text-lg font-extrabold">
                      {weeksToGoal} أسبوع تقريباً ({Math.round(weeksToGoal / 4.3)} شهر)
                    </p>
                    <p className="text-xs font-bold mt-0.5">
                      الوقت المتوقع للوصول من {form.weight} كغ إلى {form.targetWeight} كغ
                    </p>
                    <p className="text-[10px] mt-0.5 text-violet-400">
                      بمعدل {weeklyChange} كغ/أسبوع · بناءً على عجز/فائض {Math.abs(goalAdj)} سعرة يومياً
                    </p>
                  </div>
                )}
              </div>
            )
          })()}
          <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-500 space-y-1">
            <p><strong className="text-slate-700">معادلة Mifflin-St Jeor (1990) — الأدق وفق ADA/AND:</strong></p>
            {form.gender === 'male'
              ? <p>BMR = (10 × {form.weight}) + (6.25 × {form.height}) − (5 × {form.age}) + 5 = <strong className="text-primary-600">{result.bmr}</strong> سعرة</p>
              : <p>BMR = (10 × {form.weight}) + (6.25 × {form.height}) − (5 × {form.age}) − 161 = <strong className="text-primary-600">{result.bmr}</strong> سعرة</p>
            }
            <p>TDEE = BMR × {getActivity(form.activity).pa} = <strong className="text-primary-600">{result.tdee}</strong> سعرة</p>
            {(() => {
              const adj = result.target - result.tdee
              const src = form.manualAdj
                ? `عجز/فائض يدوي: ${+form.manualAdj > 0 ? '+' : ''}${form.manualAdj} سعرة/يوم`
                : form.weeklyRate
                  ? `معدل أسبوعي: ${form.weeklyRate} كغ/أسبوع → ${adj > 0 ? '+' : ''}${adj} سعرة/يوم`
                  : form.targetWeight && form.weight
                    ? +form.weight > +form.targetWeight ? 'تلقائي: عجز (وزن حالي > مستهدف)' : +form.weight < +form.targetWeight ? 'تلقائي: فائض (وزن حالي < مستهدف)' : getGoal(form.goal).label
                    : getGoal(form.goal).label
              return (
                <p>
                  السعرات المستهدفة = {result.tdee} {adj >= 0 ? '+' : '−'} {Math.abs(adj)} = <strong className="text-primary-600">{result.target}</strong> سعرة
                  {' '}<span className="text-violet-500 font-medium">({src})</span>
                  {' '}<span className="text-slate-400">(الحد الأدنى: {form.gender === 'male' ? '1500' : '1200'} سعرة)</span>
                </p>
              )
            })()}
          </div>
        </StepCard>

        {/* Step 2 — Exchange Table */}
        <StepCard num="2" title="جدول الحصص الغذائية — نظام التبادل">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  {['المجموعة الغذائية', 'الحصص', 'السعرات', 'كربوهيدرات (غ)', 'بروتين (غ)', 'دهون (غ)'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-right font-bold text-slate-600 border border-slate-200 text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'starches',   ex: EX.starch,    count: result.ex.starches   },
                  { key: 'meats',      ex: EX.meat,      count: result.ex.meats      },
                  { key: 'dairy',      ex: EX.milk,      count: result.ex.dairy      },
                  { key: 'fats',       ex: EX.fat,       count: result.ex.fats       },
                  { key: 'fruits',     ex: EX.fruit,     count: result.ex.fruits     },
                  { key: 'vegetables', ex: EX.vegetable, count: result.ex.vegetables },
                ].map(({ key, ex, count }) => count === 0 ? (
                  <tr key={key} className="opacity-40 bg-red-50">
                    <td className="px-3 py-2 border border-slate-200 font-medium line-through text-slate-400">
                      <span className="mr-1">{ex.icon}</span> {ex.nameAr}
                    </td>
                    <td colSpan={5} className="px-3 py-2 border border-slate-200 text-center text-red-400 text-xs">🚫 ممنوع</td>
                  </tr>
                ) : (
                  <tr key={key} className="hover:bg-slate-50/50">
                    <td className="px-3 py-2.5 border border-slate-200 font-medium">
                      <span className="mr-1">{ex.icon}</span> {ex.nameAr}
                    </td>
                    <td className="px-3 py-2.5 border border-slate-200 text-center font-bold text-primary-700">{count}</td>
                    <td className="px-3 py-2.5 border border-slate-200 text-center">{(count * ex.kcal).toLocaleString()}</td>
                    <td className="px-3 py-2.5 border border-slate-200 text-center">{count * ex.carbs}</td>
                    <td className="px-3 py-2.5 border border-slate-200 text-center">{count * ex.protein}</td>
                    <td className="px-3 py-2.5 border border-slate-200 text-center">{count * ex.fat}</td>
                  </tr>
                ))}
                <tr className="bg-primary-50 font-bold">
                  <td className="px-3 py-2.5 border border-slate-200 text-primary-800">الإجمالي</td>
                  <td className="px-3 py-2.5 border border-slate-200 text-center text-primary-700">—</td>
                  <td className="px-3 py-2.5 border border-slate-200 text-center text-primary-700">{result.ex.actualKcal}</td>
                  <td className="px-3 py-2.5 border border-slate-200 text-center text-primary-700">{result.ex.macros.carbs}</td>
                  <td className="px-3 py-2.5 border border-slate-200 text-center text-primary-700">{result.ex.macros.protein}</td>
                  <td className="px-3 py-2.5 border border-slate-200 text-center text-primary-700">{result.ex.macros.fat}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'كربوهيدرات', val: result.ex.macros.carbs,   pct: result.ex.pct.carbs,   color: 'bg-amber-400' },
              { label: 'بروتين',     val: result.ex.macros.protein, pct: result.ex.pct.protein, color: 'bg-red-400' },
              { label: 'دهون',       val: result.ex.macros.fat,     pct: result.ex.pct.fat,     color: 'bg-yellow-400' },
            ].map(m => (
              <div key={m.label} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                <div className={`w-3 h-3 ${m.color} rounded-full mx-auto mb-1`} />
                <p className="text-lg font-extrabold text-slate-800">{m.val} غ</p>
                <p className="text-xs text-slate-500">{m.label} ({m.pct}%)</p>
              </div>
            ))}
          </div>
        </StepCard>

        {/* Step 3 — Meal Distribution */}
        <StepCard num="3" title="توزيع الوجبات اليومية">
          {/* Week/Month navigation tabs */}
          {result.duration === 'week' && (
            <div className="flex flex-wrap gap-2 mb-4">
              {result.days.map((d, i) => (
                <button key={i} onClick={() => setSelectedDay(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedDay === i ? 'bg-primary-600 text-white border-primary-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                  {d.name}
                </button>
              ))}
            </div>
          )}
          {result.duration === 'month' && (
            <div className="flex flex-wrap gap-2 mb-4">
              {result.weeks.map((w, i) => (
                <button key={i} onClick={() => setSelectedWeek(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedWeek === i ? 'bg-primary-600 text-white border-primary-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                  {w.name}
                </button>
              ))}
            </div>
          )}
          <div className="space-y-3">
            {(currentMenu || []).map((meal, i) => {
              const nm = normalizeMeal(meal)
              return (
              <div key={i} className="border border-slate-100 rounded-2xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{nm.icon}</span>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{nm.name}</p>
                      <p className="text-xs text-slate-400">{nm.time}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-extrabold text-primary-700 text-sm">{nm.kcal} سعرة</p>
                    <p className="text-xs text-slate-400">ك:{nm.carbs}غ ب:{nm.protein}غ د:{nm.fat}غ</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {nm.items.map((item, j) => (
                    <span key={j} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-xs font-semibold bg-slate-50 border-slate-200 text-slate-700">
                      {item.icon} {item.servings} × {item.group}
                    </span>
                  ))}
                  {nm.salad?.has_salad && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-xs font-semibold bg-emerald-50 border-emerald-200 text-emerald-700">
                      🥗 سلطة خضار
                    </span>
                  )}
                  {nm.nuts?.has_nuts && nm.nuts.type !== 'None' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-xs font-semibold bg-amber-50 border-amber-200 text-amber-700">
                      🥜 مكسرات
                    </span>
                  )}
                </div>
              </div>
            )})}
          </div>

          {/* ── Total day macros verification strip ── */}
          {(() => {
            const tdm = result.duration === 'day'
              ? result.total_day_macros
              : result.days?.[selectedDay]?.total_day_macros
            if (!tdm) return null
            const diff = Math.abs((tdm.calories || 0) - (result.target || 0))
            const ok   = diff <= 5
            return (
              <div className={`mt-4 p-3 rounded-xl border text-xs font-bold flex flex-wrap gap-3 items-center ${ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-300 text-amber-800'}`}>
                <span>{ok ? '✅' : '⚠️'} التحقق الذاتي من الإجماليات:</span>
                <span className="bg-white/70 px-2 py-0.5 rounded-lg">🔥 {tdm.calories} سعرة</span>
                <span className="bg-white/70 px-2 py-0.5 rounded-lg">💪 {tdm.protein} غ بروتين</span>
                <span className="bg-white/70 px-2 py-0.5 rounded-lg">🌾 {tdm.carbs} غ كارب</span>
                <span className="bg-white/70 px-2 py-0.5 rounded-lg">🥑 {tdm.fat} غ دهون</span>
                {!ok && <span className="text-amber-700 mr-auto">فارق {diff} سعرة عن الهدف</span>}
              </div>
            )
          })()}
        </StepCard>

        {/* Step 4 — Detailed Menu in Grams */}
        <StepCard num="4" title="القائمة الغذائية التفصيلية بالغرام">
          <div className="flex items-start gap-2 mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-700">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            جميع الكميات محسوبة بالغرام بدقة وفق نظام التبادل الغذائي. الأطعمة المفضلة تظهر أولاً.
          </div>
          {/* Week/Month navigation tabs */}
          {result.duration === 'week' && (
            <div className="flex flex-wrap gap-2 mb-4">
              {result.days.map((d, i) => (
                <button key={i} onClick={() => setSelectedDay(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedDay === i ? 'bg-primary-600 text-white border-primary-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                  {d.name}
                </button>
              ))}
            </div>
          )}
          {result.duration === 'month' && (
            <div className="flex flex-wrap gap-2 mb-4">
              {result.weeks.map((w, i) => (
                <button key={i} onClick={() => setSelectedWeek(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedWeek === i ? 'bg-primary-600 text-white border-primary-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                  {w.name}
                </button>
              ))}
            </div>
          )}
          <div className="space-y-4">
            {(currentMenu || []).map((meal, i) => {
              const nm = normalizeMeal(meal)
              return (
              <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{nm.icon}</span>
                    <div>
                      <span className="font-bold text-slate-800 text-sm">{nm.name}</span>
                      <span className="text-xs text-slate-400 mr-2">{nm.time}</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-primary-700 text-sm">{nm.kcal} سعرة</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {/* Regular food items — click food name to edit */}
                  {nm.items.map((item, j) => {
                    const key         = `${i}-${j}`
                    const isEditing   = editKey === key
                    const displayFood = getDisplayFood(key, item.food)
                    const wasEdited   = itemEdits[key] !== undefined
                    return (
                    <div key={j} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/50 group">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-lg flex-shrink-0">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                autoFocus
                                value={editVal}
                                onChange={e => setEditVal(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') commitEdit(key); if (e.key === 'Escape') setEditKey(null) }}
                                onBlur={() => commitEdit(key)}
                                className="flex-1 text-sm font-semibold border border-primary-300 rounded-lg px-2 py-0.5 outline-none focus:ring-2 focus:ring-primary-200 text-slate-800 bg-primary-50"
                              />
                              <button onMouseDown={() => commitEdit(key)} className="text-emerald-600 hover:text-emerald-700">
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <p className={`font-semibold text-sm truncate ${wasEdited ? 'text-primary-700' : 'text-slate-800'}`}>
                                {displayFood}
                              </p>
                              <button
                                onClick={() => startEdit(key, displayFood)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-primary-500 flex-shrink-0"
                                title="تعديل الاسم"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                          <p className="text-xs text-slate-400 mt-0.5">
                            {item.group} — {item.servings} حصة
                            {item.cooking_method && item.cooking_method !== 'None' && (
                              <span className="mr-1.5 text-violet-500 font-medium">· {item.cooking_method}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-700 text-sm bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full flex-shrink-0 mr-2">
                        {item.amount}
                      </span>
                    </div>
                  )})}
                  {/* ── Salad card — visually distinct ── */}
                  {nm.salad?.has_salad && nm.salad.vegetables?.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border-t-2 border-emerald-200">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-xl flex-shrink-0">🥗</div>
                        <div>
                          <p className="font-bold text-emerald-800 text-sm">
                            {nm.salad.vegetables.join(' + ')}
                          </p>
                          <p className="text-xs text-emerald-600 mt-0.5">{nm.salad.preparation || 'سلطة طازجة'} · خضروات مجمَّعة</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {nm.salad.grams > 0 && (
                          <span className="font-bold text-emerald-700 text-sm bg-emerald-200 border border-emerald-300 px-3 py-1 rounded-full">
                            {nm.salad.grams} غ
                          </span>
                        )}
                        {nm.salad.kcal > 0 && (
                          <span className="font-medium text-emerald-600 text-xs bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                            {nm.salad.kcal} سعرة
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {/* ── Nuts card — visually distinct ── */}
                  {nm.nuts?.has_nuts && nm.nuts.type && nm.nuts.type !== 'None' && (
                    <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border-t-2 border-amber-200">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-xl flex-shrink-0">🥜</div>
                        <div>
                          <p className="font-bold text-amber-800 text-sm">{nm.nuts.type}</p>
                          <p className="text-xs text-amber-600 mt-0.5">مكسرات · دهون صحية</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {nm.nuts.grams > 0 && (
                          <span className="font-bold text-amber-700 text-sm bg-amber-200 border border-amber-300 px-3 py-1 rounded-full">
                            {nm.nuts.grams} غ
                          </span>
                        )}
                        {nm.nuts.kcal > 0 && (
                          <span className="font-medium text-amber-600 text-xs bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                            {nm.nuts.kcal} سعرة
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )})}
          </div>
        </StepCard>

        {/* Export + Save */}
        <div className="flex gap-3">
          <button onClick={openReport}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md">
            <FileText className="w-5 h-5" />
            تصدير الخطة — طباعة PDF احترافية
          </button>
        </div>

        {/* Publish to client portal */}
        <div className={`rounded-2xl border-2 overflow-hidden ${saveStatus === 'saved' ? 'border-emerald-400' : saveStatus === 'error' ? 'border-red-300' : 'border-primary-300'}`}>
          <div className="flex items-center gap-3 px-4 py-3" style={{ background: 'linear-gradient(135deg,#0a0a0a,#1a1a2e)' }}>
            <span className="text-2xl">📲</span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-extrabold">نشر الخطة على منصة العميل</p>
              <p className="text-white/40 text-xs mt-0.5">
                {pickedClient
                  ? <>ستظهر لـ <span className="text-primary-300 font-bold">{pickedClient.name}</span> في صفحة الخطة الغذائية فوراً</>
                  : 'اختر عميلاً من الأعلى أولاً'}
              </p>
            </div>
            {saveStatus === 'saved' && <span className="text-sm font-extrabold text-emerald-400 flex-shrink-0">✓ تم النشر</span>}
            {saveStatus === 'error'  && <span className="text-sm font-bold text-red-400 flex-shrink-0">خطأ — حاول مجدداً</span>}
            <button
              onClick={savePlan}
              disabled={!pickedClient || saveLoading}
              className="px-5 py-2.5 bg-primary-500 hover:bg-primary-400 disabled:bg-white/10 disabled:text-white/25 text-white rounded-xl text-sm font-extrabold transition flex-shrink-0 active:scale-95"
            >
              {saveLoading ? 'جاري النشر...' : '🚀 نشر الآن'}
            </button>
          </div>
          {saveStatus === 'saved' && (
            <div className="px-4 py-2.5 bg-emerald-50 border-t border-emerald-200 text-xs text-emerald-700 font-medium">
              ✓ الخطة الأسبوعية منشورة — يستطيع العميل رؤيتها الآن في منصته مع التقويم الأسبوعي
            </div>
          )}
        </div>

      </>)}
    </div>
  )
}
