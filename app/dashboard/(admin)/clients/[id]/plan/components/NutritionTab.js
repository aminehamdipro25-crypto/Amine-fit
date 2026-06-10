'use client'
import { useState, useRef, useEffect } from 'react'
import {
  Utensils, Plus, Loader2, CheckCircle2, Flame,
  Sparkles, Download, Info, X, Brain, Printer,
} from 'lucide-react'
import MealCard from './MealCard'
import { findFoodInDB, makeDBItem, calcItemTotals } from './foodUtils'

const emptyMeal = () => ({ name: '', time: '', calories: '', description: '', items: [], macros: { protein: '', carbs: '', fats: '' } })

/* ── NutritionTab ─────────────────────────────────────────────────────────── */
export default function NutritionTab({
  client,
  form,
  onFormChange,
  meals,
  onMealsChange,
  calcPlanData,
  calcDayIdx,
  onApplyCalcDay,
  onImportFromCalculator,
}) {
  const {
    calories, protein, carbs, fats, waterGoal, fiberG, nutritionNote, nutritionTips,
  } = form

  // Local state for generation panel
  const GOAL_MAP = { loss:'loss', gain:'gain', maintain:'maintain', performance:'maintain' }
  const [showGenPanel,  setShowGenPanel]  = useState(false)
  const [genLoading,    setGenLoading]    = useState(false)
  const [genMeals,      setGenMeals]      = useState(5)
  const [genDuration,   setGenDuration]   = useState('day')
  const [genPreferred,  setGenPreferred]  = useState(client.preferredFoods || '')
  const [genAvoided,    setGenAvoided]    = useState(
    [client.dislikedFoods, client.foodAllergy].filter(Boolean).join('، ')
  )
  const [genDays,       setGenDays]       = useState(null)
  const [genPickDay,    setGenPickDay]    = useState(false)
  const [activeDayIdx,  setActiveDayIdx]  = useState(0)
  const [importStatus,  setImportStatus]  = useState('')

  // AI chat refinement
  const [chatMessages,  setChatMessages]  = useState([])
  const [chatInput,     setChatInput]     = useState('')
  const [chatLoading,   setChatLoading]   = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages, chatLoading])

  // Convert a raw menu array → PlanBuilder meals (shared helper)
  function menuToMeals(menu) {
    return (menu || []).map(m => {
      const linkedItems = (m.items || []).map(item => {
        const dbFood = findFoodInDB(item.food)
        if (dbFood) return makeDBItem(dbFood, item.servings || 1)
        return { food: item.food || '', amount: item.amount || '' }
      })
      const totals = calcItemTotals(linkedItems)
      return {
        name:     m.name || '',
        time:     m.time || '',
        calories: totals ? String(Math.round(totals.kcal)) : String(Math.round(m.kcal || 0)),
        description: '',
        macros: {
          protein: totals ? String(Math.round(totals.protein)) : String(Math.round(m.protein || 0)),
          carbs:   totals ? String(Math.round(totals.carbs))   : String(Math.round(m.carbs   || 0)),
          fats:    totals ? String(Math.round(totals.fat))     : String(Math.round(m.fat     || 0)),
        },
        items: linkedItems,
      }
    })
  }

  function importDay(menu, idx) {
    onMealsChange(menuToMeals(menu))
    setActiveDayIdx(idx)
    setGenPickDay(false)
    setShowGenPanel(false)
    setImportStatus('ok')
    setChatMessages([])
    setTimeout(() => setImportStatus(''), 4000)
  }

  // Save current meal edits back into genDays before switching days
  function switchDay(idx) {
    if (!genDays) return
    const updatedDays = genDays.map((d, i) =>
      i === activeDayIdx
        ? { ...d, menu: mealsToMenuFormat(meals) }
        : d
    )
    setGenDays(updatedDays)
    setActiveDayIdx(idx)
    onMealsChange(menuToMeals(updatedDays[idx].menu))
    setChatMessages([])
  }

  async function generateNutritionPlan() {
    setGenLoading(true)
    setImportStatus('')
    setGenPickDay(false)
    setGenDays(null)
    try {
      const reqForm = {
        name:         client.name         || '',
        age:          client.age          || '',
        gender:       client.gender       || 'male',
        weight:       client.weight       || '',
        height:       client.height       || '',
        targetWeight: client.targetWeight || '',
        bodyFatPct:   client.bodyFatPct   || null,
        activity:     client.activityLevel || 'moderate',
        goal:         GOAL_MAP[client.goal] || 'maintain',
        preferred:    genPreferred,
        avoided:      genAvoided,
        meals:        genMeals,
        duration:     genDuration,
        country:      client.country      || '',
      }
      const res  = await fetch('/api/ai-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqForm),
      })
      const plan = await res.json()

      // Update shared macro fields via onFormChange
      const newForm = { ...form }
      if (plan.target) newForm.calories = String(Math.round(plan.target))
      if (plan.ex?.macros) {
        newForm.protein = String(Math.round(plan.ex.macros.protein || 0))
        newForm.carbs   = String(Math.round(plan.ex.macros.carbs    || 0))
        newForm.fats    = String(Math.round(plan.ex.macros.fat       || 0))
      }
      if (plan.water?.liters) newForm.waterGoal = String(plan.water.liters)
      if (plan.ex?.fiber?.g)  newForm.fiberG    = String(plan.ex.fiber.g)
      onFormChange(newForm)

      if (genDuration === 'day' && Array.isArray(plan.menu) && plan.menu.length > 0) {
        onMealsChange(menuToMeals(plan.menu))
        setGenDays(null)
        setShowGenPanel(false)
        setChatMessages([])
        setImportStatus('ok')
        setTimeout(() => setImportStatus(''), 4000)
      } else if (genDuration === 'week' && Array.isArray(plan.days)) {
        setGenDays(plan.days)
        setActiveDayIdx(0)
        setGenPickDay(true)
        onMealsChange(menuToMeals(plan.days[0].menu))
        setChatMessages([])
      } else if (genDuration === 'month' && Array.isArray(plan.weeks)) {
        const allDays = plan.weeks.flatMap(w =>
          (w.menu ? [{ name: w.name, menu: w.menu }] : [])
        )
        setGenDays(allDays)
        setActiveDayIdx(0)
        setGenPickDay(true)
        onMealsChange(menuToMeals(allDays[0]?.menu || []))
        setChatMessages([])
      }
    } catch {
      setImportStatus('حدث خطأ أثناء التوليد — تحقق من الاتصال.')
    } finally {
      setGenLoading(false)
    }
  }

  // Convert PlanBuilder meals → ai-chat menu format
  function mealsToMenuFormat(mealsList) {
    return mealsList.map(m => ({
      name:    m.name,
      time:    m.time,
      icon:    '🍽️',
      kcal:    parseFloat(m.calories)       || 0,
      carbs:   parseFloat(m.macros?.carbs)  || 0,
      protein: parseFloat(m.macros?.protein)|| 0,
      fat:     parseFloat(m.macros?.fats)   || 0,
      items:   (m.items || []).map(item => ({
        group:    item.group    || '',
        icon:     '•',
        servings: item.servings || 1,
        food:     item.food     || '',
        amount:   item.amount   || '',
      })),
    }))
  }

  async function sendNutritionChat() {
    const msg = chatInput.trim()
    if (!msg || chatLoading || meals.length === 0) return
    setChatInput('')
    const newMessages = [...chatMessages, { role: 'user', content: msg }]
    setChatMessages(newMessages)
    setChatLoading(true)
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: { target: parseFloat(calories) || 0 },
          menu: mealsToMenuFormat(meals),
          messages: newMessages,
        }),
      })
      const { menu: updatedMenu, message } = await res.json()
      onMealsChange(menuToMeals(updatedMenu))
      setChatMessages(prev => [...prev, { role: 'assistant', content: message }])
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: '⚠️ حدث خطأ في الاتصال — لم تتغير الخطة.' }])
    } finally {
      setChatLoading(false)
    }
  }

  const updateMeal = (i, val) => { const m = [...meals]; m[i] = val; onMealsChange(m) }
  const removeMeal = (i) => onMealsChange(meals.filter((_, j) => j !== i))

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-slate-800 flex items-center gap-2">
              <Flame className="w-4 h-4 text-gold-500" /> الماكرو اليومي
            </h2>
            {meals.some(m => parseFloat(m.calories) > 0) && (
              <p className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> مجموع الوجبات — يتحدث تلقائياً
              </p>
            )}
          </div>
          {/* Generate / Import buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowGenPanel(p => !p)}
              disabled={!client.age || !client.weight || !client.height}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed
                ${showGenPanel ? 'border-violet-400 bg-violet-600 text-white' : 'border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100'}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              توليد AI
            </button>
            <button
              type="button"
              onClick={async () => {
                setImportStatus('جاري التحميل...')
                await onImportFromCalculator({ setImportStatus, menuToMeals, onMealsChange, onFormChange, form, setChatMessages })
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-gold-400 text-gold-600 text-xs font-bold hover:bg-gold-50 transition"
            >
              <Download className="w-3.5 h-3.5" />
              من الحاسبة
            </button>
            <button
              type="button"
              onClick={async () => {
                // Try Redis first, then React state (calcPlanData), then localStorage
                let planData = null
                if (client?.id) {
                  try {
                    const r = await fetch(`/api/admin/clients/${client.id}/calc-plan`)
                    const d = await r.json()
                    if (d.plan) planData = d.plan
                  } catch {}
                }
                if (!planData && calcPlanData) planData = calcPlanData
                if (!planData) {
                  try { const raw = localStorage.getItem('amineFitPlan'); if (raw) planData = JSON.parse(raw) } catch {}
                }
                if (!planData) { alert('لا توجد خطة محفوظة — احفظ الخطة أولاً ثم حاول مجدداً'); return }
                localStorage.setItem('amineFitPlan', JSON.stringify(planData))
                window.open('/plan-report', '_blank')
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs font-bold hover:bg-slate-50 transition"
              title="فتح تقرير PDF من الخطة المحفوظة في الحاسبة"
            >
              <Printer className="w-3.5 h-3.5" />
              PDF
            </button>
          </div>
        </div>

        {/* AI Generation Panel — asks for options BEFORE generating */}
        {showGenPanel && (
          <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4 space-y-3">
            <p className="text-xs font-extrabold text-violet-700 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> إعدادات الخطة الغذائية
            </p>

            {/* Client summary — read-only */}
            <div className="flex flex-wrap gap-2 text-[11px]">
              {[
                { l: 'الاسم', v: client.name },
                { l: 'العمر', v: client.age ? client.age + ' سنة' : null },
                { l: 'الوزن', v: client.weight ? client.weight + ' كغ' : null },
                { l: 'الطول', v: client.height ? client.height + ' سم' : null },
                { l: 'الهدف', v: { loss:'خسارة وزن', gain:'بناء عضلات', maintain:'حفاظ', performance:'أداء رياضي' }[client.goal] || client.goal },
                { l: 'البلد', v: client.country || null },
              ].filter(x => x.v).map(x => (
                <span key={x.l} className="bg-white border border-violet-200 text-violet-800 font-semibold px-2 py-0.5 rounded-lg">
                  {x.l}: {x.v}
                </span>
              ))}
            </div>

            {/* Duration */}
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">
                مدة الخطة
                <span className="mr-2 font-normal text-slate-400 text-[10px]">اليوم والأسبوع بـ Claude AI • الشهر بالمحرك المحلي مجاناً</span>
              </label>
              <div className="flex gap-2">
                {[
                  { key:'day',   label:'يوم واحد',    badge:'Haiku AI',  badgeColor:'bg-amber-100 text-amber-700' },
                  { key:'week',  label:'أسبوع كامل',  badge:'Sonnet AI', badgeColor:'bg-violet-100 text-violet-700' },
                  { key:'month', label:'شهر كامل',    badge:'مجاناً ✓',  badgeColor:'bg-emerald-100 text-emerald-700' },
                ].map(d => (
                  <button key={d.key} type="button" onClick={() => setGenDuration(d.key)}
                    className={`flex-1 py-2 px-1 rounded-xl border-2 font-bold text-xs transition-all flex flex-col items-center gap-0.5
                      ${genDuration === d.key ? 'border-violet-500 bg-violet-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300'}`}>
                    <span>{d.label}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${genDuration === d.key ? 'bg-white/20 text-white' : d.badgeColor}`}>{d.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Meal count */}
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">عدد الوجبات في اليوم</label>
              <div className="flex gap-2">
                {[3, 4, 5].map(n => (
                  <button key={n} type="button" onClick={() => setGenMeals(n)}
                    className={`flex-1 py-2 rounded-xl border-2 font-bold text-sm transition-all
                      ${genMeals === n ? 'border-violet-500 bg-violet-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300'}`}>
                    {n} وجبات
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred foods */}
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">✅ الأطعمة المفضلة <span className="font-normal text-slate-400">(من الاستبيان — يمكنك التعديل)</span></label>
              <input value={genPreferred} onChange={e => setGenPreferred(e.target.value)}
                placeholder="دجاج، أرز، تونة..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-violet-400 transition" />
            </div>

            {/* Avoided foods */}
            <div>
              <label className="text-xs font-bold text-red-600 block mb-1">🚫 الأطعمة الممنوعة <span className="font-normal text-slate-400">(من الاستبيان — يمكنك التعديل)</span></label>
              <input value={genAvoided} onChange={e => setGenAvoided(e.target.value)}
                placeholder="لحم أحمر، حليب..."
                className="w-full px-3 py-2 rounded-xl border border-red-200 bg-white text-sm outline-none focus:border-red-400 transition" />
            </div>

            <button type="button" onClick={generateNutritionPlan} disabled={genLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-primary-600 text-white font-bold text-sm hover:from-violet-700 hover:to-primary-700 disabled:from-slate-300 disabled:to-slate-300 transition shadow-lg shadow-violet-500/20">
              {genLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري التوليد...</>
                : <><Sparkles className="w-4 h-4" /> توليد {genMeals} وجبات — {{day:'يوم',week:'أسبوع',month:'شهر'}[genDuration]}</>
              }
            </button>
          </div>
        )}

        {/* Persistent week/month day navigator */}
        {genPickDay && genDays && genDays.length > 0 && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                تنقّل بين الأيام — التعديلات تُحفظ عند الانتقال
              </p>
              <button type="button" onClick={() => { setGenPickDay(false); setGenDays(null) }}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                <X className="w-3 h-3" /> إغلاق
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {genDays.map((d, i) => (
                <button key={i} type="button" onClick={() => switchDay(i)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all border
                    ${activeDayIdx === i
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white border-emerald-200 text-emerald-800 hover:border-emerald-400'}`}>
                  {d.name}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">
              يمكنك تعديل كل يوم بخانة الذكاء الاصطناعي ثم الانتقال للتالي • احفظ الخطة عند الانتهاء
            </p>
          </div>
        )}

        {/* Import status message */}
        {importStatus && !importStatus.startsWith('ok') && (
          <div className={`flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs font-medium ${importStatus === 'جاري التحميل...' ? 'bg-violet-50 border border-violet-200 text-violet-700' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {importStatus}
          </div>
        )}
        {importStatus?.startsWith('ok') && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            تم استيراد الخطة بنجاح ✓
            {importStatus.length > 2 && <span className="font-normal text-emerald-600">{importStatus.slice(2)}</span>}
          </div>
        )}

        {/* Day picker — shown for weekly/monthly calculator plans */}
        {calcPlanData?.days?.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="text-xs text-amber-700 font-bold flex-shrink-0">اختر اليوم:</span>
            {calcPlanData.days.map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onApplyCalcDay(calcPlanData, i)
                  setImportStatus(`ok — ${d.name}`)
                  setTimeout(() => setImportStatus(''), 3000)
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                  calcDayIdx === i
                    ? 'bg-amber-500 border-amber-500 text-white'
                    : 'bg-white border-amber-300 text-amber-700 hover:bg-amber-100'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: 'calories',  label: 'السعرات (kcal)', ph: '2000', val: calories },
            { key: 'protein',   label: 'بروتين (غ)',     ph: '150',  val: protein },
            { key: 'carbs',     label: 'كربوهيدرات (غ)', ph: '250',  val: carbs },
            { key: 'fats',      label: 'دهون (غ)',        ph: '60',   val: fats },
            { key: 'waterGoal', label: 'ماء (لتر/يوم)',   ph: '2.5',  val: waterGoal },
            { key: 'fiberG',    label: 'ألياف (غ/يوم)',   ph: '25',   val: fiberG },
          ].map(({ key, label, ph, val }) => (
            <div key={key}>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">{label}</label>
              <input type="number" value={val} onChange={e => onFormChange({ ...form, [key]: e.target.value })} placeholder={ph}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
            </div>
          ))}
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">ملاحظة للعميل</label>
          <textarea value={nutritionNote} onChange={e => onFormChange({ ...form, nutritionNote: e.target.value })} rows={2}
            placeholder="ملاحظة تظهر في أعلى صفحة الخطة..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium resize-none" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">نصائح (سطر لكل نصيحة)</label>
          <textarea value={nutritionTips} onChange={e => onFormChange({ ...form, nutritionTips: e.target.value })} rows={3}
            placeholder={"اشرب 3 لتر ماء يومياً\nلا تتخطى وجبة الفطور..."}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium resize-none" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-slate-800 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-gold-500" /> الوجبات ({meals.length})
          </h2>
          <button onClick={() => onMealsChange([...meals, emptyMeal()])}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gold-400 text-black font-bold text-xs hover:bg-gold-300 transition">
            <Plus className="w-3.5 h-3.5" /> إضافة وجبة
          </button>
        </div>
        {meals.map((meal, i) => (
          <MealCard key={i} meal={meal} idx={i} onChange={v => updateMeal(i, v)} onRemove={() => removeMeal(i)} />
        ))}
        {meals.length === 0 && (
          <div className="text-center py-8 text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">
            <p className="text-sm font-medium">لا توجد وجبات — أضفها يدوياً أو ولّدها بالذكاء الاصطناعي</p>
          </div>
        )}
      </div>

      {/* AI Chat Refinement */}
      {meals.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-white">
            <div className="w-7 h-7 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-800">تعديل الخطة بالذكاء الاصطناعي</p>
              <p className="text-[10px] text-slate-400">اكتب تعليمات التعديل — مثال: "أزل السمك من الفطور"</p>
            </div>
            {chatMessages.length > 0 && (
              <button onClick={() => setChatMessages([])} className="mr-auto text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                <X className="w-3 h-3" /> مسح
              </button>
            )}
          </div>

          {/* Messages */}
          {chatMessages.length > 0 && (
            <div className="px-4 py-3 space-y-2.5 max-h-52 overflow-y-auto">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-extrabold
                    ${m.role === 'user' ? 'bg-slate-800 text-white' : 'bg-violet-600 text-white'}`}>
                    {m.role === 'user' ? 'أ' : 'AI'}
                  </div>
                  <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-xs font-medium leading-relaxed
                    ${m.role === 'user'
                      ? 'bg-slate-800 text-white rounded-tl-none'
                      : 'bg-violet-50 border border-violet-100 text-slate-700 rounded-tr-none'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-[11px] font-extrabold flex-shrink-0">AI</div>
                  <div className="bg-violet-50 border border-violet-100 px-3 py-2 rounded-2xl rounded-tr-none flex gap-1 items-center">
                    {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay:`${i*0.15}s` }} />)}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 flex gap-2 border-t border-slate-50">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendNutritionChat()}
              placeholder="مثال: أزل السمك من الفطور وضع بدله بيض..."
              disabled={chatLoading}
              className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition disabled:bg-slate-50 text-right"
            />
            <button onClick={sendNutritionChat} disabled={chatLoading || !chatInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-700 disabled:from-slate-300 disabled:bg-slate-300 transition flex items-center gap-1.5">
              {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
