'use client'
import { useState, useEffect } from 'react'
import { X, Check, ArrowLeft, Zap, Shield, Clock, Headphones, Flame, Tag } from 'lucide-react'

/* ── countdown to end of month ── */
function useCountdown() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 })
  useEffect(() => {
    function calc() {
      const now  = new Date()
      const end  = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      const diff = Math.max(0, end - now)
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

const plans = [
  {
    name: 'برنامج التدريب',
    salePrice: '50',
    origPrice: '100',
    currency: 'د.ت',
    period: '/ شهر',
    desc: 'للبدء بخطوة واحدة',
    emoji: '🏋️',
    badge: null,
    color: 'dark',
    duration: 'شهر واحد',
    support: 'واتساب (رد خلال 24 ساعة)',
    sessions: 'حسب المستوى',
    includes: [
      'خطة تدريب أسبوعية مخصصة',
      'بوابة عميل شخصية للوصول للبرنامج',
      'تعديل الخطة عند الحاجة',
      'دعم عبر الواتساب',
    ],
    notIncluded: [
      'خطة غذائية',
      'متابعة أسبوعية مفصلة',
      'قياسات InBody',
    ],
    forWho: 'مثالي لمن يريد بداية بسيطة بخطة تدريب احترافية دون التزام غذائي كامل.',
  },
  {
    name: 'الباقة الشهرية',
    salePrice: '125',
    origPrice: '250',
    currency: 'د.ت',
    period: '/ شهر',
    desc: 'تدريب + تغذية متكاملة',
    emoji: '⚡',
    badge: '⭐ الأكثر طلباً',
    color: 'gold',
    duration: 'شهر واحد',
    support: 'واتساب + متابعة أسبوعية',
    sessions: '3–4 جلسات / أسبوع',
    includes: [
      'خطة تدريب أسبوعية مخصصة',
      'خطة غذائية بنظام التبادل الكامل',
      'بوابة عميل شخصية متكاملة',
      'متابعة أسبوعية + تعديلات فورية',
      'استشارات غذائية عبر الواتساب',
      'تقرير تقدم شهري',
    ],
    notIncluded: [
      'قياسات InBody الشهرية',
    ],
    forWho: 'الخيار الأمثل لمن يريد تحولاً حقيقياً في التدريب والتغذية معاً خلال شهر واحد.',
  },
  {
    name: 'باقة 3 أشهر',
    salePrice: '300',
    origPrice: '600',
    currency: 'د.ت',
    period: '/ 3 أشهر',
    desc: 'الأوفر — نتائج مضمونة',
    emoji: '🏆',
    badge: '💎 الأوفر',
    color: 'dark',
    duration: '3 أشهر كاملة',
    support: 'دعم مباشر + مكالمة شهرية',
    sessions: '3–5 جلسات / أسبوع',
    includes: [
      'خطة تدريب + تغذية كاملة ومتجددة',
      'بوابة عميل شخصية متكاملة',
      'متابعة أسبوعية طوال الفترة',
      'تعديل الخطط كل شهر حسب التقدم',
      'استشارات غذائية غير محدودة',
      'تقارير تقدم مفصلة شهرية',
      'ضمان التقدم الملموس أو التمديد مجاناً',
    ],
    notIncluded: [],
    forWho: 'للجادين فعلاً — 3 أشهر كافية لتحول حقيقي مع ضمان نتيجة ملموسة.',
  },
]

function Digit({ val, label }) {
  return (
    <div className="text-center">
      <div className="bg-black/30 border border-white/10 rounded-xl w-14 h-14 flex items-center justify-center">
        <span className="text-2xl font-extrabold text-white tabular-nums">
          {String(val).padStart(2, '0')}
        </span>
      </div>
      <p className="text-white/30 text-[10px] font-bold mt-1 uppercase">{label}</p>
    </div>
  )
}

function PlanModal({ plan, onClose }) {
  const isGold = plan.color === 'gold'
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-4
        ${isGold ? 'bg-white' : 'bg-[#111]'}`}>

        <div className={`px-7 pt-7 pb-5 relative
          ${isGold
            ? 'bg-gradient-to-br from-gold-400 to-amber-400'
            : 'bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] border-b border-white/5'}`}>
          <button onClick={onClose}
            className={`absolute top-4 left-4 p-2 rounded-xl transition
              ${isGold ? 'text-black/40 hover:bg-black/10' : 'text-white/30 hover:bg-white/5'}`}>
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-start gap-4">
            <span className="text-5xl">{plan.emoji}</span>
            <div>
              {plan.badge && (
                <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full mb-2 inline-block
                  ${isGold ? 'bg-black/10 text-black' : 'bg-gold-400/10 text-gold-400 border border-gold-400/20'}`}>
                  {plan.badge}
                </span>
              )}
              <h2 className={`text-2xl font-extrabold ${isGold ? 'text-black' : 'text-white'}`}>{plan.name}</h2>
              <p className={`text-sm font-medium ${isGold ? 'text-black/50' : 'text-white/40'}`}>{plan.desc}</p>
            </div>
          </div>
          <div className="flex items-end gap-2 mt-4">
            <span className={`text-4xl font-extrabold ${isGold ? 'text-black' : 'text-white'}`}>{plan.salePrice}</span>
            <div className="mb-1">
              <span className={`line-through text-sm block ${isGold ? 'text-black/30' : 'text-white/25'}`}>
                {plan.origPrice} {plan.currency}
              </span>
              <span className={`text-xs font-bold ${isGold ? 'text-black/40' : 'text-white/30'}`}>
                {plan.currency} {plan.period}
              </span>
            </div>
            <span className="mb-2 bg-red-500 text-white text-xs font-extrabold px-2 py-0.5 rounded-full">-50%</span>
          </div>
        </div>

        <div className="px-7 py-6 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Clock,      label: 'المدة',   val: plan.duration },
              { icon: Zap,        label: 'الجلسات', val: plan.sessions },
              { icon: Headphones, label: 'الدعم',   val: plan.support  },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className={`rounded-2xl p-3 text-center
                ${isGold ? 'bg-slate-50 border border-slate-100' : 'bg-white/5 border border-white/5'}`}>
                <Icon className={`w-4 h-4 mx-auto mb-1.5 ${isGold ? 'text-slate-600' : 'text-gold-400'}`} />
                <p className={`text-[10px] font-bold uppercase tracking-wide mb-0.5 ${isGold ? 'text-slate-400' : 'text-white/30'}`}>{label}</p>
                <p className={`text-xs font-extrabold leading-tight ${isGold ? 'text-slate-800' : 'text-white'}`}>{val}</p>
              </div>
            ))}
          </div>

          <div className={`rounded-2xl p-4 border-r-4 ${isGold ? 'bg-amber-50 border-amber-400' : 'bg-gold-400/5 border-gold-400'}`}>
            <p className={`text-sm font-medium leading-relaxed ${isGold ? 'text-amber-900' : 'text-white/70'}`}>
              💡 {plan.forWho}
            </p>
          </div>

          <div>
            <p className={`text-xs font-extrabold uppercase tracking-widest mb-3 ${isGold ? 'text-slate-500' : 'text-white/40'}`}>ما تشمله الباقة</p>
            <ul className="space-y-2">
              {plan.includes.map(f => (
                <li key={f} className="flex items-start gap-2.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                    ${isGold ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    <Check className="w-3 h-3" />
                  </span>
                  <span className={`text-sm font-medium ${isGold ? 'text-slate-700' : 'text-white/70'}`}>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {plan.notIncluded.length > 0 && (
            <div>
              <p className={`text-xs font-extrabold uppercase tracking-widest mb-3 ${isGold ? 'text-slate-400' : 'text-white/20'}`}>غير مشمول</p>
              <ul className="space-y-2">
                {plan.notIncluded.map(f => (
                  <li key={f} className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                      ${isGold ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-white/20'}`}>
                      <X className="w-3 h-3" />
                    </span>
                    <span className={`text-sm line-through ${isGold ? 'text-slate-400' : 'text-white/25'}`}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className={`px-4 py-3 rounded-xl font-bold text-sm transition border
                ${isGold ? 'border-slate-200 text-slate-500 hover:bg-slate-50' : 'border-white/10 text-white/40 hover:bg-white/5'}`}>
              إغلاق
            </button>
            <a href={`/register?plan=${encodeURIComponent(plan.name)}`}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-extrabold text-sm transition-all shadow-lg
                ${isGold
                  ? 'bg-black text-gold-400 hover:bg-black/80 shadow-black/20'
                  : 'bg-gold-400 text-black hover:bg-gold-300 shadow-gold-400/20'}`}>
              <Zap className="w-4 h-4" fill="currentColor" />
              اشترك الآن بـ {plan.salePrice} {plan.currency}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Pricing() {
  const [activePlan, setActivePlan] = useState(null)
  const { h, m, s } = useCountdown()

  return (
    <section id="pricing" className="py-24 bg-[#0f0f0f]">
      {activePlan && <PlanModal plan={activePlan} onClose={() => setActivePlan(null)} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── FLASH SALE BANNER ── */}
        <div className="mb-12 bg-gradient-to-r from-red-600/20 via-red-500/10 to-red-600/20 border border-red-500/30 rounded-3xl p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-red-400 animate-pulse" />
            <span className="text-red-400 font-extrabold text-sm uppercase tracking-widest">عرض إطلاق محدود</span>
            <Flame className="w-5 h-5 text-red-400 animate-pulse" />
          </div>
          <p className="text-white font-extrabold text-2xl sm:text-3xl mb-1">
            خصم <span className="text-red-400">50%</span> على جميع الباقات
          </p>
          <p className="text-white/40 text-sm mb-5">
            أسعار خاصة لإطلاق المنصة في السوق التونسية — العرض ينتهي مع نهاية الشهر
          </p>
          {/* Countdown */}
          <div className="flex items-center justify-center gap-3">
            <Digit val={h}  label="ساعة" />
            <span className="text-white/30 font-extrabold text-2xl mb-5">:</span>
            <Digit val={m}  label="دقيقة" />
            <span className="text-white/30 font-extrabold text-2xl mb-5">:</span>
            <Digit val={s}  label="ثانية" />
          </div>
        </div>

        <p className="text-gold-400 font-bold text-center text-xs uppercase tracking-widest mb-3">الأسعار</p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-3 tracking-tight">
          اختر الباقة المناسبة لك
        </h2>
        <p className="text-white/30 text-center max-w-xl mx-auto font-medium text-sm">
          باقات بالدينار التونسي — اضغط على أي باقة لتعرف كل التفاصيل
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10 items-start">
          {plans.map(p => (
            <div key={p.name}
              onClick={() => setActivePlan(p)}
              className={`relative rounded-2xl p-7 border cursor-pointer transition-all hover:-translate-y-1 hover:shadow-2xl group
                ${p.color === 'gold'
                  ? 'bg-gold-400 border-gold-400 scale-[1.03] shadow-2xl shadow-gold-400/20 hover:shadow-gold-400/40'
                  : 'bg-white/3 border-white/8 hover:border-white/20 hover:shadow-white/5'}`}>

              {/* Badge */}
              {p.badge && (
                <div className={`absolute -top-3.5 right-6 text-xs font-extrabold px-3 py-1 rounded-full border
                  ${p.color === 'gold'
                    ? 'bg-[#0a0a0a] text-gold-400 border-gold-400/30'
                    : 'bg-gold-400 text-black border-gold-300'}`}>
                  {p.badge}
                </div>
              )}

              {/* -50% tag */}
              <div className="absolute -top-3.5 left-6">
                <span className="flex items-center gap-1 bg-red-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full">
                  <Tag className="w-3 h-3" />-50%
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4 mt-1">
                <span className="text-3xl">{p.emoji}</span>
                <div>
                  <h3 className={`font-extrabold text-lg leading-tight ${p.color === 'gold' ? 'text-black' : 'text-white'}`}>
                    {p.name}
                  </h3>
                  <p className={`text-xs font-medium ${p.color === 'gold' ? 'text-black/50' : 'text-white/30'}`}>{p.desc}</p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-end gap-2 mb-1">
                <span className={`text-4xl font-extrabold ${p.color === 'gold' ? 'text-black' : 'text-white'}`}>
                  {p.salePrice}
                </span>
                <div className="mb-1">
                  <span className={`line-through text-xs block font-bold ${p.color === 'gold' ? 'text-black/30' : 'text-white/25'}`}>
                    {p.origPrice} {p.currency}
                  </span>
                  <span className={`text-xs font-medium ${p.color === 'gold' ? 'text-black/50' : 'text-white/30'}`}>
                    {p.currency} {p.period}
                  </span>
                </div>
              </div>

              {/* Savings pill */}
              <div className={`inline-flex items-center gap-1 text-xs font-extrabold px-2 py-0.5 rounded-full mb-5
                ${p.color === 'gold' ? 'bg-black/10 text-black' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                💰 توفير {Number(p.origPrice) - Number(p.salePrice)} {p.currency}
              </div>

              {/* Preview features */}
              <ul className="space-y-2 mb-6">
                {p.includes.slice(0, 4).map(f => (
                  <li key={f} className={`flex items-center gap-2 text-sm font-medium
                    ${p.color === 'gold' ? 'text-black/70' : 'text-white/50'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0
                      ${p.color === 'gold' ? 'bg-black/10 text-black' : 'bg-gold-400/10 text-gold-400'}`}>✓</span>
                    {f}
                  </li>
                ))}
                {p.includes.length > 4 && (
                  <li className={`text-xs font-bold ${p.color === 'gold' ? 'text-black/40' : 'text-white/30'}`}>
                    + {p.includes.length - 4} ميزات أخرى...
                  </li>
                )}
              </ul>

              <div className={`flex items-center justify-between pt-4 border-t
                ${p.color === 'gold' ? 'border-black/10' : 'border-white/5'}`}>
                <span className={`text-xs font-bold ${p.color === 'gold' ? 'text-black/40' : 'text-white/25'}`}>
                  اضغط لعرض التفاصيل
                </span>
                <div className={`flex items-center gap-1 text-xs font-extrabold group-hover:gap-2 transition-all
                  ${p.color === 'gold' ? 'text-black' : 'text-gold-400'}`}>
                  عرض الباقة <ArrowLeft className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-white/20 text-sm mt-10">
          لست متأكداً؟{' '}
          <a href="#contact" className="text-gold-400 font-bold hover:text-gold-300 transition">
            تواصل معنا للحصول على استشارة مجانية
          </a>
        </p>
      </div>
    </section>
  )
}
