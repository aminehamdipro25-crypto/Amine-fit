'use client'
import { useState } from 'react'
import { Check, Loader2, Zap } from 'lucide-react'

const PLANS = [
  {
    id: 'basic',
    name: 'الأساسي',
    price: '200 QAR',
    period: '/شهر',
    emoji: '🌱',
    desc: 'مثالي للبداية',
    features: ['خطة تغذية مخصصة', 'حاسبة BMR/TDEE', 'متابعة شهرية', 'بوابة العميل'],
    highlight: false,
  },
  {
    id: 'standard',
    name: 'المتوسط',
    price: '350 QAR',
    period: '/شهر',
    emoji: '⚡',
    desc: 'الأكثر شعبية',
    features: ['كل ما في الأساسي', 'خطة تدريب مخصصة', 'متابعة أسبوعية', 'تعديل الخطة شهرياً', 'تتبع التقدم'],
    highlight: true,
  },
  {
    id: 'premium',
    name: 'البريميوم',
    price: '550 QAR',
    period: '/شهر',
    emoji: '🏆',
    desc: 'للنتائج المتميزة',
    features: ['كل ما في المتوسط', 'تواصل مباشر مع المدرب', 'تعديل الخطة أسبوعياً', 'تقارير تقدم مفصلة', 'أولوية الرد'],
    highlight: false,
  },
]

export default function PaymentPage() {
  const [email, setEmail] = useState('')
  const [name, setName]   = useState('')
  const [loading, setLoading] = useState(null)
  const [error, setError]   = useState('')

  async function checkout(planId) {
    if (!email) { setError('أدخل بريدك الإلكتروني أولاً'); return }
    setError('')
    setLoading(planId)

    const res  = await fetch('/api/payment/create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planId, email, name }),
    })
    const data = await res.json()

    if (data.url) {
      window.location.href = data.url
    } else {
      setError(data.error || 'حدث خطأ، حاول مرة أخرى')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]" dir="rtl">
      {/* Header */}
      <div className="text-center pt-16 pb-12 px-4">
        <div className="w-14 h-14 bg-[#fbbf24] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#fbbf24]/20">
          <Zap className="w-7 h-7 text-black" fill="black" />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-3">اختر خطتك</h1>
        <p className="text-white/40 text-lg font-medium">ابدأ رحلتك نحو جسم مثالي اليوم</p>
      </div>

      {/* Email input */}
      <div className="max-w-sm mx-auto px-4 mb-10 space-y-3">
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="اسمك (اختياري)"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-[#fbbf24] transition text-sm font-medium" />
        <input value={email} onChange={e => setEmail(e.target.value)}
          type="email" placeholder="بريدك الإلكتروني *"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-[#fbbf24] transition text-sm font-medium" />
        {error && <p className="text-red-400 text-xs font-medium">{error}</p>}
      </div>

      {/* Plans */}
      <div className="max-w-4xl mx-auto px-4 pb-16 grid grid-cols-1 sm:grid-cols-3 gap-5">
        {PLANS.map(plan => (
          <div key={plan.id}
            className={`rounded-3xl p-6 border transition-all ${plan.highlight
              ? 'bg-[#fbbf24] border-transparent'
              : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
            <div className="text-4xl mb-4">{plan.emoji}</div>
            {plan.highlight && (
              <span className="inline-block text-xs font-extrabold bg-black/20 text-black px-3 py-1 rounded-full mb-3">
                الأكثر شعبية ⭐
              </span>
            )}
            <h2 className={`text-xl font-extrabold mb-1 ${plan.highlight ? 'text-black' : 'text-white'}`}>{plan.name}</h2>
            <p className={`text-xs font-medium mb-4 ${plan.highlight ? 'text-black/60' : 'text-white/30'}`}>{plan.desc}</p>
            <div className={`text-3xl font-extrabold mb-6 ${plan.highlight ? 'text-black' : 'text-white'}`}>
              {plan.price}
              <span className={`text-sm font-semibold mr-1 ${plan.highlight ? 'text-black/50' : 'text-white/30'}`}>{plan.period}</span>
            </div>
            <ul className="space-y-2.5 mb-6">
              {plan.features.map(f => (
                <li key={f} className={`flex items-center gap-2.5 text-sm font-medium ${plan.highlight ? 'text-black' : 'text-white/60'}`}>
                  <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-black' : 'text-[#fbbf24]'}`} />
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={() => checkout(plan.id)} disabled={!!loading}
              className={`w-full py-3 rounded-xl font-extrabold text-sm transition flex items-center justify-center gap-2 disabled:opacity-60 ${plan.highlight
                ? 'bg-black text-[#fbbf24] hover:bg-[#111]'
                : 'bg-[#fbbf24] text-black hover:bg-[#f59e0b]'}`}>
              {loading === plan.id
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : 'اشترك الآن'}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-white/20 text-xs pb-8 font-medium">
        🔒 دفع آمن عبر Stripe · يمكنك الإلغاء في أي وقت
      </p>
    </div>
  )
}
