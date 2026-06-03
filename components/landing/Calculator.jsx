'use client'
import { useState } from 'react'
import { Calculator, Zap, ArrowLeft, RotateCcw } from 'lucide-react'

const activityLevels = [
  { val: 1.2,   label: 'مستقر',        desc: 'عمل مكتبي، لا رياضة' },
  { val: 1.375, label: 'خفيف',         desc: '1–3 جلسات أسبوعياً' },
  { val: 1.55,  label: 'متوسط',        desc: '3–5 جلسات أسبوعياً' },
  { val: 1.725, label: 'نشيط',         desc: '6–7 جلسات أسبوعياً' },
  { val: 1.9,   label: 'مكثف',         desc: 'رياضي / عمل بدني' },
]

function getBmiCategory(bmi) {
  if (bmi < 18.5) return { label: 'نقص في الوزن',    color: 'text-blue-400',   bar: 'bg-blue-400' }
  if (bmi < 25)   return { label: 'وزن طبيعي مثالي', color: 'text-green-400',  bar: 'bg-green-400' }
  if (bmi < 30)   return { label: 'زيادة في الوزن',  color: 'text-yellow-400', bar: 'bg-yellow-400' }
  return            { label: 'سمنة',                  color: 'text-red-400',    bar: 'bg-red-400' }
}

function getBmiWidth(bmi) {
  return Math.min(100, Math.max(5, ((bmi - 10) / 30) * 100))
}

export default function CalculatorSection() {
  const [form, setForm] = useState({ gender: 'male', age: '', height: '', weight: '', activity: 1.55 })
  const [result, setResult] = useState(null)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setResult(null) }

  function calculate() {
    const age = Number(form.age), h = Number(form.height), w = Number(form.weight)
    if (!age || !h || !w || age < 10 || h < 100 || w < 30) return
    const bmi = w / ((h / 100) ** 2)
    const bmr = form.gender === 'male'
      ? 10 * w + 6.25 * h - 5 * age + 5
      : 10 * w + 6.25 * h - 5 * age - 161
    const tdee   = Math.round(bmr * form.activity)
    const lose   = Math.round(tdee - 500)
    const gain   = Math.round(tdee + 300)
    const cat    = getBmiCategory(bmi)
    setResult({ bmi: bmi.toFixed(1), bmr: Math.round(bmr), tdee, lose, gain, cat })
  }

  function reset() { setForm({ gender: 'male', age: '', height: '', weight: '', activity: 1.55 }); setResult(null) }

  const valid = form.age && form.height && form.weight

  return (
    <section id="calculator" className="py-24 bg-[#0d0d0d] border-t border-white/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <p className="text-gold-400 font-bold text-xs uppercase tracking-widest mb-3">أداة حساب</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
            احسب <span className="text-gold-400">احتياجاتك الغذائية</span>
          </h2>
          <p className="text-white/30 max-w-xl mx-auto text-sm font-medium">
            اكتشف مؤشر كتلة جسمك وعدد السعرات الحرارية التي تحتاجها يومياً لتحقيق هدفك
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Form */}
          <div className="bg-white/3 border border-white/8 rounded-3xl p-7">
            <div className="flex items-center gap-2 mb-6">
              <Calculator className="w-4 h-4 text-gold-400" />
              <span className="text-white font-extrabold text-sm uppercase tracking-wide">بياناتك</span>
            </div>

            {/* Gender */}
            <div className="mb-5">
              <label className="text-white/40 text-xs font-bold uppercase tracking-wide block mb-2">الجنس</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ val: 'male', label: '♂ ذكر' }, { val: 'female', label: '♀ أنثى' }].map(g => (
                  <button key={g.val} onClick={() => set('gender', g.val)}
                    className={`py-2.5 rounded-xl font-bold text-sm transition-all ${form.gender === g.val ? 'bg-gold-400 text-black' : 'bg-white/5 text-white/50 hover:bg-white/8 border border-white/8'}`}>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { key: 'age',    label: 'العمر',   unit: 'سنة', min: 10, max: 90 },
                { key: 'height', label: 'الطول',   unit: 'سم',  min: 100, max: 250 },
                { key: 'weight', label: 'الوزن',   unit: 'كغ',  min: 30,  max: 300 },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-white/40 text-xs font-bold uppercase tracking-wide block mb-1.5">{f.label}</label>
                  <div className="relative">
                    <input type="number" min={f.min} max={f.max} value={form[f.key]}
                      onChange={e => set(f.key, e.target.value)} placeholder="0"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/15 focus:border-gold-400/60 outline-none transition text-sm font-bold text-center" />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white/20 text-[10px] font-bold pointer-events-none">{f.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Activity */}
            <div className="mb-6">
              <label className="text-white/40 text-xs font-bold uppercase tracking-wide block mb-2">مستوى النشاط</label>
              <div className="space-y-2">
                {activityLevels.map(a => (
                  <button key={a.val} onClick={() => set('activity', a.val)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${form.activity === a.val ? 'bg-gold-400/15 border border-gold-400/40 text-white' : 'bg-white/3 border border-white/8 text-white/50 hover:bg-white/5'}`}>
                    <span className="font-bold">{a.label}</span>
                    <span className="text-xs text-white/30">{a.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={calculate} disabled={!valid}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gold-400 hover:bg-gold-300 disabled:opacity-40 disabled:cursor-not-allowed text-black font-extrabold rounded-xl transition-all shadow-lg shadow-gold-400/20">
                <Zap className="w-4 h-4" fill="black" />
                احسب الآن
              </button>
              {result && (
                <button onClick={reset}
                  className="px-4 py-3.5 border border-white/10 text-white/40 hover:text-white rounded-xl transition-all">
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Result */}
          <div>
            {!result ? (
              <div className="bg-white/2 border border-white/5 rounded-3xl p-8 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                <div className="text-6xl mb-4 opacity-20">⚡</div>
                <p className="text-white/20 text-sm font-medium">أدخل بياناتك واضغط "احسب الآن"</p>
                <p className="text-white/10 text-xs mt-2">ستظهر نتائجك هنا فوراً</p>
              </div>
            ) : (
              <div className="space-y-4">

                {/* BMI */}
                <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-white/40 text-xs font-bold uppercase tracking-wide">مؤشر كتلة الجسم (BMI)</p>
                      <p className={`text-3xl font-extrabold mt-1 ${result.cat.color}`}>{result.bmi}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl font-extrabold text-sm ${result.cat.bar} text-black`}>
                      {result.cat.label}
                    </div>
                  </div>
                  <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                    <div className={`h-full ${result.cat.bar} rounded-full transition-all duration-700`}
                      style={{ width: `${getBmiWidth(Number(result.bmi))}%` }} />
                  </div>
                  <div className="flex justify-between text-white/20 text-[10px] font-bold mt-1.5">
                    <span>10</span><span>18.5</span><span>25</span><span>30</span><span>40+</span>
                  </div>
                </div>

                {/* Calories */}
                <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-wide mb-4">السعرات الحرارية اليومية</p>
                  <div className="space-y-3">
                    {[
                      { label: 'للحفاظ على الوزن',   val: result.tdee, color: 'bg-blue-400',   icon: '⚖️' },
                      { label: 'لحرق الدهون (−500)',  val: result.lose, color: 'bg-green-400',  icon: '🔥' },
                      { label: 'لبناء العضلات (+300)', val: result.gain, color: 'bg-gold-400',   icon: '💪' },
                    ].map(c => (
                      <div key={c.label} className="flex items-center gap-3">
                        <span className="text-lg">{c.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white/50 text-xs font-medium">{c.label}</span>
                            <span className="text-white font-extrabold text-sm">{c.val.toLocaleString()} سعرة</span>
                          </div>
                          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                            <div className={`h-full ${c.color} rounded-full`}
                              style={{ width: `${Math.min(100, (c.val / 4000) * 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-white/20 text-[10px] font-medium mt-3">معدل الأيض الأساسي (BMR): {result.bmr.toLocaleString()} سعرة</p>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-gold-400/15 to-gold-400/5 border border-gold-400/25 rounded-2xl p-5 text-center">
                  <p className="text-white font-extrabold text-sm mb-1">هل تريد خطة مخصصة لك؟</p>
                  <p className="text-white/40 text-xs mb-4">أمين سيصمم برنامجك الغذائي والتدريبي بناءً على نتائجك</p>
                  <a href="#pricing"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gold-400 text-black font-extrabold rounded-xl hover:bg-gold-300 transition-all shadow-lg shadow-gold-400/20 text-sm">
                    <Zap className="w-4 h-4" fill="black" />
                    ابدأ برنامجك الآن
                    <ArrowLeft className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
