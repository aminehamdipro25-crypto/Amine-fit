'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Utensils, Dumbbell, Trash2, Save, ArrowRight,
  Loader2, Sparkles, LogIn, Paperclip,
  CheckCircle2, X,
} from 'lucide-react'
import { linkMealsToDB, findFoodInDB, makeDBItem, calcItemTotals } from './components/foodUtils'
import NutritionTab from './components/NutritionTab'
import TrainingTab from './components/TrainingTab'
import ResourcesTab from './components/ResourcesTab'
import AIGenerateModal from './components/AIGenerateModal'

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
      if (!res.ok) { console.error('preview error:', data.error); return }
      if (data.success) {
        const tab = window.open('/client/dashboard', '_blank')
        if (!tab) window.location.href = '/client/dashboard'
      }
    } catch (e) { console.error('preview failed:', e) }
    finally { setPreviewing(false) }
  }

  const [tab, setTab]     = useState('nutrition')
  const [saving, setSaving] = useState(false)
  const [toast, setToast]   = useState('')

  // Nutrition form state (flat object passed to NutritionTab)
  const [nutritionForm, setNutritionForm] = useState({
    calories:      existing.nutrition?.calories   || '',
    protein:       existing.nutrition?.protein    || '',
    carbs:         existing.nutrition?.carbs      || '',
    fats:          existing.nutrition?.fats       || '',
    waterGoal:     existing.nutrition?.waterGoal  || '',
    fiberG:        existing.nutrition?.fiberG     || '',
    nutritionNote: existing.nutrition?.note       || '',
    nutritionTips: existing.nutrition?.tips?.join('\n') || '',
  })
  const [meals, setMeals] = useState(() => linkMealsToDB(existing.nutrition?.meals || []))
  const [calcPlanData, setCalcPlanData] = useState(null)
  const [calcDayIdx,   setCalcDayIdx]   = useState(0)

  // Training form state (flat object passed to TrainingTab)
  const [trainingForm, setTrainingForm] = useState({
    daysPerWeek:  existing.training?.daysPerWeek || '',
    duration:     existing.training?.duration    || '',
    level:        existing.training?.level       || '',
    trainingNote: existing.training?.note        || '',
    trainingTips: existing.training?.tips?.join('\n') || '',
  })
  const [days, setDays] = useState(existing.training?.days || [])

  // AI modal state (training generation)
  const [aiModal, setAiModal]     = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiForm, setAiForm]       = useState(() => {
    // Map client's questionnaire trainingLocation → equipment type
    const locToEquip = { home: 'home', outdoor: 'bodyweight', combination: 'gym' }
    const defaultEquip = existing.training?.equipment
      || locToEquip[client.trainingLocation]
      || 'gym'
    // Default days from questionnaire
    const defaultDays = client.availableTrainingDays && /^\d$/.test(client.availableTrainingDays)
      ? client.availableTrainingDays
      : '3'
    return {
      goal:       client.goal || 'gain',
      level:      client.activityLevel?.includes('مبتدئ') ? 'beginner' : 'intermediate',
      daysPerWeek: defaultDays,
      equipment:  defaultEquip,
      injuries:   client.injuries || '',
    }
  })

  // Auto-sum meal macros into top-level daily totals
  useEffect(() => {
    const hasData = meals.some(m =>
      parseFloat(m.calories) > 0 ||
      parseFloat(m.macros?.protein) > 0 ||
      parseFloat(m.macros?.carbs) > 0 ||
      parseFloat(m.macros?.fats) > 0
    )
    if (!hasData) return
    const sum = meals.reduce((acc, m) => ({
      kcal:    acc.kcal    + (parseFloat(m.calories)        || 0),
      protein: acc.protein + (parseFloat(m.macros?.protein) || 0),
      carbs:   acc.carbs   + (parseFloat(m.macros?.carbs)   || 0),
      fats:    acc.fats    + (parseFloat(m.macros?.fats)    || 0),
    }), { kcal: 0, protein: 0, carbs: 0, fats: 0 })
    setNutritionForm(f => ({
      ...f,
      calories: sum.kcal    ? String(Math.round(sum.kcal))    : '',
      protein:  sum.protein ? String(Math.round(sum.protein)) : '',
      carbs:    sum.carbs   ? String(Math.round(sum.carbs))   : '',
      fats:     sum.fats    ? String(Math.round(sum.fats))    : '',
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meals])

  /* Apply meals from a specific day of a calculator plan */
  function applyCalcDay(plan, dayIdx) {
    const { target, ex } = plan
    let menu = null
    let dayLabel = ''
    if (plan.days?.length) {
      const d = plan.days[dayIdx] || plan.days[0]
      menu = d?.menu ?? null
      dayLabel = ` — ${d?.name || ''}`
    } else if (plan.weeks?.length) {
      const w = plan.weeks[dayIdx] || plan.weeks[0]
      menu = w?.menu ?? null
      dayLabel = ` — ${w?.name || ''}`
    } else {
      menu = plan.menu ?? null
    }

    setNutritionForm(f => {
      const updated = { ...f }
      if (target) updated.calories = String(Math.round(target))
      if (ex?.macros) {
        updated.protein = String(Math.round(ex.macros.protein || 0))
        updated.carbs   = String(Math.round(ex.macros.carbs    || 0))
        updated.fats    = String(Math.round(ex.macros.fat       || 0))
      }
      const fiberVal = ex?.fiber?.g ?? ex?.fiber
      if (plan.water?.liters) updated.waterGoal = String(plan.water.liters)
      if (fiberVal)           updated.fiberG    = String(Math.round(fiberVal))
      return updated
    })
    setCalcDayIdx(dayIdx)

    if (Array.isArray(menu) && menu.length > 0) {
      setMeals(menu.map(m => {
        const linkedItems = (m.items || []).map(item => {
          const dbFood = findFoodInDB(item.food)
          if (dbFood) {
            const servings = item.servings || 1
            return makeDBItem(dbFood, servings)
          }
          return { food: item.food || '', amount: item.amount || '' }
        })
        const totals = calcItemTotals(linkedItems)
        return {
          name:        m.name || '',
          time:        m.time || '',
          calories:    totals ? String(Math.round(totals.kcal)) : String(Math.round(m.kcal || 0)),
          description: '',
          macros: {
            protein: totals ? String(Math.round(totals.protein)) : String(Math.round(m.protein || 0)),
            carbs:   totals ? String(Math.round(totals.carbs))   : String(Math.round(m.carbs   || 0)),
            fats:    totals ? String(Math.round(totals.fat))     : String(Math.round(m.fat     || 0)),
          },
          items: linkedItems,
        }
      }))
    }
    return dayLabel
  }

  /* Import macros + meals from the calculator — Redis first, then localStorage. */
  async function importFromCalculator({ setImportStatus, onMealsChange, onFormChange, form, setChatMessages }) {
    setImportStatus('جاري التحميل...')
    try {
      let plan = null
      let source = ''

      // 1. Try Redis first — contains AI-modified version
      if (client?.id) {
        try {
          const r = await fetch(`/api/admin/clients/${client.id}/calc-plan`)
          const d = await r.json()
          if (d.plan) { plan = d.plan; source = 'redis' }
        } catch {}
      }

      // 2. Fall back to localStorage
      if (!plan) {
        const raw = localStorage.getItem('amineFitPlan')
        if (raw) { plan = JSON.parse(raw); source = 'local' }
      }

      if (!plan) {
        setImportStatus('لم تُنشئ خطة في الحاسبة بعد — اذهب إلى الحاسبة أولاً ثم ارجع هنا.')
        return
      }

      setCalcPlanData(plan)
      const dayLabel = applyCalcDay(plan, 0)
      setChatMessages([])

      // Immediately publish full weekly/monthly plan to client portal
      const isMultiDay = plan.days?.length > 0 || plan.weeks?.length > 0
      if (isMultiDay && client?.id) {
        try {
          await fetch(`/api/admin/clients/${client.id}/calc-plan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan }),
          })
          try { localStorage.setItem('amineFitPlan', JSON.stringify(plan)) } catch {}
          source = 'published'
        } catch {}
      }

      const savedNote = source === 'published'
        ? ' — ✓ نُشرت على منصة العميل'
        : source === 'redis'
          ? ' (من الحفظ الأخير بالتعديلات)'
          : ' (من الجلسة الأخيرة)'
      setImportStatus('ok' + savedNote + dayLabel)
      setTimeout(() => setImportStatus(''), 6000)
    } catch {
      setImportStatus('حدث خطأ أثناء الاستيراد.')
    }
  }

  async function generateWithAI() {
    setAiLoading(true)
    try {
      const res  = await fetch('/api/ai-training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...aiForm, age: client.age, gender: client.gender }),
      })
      const plan = await res.json()
      setDays(plan.days || [])
      setTrainingForm(f => ({
        ...f,
        daysPerWeek:  plan.daysPerWeek ? String(plan.daysPerWeek) : f.daysPerWeek,
        duration:     plan.duration    ? String(plan.duration)    : f.duration,
        level:        plan.level       ? (plan.level === 'beginner' ? 'مبتدئ' : plan.level === 'advanced' ? 'متقدم' : 'متوسط') : f.level,
        trainingNote: plan.note        ? plan.note                : f.trainingNote,
        trainingTips: plan.tips?.length ? plan.tips.join('\n')    : f.trainingTips,
      }))
      setAiModal(false)
      setToast(plan.ai ? '✨ تم توليد البرنامج بالذكاء الاصطناعي' : '✓ تم تحميل البرنامج الافتراضي')
    } catch (err) {
      console.error(err)
      setToast('حدث خطأ أثناء التوليد')
    } finally {
      setAiLoading(false)
    }
  }

  async function save() {
    setSaving(true)
    const plan = {
      nutrition: {
        calories:  nutritionForm.calories,
        protein:   nutritionForm.protein,
        carbs:     nutritionForm.carbs,
        fats:      nutritionForm.fats,
        waterGoal: nutritionForm.waterGoal || null,
        fiberG:    nutritionForm.fiberG    || null,
        note:      nutritionForm.nutritionNote,
        tips:      nutritionForm.nutritionTips.split('\n').map(t => t.trim()).filter(Boolean),
        meals,
      },
      training: {
        daysPerWeek: String(days.length),
        duration:    trainingForm.duration,
        level:       trainingForm.level,
        equipment:   aiForm.equipment,
        note:        trainingForm.trainingNote,
        tips:        trainingForm.trainingTips.split('\n').map(t => t.trim()).filter(Boolean),
        days,
      },
    }
    try {
      const res = await fetch(`/api/register/${client.id}/plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      // If we have a full weekly/monthly calc plan loaded, also persist it
      if (calcPlanData && (calcPlanData.days?.length > 0 || calcPlanData.weeks?.length > 0)) {
        try {
          await fetch(`/api/admin/clients/${client.id}/calc-plan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan: calcPlanData }),
          })
          try { localStorage.setItem('amineFitPlan', JSON.stringify(calcPlanData)) } catch {}
        } catch {}
      }

      setToast('تم حفظ الخطة بنجاح ✓')
    } catch {
      setToast('❌ فشل الحفظ — تحقق من الاتصال وأعد المحاولة')
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
            <span className="text-gold-400 font-bold" dir="ltr">amine-fit.com/client/login</span>{' '}
            ببريده وكلمة المرور التي ضبطتها له.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'nutrition',  label: 'الخطة الغذائية',    icon: Utensils },
          { key: 'training',   label: 'الخطة التدريبية',   icon: Dumbbell },
          { key: 'resources',  label: 'الملفات والروابط',  icon: Paperclip },
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

      {/* Tab panels */}
      {tab === 'nutrition' && (
        <NutritionTab
          client={client}
          form={nutritionForm}
          onFormChange={setNutritionForm}
          meals={meals}
          onMealsChange={setMeals}
          calcPlanData={calcPlanData}
          calcDayIdx={calcDayIdx}
          onApplyCalcDay={applyCalcDay}
          onImportFromCalculator={importFromCalculator}
        />
      )}

      {tab === 'training' && (
        <TrainingTab
          form={trainingForm}
          onFormChange={setTrainingForm}
          days={days}
          onDaysChange={setDays}
          onGenerate={() => setAiModal(true)}
          defaultEquipment={aiForm.equipment}
        />
      )}

      {tab === 'resources' && (
        <ResourcesTab clientId={client.id} />
      )}

      {/* Save / Delete row — only for nutrition/training tabs */}
      {tab !== 'resources' && (
        <div className="flex items-center justify-between pb-6">
          <button
            onClick={async () => {
              const label = tab === 'nutrition' ? 'الخطة الغذائية' : 'الخطة التدريبية'
              if (!confirm(`هل أنت متأكد من حذف ${label} كاملاً؟ لا يمكن التراجع.`)) return
              if (tab === 'nutrition') {
                setNutritionForm({ calories:'', protein:'', carbs:'', fats:'', waterGoal:'', fiberG:'', nutritionNote:'', nutritionTips:'' })
                setMeals([])
                setCalcPlanData(null); setCalcDayIdx(0)
                if (client?.id) {
                  try { await fetch(`/api/admin/clients/${client.id}/calc-plan`, { method: 'DELETE' }) } catch {}
                }
              } else {
                setTrainingForm({ daysPerWeek:'', duration:'', level:'', trainingNote:'', trainingTips:'' })
                setDays([])
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-red-500 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-50 transition">
            <Trash2 className="w-4 h-4" />
            حذف {tab === 'nutrition' ? 'الخطة الغذائية' : 'الخطة التدريبية'}
          </button>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-[#0a0a0a] text-white rounded-xl font-bold hover:bg-black transition disabled:opacity-50 shadow-sm">
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...</>
              : <><Save className="w-4 h-4" /> حفظ الخطة</>
            }
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast msg={toast} onClose={() => setToast('')} />}

      {/* AI Modal — training generation */}
      {aiModal && (
        <AIGenerateModal
          form={aiForm}
          setForm={setAiForm}
          onGenerate={generateWithAI}
          onClose={() => setAiModal(false)}
          loading={aiLoading}
        />
      )}
    </div>
  )
}
