'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calculator, RefreshCw, FileText, ChevronDown, ChevronUp, Info } from 'lucide-react'
import {
  ACTIVITY_FACTORS, GOALS, EX, calcBMR, calcTDEE, calcTarget,
  calcExchanges, generateMenu, getGoal, getActivity,
} from '@/lib/nutritionEngine'

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

const INIT = { name:'', age:'', weight:'', height:'', gender:'male', activity:'moderate', goal:'maintain', preferred:'', meals:5 }

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function CalculatorPage() {
  const router  = useRouter()
  const [form, setForm] = useState(INIT)
  const [result, setRes] = useState(null)
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setRes(null) }

  const valid = +form.age > 0 && +form.weight > 0 && +form.height > 0

  function calculate() {
    if (!valid) return
    const bmr    = calcBMR(form.gender, form.weight, form.height, form.age)
    const tdee   = calcTDEE(bmr, form.activity)
    const target = calcTarget(tdee, form.goal)
    const ex     = calcExchanges(target, form.goal)
    const menu   = generateMenu(ex, +form.meals, form.preferred)
    const plan   = { form, bmr: Math.round(bmr), tdee, target, ex, menu, date: new Date().toLocaleDateString('ar-TN') }
    setRes(plan)
  }

  function openReport() {
    if (!result) return
    localStorage.setItem('amineFitPlan', JSON.stringify(result))
    window.open('/plan-report', '_blank')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* ── Input Card ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-primary-50 to-white">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">بيانات المشترك</h2>
            <p className="text-xs text-slate-500">نظام التبادل الغذائي — Harris-Benedict BMR</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">الوزن (كغ) *</label>
              <input className={inp} type="number" placeholder="75" value={form.weight} onChange={e => set('weight', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">الطول (سم) *</label>
              <input className={inp} type="number" placeholder="175" value={form.height} onChange={e => set('height', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">مستوى النشاط</label>
              <select className={sel} value={form.activity} onChange={e => set('activity', e.target.value)}>
                {ACTIVITY_FACTORS.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
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

          {/* Preferred foods + meals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">الأطعمة المفضلة</label>
              <input className={inp} placeholder="دجاج، أرز، بطاطا، تونة..." value={form.preferred} onChange={e => set('preferred', e.target.value)} />
              <p className="text-xs text-slate-400">ستُدرج كأولوية في القائمة الغذائية</p>
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
          <button onClick={calculate} disabled={!valid}
            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
            <Calculator className="w-5 h-5" /> احسب البرنامج الغذائي
          </button>
          <button onClick={() => { setForm(INIT); setRes(null) }} title="إعادة تعيين"
            className="px-4 py-3 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Results ── */}
      {result && (<>

        {/* Step 1 — Energy */}
        <StepCard num="1" title="حسابات الطاقة — BMR & TDEE">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {[
              { label: 'معدل الأيض الأساسي (BMR)',   val: result.bmr.toLocaleString() + ' سعرة',   sub: 'Harris-Benedict',          hi: false },
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
          <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-500 space-y-1">
            <p><strong className="text-slate-700">معادلة Harris-Benedict:</strong></p>
            {form.gender === 'male'
              ? <p>BMR = 66.47 + (13.75 × {form.weight}) + (5.003 × {form.height}) − (6.755 × {form.age}) = <strong className="text-primary-600">{result.bmr}</strong> سعرة</p>
              : <p>BMR = 655.1 + (9.563 × {form.weight}) + (1.850 × {form.height}) − (4.676 × {form.age}) = <strong className="text-primary-600">{result.bmr}</strong> سعرة</p>
            }
            <p>TDEE = BMR × {getActivity(form.activity).pa} = <strong className="text-primary-600">{result.tdee}</strong> سعرة</p>
            <p>السعرات المستهدفة = {result.tdee} {getGoal(form.goal).adj >= 0 ? '+' : '−'} {Math.abs(getGoal(form.goal).adj)} = <strong className="text-primary-600">{result.target}</strong> سعرة</p>
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
                ].map(({ key, ex, count }) => (
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
          <div className="space-y-3">
            {result.menu.map((meal, i) => (
              <div key={i} className="border border-slate-100 rounded-2xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{meal.icon}</span>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{meal.name}</p>
                      <p className="text-xs text-slate-400">{meal.time}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-extrabold text-primary-700 text-sm">{meal.kcal} سعرة</p>
                    <p className="text-xs text-slate-400">ك:{meal.carbs}غ ب:{meal.protein}غ د:{meal.fat}غ</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {meal.items.map((item, j) => (
                    <span key={j} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-xs font-semibold bg-slate-50 border-slate-200 text-slate-700">
                      {item.icon} {item.servings} × {item.group}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </StepCard>

        {/* Step 4 — Detailed Menu in Grams */}
        <StepCard num="4" title="القائمة الغذائية التفصيلية بالغرام">
          <div className="flex items-start gap-2 mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-700">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            جميع الكميات محسوبة بالغرام بدقة وفق نظام التبادل الغذائي. الأطعمة المفضلة تظهر أولاً.
          </div>
          <div className="space-y-4">
            {result.menu.map((meal, i) => (
              <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{meal.icon}</span>
                    <div>
                      <span className="font-bold text-slate-800 text-sm">{meal.name}</span>
                      <span className="text-xs text-slate-400 mr-2">{meal.time}</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-primary-700 text-sm">{meal.kcal} سعرة</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {meal.items.map((item, j) => (
                    <div key={j} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.icon}</span>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{item.food}</p>
                          <p className="text-xs text-slate-400">{item.group} — {item.servings} حصة</p>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-700 text-sm bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                        {item.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </StepCard>

        {/* Export */}
        <div className="flex gap-3">
          <button onClick={openReport}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md">
            <FileText className="w-5 h-5" />
            تصدير الخطة — طباعة PDF احترافية
          </button>
        </div>

      </>)}
    </div>
  )
}
