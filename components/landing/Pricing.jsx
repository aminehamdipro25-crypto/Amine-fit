'use client'
import { useState, useEffect } from 'react'
import { X, Check, ArrowLeft, Zap, Shield, Clock, Headphones, Flame, Tag, Star, Trophy, Target, Brain, ChartLine, MessageCircle, Calendar, Dumbbell, Apple, RefreshCw } from 'lucide-react'

/* ── Rolling 5-day countdown per visitor (stored in localStorage) ── */
const OFFER_DURATION = 5 * 24 * 60 * 60 * 1000  // 5 days in ms
const LS_KEY = 'af_offer_expiry'

function useCountdown() {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0, expired: false })

  useEffect(() => {
    // Get or create per-visitor deadline
    let expiry = parseInt(localStorage.getItem(LS_KEY) || '0', 10)
    if (!expiry || expiry < Date.now()) {
      expiry = Date.now() + OFFER_DURATION
      localStorage.setItem(LS_KEY, String(expiry))
    }

    function calc() {
      const diff = expiry - Date.now()
      if (diff <= 0) {
        setTime({ d: 0, h: 0, m: 0, s: 0, expired: true })
        return
      }
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        expired: false,
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
    tag: 'البداية الصحيحة',
    salePrice: '50',
    origPrice: '100',
    currency: 'د.ت',
    period: '/ شهر',
    emoji: '🏋️',
    badge: null,
    color: 'dark',
    forWho: 'لمن يريد بناء عادة تدريبية احترافية والبدء بخطوة واضحة ومدروسة دون الدخول في تعقيدات التغذية بعد.',
    highlights: [
      { icon: Target,         text: 'برنامج تدريب مخصص 100% حسب مستواك وهدفك' },
      { icon: Dumbbell,       text: 'شرح كامل لكل تمرين — أوزان، تكرارات، راحة' },
      { icon: RefreshCw,      text: 'تعديل البرنامج كل أسبوعين حسب تقدمك الفعلي' },
      { icon: MessageCircle,  text: 'دعم واتساب مع رد خلال 24 ساعة' },
      { icon: ChartLine,      text: 'بوابة عميل شخصية — تتابع خطتك في أي وقت' },
    ],
    notIncluded: ['خطة غذائية مفصلة', 'قياسات جسم دورية', 'متابعة أسبوعية مفصلة'],
    results: 'تحسن ملحوظ في القوة والأداء خلال 3–4 أسابيع',
    guarantee: null,
    cta: 'ابدأ التدريب',
    duration: 'شهر واحد',
    sessions: '3–5 أيام / أسبوع',
    support: 'واتساب خلال 24 ساعة',
  },
  {
    name: 'الباقة الشهرية',
    tag: 'تدريب + تغذية متكاملة',
    salePrice: '125',
    origPrice: '250',
    currency: 'د.ت',
    period: '/ شهر',
    emoji: '⚡',
    badge: '⭐ الأكثر طلباً',
    color: 'gold',
    forWho: 'للجادين الذين يريدون تحولاً حقيقياً في شهر واحد — لا تخمين في التغذية ولا عشوائية في التدريب.',
    highlights: [
      { icon: Dumbbell,       text: 'برنامج تدريب أسبوعي مخصص + تعديلات فورية' },
      { icon: Apple,          text: 'خطة غذائية كاملة بنظام التبادل الغذائي ADA 2019' },
      { icon: Brain,          text: 'توزيع دقيق للسعرات والماكرو مع قائمة وجبات يومية' },
      { icon: ChartLine,      text: 'متابعة أسبوعية مفصلة + ضبط الخطط حسب التقدم' },
      { icon: MessageCircle,  text: 'استشارات غذائية مفتوحة عبر واتساب طوال الشهر' },
      { icon: Calendar,       text: 'بوابة عميل متكاملة — تدريب + غذاء + تتبع التقدم' },
      { icon: Star,           text: 'تقرير تقدم شامل في نهاية الشهر بالأرقام والنسب' },
    ],
    notIncluded: ['قياسات InBody (تُضاف عند الطلب)'],
    results: 'تغيير ملموس في التركيب الجسدي خلال 4 أسابيع',
    guarantee: '7 أيام ضمان استرداد كامل',
    cta: 'احصل على خطتك',
    duration: 'شهر واحد',
    sessions: '3–5 أيام / أسبوع',
    support: 'واتساب + متابعة أسبوعية',
  },
  {
    name: 'باقة 3 أشهر',
    tag: 'التحول الجذري — 90 يوماً',
    salePrice: '300',
    origPrice: '600',
    currency: 'د.ت',
    period: '/ 3 أشهر',
    emoji: '🏆',
    badge: '💎 الأوفر',
    color: 'dark',
    forWho: 'للمحترفين الجادين — 3 أشهر من الالتزام الكامل تُحدث التحول الحقيقي الذي تبحث عنه.',
    highlights: [
      { icon: Dumbbell,       text: 'برنامج تدريب + تغذية كاملة متجددة كل شهر' },
      { icon: Calendar,       text: 'مكالمة تقييم شهرية (15–20 دقيقة) لمراجعة التقدم' },
      { icon: ChartLine,      text: 'قياسات جسم دورية + تحليل مفصل للنسب والتركيب' },
      { icon: MessageCircle,  text: 'استشارات غير محدودة — رد خلال ساعات طوال الأسبوع' },
      { icon: Brain,          text: 'إعادة تصميم البرامج كل شهر حسب نتائجك الفعلية' },
      { icon: Star,           text: 'تقارير تقدم شهرية مفصلة بالأرقام والصور' },
      { icon: Trophy,         text: 'أولوية قصوى في الرد والمتابعة الشخصية' },
      { icon: Shield,         text: '✅ ضمان النتيجة — تقدم ملموس أو تمديد مجاناً' },
    ],
    notIncluded: [],
    results: 'تحول جسدي كامل وعادات صحية مدى الحياة',
    guarantee: 'نتيجة ملموسة أو نمدد مجاناً',
    cta: 'احجز مكانك',
    duration: '3 أشهر كاملة',
    sessions: '4–5 أيام / أسبوع',
    support: 'مباشر + مكالمة شهرية',
  },
]

function Digit({ val, label }) {
  return (
    <div className="text-center">
      <div className="bg-black/40 border border-white/15 rounded-xl w-14 h-14 flex items-center justify-center">
        <span className="text-2xl font-extrabold text-white tabular-nums leading-none">
          {String(val).padStart(2, '0')}
        </span>
      </div>
      <p className="text-white/40 text-[10px] font-bold mt-1.5 uppercase tracking-widest">{label}</p>
    </div>
  )
}

function PlanModal({ plan, onClose }) {
  const isGold = plan.color === 'gold'

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-4
        ${isGold ? 'bg-white' : 'bg-[#111]'}`}>

        {/* Header */}
        <div className={`px-7 pt-7 pb-5 relative ${isGold
          ? 'bg-gradient-to-br from-gold-400 to-amber-400'
          : 'bg-gradient-to-br from-[#0a0a0a] to-[#181818] border-b border-white/5'}`}>
          <button onClick={onClose} className={`absolute top-4 left-4 p-2 rounded-xl transition
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
              <p className={`text-sm font-medium mt-0.5 ${isGold ? 'text-black/50' : 'text-white/40'}`}>{plan.tag}</p>
            </div>
          </div>
          <div className="flex items-end gap-2 mt-4">
            <span className={`text-4xl font-extrabold ${isGold ? 'text-black' : 'text-white'}`}>{plan.salePrice}</span>
            <div className="mb-1">
              <span className={`line-through text-sm block ${isGold ? 'text-black/30' : 'text-white/25'}`}>{plan.origPrice} {plan.currency}</span>
              <span className={`text-xs font-bold ${isGold ? 'text-black/40' : 'text-white/30'}`}>{plan.currency} {plan.period}</span>
            </div>
            <span className="mb-2 bg-red-500 text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full">-50%</span>
          </div>
        </div>

        <div className="px-7 py-6 space-y-5">

          {/* Meta */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Clock,      label: 'المدة',   val: plan.duration },
              { icon: Zap,        label: 'التدريب', val: plan.sessions },
              { icon: Headphones, label: 'الدعم',   val: plan.support  },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className={`rounded-2xl p-3 text-center ${isGold ? 'bg-slate-50 border border-slate-100' : 'bg-white/5 border border-white/5'}`}>
                <Icon className={`w-4 h-4 mx-auto mb-1.5 ${isGold ? 'text-slate-500' : 'text-gold-400'}`} />
                <p className={`text-[10px] font-bold uppercase tracking-wide mb-0.5 ${isGold ? 'text-slate-400' : 'text-white/30'}`}>{label}</p>
                <p className={`text-xs font-extrabold leading-tight ${isGold ? 'text-slate-800' : 'text-white'}`}>{val}</p>
              </div>
            ))}
          </div>

          {/* For who */}
          <div className={`rounded-2xl p-4 border-r-4 ${isGold ? 'bg-amber-50 border-amber-400' : 'bg-gold-400/5 border-gold-400'}`}>
            <p className={`text-sm font-medium leading-relaxed ${isGold ? 'text-amber-900' : 'text-white/70'}`}>
              💡 {plan.forWho}
            </p>
          </div>

          {/* Expected results */}
          <div className={`flex items-center gap-2.5 rounded-xl p-3 ${isGold ? 'bg-emerald-50 border border-emerald-200' : 'bg-emerald-500/5 border border-emerald-500/20'}`}>
            <Trophy className={`w-4 h-4 flex-shrink-0 ${isGold ? 'text-emerald-600' : 'text-emerald-400'}`} />
            <p className={`text-xs font-bold ${isGold ? 'text-emerald-800' : 'text-emerald-400'}`}>النتيجة المتوقعة: {plan.results}</p>
          </div>

          {/* Guarantee */}
          {plan.guarantee && (
            <div className={`flex items-center gap-2.5 rounded-xl p-3 ${isGold ? 'bg-violet-50 border border-violet-200' : 'bg-violet-500/5 border border-violet-500/20'}`}>
              <Shield className={`w-4 h-4 flex-shrink-0 ${isGold ? 'text-violet-600' : 'text-violet-400'}`} />
              <p className={`text-xs font-bold ${isGold ? 'text-violet-800' : 'text-violet-400'}`}>الضمان: {plan.guarantee}</p>
            </div>
          )}

          {/* Includes */}
          <div>
            <p className={`text-xs font-extrabold uppercase tracking-widest mb-3 ${isGold ? 'text-slate-500' : 'text-white/40'}`}>ما تشمله الباقة</p>
            <ul className="space-y-2.5">
              {plan.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                    ${isGold ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    <Check className="w-3 h-3" />
                  </span>
                  <span className={`text-sm font-medium leading-relaxed ${isGold ? 'text-slate-700' : 'text-white/70'}`}>{h.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Not included */}
          {plan.notIncluded.length > 0 && (
            <div>
              <p className={`text-xs font-extrabold uppercase tracking-widest mb-3 ${isGold ? 'text-slate-400' : 'text-white/20'}`}>غير مشمول في هذه الباقة</p>
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
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-extrabold text-sm transition-all shadow-lg
                ${isGold
                  ? 'bg-black text-gold-400 hover:bg-black/80 shadow-black/20'
                  : 'bg-gold-400 text-black hover:bg-gold-300 shadow-gold-400/20'}`}>
              <Zap className="w-4 h-4" fill="currentColor" />
              {plan.cta} — {plan.salePrice} {plan.currency}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Pricing() {
  const [activePlan, setActivePlan] = useState(null)
  const { d, h, m, s, expired } = useCountdown()

  return (
    <section id="pricing" className="py-24 bg-[#0f0f0f]">
      {activePlan && <PlanModal plan={activePlan} onClose={() => setActivePlan(null)} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── FLASH SALE BANNER ── */}
        <div className="mb-14 bg-gradient-to-r from-red-900/30 via-red-800/20 to-red-900/30 border border-red-500/25 rounded-3xl p-7 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-red-400 animate-pulse" />
            <span className="text-red-400 font-extrabold text-sm uppercase tracking-widest">عرض إطلاق حصري — مؤقت</span>
            <Flame className="w-5 h-5 text-red-400 animate-pulse" />
          </div>
          <p className="text-white font-extrabold text-2xl sm:text-3xl mb-1">
            خصم <span className="text-red-400">50%</span> على جميع الباقات
          </p>
          <p className="text-white/40 text-sm mb-6">
            {expired
              ? 'انتهى العرض — تواصل معنا لمعرفة الأسعار الحالية'
              : 'أسعار الإطلاق الخاصة لن تبقى للأبد — العرض ينتهي بعد:'}
          </p>
          {/* Countdown — days / hours / minutes / seconds */}
          {expired ? (
            <div className="flex items-center justify-center gap-2 text-red-400 font-extrabold text-lg mb-2">
              <span>⏰</span>
              <span>انتهى عرض الإطلاق</span>
            </div>
          ) : (
            <div className="flex items-end justify-center gap-2">
              <Digit val={d} label="يوم" />
              <span className="text-white/30 font-extrabold text-2xl mb-6">:</span>
              <Digit val={h} label="ساعة" />
              <span className="text-white/30 font-extrabold text-2xl mb-6">:</span>
              <Digit val={m} label="دقيقة" />
              <span className="text-white/30 font-extrabold text-2xl mb-6">:</span>
              <Digit val={s} label="ثانية" />
            </div>
          )}
        </div>

        <p className="text-gold-400 font-bold text-center text-xs uppercase tracking-widest mb-3">الأسعار</p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-3 tracking-tight">
          اختر الباقة المناسبة لك
        </h2>
        <p className="text-white/30 text-center max-w-xl mx-auto font-medium text-sm mb-10">
          باقات بالدينار التونسي — اضغط على أي باقة لتعرف كل التفاصيل
        </p>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="flex" style={{ direction: 'ltr' }}>
            {['أ','م','ي','س','ع'].map((l, i) => (
              <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-amber-500 border-2 border-[#0f0f0f] flex items-center justify-center text-black font-extrabold text-xs -ml-2 first:ml-0">
                {l}
              </div>
            ))}
          </div>
          <p className="text-white/50 text-sm font-medium">
            <strong className="text-white">37+</strong> شخص انضم هذا الشهر
          </p>
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            🟢 مفتوح للتسجيل
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map(p => {
            const isGold = p.color === 'gold'
            return (
              <div key={p.name}
                onClick={() => setActivePlan(p)}
                className={`relative rounded-2xl p-7 border cursor-pointer transition-all duration-300 hover:-translate-y-1.5 group
                  ${isGold
                    ? 'bg-gold-400 border-gold-400 scale-[1.04] shadow-2xl shadow-gold-400/25 hover:shadow-gold-400/40'
                    : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.05] hover:shadow-2xl hover:shadow-white/5'}`}>

                {/* Badges */}
                {p.badge && (
                  <div className={`absolute -top-3.5 right-6 text-xs font-extrabold px-3 py-1 rounded-full border
                    ${isGold ? 'bg-[#0a0a0a] text-gold-400 border-gold-400/30' : 'bg-gold-400 text-black border-gold-300'}`}>
                    {p.badge}
                  </div>
                )}
                <div className="absolute -top-3.5 left-6">
                  <span className="flex items-center gap-1 bg-red-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full">
                    <Tag className="w-3 h-3" />-50%
                  </span>
                </div>

                {/* Plan header */}
                <div className="flex items-center gap-3 mb-5 mt-1">
                  <span className="text-3xl">{p.emoji}</span>
                  <div>
                    <h3 className={`font-extrabold text-lg leading-tight ${isGold ? 'text-black' : 'text-white'}`}>{p.name}</h3>
                    <p className={`text-xs font-medium mt-0.5 ${isGold ? 'text-black/50' : 'text-white/30'}`}>{p.tag}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-end gap-2 mb-1">
                  <span className={`text-4xl font-extrabold ${isGold ? 'text-black' : 'text-white'}`}>{p.salePrice}</span>
                  <div className="mb-1">
                    <span className={`line-through text-xs block font-bold ${isGold ? 'text-black/30' : 'text-white/25'}`}>{p.origPrice} {p.currency}</span>
                    <span className={`text-xs font-medium ${isGold ? 'text-black/50' : 'text-white/30'}`}>{p.currency} {p.period}</span>
                  </div>
                </div>
                <div className={`inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-0.5 rounded-full mb-5
                  ${isGold ? 'bg-black/10 text-black' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  💰 توفير {Number(p.origPrice) - Number(p.salePrice)} {p.currency}
                </div>

                {/* Highlights preview */}
                <ul className="space-y-2.5 mb-6">
                  {p.highlights.slice(0, 4).map((h, i) => {
                    const Icon = h.icon
                    return (
                      <li key={i} className={`flex items-center gap-2.5 text-sm font-medium ${isGold ? 'text-black/75' : 'text-white/55'}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                          ${isGold ? 'bg-black/10 text-black' : 'bg-gold-400/10 text-gold-400'}`}>
                          <Check className="w-3 h-3" />
                        </span>
                        {h.text}
                      </li>
                    )
                  })}
                  {p.highlights.length > 4 && (
                    <li className={`text-xs font-bold mr-7 ${isGold ? 'text-black/40' : 'text-white/30'}`}>
                      + {p.highlights.length - 4} ميزات إضافية...
                    </li>
                  )}
                </ul>

                {/* Guarantee badge */}
                {p.guarantee && (
                  <div className={`flex items-center gap-1.5 text-xs font-bold mb-5 px-3 py-2 rounded-xl
                    ${isGold ? 'bg-black/10 text-black' : 'bg-violet-500/10 border border-violet-500/20 text-violet-400'}`}>
                    <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                    {p.guarantee}
                  </div>
                )}

                <div className={`flex items-center justify-between pt-4 border-t ${isGold ? 'border-black/10' : 'border-white/5'}`}>
                  <span className={`text-xs font-bold ${isGold ? 'text-black/40' : 'text-white/25'}`}>اضغط للتفاصيل الكاملة</span>
                  <div className={`flex items-center gap-1 text-xs font-extrabold group-hover:gap-2 transition-all
                    ${isGold ? 'text-black' : 'text-gold-400'}`}>
                    {p.cta} <ArrowLeft className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-center text-white/20 text-sm mt-12">
          لست متأكداً من الباقة المناسبة؟{' '}
          <a href="#contact" className="text-gold-400 font-bold hover:text-gold-300 transition underline underline-offset-2">
            تواصل معنا للحصول على استشارة مجانية
          </a>
        </p>
      </div>
    </section>
  )
}
