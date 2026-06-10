'use client'
import { useState } from 'react'
import { TrendingDown, TrendingUp, Zap, Shield } from 'lucide-react'

const results = [
  {
    initials: 'أ.م.',
    city: 'الدوحة، قطر',
    goal: 'إنقاص الوزن',
    goalColor: 'text-blue-400',
    before: { weight: '98 كغ', fat: '31%', desc: 'إرهاق دائم، لا نتيجة منذ سنتين' },
    after:  { weight: '80 كغ', fat: '18%', desc: 'طاقة عالية، ملابس أصغر بـ 3 مقاسات' },
    duration: '4 أشهر',
    loss: '−18 كغ',
    lossColor: 'text-emerald-400',
    avatar: 'أ',
    quote: 'الخطة الغذائية كانت مرنة ومناسبة لجدولي — ما شعرت بالحرمان ولو مرة.',
  },
  {
    initials: 'س.ب.',
    city: 'تونس',
    goal: 'بناء العضل',
    goalColor: 'text-orange-400',
    before: { weight: '58 كغ', fat: '24%', desc: 'ضعف عضلي، تعب بعد أي نشاط' },
    after:  { weight: '66 كغ', fat: '19%', desc: 'قوة ملحوظة، شكل رياضي واضح' },
    duration: '6 أشهر',
    loss: '+8 كغ عضل',
    lossColor: 'text-orange-400',
    avatar: 'س',
    quote: 'البرنامج مناسب لأم لثلاثة أطفال — مرن وعملي ومشروح بالتفصيل.',
  },
  {
    initials: 'ي.ع.',
    city: 'الرياض، السعودية',
    goal: 'لياقة عامة',
    goalColor: 'text-purple-400',
    before: { weight: '88 كغ', fat: '27%', desc: 'ضغط العمل، بدون نشاط منذ سنوات' },
    after:  { weight: '78 كغ', fat: '16%', desc: 'أداء رياضي محسّن، نوم أفضل، طاقة مضاعفة' },
    duration: '5 أشهر',
    loss: '−10 كغ',
    lossColor: 'text-emerald-400',
    avatar: 'ي',
    quote: 'لأول مرة أفهم التغذية فعلاً — أسلوب أمين واضح ومباشر مثله.',
  },
]

export default function Results() {
  const [active, setActive] = useState(0)
  const r = results[active]

  return (
    <section id="results" className="py-24 bg-[#0f0f0f] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <p className="text-gold-400 font-bold text-center text-xs uppercase tracking-widest mb-3">النتائج الحقيقية</p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-3 tracking-tight">
          أرقام حقيقية من عملاء حقيقيين
        </h2>
        <p className="text-white/30 text-center max-w-xl mx-auto font-medium text-sm mb-12">
          قبل وبعد — بيانات موثّقة من تقارير التقدم داخل بوابة العميل
        </p>

        {/* Selector tabs */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-pressed={active === i}
              aria-label={`عرض نتائج ${r.initials} من ${r.city}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all
                ${active === i
                  ? 'bg-gold-400 text-black border-gold-400'
                  : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold
                ${active === i ? 'bg-black/20' : 'bg-white/10'}`}>
                {r.avatar}
              </span>
              {r.initials} · {r.city}
            </button>
          ))}
        </div>

        {/* Main card */}
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

            {/* Before */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-white/40 text-xs font-extrabold uppercase tracking-widest">قبل</span>
              </div>
              <div className="flex items-end gap-4 mb-3">
                <div>
                  <p className="text-3xl font-extrabold text-white/70">{r.before.weight}</p>
                  <p className="text-white/30 text-xs font-medium mt-0.5">الوزن</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-white/70">{r.before.fat}</p>
                  <p className="text-white/30 text-xs font-medium mt-0.5">دهون</p>
                </div>
              </div>
              <p className="text-white/35 text-sm font-medium leading-relaxed">{r.before.desc}</p>
            </div>

            {/* After */}
            <div className="bg-gold-400/5 border border-gold-400/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-gold-400 text-xs font-extrabold uppercase tracking-widest">بعد · {r.duration}</span>
              </div>
              <div className="flex items-end gap-4 mb-3">
                <div>
                  <p className="text-3xl font-extrabold text-white">{r.after.weight}</p>
                  <p className="text-white/30 text-xs font-medium mt-0.5">الوزن</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-white">{r.after.fat}</p>
                  <p className="text-white/30 text-xs font-medium mt-0.5">دهون</p>
                </div>
                <div className={`mr-auto text-2xl font-extrabold ${r.lossColor}`}>{r.loss}</div>
              </div>
              <p className="text-white/60 text-sm font-medium leading-relaxed">{r.after.desc}</p>
            </div>
          </div>

          {/* Quote + meta */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-amber-500 text-black flex items-center justify-center font-extrabold text-lg flex-shrink-0">
              {r.avatar}
            </div>
            <div className="flex-1">
              <p className="text-white/55 text-sm leading-relaxed italic mb-2">"{r.quote}"</p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-white/40 text-xs font-bold">{r.initials} · {r.city}</span>
                <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full bg-white/5 ${r.goalColor}`}>{r.goal}</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <Shield className="w-3 h-3" />موثّق
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-white/20 text-xs mt-8 font-medium">
          * الأحرف الأولى فقط حفاظاً على الخصوصية — البيانات مستخرجة من تقارير التقدم داخل المنصة
        </p>

        <div className="flex justify-center mt-8">
          <a href="#pricing"
            className="flex items-center gap-2 px-8 py-4 bg-gold-400 text-black font-extrabold rounded-2xl hover:bg-gold-300 transition-all shadow-lg shadow-gold-400/20">
            <Zap className="w-5 h-5" fill="black" />
            ابدأ تحولك الآن
          </a>
        </div>
      </div>
    </section>
  )
}
