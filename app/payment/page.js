'use client'
import { useState } from 'react'
import { Check, Zap, MessageCircle } from 'lucide-react'
import Link from 'next/link'

const WA = '97430653759'

const PLANS = [
  {
    id: 'training',
    name: 'برنامج التدريب',
    price: '50',
    origPrice: '100',
    currency: 'د.ت',
    period: '/ شهر',
    emoji: '🏋️',
    desc: 'البداية الصحيحة',
    features: ['برنامج تدريب مخصص 100%', 'شرح كامل لكل تمرين', 'تعديل كل أسبوعين', 'دعم واتساب 24 ساعة', 'بوابة عميل شخصية'],
    highlight: false,
  },
  {
    id: 'monthly',
    name: 'الباقة الشهرية',
    price: '125',
    origPrice: '250',
    currency: 'د.ت',
    period: '/ شهر',
    emoji: '⚡',
    desc: 'الأكثر طلباً',
    features: ['تدريب + تغذية متكاملة', 'خطة غذائية بنظام ADA 2019', 'متابعة أسبوعية مفصلة', 'استشارات واتساب مفتوحة', 'تقرير تقدم شهري'],
    highlight: true,
  },
  {
    id: '3months',
    name: 'باقة 3 أشهر',
    price: '300',
    origPrice: '600',
    currency: 'د.ت',
    period: '/ 3 أشهر',
    emoji: '🏆',
    desc: '💎 الأوفر — توفير 300 د.ت',
    features: ['كل ما في الباقة الشهرية', 'مكالمة تقييم شهرية', 'قياسات جسم دورية', 'ضمان النتيجة أو تمديد مجاناً', 'أولوية قصوى في الرد'],
    highlight: false,
  },
]

export default function PaymentPage() {
  const [selected, setSelected] = useState(null)

  function buildWaMessage(plan) {
    return encodeURIComponent(
      `مرحباً أمين 👋\nأريد الاشتراك في ${plan.name} — ${plan.price} ${plan.currency}${plan.period}\nأرجو إرشادي لإتمام الدفع.`
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]" dir="rtl">
      {/* Header */}
      <div className="text-center pt-16 pb-10 px-4">
        <div className="w-14 h-14 bg-[#fbbf24] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#fbbf24]/20">
          <Zap className="w-7 h-7 text-black" fill="black" />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-3">اختر خطتك</h1>
        <p className="text-white/40 text-base font-medium">
          بعد الاختيار ستتواصل مع المدرب أمين مباشرة لإتمام الدفع وتفعيل حسابك
        </p>
      </div>

      {/* Plans */}
      <div className="max-w-4xl mx-auto px-4 pb-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
        {PLANS.map(plan => (
          <div key={plan.id}
            onClick={() => setSelected(plan.id)}
            className={`rounded-3xl p-6 border cursor-pointer transition-all ${
              plan.highlight
                ? 'bg-[#fbbf24] border-transparent'
                : selected === plan.id
                  ? 'bg-white/10 border-[#fbbf24]'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}>
            <div className="text-4xl mb-4">{plan.emoji}</div>
            {plan.highlight && (
              <span className="inline-block text-xs font-extrabold bg-black/20 text-black px-3 py-1 rounded-full mb-3">
                الأكثر طلباً ⭐
              </span>
            )}
            <h2 className={`text-xl font-extrabold mb-1 ${plan.highlight ? 'text-black' : 'text-white'}`}>
              {plan.name}
            </h2>
            <p className={`text-xs font-medium mb-3 ${plan.highlight ? 'text-black/60' : 'text-white/30'}`}>
              {plan.desc}
            </p>
            <div className={`mb-1 ${plan.highlight ? 'text-black' : 'text-white'}`}>
              <span className="text-3xl font-extrabold">{plan.price}</span>
              <span className={`text-sm font-semibold mr-1 ${plan.highlight ? 'text-black/60' : 'text-white/40'}`}>
                {plan.currency}{plan.period}
              </span>
            </div>
            <p className={`text-xs mb-5 ${plan.highlight ? 'text-black/40' : 'text-white/20'}`}>
              عوضاً عن {plan.origPrice} {plan.currency}
            </p>
            <ul className="space-y-2.5 mb-6">
              {plan.features.map(f => (
                <li key={f} className={`flex items-center gap-2.5 text-sm font-medium ${plan.highlight ? 'text-black' : 'text-white/60'}`}>
                  <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-black' : 'text-[#fbbf24]'}`} />
                  {f}
                </li>
              ))}
            </ul>
            <a href={`https://wa.me/${WA}?text=${buildWaMessage(plan)}`}
              target="_blank" rel="noreferrer"
              onClick={e => e.stopPropagation()}
              className={`w-full py-3 rounded-xl font-extrabold text-sm transition flex items-center justify-center gap-2 ${
                plan.highlight
                  ? 'bg-black text-[#fbbf24] hover:bg-[#111]'
                  : 'bg-[#fbbf24] text-black hover:bg-[#f59e0b]'
              }`}>
              <MessageCircle className="w-4 h-4" />
              تواصل للاشتراك
            </a>
          </div>
        ))}
      </div>

      {/* Or register CTA */}
      <div className="text-center pb-16 px-4">
        <p className="text-white/30 text-sm mb-4 font-medium">— أو —</p>
        <Link href="/register"
          className="inline-flex items-center gap-2 px-8 py-3 bg-white/5 border border-white/10 text-white/70 font-bold rounded-2xl hover:bg-white/10 hover:text-white transition text-sm">
          <Zap className="w-4 h-4 text-[#fbbf24]" fill="#fbbf24" />
          سجّل الاستبيان الكامل أولاً
        </Link>
        <p className="text-white/20 text-xs mt-3 font-medium">
          الاستبيان يسمح للمدرب أمين بتخصيص برنامجك بدقة أعلى
        </p>
      </div>
    </div>
  )
}
