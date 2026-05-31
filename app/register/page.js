'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Dumbbell, CheckCircle2, Loader2, Eye, EyeOff, Lock } from 'lucide-react'

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
  { title: 'النمط الغذائي',                     icon: '🥗', sub: 'Dietary Habits' },
  { title: 'الأهداف والقياسات',                 icon: '🎯', sub: 'Goals & Measurements' },
  { title: 'الحالة الصحية والنشاط البدني',     icon: '🏃', sub: 'Health & Activity' },
  { title: 'نمط الحياة وإنشاء الحساب',         icon: '🔐', sub: 'Lifestyle & Account' },
]

const INIT = {
  email:'', name:'', gender:'', age:'', height:'', weight:'',
  workActivity:'', hasScale:'',
  goal:'', targetWeight:'', hasInBody:'', inBodyNote:'',
  hasNFS:'', nfsNote:'',
  dailyMeals:'', foodAllergy:'', dislikedFoods:'', preferredFoods:'',
  appetite:'', currentDiet:'',
  waterIntake:'', hasChronicDisease:'', medications:'',
  activityLevel:'', sportType:'',
  sleepHours:'', hasPsychStress:'', foodPrep:'',
  clientPassword:'', confirmPassword:'',
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
    if (!form.goal)         errs.goal        = 'الهدف مطلوب'
    if (!form.targetWeight) errs.targetWeight= 'الوزن المثالي مطلوب'
    if (!form.hasInBody)    errs.hasInBody   = 'هذا الحقل مطلوب'
    if (!form.hasNFS)       errs.hasNFS      = 'هذا الحقل مطلوب'
  }
  if (step === 2) {
    if (!form.dailyMeals)   errs.dailyMeals  = 'عدد الوجبات مطلوب'
  }
  if (step === 3) {
    if (!form.waterIntake)  errs.waterIntake = 'كمية الماء مطلوبة'
    if (!form.activityLevel)errs.activityLevel='مستوى النشاط مطلوب'
  }
  if (step === 4) {
    if (!form.sleepHours)    errs.sleepHours     = 'ساعات النوم مطلوبة'
    if (!form.hasPsychStress)errs.hasPsychStress = 'هذا الحقل مطلوب'
    if (!form.foodPrep)      errs.foodPrep       = 'هذا الحقل مطلوب'
    if (!form.clientPassword || form.clientPassword.length < 6)
      errs.clientPassword = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    if (form.clientPassword !== form.confirmPassword)
      errs.confirmPassword = 'كلمتا المرور غير متطابقتين'
  }
  return errs
}

/* ─── Main ─── */
export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep]     = useState(0)
  const [form, setForm]     = useState(INIT)
  const [errors, setErrors] = useState({})
  const [loading, setLoad]  = useState(false)
  const [apiErr, setApiErr] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showCp, setShowCp] = useState(false)

  function next() {
    const errs = validate(step, form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
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
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoad(true); setApiErr('')
    try {
      // 1. Save registration with clientPassword
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'خطأ')

      // 2. Auto-login: set client_token cookie immediately
      const loginRes = await fetch('/api/client/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.clientPassword }),
      })
      if (loginRes.ok) {
        router.push('/client/dashboard')
      } else {
        // Login failed but registration succeeded — go to success page
        router.push('/register/success')
      }
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
          <h1 className="text-2xl font-extrabold text-white mb-1">إستبيان وضع البرنامج الغذائي</h1>
          <p className="text-white/60 text-sm">يرجى الإجابة بدقة لتمكيننا من وضع برنامج مخصص لك</p>
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
                <TextInput field="email" type="email" placeholder="exemple@gmail.com"
                  dir="ltr" form={form} setForm={setForm} errors={errors} />
              </Inp>
              <Inp label="الإسم الكامل" required error={errors.name}>
                <TextInput field="name" placeholder="أحمد بن علي"
                  form={form} setForm={setForm} errors={errors} />
              </Inp>
              <Inp label="الجنس" required error={errors.gender}>
                <RadioGroup field="gender" form={form} setForm={setForm}
                  options={[{value:'male',label:'ذكر'},{value:'female',label:'أنثى'}]} />
              </Inp>
              <div className="grid grid-cols-3 gap-3">
                <Inp label="العمر" required error={errors.age}>
                  <TextInput field="age" type="number" placeholder="25" min="10" max="80"
                    form={form} setForm={setForm} errors={errors} />
                </Inp>
                <Inp label="الطول (سم)" required error={errors.height}>
                  <TextInput field="height" type="number" placeholder="175"
                    form={form} setForm={setForm} errors={errors} />
                </Inp>
                <Inp label="الوزن (كغ)" required error={errors.weight}>
                  <TextInput field="weight" type="number" placeholder="70"
                    form={form} setForm={setForm} errors={errors} />
                </Inp>
              </div>
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

            {/* ── STEP 1: Dietary Habits ── */}
            {step === 1 && <>
              <Inp label="ما هو هدفك الرئيسي من البرنامج؟" required error={errors.goal}>
                <RadioGroup field="goal" form={form} setForm={setForm} options={[
                  {value:'loss',      label:'إنقاص الوزن / حرق الدهون'},
                  {value:'gain',      label:'زيادة الكتلة العضلية'},
                  {value:'maintain',  label:'المحافظة على الوزن وتحسين الصحة العامة'},
                  {value:'performance',label:'تحسين الأداء الرياضي'},
                ]} />
              </Inp>
              <Inp label="الوزن المثالي الذي تطمح للوصول إليه (كغ)" required error={errors.targetWeight}>
                <TextInput field="targetWeight" type="number" placeholder="65"
                  form={form} setForm={setForm} errors={errors} />
              </Inp>
              <Inp label="هل قمت بقياس نسبة الدهون (InBody) مؤخراً؟" required error={errors.hasInBody}>
                <RadioGroup field="hasInBody" form={form} setForm={setForm}
                  options={[{value:'yes',label:'نعم'},{value:'no',label:'لا'}]} />
              </Inp>
              {form.hasInBody === 'yes' && (
                <Inp label="نتائج InBody (اذكرها باختصار أو أرفق الأرقام)">
                  <Textarea field="inBodyNote" form={form} setForm={setForm} errors={errors}
                    rows={3} />
                </Inp>
              )}
              <Inp label="هل قمت بإجراء تحاليل للدم (NFS)؟" required error={errors.hasNFS}>
                <RadioGroup field="hasNFS" form={form} setForm={setForm}
                  options={[{value:'yes',label:'نعم'},{value:'no',label:'لا'}]} />
              </Inp>
              {form.hasNFS === 'yes' && (
                <Inp label="نتائج التحاليل (NFS) — اذكرها باختصار">
                  <Textarea field="nfsNote" form={form} setForm={setForm} errors={errors}
                    rows={3} />
                </Inp>
              )}
            </>}

            {/* ── STEP 2: Goals & Measurements ── */}
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
                  {value:'high',   label:'عالية جداً'},
                  {value:'medium', label:'متوسطة'},
                  {value:'low',    label:'ضعيفة'},
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
              <Inp label="هل تتناول أي أدوية أو مكملات غذائية حالياً؟"
                hint="اذكرها، أو اكتب «لا» إن لم تكن تتناول أي شيء">
                <TextInput field="medications" placeholder="فيتامين د، أوميغا 3..."
                  form={form} setForm={setForm} errors={errors} />
              </Inp>
              <Inp label="معدل نشاطك الرياضي الأسبوعي" required error={errors.activityLevel}>
                <RadioGroup field="activityLevel" form={form} setForm={setForm} options={[
                  {value:'sedentary', label:'خامل (لا يوجد نشاط)'},
                  {value:'light',     label:'خفيف (1-2 يوم في الأسبوع)'},
                  {value:'moderate',  label:'متوسط (3-4 أيام في الأسبوع)'},
                  {value:'high',      label:'عالي (5-7 أيام في الأسبوع)'},
                ]} />
              </Inp>
              <Inp label="ما هي نوع الرياضة التي تمارسها؟"
                hint="إن لم تمارس رياضة، اكتب «لا يوجد»">
                <TextInput field="sportType" placeholder="كرة القدم، رفع الأثقال..."
                  form={form} setForm={setForm} errors={errors} />
              </Inp>
            </>}

            {/* ── STEP 4: Lifestyle ── */}
            {step === 4 && <>
              <Inp label="كم عدد ساعات نومك ليلاً في الغالب؟" required error={errors.sleepHours}>
                <TextInput field="sleepHours" type="number" placeholder="7" min="3" max="12"
                  form={form} setForm={setForm} errors={errors} />
              </Inp>
              <Inp label="هل تعاني من ضغوطات نفسية أو توتر مستمر؟" required error={errors.hasPsychStress}>
                <RadioGroup field="hasPsychStress" form={form} setForm={setForm} options={[
                  {value:'yes',       label:'نعم'},
                  {value:'no',        label:'لا'},
                  {value:'sometimes', label:'غالباً'},
                ]} />
              </Inp>
              <Inp label="من يقوم بتحضير الطعام في المنزل؟" required error={errors.foodPrep}
                hint="مثال: أنا بنفسي، الأم، الزوجة، مطعم...">
                <TextInput field="foodPrep" placeholder="أنا بنفسي"
                  form={form} setForm={setForm} errors={errors} />
              </Inp>

              {/* Password section */}
              <div className="mt-2 p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-4 h-4 text-primary-500" />
                  <p className="text-sm font-extrabold text-slate-700">إنشاء كلمة مرور لحسابك</p>
                </div>
                <p className="text-xs text-slate-400 -mt-2">ستستخدمها لتسجيل الدخول لبوابتك الشخصية لاحقاً</p>
                <Inp label="كلمة المرور" required error={errors.clientPassword}>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={form.clientPassword}
                      onChange={e => setForm(f => ({ ...f, clientPassword: e.target.value }))}
                      placeholder="6 أحرف على الأقل"
                      className={`${cls(errors.clientPassword)} pr-10 pl-10`}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </Inp>
                <Inp label="تأكيد كلمة المرور" required error={errors.confirmPassword}>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                    <input
                      type={showCp ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                      placeholder="أعد كتابة كلمة المرور"
                      className={`${cls(errors.confirmPassword)} pr-10 pl-10`}
                    />
                    <button type="button" onClick={() => setShowCp(v => !v)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                      {showCp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </Inp>
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
                  <span>النشاط: <strong>{{sedentary:'خامل',light:'خفيف',moderate:'متوسط',high:'عالي'}[form.activityLevel] || '—'}</strong></span>
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
                    : <><CheckCircle2 className="w-4 h-4" /> إنشاء حسابي والدخول</>
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
