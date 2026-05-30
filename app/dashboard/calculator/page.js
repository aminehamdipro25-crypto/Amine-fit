'use client'
import { useState } from 'react'
import { Calculator, RefreshCw, Info, Printer, ChevronDown } from 'lucide-react'
import {
  exchangeGroups, activityLevels, goals,
  calculateBMR, calculateTDEE, calculateTargetCalories, calculateExchanges, distributeMeals,
} from '@/lib/exchangeData'

const colorMap = {
  starches:   { bg:'bg-amber-50',   border:'border-amber-200',   text:'text-amber-800',   badge:'bg-amber-500' },
  meats:      { bg:'bg-red-50',     border:'border-red-200',     text:'text-red-800',     badge:'bg-red-500' },
  dairy:      { bg:'bg-blue-50',    border:'border-blue-200',    text:'text-blue-800',    badge:'bg-blue-500' },
  fats:       { bg:'bg-yellow-50',  border:'border-yellow-200',  text:'text-yellow-800',  badge:'bg-yellow-500' },
  fruits:     { bg:'bg-green-50',   border:'border-green-200',   text:'text-green-800',   badge:'bg-green-500' },
  vegetables: { bg:'bg-emerald-50', border:'border-emerald-200', text:'text-emerald-800', badge:'bg-emerald-500' },
}

function ExchangeCard({ groupKey, count }) {
  const group = exchangeGroups[groupKey]
  const c = colorMap[groupKey]
  const [open, setOpen] = useState(false)
  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} overflow-hidden`}>
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className={`w-10 h-10 ${c.badge} rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0`}>{group.icon}</div>
        <div className="flex-1 min-w-0">
          <p className={`font-bold ${c.text}`}>{group.nameAr}</p>
          <p className="text-xs text-slate-500">{group.calories} سعرة · {group.carbs}ك {group.protein}ب {group.fat}د</p>
        </div>
        <div className={`w-10 h-10 ${c.badge} rounded-xl flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0`}>{count}</div>
        <ChevronDown className={`w-4 h-4 ${c.text} opacity-60 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </div>
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

const init = { name:'', age:'', weight:'', height:'', gender:'male', activity:'moderate', goal:'maintain' }

export default function CalculatorPage() {
  const [form, setForm]   = useState(init)
  const [result, setRes]  = useState(null)
  const [tab, setTab]     = useState('exchanges')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const valid = form.age && form.weight && form.height && +form.age > 0 && +form.weight > 0 && +form.height > 0

  function calc() {
    if (!valid) return
    const actLevel = activityLevels.find(a => a.key === form.activity)
    const goalItem = goals.find(g => g.key === form.goal)
    const bmr    = calculateBMR({ weight:+form.weight, height:+form.height, age:+form.age, gender:form.gender })
    const tdee   = calculateTDEE(bmr, actLevel.multiplier)
    const target = calculateTargetCalories(tdee, goalItem.adjustment)
    const ex     = calculateExchanges(target)
    const meals  = distributeMeals(ex)
    setRes({ bmr: Math.round(bmr), tdee, target, exchanges: ex, meals })
    setTab('exchanges')
  }

  const inp = (extra = {}) => ({
    className: 'w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition',
    ...extra,
  })

  const sel = (extra = {}) => ({
    className: 'w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:border-primary-400 outline-none transition appearance-none',
    ...extra,
  })

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-primary-50 to-white">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">بيانات المشترك</h2>
            <p className="text-xs text-slate-500">أدخل البيانات لحساب الحصص الغذائية بنظام التبادل</p>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">الاسم (اختياري)</label>
            <input {...inp({ placeholder:'أحمد بن علي', value:form.name, onChange:e=>set('name',e.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">العمر *</label>
            <input {...inp({ type:'number', placeholder:'28', min:'10', max:'80', value:form.age, onChange:e=>set('age',e.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">الجنس</label>
            <select {...sel({ value:form.gender, onChange:e=>set('gender',e.target.value) })}>
              <option value="male">ذكر</option><option value="female">أنثى</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">الوزن (كغ) *</label>
            <input {...inp({ type:'number', placeholder:'75', value:form.weight, onChange:e=>set('weight',e.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">الطول (سم) *</label>
            <input {...inp({ type:'number', placeholder:'175', value:form.height, onChange:e=>set('height',e.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">مستوى النشاط</label>
            <select {...sel({ value:form.activity, onChange:e=>set('activity',e.target.value) })}>
              {activityLevels.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-3 space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">الهدف</label>
            <div className="grid grid-cols-3 gap-3 mt-1">
              {goals.map(g => (
                <button key={g.key} onClick={() => set('goal', g.key)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-semibold
                    ${form.goal===g.key ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'}`}>
                  <span className="text-2xl">{g.icon}</span>{g.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <button onClick={calc} disabled={!valid}
            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
            <Calculator className="w-5 h-5" /> احسب الحصص الغذائية
          </button>
          <button onClick={() => { setForm(init); setRes(null) }}
            className="px-4 py-3 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition" title="إعادة تعيين">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label:'معدل الأيض (BMR)',         val:result.bmr.toLocaleString() },
              { label:'إنفاق الطاقة (TDEE)',       val:result.tdee.toLocaleString() },
              { label:'السعرات المستهدفة',         val:result.target.toLocaleString(), hi:true },
            ].map(b => (
              <div key={b.label} className={`rounded-2xl p-4 text-center shadow-sm border ${b.hi ? 'bg-primary-600 border-primary-700 text-white' : 'bg-white border-slate-100 text-slate-800'}`}>
                <p className="text-2xl font-extrabold">{b.val}</p>
                <p className={`text-xs mt-1 ${b.hi ? 'text-primary-200' : 'text-slate-500'}`}>{b.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm w-fit">
            {[{key:'exchanges',label:'وحدات التبادل'},{key:'meals',label:'توزيع الوجبات'},{key:'macros',label:'الماكرو'}].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab===t.key ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'exchanges' && (
            <div>
              <div className="flex items-center gap-2 mb-3 p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700">
                <Info className="w-4 h-4 flex-shrink-0" />انقر على البطاقة لعرض أمثلة الحصة الواحدة.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.keys(exchangeGroups).map(k => <ExchangeCard key={k} groupKey={k} count={result.exchanges[k]} />)}
              </div>
            </div>
          )}

          {tab === 'meals' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3 p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700">
                <Info className="w-4 h-4 flex-shrink-0" />توزيع مقترح للوجبات — قابل للتعديل حسب الجدول اليومي.
              </div>
              {result.meals.map((m, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <p className="font-bold text-slate-800">{m.name}</p>
                      <p className="text-xs text-slate-400">{m.time}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {m.items.map((item, j) => {
                      const c = colorMap[item.g]
                      return (
                        <span key={j} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${c.bg} ${c.border} ${c.text}`}>
                          <span className="text-base">{exchangeGroups[item.g].icon}</span>
                          {item.c} × {exchangeGroups[item.g].nameAr}
                        </span>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'macros' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 mb-4">توزيع الماكرو</h3>
              <div className="text-center mb-4">
                <p className="text-4xl font-extrabold text-slate-800">{result.exchanges.actualCalories.toLocaleString()}</p>
                <p className="text-slate-500 text-sm">سعرة حرارية / يوم</p>
              </div>
              {(() => {
                const { carbs, protein, fat } = result.exchanges.macros
                const total = carbs*4 + protein*4 + fat*9
                const pC = total ? Math.round(carbs*4/total*100) : 0
                const pP = total ? Math.round(protein*4/total*100) : 0
                const pF = 100 - pC - pP
                return (
                  <>
                    <div className="w-full h-3 rounded-full overflow-hidden flex mb-4">
                      <div style={{ width:`${pC}%` }} className="bg-amber-400" />
                      <div style={{ width:`${pP}%` }} className="bg-red-400" />
                      <div style={{ width:`${pF}%` }} className="bg-yellow-300" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      {[
                        { label:'كربوهيدرات', val:carbs, pct:pC, cls:'text-amber-600 bg-amber-50' },
                        { label:'بروتين',     val:protein, pct:pP, cls:'text-red-600 bg-red-50' },
                        { label:'دهون',       val:fat,    pct:pF, cls:'text-yellow-600 bg-yellow-50' },
                      ].map(m => (
                        <div key={m.label} className={`rounded-xl p-2 ${m.cls}`}>
                          <p className="font-bold">{m.val} غ</p>
                          <p className="text-xs opacity-70">{m.label} ({m.pct}%)</p>
                        </div>
                      ))}
                    </div>
                  </>
                )
              })()}
            </div>
          )}

          <button onClick={() => window.print()}
            className="no-print flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition">
            <Printer className="w-4 h-4" /> طباعة الخطة الغذائية
          </button>
        </div>
      )}
    </div>
  )
}
