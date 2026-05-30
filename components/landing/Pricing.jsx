'use client'
import { useState } from 'react'
import { X, Check, ArrowLeft, Zap, Shield, Clock, Headphones } from 'lucide-react'

const plans = [
  {
    name: 'الباقة الأساسية',
    price: '500',
    desc: 'مثالية للمبتدئين',
    emoji: '🌱',
    badge: null,
    color: 'dark',
    duration: 'شهر واحد',
    support: 'واتساب (رد خلال 24س)',
    sessions: '2 أسبوعياً',
    includes: [
      '2 جلسات تدريب أسبوعياً',
      'خطة غذائية أساسية مخصصة',
      'بوابة عميل شخصية للوصول للخطة',
      'متابعة شهرية لقياس التقدم',
      'دعم عبر الواتساب',
      'تعديل الخطة عند الحاجة',
    ],
    notIncluded: [
      'قياسات جسم دورية (InBody)',
      'تقارير تقدم مفصلة أسبوعية',
      'أولوية الرد الفوري',
      'استشارات غذائية غير محدودة',
    ],
    forWho: 'مناسبة لمن يبدأ رحلته الأولى في اللياقة البدنية ويريد نتائج ثابتة بدعم أساسي.',
  },
  {
    name: 'الباقة المتقدمة',
    price: '900',
    desc: 'الخيار الأمثل للنتائج السريعة',
    emoji: '⚡',
    badge: '⭐ الأكثر طلباً',
    color: 'gold',
    duration: 'شهر واحد',
    support: 'واتساب + مكالمة أسبوعية',
    sessions: '4 أسبوعياً',
    includes: [
      '4 جلسات تدريب أسبوعياً',
      'خطة غذائية بنظام التبادل الكامل',
      'بوابة عميل شخصية متكاملة',
      'متابعة أسبوعية + تعديلات فورية',
      'قياسات جسم شهرية (InBody)',
      'تقارير تقدم مفصلة أسبوعية',
      'استشارات غذائية غير محدودة',
      'دعم عبر الواتساب والمكالمة',
    ],
    notIncluded: [
      'أولوية الرد الفوري (24/7)',
    ],
    forWho: 'الخيار الأمثل لمن يريد نتائج حقيقية وسريعة مع متابعة دورية ودعم متواصل.',
  },
  {
    name: 'الباقة الاحترافية',
    price: '1,500',
    desc: 'للمحترفين وصنّاع النتائج',
    emoji: '🏆',
    badge: '💎 VIP',
    color: 'dark',
    duration: 'شهر واحد',
    support: 'دعم مباشر فوري 7/7',
    sessions: '6 أسبوعياً',
    includes: [
      '6 جلسات تدريب أسبوعياً',
      'خطة غذائية + تكيفات دورية ذكية',
      'بوابة عميل شخصية VIP',
      'متابعة يومية مستمرة',
      'قياسات جسم + تقارير مفصلة أسبوعية',
      'أولوية الرد الفوري (24/7)',
      'استشارات غير محدودة في كل وقت',
      'خطة خاصة للمناسبات والسفر',
      'ضمان النتيجة أو الاسترداد',
    ],
    notIncluded: [],
    forWho: 'للرياضيين والمحترفين الذين يريدون أعلى مستوى من التخصيص والدعم بلا حدود.',
  },
]

function PlanModal({ plan, onClose }) {
  const isGold = plan.color === 'gold'
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-4
        ${isGold ? 'bg-white' : 'bg-[#111]'}`}>

        {/* Header */}
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
            <div className={`text-5xl`}>{plan.emoji}</div>
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
          <div className="flex items-end gap-1 mt-4">
            <span className={`text-4xl font-extrabold ${isGold ? 'text-black' : 'text-white'}`}>{plan.price}</span>
            <span className={`text-sm mb-1 ${isGold ? 'text-black/40' : 'text-white/30'}`}>ر.ق / شهر</span>
          </div>
        </div>

        <div className="px-7 py-6 space-y-6">

          {/* Quick info */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Clock,       label: 'المدة',      val: plan.duration  },
              { icon: Zap,         label: 'الجلسات',    val: plan.sessions  },
              { icon: Headphones,  label: 'الدعم',      val: plan.support   },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className={`rounded-2xl p-3 text-center
                ${isGold ? 'bg-slate-50 border border-slate-100' : 'bg-white/5 border border-white/5'}`}>
                <Icon className={`w-4 h-4 mx-auto mb-1.5 ${isGold ? 'text-slate-600' : 'text-gold-400'}`} />
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

          {/* Included */}
          <div>
            <p className={`text-xs font-extrabold uppercase tracking-widest mb-3 ${isGold ? 'text-slate-500' : 'text-white/40'}`}>ما يشمله الباقة</p>
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

          {/* CTA */}
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
              اشترك في {plan.name}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Pricing() {
  const [activePlan, setActivePlan] = useState(null)

  return (
    <section id="pricing" className="py-24 bg-[#0f0f0f]">
      {activePlan && <PlanModal plan={activePlan} onClose={() => setActivePlan(null)} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-gold-400 font-bold text-center text-xs uppercase tracking-widest mb-3">الأسعار</p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-3 tracking-tight">
          اختر الباقة المناسبة لك
        </h2>
        <p className="text-white/30 text-center max-w-xl mx-auto font-medium">
          باقات مرنة بأسعار في متناول الجميع — اضغط على أي باقة لتعرف كل التفاصيل
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-14 items-start">
          {plans.map(p => (
            <div key={p.name}
              onClick={() => setActivePlan(p)}
              className={`relative rounded-2xl p-7 border cursor-pointer transition-all hover:-translate-y-1 hover:shadow-2xl group
                ${p.color === 'gold'
                  ? 'bg-gold-400 border-gold-400 scale-[1.03] shadow-2xl shadow-gold-400/20 hover:shadow-gold-400/40'
                  : 'bg-white/3 border-white/8 hover:border-white/20 hover:shadow-white/5'}`}>

              {p.badge && (
                <div className={`absolute -top-3.5 right-6 text-xs font-extrabold px-3 py-1 rounded-full border
                  ${p.color === 'gold'
                    ? 'bg-[#0a0a0a] text-gold-400 border-gold-400/30'
                    : 'bg-gold-400 text-black border-gold-300'}`}>
                  {p.badge}
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{p.emoji}</span>
                <div>
                  <h3 className={`font-extrabold text-lg leading-tight ${p.color === 'gold' ? 'text-black' : 'text-white'}`}>
                    {p.name}
                  </h3>
                  <p className={`text-xs font-medium ${p.color === 'gold' ? 'text-black/50' : 'text-white/30'}`}>{p.desc}</p>
                </div>
              </div>

              <div className="flex items-end gap-1 mb-6">
                <span className={`text-4xl font-extrabold ${p.color === 'gold' ? 'text-black' : 'text-white'}`}>{p.price}</span>
                <span className={`text-sm mb-1 ${p.color === 'gold' ? 'text-black/40' : 'text-white/30'}`}>ر.ق / شهر</span>
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

              {/* CTA */}
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
