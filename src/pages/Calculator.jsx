import { useState } from 'react'
import {
  Calculator as CalcIcon, User, Activity, Target,
  ChevronDown, Info, Printer, RefreshCw,
} from 'lucide-react'
import {
  exchangeGroups, activityLevels, goals,
  calculateBMR, calculateTDEE, calculateTargetCalories, calculateExchanges, distributeMeals,
} from '../data/exchangeData'

// ---- Form field ----
function Field({ label, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm
        focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition"
    />
  )
}

function Select({ children, ...props }) {
  return (
    <div className="relative">
      <select
        {...props}
        className="w-full appearance-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm
          focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition pr-4 pl-9"
      >
        {children}
      </select>
      <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  )
}

// ---- Exchange result card ----
const groupColorMap = {
  starches:   { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-800',   badge: 'bg-amber-500' },
  meats:      { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-800',     badge: 'bg-red-500' },
  dairy:      { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-800',    badge: 'bg-blue-500' },
  fats:       { bg: 'bg-yellow-50',  border: 'border-yellow-200',  text: 'text-yellow-800',  badge: 'bg-yellow-500' },
  fruits:     { bg: 'bg-green-50',   border: 'border-green-200',   text: 'text-green-800',   badge: 'bg-green-500' },
  vegetables: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', badge: 'bg-emerald-500' },
}

function ExchangeCard({ groupKey, count }) {
  const group = exchangeGroups[groupKey]
  const c = groupColorMap[groupKey]
  const [open, setOpen] = useState(false)

  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} overflow-hidden transition-all`}>
      <div
        className="flex items-center gap-3 p-4 cursor-pointer select-none"
        onClick={() => setOpen(o => !o)}
      >
        <div className={`w-10 h-10 ${c.badge} rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0`}>
          {group.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-bold ${c.text}`}>{group.nameAr}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {group.calories} سعرة · {group.carbs}ك {group.protein}ب {group.fat}د
          </p>
        </div>
        <div className={`w-10 h-10 ${c.badge} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <span className="text-white font-extrabold text-lg">{count}</span>
        </div>
        <ChevronDown className={`w-4 h-4 ${c.text} opacity-60 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </div>

      {/* Examples dropdown */}
      {open && (
        <div className="border-t border-slate-200/60 px-4 pb-4 pt-3">
          <p className="text-xs font-semibold text-slate-500 mb-2">أمثلة على حصة واحدة:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {group.examples.map((ex, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-600 bg-white/60 rounded-lg px-2.5 py-2">
                <span className="text-slate-400 mt-0.5">•</span>
                <span><strong>{ex.name}</strong> — {ex.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Meal plan row ----
function MealRow({ meal, exchanges }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{meal.icon}</span>
        <div>
          <p className="font-bold text-slate-800">{meal.name}</p>
          <p className="text-xs text-slate-400">{meal.time}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {meal.items.map((item, i) => {
          const c = groupColorMap[item.group]
          return (
            <span
              key={i}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${c.bg} ${c.border} ${c.text}`}
            >
              <span className="text-base leading-none">{exchangeGroups[item.group].icon}</span>
              {item.count} × {item.label}
            </span>
          )
        })}
        {meal.items.length === 0 && (
          <span className="text-xs text-slate-400 italic">لا توجد حصص في هذه الوجبة</span>
        )}
      </div>
    </div>
  )
}

// ---- Macro donut mini ----
function MacroBar({ carbs, protein, fat, calories }) {
  const total = carbs * 4 + protein * 4 + fat * 9
  const pC = total ? Math.round((carbs * 4 / total) * 100) : 0
  const pP = total ? Math.round((protein * 4 / total) * 100) : 0
  const pF = 100 - pC - pP

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary-500" />
        توزيع الماكرو
      </h3>
      <div className="flex items-center justify-center mb-4">
        <div className="text-center">
          <p className="text-4xl font-extrabold text-slate-800">{calories.toLocaleString()}</p>
          <p className="text-slate-500 text-sm">سعرة حرارية / يوم</p>
        </div>
      </div>
      {/* Bar */}
      <div className="w-full h-3 rounded-full overflow-hidden flex mb-3">
        <div style={{ width: `${pC}%` }} className="bg-amber-400 transition-all" />
        <div style={{ width: `${pP}%` }} className="bg-red-400 transition-all" />
        <div style={{ width: `${pF}%` }} className="bg-yellow-300 transition-all" />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        {[
          { label: 'كربوهيدرات', value: carbs, unit: 'غ', pct: pC, color: 'text-amber-600 bg-amber-50' },
          { label: 'بروتين',     value: protein, unit: 'غ', pct: pP, color: 'text-red-600 bg-red-50' },
          { label: 'دهون',       value: fat,    unit: 'غ', pct: pF, color: 'text-yellow-600 bg-yellow-50' },
        ].map(m => (
          <div key={m.label} className={`rounded-xl p-2 ${m.color}`}>
            <p className="font-bold">{m.value} {m.unit}</p>
            <p className="text-xs opacity-70">{m.label} ({m.pct}%)</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==== Main page ====
const defaultForm = {
  name: '', age: '', weight: '', height: '',
  gender: 'male', activity: 'moderate', goal: 'maintain',
}

export default function Calculator() {
  const [form, setForm]       = useState(defaultForm)
  const [result, setResult]   = useState(null)
  const [activeTab, setTab]   = useState('exchanges')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const valid =
    form.age && form.weight && form.height &&
    +form.age > 0 && +form.weight > 0 && +form.height > 0

  function calculate() {
    if (!valid) return
    const actLevel  = activityLevels.find(a => a.key === form.activity)
    const goalData  = goals.find(g => g.key === form.goal)
    const bmr       = calculateBMR({ weight: +form.weight, height: +form.height, age: +form.age, gender: form.gender })
    const tdee      = calculateTDEE(bmr, actLevel.multiplier)
    const target    = calculateTargetCalories(tdee, goalData.adjustment)
    const exchanges = calculateExchanges(target)
    const meals     = distributeMeals(exchanges)
    setResult({ bmr: Math.round(bmr), tdee, target, exchanges, meals })
    setTab('exchanges')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Input form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-primary-50 to-white">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <CalcIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">بيانات المشترك</h2>
            <p className="text-xs text-slate-500">أدخل البيانات لحساب الحصص الغذائية بنظام التبادل</p>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="الاسم (اختياري)">
            <Input placeholder="مثال: أحمد بن علي" value={form.name} onChange={e => set('name', e.target.value)} />
          </Field>
          <Field label="العمر *">
            <Input type="number" placeholder="28" min="10" max="80" value={form.age} onChange={e => set('age', e.target.value)} />
          </Field>
          <Field label="الجنس">
            <Select value={form.gender} onChange={e => set('gender', e.target.value)}>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </Select>
          </Field>
          <Field label="الوزن (كغ) *">
            <Input type="number" placeholder="75" min="30" max="250" value={form.weight} onChange={e => set('weight', e.target.value)} />
          </Field>
          <Field label="الطول (سم) *">
            <Input type="number" placeholder="175" min="100" max="230" value={form.height} onChange={e => set('height', e.target.value)} />
          </Field>
          <Field label="مستوى النشاط">
            <Select value={form.activity} onChange={e => set('activity', e.target.value)}>
              {activityLevels.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
            </Select>
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <Field label="الهدف">
              <div className="grid grid-cols-3 gap-3 mt-1">
                {goals.map(g => (
                  <button
                    key={g.key}
                    onClick={() => set('goal', g.key)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-semibold
                      ${form.goal === g.key
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                      }`}
                  >
                    <span className="text-2xl">{g.icon}</span>
                    {g.label}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={calculate}
            disabled={!valid}
            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <CalcIcon className="w-5 h-5" />
            احسب الحصص الغذائية
          </button>
          <button
            onClick={() => { setForm(defaultForm); setResult(null) }}
            className="px-4 py-3 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors"
            title="إعادة تعيين"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-slide-in">

          {/* BMR / TDEE info banner */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'معدل الأيض الأساسي (BMR)', value: result.bmr.toLocaleString(), unit: 'سعرة' },
              { label: 'إجمالي إنفاق الطاقة (TDEE)', value: result.tdee.toLocaleString(), unit: 'سعرة' },
              { label: 'السعرات المستهدفة', value: result.target.toLocaleString(), unit: 'سعرة', highlight: true },
            ].map(b => (
              <div key={b.label} className={`rounded-2xl p-4 text-center shadow-sm border ${
                b.highlight ? 'bg-primary-600 border-primary-700 text-white' : 'bg-white border-slate-100 text-slate-800'
              }`}>
                <p className={`text-2xl font-extrabold`}>{b.value}</p>
                <p className={`text-xs mt-1 ${b.highlight ? 'text-primary-200' : 'text-slate-500'}`}>{b.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm w-fit">
            {[
              { key: 'exchanges', label: 'وحدات التبادل' },
              { key: 'meals',     label: 'توزيع الوجبات' },
              { key: 'macros',    label: 'الماكرو' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === t.key ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Exchange tab */}
          {activeTab === 'exchanges' && (
            <div>
              <div className="flex items-center gap-2 mb-3 p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700">
                <Info className="w-4 h-4 flex-shrink-0" />
                انقر على أي بطاقة لعرض أمثلة على الحصة الواحدة من هذا المجموعة الغذائية.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.keys(exchangeGroups).map(key => (
                  <ExchangeCard key={key} groupKey={key} count={result.exchanges[key]} />
                ))}
              </div>
            </div>
          )}

          {/* Meals tab */}
          {activeTab === 'meals' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3 p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700">
                <Info className="w-4 h-4 flex-shrink-0" />
                التوزيع المقترح للوجبات — يمكن تعديله حسب جدول المشترك اليومي.
              </div>
              {result.meals.map((m, i) => (
                <MealRow key={i} meal={m} exchanges={result.exchanges} />
              ))}
            </div>
          )}

          {/* Macros tab */}
          {activeTab === 'macros' && (
            <MacroBar
              carbs={result.exchanges.macros.carbs}
              protein={result.exchanges.macros.protein}
              fat={result.exchanges.macros.fat}
              calories={result.exchanges.actualCalories}
            />
          )}

          {/* Print button */}
          <button
            onClick={() => window.print()}
            className="no-print flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors"
          >
            <Printer className="w-4 h-4" />
            طباعة الخطة الغذائية
          </button>
        </div>
      )}
    </div>
  )
}
