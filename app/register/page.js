'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Dumbbell, CheckCircle2, Loader2, Star, RotateCcw } from 'lucide-react'
import { trackEvent } from '@/lib/gtag'

const LS_FORM = 'af_reg_form'
const LS_STEP = 'af_reg_step'

// Map Arabic plan names from pricing page to subscription plan keys
const PLAN_NAME_MAP = {
  'برنامج التدريب': { key: 'basic',    label: 'برنامج التدريب',  price: '50 د.ت',  days: 30 },
  'الباقة الشهرية': { key: 'standard', label: 'الباقة الشهرية',  price: '125 د.ت', days: 30 },
  'باقة 3 أشهر':   { key: 'premium',  label: 'باقة 3 أشهر',    price: '300 د.ت', days: 90 },
}

/* ─── helpers ─── */
function Inp({ label, required, error, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700">
        {label}{required && <span className="text-rose-500 mr-1">*</span>}
      </label>
      {children}
      {hint  && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  )
}

const cls = (err) =>
  `w-full px-4 py-3 rounded-xl border text-slate-800 text-sm outline-none transition
  ${err ? 'border-rose-400 bg-rose-50 focus:ring-2 focus:ring-rose-200'
        : 'border-slate-200 bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100'}`

function TextInput({ field, form, setForm, errors, ...props }) {
  return (
    <input
      {...props}
      value={form[field] ?? ''}
      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
      className={cls(errors[field])}
    />
  )
}

function Textarea({ field, form, setForm, errors, rows = 3 }) {
  return (
    <textarea
      rows={rows}
      value={form[field] ?? ''}
      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
      className={`${cls(errors[field])} resize-none`}
    />
  )
}

function RadioGroup({ field, form, setForm, options }) {
  return (
    <div className="space-y-2">
      {options.map(opt => {
        const val = typeof opt === 'string' ? opt : opt.value
        const lbl = typeof opt === 'string' ? opt : opt.label
        const checked = form[field] === val
        return (
          <label key={val}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
              ${checked ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition
              ${checked ? 'border-primary-500 bg-primary-500' : 'border-slate-300'}`}>
              {checked && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <input type="radio" className="sr-only" checked={checked}
              onChange={() => setForm(f => ({ ...f, [field]: val }))} />
            <span className="text-sm font-medium text-slate-700">{lbl}</span>
          </label>
        )
      })}
    </div>
  )
}

/* ─── steps config ─── */
const STEPS = [
  { title: 'المعلومات الأساسية',               icon: '👤', sub: 'Basic Information' },
  { title: 'الأهداف والقياسات',                 icon: '🎯', sub: 'Goals & Measurements' },
  { title: 'النمط الغذائي',                     icon: '🥗', sub: 'Dietary Habits' },
  { title: 'الحالة الصحية والنشاط البدني',     icon: '🏃', sub: 'Health & Activity' },
  { title: 'نمط الحياة والالتزام',              icon: '🌙', sub: 'Lifestyle & Commitment' },
]

const COUNTRIES = [
  { code:'TN', label:'🇹🇳 تونس' },
  { code:'MA', label:'🇲🇦 المغرب' },
  { code:'DZ', label:'🇩🇿 الجزائر' },
  { code:'LY', label:'🇱🇾 ليبيا' },
  { code:'QA', label:'🇶🇦 قطر' },
  { code:'SA', label:'🇸🇦 السعودية' },
  { code:'AE', label:'🇦🇪 الإمارات' },
  { code:'KW', label:'🇰🇼 الكويت' },
  { code:'BH', label:'🇧🇭 البحرين' },
  { code:'OM', label:'🇴🇲 عُمان' },
  { code:'EG', label:'🇪🇬 مصر' },
  { code:'JO', label:'🇯🇴 الأردن' },
  { code:'LB', label:'🇱🇧 لبنان' },
  { code:'SY', label:'🇸🇾 سوريا' },
  { code:'IQ', label:'🇮🇶 العراق' },
  { code:'YE', label:'🇾🇪 اليمن' },
  { code:'SD', label:'🇸🇩 السودان' },
  { code:'MR', label:'🇲🇷 موريتانيا' },
  { code:'PS', label:'🇵🇸 فلسطين' },
  { code:'OTHER', label:'🌍 دولة أخرى' },
]

const INIT = {
  email:'', name:'', gender:'', age:'', height:'', weight:'',
  phone:'', country:'', workActivity:'', hasScale:'',
  goal:'', targetWeight:'', goalTimeline:'', trainingExperience:'',
  hasInBody:'', inBodyNote:'', bodyFatPct:'', hasNFS:'', nfsNote:'',
  dailyMeals:'', foodAllergy:'', dislikedFoods:'', preferredFoods:'',
  appetite:'', currentDiet:'',
  waterIntake:'', hasChronicDisease:'', chronicDiseaseNote:'',
  medications:'', activityLevel:'', sportType:'',
  hasDigestiveIssues:'', digestiveIssuesNote:'',
  hasHormonalIssues:'', hormonalIssuesNote:'',
  trainingLocation:'', availableTrainingDays:'',
  hasPhysicalLimitations:'', physicalLimitationsNote:'',
  sleepHours:'', hasPsychStress:'', foodPrep:'',
  motivation:'', previousPrograms:'', commitment:'', heardFrom:'', notes:'',
  interestedPlan: '',
}

/* ─── validation per step ─── */
function validate(step, form) {
  const errs = {}
  if (step === 0) {
    if (!form.email)        errs.email       = 'البريد الإلكتروني مطلوب'
    if (!form.name)         errs.name        = 'الاسم مطلوب'
    if (!form.gender)       errs.gender      = 'الجنس مطلوب'
    if (!form.age)          errs.age         = 'العمر مطلوب'
    if (!form.height)       errs.height      = 'الطول مطلوب'
    if (!form.weight)       errs.weight      = 'الوزن مطلوب'
    if (!form.workActivity) errs.workActivity= 'طبيعة العمل مطلوبة'
    if (!form.hasScale)     errs.hasScale    = 'هذا الحقل مطلوب'
  }
  if (step === 1) {
    if (!form.goal)               errs.goal              = 'الهدف مطلوب'
    if (!form.targetWeight)       errs.targetWeight      = 'الوزن المثالي مطلوب'
    if (!form.trainingExperience) errs.trainingExperience= 'هذا الحقل مطلوب'
    if (!form.hasInBody)          errs.hasInBody         = 'هذا الحقل مطلوب'
    if (!form.hasNFS)             errs.hasNFS            = 'هذا الحقل مطلوب'
  }
  if (step === 2) {
    if (!form.dailyMeals)   errs.dailyMeals  = 'عدد الوجبات مطلوب'
  }
  if (step === 3) {
    if (!form.waterIntake)   errs.waterIntake  = 'كمية الماء مطلوبة'
    if (!form.activityLevel) errs.activityLevel= 'مستوى النشاط مطلوب'
  }
  if (step === 4) {
    if (!form.sleepHours)    errs.sleepHours     = 'ساعات النوم مطلوبة'
    if (!form.hasPsychStress)errs.hasPsychStress = 'هذا الحقل مطلوب'
    if (!form.foodPrep)      errs.foodPrep       = 'هذا الحقل مطلوب'
  }
  return errs
}

/* ─── Main ─── */
export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep]         = useState(0)
  const [form, setForm]         = useState(INIT)
  const [errors, setErrors]     = useState({})
  const [loading, setLoad]      = useState(false)
  const [apiErr, setApiErr]     = useState('')
  const [giftCode, setGiftCode] = useState('')
  const [giftValid, setGiftValid] = useState(null)
  const [giftInfo, setGiftInfo]   = useState(null)
  const [hasSaved, setHasSaved]   = useState(false)

  // On mount: restore localStorage + read URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const plan   = params.get('plan') || ''
    const gift   = params.get('gift')?.toUpperCase().trim() || ''

    // Restore saved form data
    try {
      const saved = localStorage.getItem(LS_FORM)
      if (saved) {
        setForm(prev => ({ ...prev, ...JSON.parse(saved) }))
        setHasSaved(true)
      }
      const savedStep = parseInt(localStorage.getItem(LS_STEP) || '0', 10)
      if (savedStep > 0 && savedStep < STEPS.length) setStep(savedStep)
    } catch {}

    // URL params override saved data
    if (plan) setForm(f => ({ ...f, interestedPlan: plan }))

    // Validate gift code
    if (gift) {
      setGiftCode(gift)
      fetch(`/api/gift?code=${encodeURIComponent(gift)}`)
        .then(r => r.json())
        .then(data => {
          if (data.valid) {
            setGiftValid(true)
            setGiftInfo(data)
            if (data.planName) setForm(f => ({ ...f, interestedPlan: data.planName }))
          } else {
            setGiftValid(false)
          }
        })
        .catch(() => setGiftValid(false))
    }

    trackEvent('form_start', { form_name: 'registration', interested_plan: plan || gift || 'none' })
  }, [])

  // Persist form data to localStorage on every change
  useEffect(() => {
    try { localStorage.setItem(LS_FORM, JSON.stringify(form)) } catch {}
  }, [form])

  // Persist step
  useEffect(() => {
    try { localStorage.setItem(LS_STEP, String(step)) } catch {}
  }, [step])

  function resetForm() {
    if (!confirm('هل تريد مسح جميع البيانات والبدء من جديد؟')) return
    try { localStorage.removeItem(LS_FORM); localStorage.removeItem(LS_STEP) } catch {}
    setForm(INIT); setStep(0); setErrors({}); setApiErr('')
    setHasSaved(false)
  }

  function scrollToFirstError() {
    setTimeout(() => {
      const el = document.querySelector('.text-rose-500') || document.querySelector('.border-rose-400')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 60)
  }

  function next() {
    const errs = validate(step, form)
    if (Object.keys(errs).length) {
      setErrors(errs)
      scrollToFirstError()
      return
    }
    setErrors({})
    trackEvent('form_step_complete', { step_number: step + 1, step_name: STEPS[step].title })
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function prev() {
    setErrors({})
    setStep(s => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submit() {
    const errs = validate(4, form)
    if (Object.keys(errs).length) {
      setErrors(errs)
      scrollToFirstError()
      return
    }
    setLoad(true); setApiErr('')
    try {
      const body = { ...form }
      if (giftCode) body.giftCode = giftCode
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'خطأ')
      trackEvent('registration_complete', {
        interested_plan: form.interestedPlan || 'none',
        goal: form.goal,
        gender: form.gender,
        heard_from: form.heardFrom,
      })
      // Clear saved data after successful submission
      try { localStorage.removeItem(LS_FORM); localStorage.removeItem(LS_STEP) } catch {}
      const planParam  = form.interestedPlan ? `&plan=${encodeURIComponent(form.interestedPlan)}` : ''
      const emailParam = data.email ? `&email=${encodeURIComponent(data.email)}` : ''
      router.push(data.alreadyRegistered ? `/register/success?existing=1${planParam}${emailParam}` : `/register/success?${planParam}${emailParam}`)
    } catch (e) {
      setApiErr(e.message)
    } finally {
      setLoad(false)
    }
  }

  const pct = Math.round(((step) / STEPS.length) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-extrabold text-xl">Amine-Fit</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1">استبيان التقييم الأولي</h1>
          <p className="text-white/60 text-sm">إجاباتك الدقيقة تُمكّن المدرب من تصميم برنامجك الشخصي بدقة عالية</p>
          {hasSaved && (
            <button onClick={resetForm}
              className="mt-3 inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs transition">
              <RotateCcw className="w-3 h-3" /> مسح البيانات والبدء من جديد
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-white/50 mb-2">
            <span>الخطوة {step + 1} من {STEPS.length}</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-2 rounded-full bg-gradient-to-l from-emerald-400 to-primary-500 transition-all duration-500"
              style={{ width: `${pct + 20}%` }} />
          </div>
          <div className="flex justify-between mt-3">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all
                  ${i < step  ? 'bg-emerald-500 text-white'
                  : i === step? 'bg-primary-500 text-white ring-4 ring-primary-500/30'
                               : 'bg-white/10 text-white/40'}`}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : s.icon}
                </div>
                <span className={`text-xs hidden sm:block ${i === step ? 'text-white font-semibold' : 'text-white/40'}`}>
                  {s.title.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">

          {/* Gift banner */}
          {giftValid && giftInfo && (
            <div className="mb-4 bg-gradient-to-l from-violet-50 to-purple-50 border border-violet-200 rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-violet-500 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">🎁</div>
              <div className="flex-1">
                <p className="text-xs font-extrabold text-violet-700 uppercase tracking-wide">هدية مجانية من المدرب أمين</p>
                <p className="font-extrabold text-slate-900 text-sm">
                  {giftInfo.planName}
                  <span className="text-violet-600 font-bold mr-2">— مجاناً 🎉</span>
                </p>
              </div>
            </div>
          )}
          {giftValid === false && giftCode && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <p className="text-red-600 text-sm font-semibold">⚠️ رابط الهدية غير صالح أو مستخدم مسبقاً</p>
            </div>
          )}

          {/* Selected plan banner */}
          {!giftValid && form.interestedPlan && PLAN_NAME_MAP[form.interestedPlan] && (
            <div className="mb-6 bg-gradient-to-l from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-black fill-black" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-extrabold text-amber-700 uppercase tracking-wide">الباقة المختارة</p>
                <p className="font-extrabold text-slate-900 text-sm">
                  {PLAN_NAME_MAP[form.interestedPlan].label}
                  <span className="text-amber-600 font-bold mr-2">— {PLAN_NAME_MAP[form.interestedPlan].price}</span>
                </p>
              </div>
              <button onClick={() => setForm(f => ({ ...f, interestedPlan: '' }))}
                className="text-amber-400 hover:text-amber-600 text-lg leading-none font-bold">×</button>
            </div>
          )}

          <div className="mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <span>{STEPS[step].icon}</span> {STEPS[step].title}
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">{STEPS[step].sub}</p>
          </div>

          <div className="space-y-5">

            {/* ── STEP 0: Basic Info ── */}
            {step === 0 && <>
              <Inp label="البريد الإلكتروني" required error={errors.email}>
                <TextInput field="email" type="email" placeholder="example@gmail.com"
                  dir="ltr" form={form} setForm={setForm} errors={errors} />
              </Inp>
              <Inp label="الإسم الكامل" required error={errors.name}>
                <TextInput field="name" placeholder="أحمد بن علي"
                  form={form} setForm={setForm} errors={errors} />
              </Inp>
              <Inp label="رقم الهاتف (واتساب)" error={errors.phone}
                hint="للتواصل وإرسال بيانات الدخول">
                <TextInput field="phone" type="tel" placeholder="+974 3065 3759"
                  dir="ltr" form={form} setForm={setForm} errors={errors} />
              </Inp>
              <Inp label="البلد" error={errors.country}
                hint="يساعد في تكييف البرنامج الغذائي مع الأطعمة المحلية">
                <select
                  value={form.country ?? ''}
                  onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                  className={cls(errors.country)}>
                  <option value="">اختر بلدك...</option>
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </Inp>
              <Inp label="الجنس" required error={errors.gender}>
                <RadioGroup field="gender" form={form} setForm={setForm}
                  options={[{value:'male',label:'ذكر'},{value:'female',label:'أنثى'}]} />
              </Inp>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Inp label="العمر" required error={errors.age}>
                  <TextInput field="age" type="number" placeholder="25" min="10" max="80"
                    form={form} setForm={setForm} errors={errors} />
                </Inp>
                <Inp label="الطول (سم)" required error={errors.height}>
                  <TextInput field="height" type="number" placeholder="175" min="100" max="250"
                    form={form} setForm={setForm} errors={errors} />
                </Inp>
                <Inp label="الوزن (كغ)" required error={errors.weight}>
                  <TextInput field="weight" type="number" placeholder="70" min="30" max="300"
                    form={form} setForm={setForm} errors={errors} />
                </Inp>
              </div>

              {/* BMI Preview */}
              {form.height && form.weight && +form.height > 0 && +form.weight > 0 && (() => {
                const bmi = (+form.weight / ((+form.height / 100) ** 2)).toFixed(1)
                const cat = bmi < 18.5 ? { label: 'نقص وزن', color: 'text-blue-600 bg-blue-50 border-blue-200' }
                  : bmi < 25 ? { label: 'وزن طبيعي ✓', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' }
                  : bmi < 30 ? { label: 'زيادة وزن', color: 'text-amber-600 bg-amber-50 border-amber-200' }
                  : { label: 'سمنة', color: 'text-red-600 bg-red-50 border-red-200' }
                return (
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-bold ${cat.color}`}>
                    <span>مؤشر كتلة الجسم (BMI): {bmi}</span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-white/50">{cat.label}</span>
                  </div>
                )
              })()}

              <Inp label="طبيعة العمل / النشاط اليومي" required error={errors.workActivity}
                hint="مثال: موظف مكتبي، عامل ميداني، ربة بيت...">
                <TextInput field="workActivity" placeholder="موظف مكتبي"
                  form={form} setForm={setForm} errors={errors} />
              </Inp>
              <Inp label="هل لديك ميزان في المطبخ؟" required error={errors.hasScale}>
                <RadioGroup field="hasScale" form={form} setForm={setForm}
                  options={[{value:'yes',label:'نعم'},{value:'no',label:'لا'}]} />
              </Inp>
            </>}

            {/* ── STEP 1: Goals & Measurements ── */}
            {step === 1 && <>
              <Inp label="ما هو هدفك الرئيسي من البرنامج؟" required error={errors.goal}>
                <RadioGroup field="goal" form={form} setForm={setForm} options={[
                  {value:'loss',       label:'📉 إنقاص الوزن / حرق الدهون'},
                  {value:'gain',       label:'💪 زيادة الكتلة العضلية'},
                  {value:'maintain',   label:'⚖️ المحافظة على الوزن وتحسين الصحة العامة'},
                  {value:'performance',label:'🏃 تحسين الأداء الرياضي'},
                ]} />
              </Inp>
              <Inp label="الوزن المثالي الذي تطمح للوصول إليه (كغ)" required error={errors.targetWeight}>
                <TextInput field="targetWeight" type="number" placeholder="65" min="30" max="250"
                  form={form} setForm={setForm} errors={errors} />
              </Inp>
              <Inp label="في كم من الوقت تتوقع الوصول لهدفك؟" error={errors.goalTimeline}>
                <RadioGroup field="goalTimeline" form={form} setForm={setForm} options={[
                  {value:'1month',   label:'أقل من شهر (هدف قريب)'},
                  {value:'3months',  label:'1 – 3 أشهر'},
                  {value:'6months',  label:'3 – 6 أشهر'},
                  {value:'long',     label:'أكثر من 6 أشهر (تدريجي وصحي)'},
                ]} />
              </Inp>
              <Inp label="ما مستوى تجربتك الرياضية؟" required error={errors.trainingExperience}>
                <RadioGroup field="trainingExperience" form={form} setForm={setForm} options={[
                  {value:'beginner',     label:'مبتدئ — أقل من سنة'},
                  {value:'intermediate', label:'متوسط — 1 إلى 3 سنوات'},
                  {value:'advanced',     label:'متقدم — أكثر من 3 سنوات'},
                ]} />
              </Inp>
              <Inp label="هل قمت بقياس نسبة الدهون (InBody) مؤخراً؟" required error={errors.hasInBody}>
                <RadioGroup field="hasInBody" form={form} setForm={setForm}
                  options={[{value:'yes',label:'نعم'},{value:'no',label:'لا'}]} />
              </Inp>
              {form.hasInBody === 'yes' && (
                <Inp label="نتائج InBody (اذكرها باختصار أو أرفق الأرقام)">
                  <Textarea field="inBodyNote" form={form} setForm={setForm} errors={errors} rows={3} />
                </Inp>
              )}
              <Inp label="نسبة الدهون في الجسم % (اختياري)"
                hint="إذا أجريت قياس InBody أو DEXA — أدخل النسبة لدقة أعلى في حساباتك">
                <input
                  type="number"
                  min="3"
                  max="70"
                  placeholder="مثال: 18"
                  value={form.bodyFatPct ?? ''}
                  onChange={e => setForm(f => ({ ...f, bodyFatPct: e.target.value }))}
                  className={cls(errors.bodyFatPct)}
                />
              </Inp>
              <Inp label="هل قمت بإجراء تحاليل للدم (NFS)؟" required error={errors.hasNFS}>
                <RadioGroup field="hasNFS" form={form} setForm={setForm}
                  options={[{value:'yes',label:'نعم'},{value:'no',label:'لا'}]} />
              </Inp>
              {form.hasNFS === 'yes' && (
                <Inp label="نتائج التحاليل (NFS) — اذكرها باختصار">
                  <Textarea field="nfsNote" form={form} setForm={setForm} errors={errors} rows={3} />
                </Inp>
              )}
            </>}

            {/* ── STEP 2: Dietary Habits ── */}
            {step === 2 && <>
              <Inp label="كم عدد الوجبات التي تتناولها حالياً في اليوم؟" required error={errors.dailyMeals}>
                <TextInput field="dailyMeals" type="number" placeholder="3" min="1" max="10"
                  form={form} setForm={setForm} errors={errors} />
              </Inp>
              <Inp label="هل تعاني من حساسية تجاه أي نوع من الطعام؟"
                hint="اذكر المواد إن وجدت، أو اكتب «لا» إن لم تكن لديك حساسية">
                <Textarea field="foodAllergy" form={form} setForm={setForm} errors={errors} />
              </Inp>
              <Inp label="أطعمة لا تحبها وتريد استبعادها من الجدول">
                <Textarea field="dislikedFoods" form={form} setForm={setForm} errors={errors} />
              </Inp>
              <Inp label="أطعمة تحبها وتفضل وجودها بشكل أساسي">
                <Textarea field="preferredFoods" form={form} setForm={setForm} errors={errors} />
              </Inp>
              <Inp label="كيف تصف شهيتك للطعام؟" error={errors.appetite}>
                <RadioGroup field="appetite" form={form} setForm={setForm} options={[
                  {value:'high',   label:'عالية جداً — أجد صعوبة في التوقف عن الأكل'},
                  {value:'medium', label:'متوسطة — طبيعية'},
                  {value:'low',    label:'ضعيفة — أنسى الأكل أحياناً'},
                ]} />
              </Inp>
              <Inp label="هل تتبع نظاماً غذائياً معيناً حالياً؟"
                hint="إن لم تتبع أي نظام، اكتب «لا»">
                <Textarea field="currentDiet" form={form} setForm={setForm} errors={errors} rows={2} />
              </Inp>
            </>}

            {/* ── STEP 3: Health & Activity ── */}
            {step === 3 && <>
              <Inp label="كم لتر ماء تشرب يومياً تقريباً؟" required error={errors.waterIntake}>
                <TextInput field="waterIntake" type="number" placeholder="1.5" step="0.5"
                  form={form} setForm={setForm} errors={errors} />
              </Inp>
              <Inp label="هل تعاني من أي أمراض مزمنة؟" error={errors.hasChronicDisease}>
                <RadioGroup field="hasChronicDisease" form={form} setForm={setForm}
                  options={[{value:'yes',label:'نعم'},{value:'no',label:'لا'}]} />
              </Inp>
              {form.hasChronicDisease === 'yes' && (
                <Inp label="اذكر الأمراض المزمنة">
                  <Textarea field="chronicDiseaseNote" form={form} setForm={setForm} errors={errors} rows={2} />
                </Inp>
              )}
              <Inp label="هل تعاني من مشاكل هضمية؟" error={errors.hasDigestiveIssues}
                hint="انتفاخ، قولون عصبي، إمساك، حرقة معدة...">
                <RadioGroup field="hasDigestiveIssues" form={form} setForm={setForm}
                  options={[{value:'yes',label:'نعم'},{value:'no',label:'لا'}]} />
              </Inp>
              {form.hasDigestiveIssues === 'yes' && (
                <Inp label="اذكر المشاكل الهضمية باختصار">
                  <Textarea field="digestiveIssuesNote" form={form} setForm={setForm} errors={errors} rows={2} />
                </Inp>
              )}
              {/* Female-specific hormonal question */}
              {form.gender === 'female' && (
                <>
                  <Inp label="هل لديك أي من هذه الحالات الصحية؟" error={errors.hasHormonalIssues}
                    hint="تكيس المبايض، مشاكل الغدة الدرقية، حمل، رضاعة، انقطاع الطمث...">
                    <RadioGroup field="hasHormonalIssues" form={form} setForm={setForm}
                      options={[{value:'yes',label:'نعم'},{value:'no',label:'لا'}]} />
                  </Inp>
                  {form.hasHormonalIssues === 'yes' && (
                    <Inp label="اذكر الحالة باختصار">
                      <Textarea field="hormonalIssuesNote" form={form} setForm={setForm} errors={errors} rows={2} />
                    </Inp>
                  )}
                </>
              )}
              <Inp label="هل تتناول أي أدوية أو مكملات غذائية حالياً؟"
                hint="اذكرها، أو اكتب «لا» إن لم تكن تتناول أي شيء">
                <TextInput field="medications" placeholder="فيتامين د، أوميغا 3..."
                  form={form} setForm={setForm} errors={errors} />
              </Inp>
              <Inp label="معدل نشاطك الرياضي الأسبوعي" required error={errors.activityLevel}>
                <RadioGroup field="activityLevel" form={form} setForm={setForm} options={[
                  {value:'sedentary', label:'🪑 خامل — لا رياضة، عمل مكتبي'},
                  {value:'light',     label:'🚶 خفيف — 1-2 يوم في الأسبوع'},
                  {value:'moderate',  label:'🏃 متوسط — 3-4 أيام في الأسبوع'},
                  {value:'active',    label:'💪 نشيط — 5-6 أيام في الأسبوع'},
                  {value:'veryActive',label:'🔥 نشيط جداً — تدريب يومي مكثف'},
                ]} />
              </Inp>
              <Inp label="ما هي نوع الرياضة التي تمارسها؟"
                hint="إن لم تمارس رياضة، اكتب «لا يوجد»">
                <TextInput field="sportType" placeholder="كرة القدم، رفع الأثقال..."
                  form={form} setForm={setForm} errors={errors} />
              </Inp>

              {/* ── Training Environment ── */}
              <div className="pt-2 pb-1 border-t border-slate-100">
                <p className="text-xs font-bold text-primary-600 uppercase tracking-widest">🔬 بيئة التدريب</p>
                <p className="text-xs text-slate-400 mt-0.5">تساعد المدرب في تخصيص التمارين حسب إمكانياتك الفعلية</p>
              </div>
              <Inp label="أين تفضل التدريب؟" error={errors.trainingLocation}>
                <RadioGroup field="trainingLocation" form={form} setForm={setForm} options={[
                  {value:'gym',        label:'🏋️ صالة رياضية (نادي)'},
                  {value:'home',       label:'🏠 المنزل (بدون معدات أو معدات بسيطة)'},
                  {value:'outdoor',    label:'🌳 في الهواء الطلق (الحديقة، الملعب)'},
                  {value:'combination',label:'🔀 مزيج (صالة + منزل أو خارج)'},
                ]} />
              </Inp>
              <Inp label="كم يوماً في الأسبوع يمكنك التدريب؟" error={errors.availableTrainingDays}>
                <RadioGroup field="availableTrainingDays" form={form} setForm={setForm} options={[
                  {value:'2', label:'يومان'},
                  {value:'3', label:'3 أيام'},
                  {value:'4', label:'4 أيام'},
                  {value:'5', label:'5 أيام أو أكثر'},
                ]} />
              </Inp>
              <Inp label="هل لديك أي إصابات أو قيود جسدية؟" error={errors.hasPhysicalLimitations}
                hint="آلام في الركبة، الظهر، الكتف، أي منطقة تحتاج تجنبها...">
                <RadioGroup field="hasPhysicalLimitations" form={form} setForm={setForm}
                  options={[{value:'yes',label:'نعم'},{value:'no',label:'لا'}]} />
              </Inp>
              {form.hasPhysicalLimitations === 'yes' && (
                <Inp label="اذكر القيود أو الإصابات باختصار">
                  <Textarea field="physicalLimitationsNote" form={form} setForm={setForm} errors={errors} rows={2} />
                </Inp>
              )}
            </>}

            {/* ── STEP 4: Lifestyle & Commitment ── */}
            {step === 4 && <>
              <Inp label="كم عدد ساعات نومك ليلاً في الغالب؟" required error={errors.sleepHours}>
                <TextInput field="sleepHours" type="number" placeholder="7" min="3" max="12"
                  form={form} setForm={setForm} errors={errors} />
              </Inp>
              <Inp label="هل تعاني من ضغوطات نفسية أو توتر مستمر؟" required error={errors.hasPsychStress}>
                <RadioGroup field="hasPsychStress" form={form} setForm={setForm} options={[
                  {value:'yes',       label:'نعم'},
                  {value:'no',        label:'لا'},
                  {value:'sometimes', label:'أحياناً'},
                ]} />
              </Inp>
              <Inp label="من يقوم بتحضير الطعام في المنزل؟" required error={errors.foodPrep}
                hint="مثال: أنا بنفسي، الأم، الزوجة، مطعم...">
                <TextInput field="foodPrep" placeholder="أنا بنفسي"
                  form={form} setForm={setForm} errors={errors} />
              </Inp>
              <Inp label="ما الذي دفعك للاشتراك في هذا البرنامج؟"
                hint="تحفيزك يساعدنا في دعمك بشكل أفضل">
                <Textarea field="motivation" form={form} setForm={setForm} errors={errors} rows={2} />
              </Inp>
              <Inp label="هل سبق وجربت برامج غذائية أو رياضية من قبل؟"
                hint="وما الذي نجح أو لم ينجح معك؟">
                <Textarea field="previousPrograms" form={form} setForm={setForm} errors={errors} rows={2} />
              </Inp>
              <Inp label="كيف تقيّم مستوى التزامك المتوقع بالبرنامج؟" error={errors.commitment}>
                <RadioGroup field="commitment" form={form} setForm={setForm} options={[
                  {value:'high',   label:'🔥 عالٍ جداً — مستعد للالتزام الكامل'},
                  {value:'medium', label:'✅ متوسط — سألتزم في معظم الأوقات'},
                  {value:'low',    label:'📌 منخفض — قد أواجه صعوبة في البداية'},
                ]} />
              </Inp>
              <Inp label="كيف عرفت عن مدرب أمين فيت؟">
                <RadioGroup field="heardFrom" form={form} setForm={setForm} options={[
                  {value:'instagram', label:'إنستغرام'},
                  {value:'friend',    label:'صديق أو معرفة'},
                  {value:'google',    label:'بحث على الإنترنت'},
                  {value:'tiktok',    label:'تيك توك'},
                  {value:'other',     label:'أخرى'},
                ]} />
              </Inp>

              {/* Pending approval notice */}
              <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <p className="text-sm font-extrabold text-amber-800 mb-1">⏳ ماذا سيحدث بعد الإرسال؟</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  سيراجع المدرب أمين طلبك ويرسل لك بيانات الدخول على بريدك الإلكتروني خلال 24 ساعة.
                </p>
              </div>

              {/* Summary box */}
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <p className="text-sm font-semibold text-emerald-800 mb-2">✅ تحقق من بياناتك قبل الإرسال</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-emerald-700">
                  <span>الاسم: <strong>{form.name || '—'}</strong></span>
                  <span>العمر: <strong>{form.age || '—'} سنة</strong></span>
                  <span>الوزن: <strong>{form.weight || '—'} كغ</strong></span>
                  <span>الطول: <strong>{form.height || '—'} سم</strong></span>
                  <span>الهدف: <strong>{{loss:'خسارة وزن',gain:'بناء عضلات',maintain:'الحفاظ على الوزن',performance:'أداء رياضي'}[form.goal] || '—'}</strong></span>
                  <span>النشاط: <strong>{{sedentary:'خامل',light:'خفيف',moderate:'متوسط',active:'نشيط',veryActive:'نشيط جداً'}[form.activityLevel] || '—'}</strong></span>
                </div>
              </div>

              {apiErr && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
                  {apiErr}
                </div>
              )}
            </>}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100">
            {step > 0
              ? <button onClick={prev}
                  className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition">
                  <ChevronRight className="w-4 h-4" /> السابق
                </button>
              : <div />
            }

            {step < STEPS.length - 1
              ? <button onClick={next}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition shadow-md">
                  التالي <ChevronLeft className="w-4 h-4" />
                </button>
              : <button onClick={submit} disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-primary-600 hover:opacity-90 disabled:opacity-60 text-white font-bold rounded-xl transition shadow-md">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري إنشاء حسابك...</>
                    : <><CheckCircle2 className="w-4 h-4" /> إرسال الطلب</>
                  }
                </button>
            }
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          جميع بياناتك محمية وسرية — لن تُشارك مع أي طرف ثالث
        </p>
      </div>
    </div>
  )
}
