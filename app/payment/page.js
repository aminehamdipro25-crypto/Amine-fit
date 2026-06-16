'use client'
import { useState, useEffect } from 'react'
import { Check, Zap, MessageCircle, Copy, CheckCheck, Smartphone, MapPin, Gift, Loader2, Wallet, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { trackEvent } from '@/lib/gtag'

const WA          = '97430653759'
const D17_NUMBER  = 'XX XXX XXX'   // ← ضع رقم D17 هنا بعد التفعيل
const D17_READY   = D17_NUMBER !== 'XX XXX XXX'
const FAWRA_NUMBER = '30653759'
const CCP_IBAN    = 'TN59 1780 1000 0002 1931 0870'
const CCP_NAME    = 'HAMDI AMINE B JALOUL'

const PRICING_DEFAULT = {
  basic:    { tnd: 50,  origTnd: 100, qar: 199,  origQar: 399  },
  standard: { tnd: 125, origTnd: 250, qar: 449,  origQar: 899  },
  premium:  { tnd: 300, origTnd: 600, qar: 999,  origQar: 1999 },
}

const GULF_COUNTRIES = new Set(['QA', 'AE', 'SA', 'KW', 'BH', 'OM'])

function buildPlans(pr) {
  return [
    {
      id: 'training',
      name: 'برنامج التدريب',
      price: String(pr.basic.tnd),
      origPrice: String(pr.basic.origTnd),
      priceQar: String(pr.basic.qar),
      origPriceQar: String(pr.basic.origQar),
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
      price: String(pr.standard.tnd),
      origPrice: String(pr.standard.origTnd),
      priceQar: String(pr.standard.qar),
      origPriceQar: String(pr.standard.origQar),
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
      price: String(pr.premium.tnd),
      origPrice: String(pr.premium.origTnd),
      priceQar: String(pr.premium.qar),
      origPriceQar: String(pr.premium.origQar),
      currency: 'د.ت',
      period: '/ 3 أشهر',
      emoji: '🏆',
      desc: '💎 الأوفر',
      features: ['كل ما في الباقة الشهرية', 'مكالمة تقييم شهرية', 'قياسات جسم دورية', 'ضمان النتيجة أو تمديد مجاناً', 'أولوية قصوى في الرد'],
      highlight: false,
    },
  ]
}

export default function PaymentPage() {
  const [selected, setSelected]     = useState(null)
  const [copied, setCopied]         = useState(false)
  const [copiedCCP, setCopiedCCP]   = useState(false)
  const [copiedFawra, setCopiedFawra] = useState(false)
  const [step, setStep]             = useState(1)
  const [method, setMethod]         = useState(null)
  const [cardEmail, setCardEmail]   = useState('')
  const [cardLoading, setCardLoading] = useState(false)
  const [giftCode, setGiftCode]     = useState('')
  const [giftStatus, setGiftStatus] = useState(null)
  const [giftData, setGiftData]     = useState(null)
  const [showGift, setShowGift]     = useState(false)
  const [pricing, setPricing]       = useState(PRICING_DEFAULT)
  const [zone, setZone]             = useState('maghreb') // 'gulf' | 'maghreb'

  const PLANS = buildPlans(pricing)
  const isGulf = zone === 'gulf'

  // Zone-aware price helpers
  function pPrice(p)    { return isGulf ? p.priceQar    : p.price }
  function pOrig(p)     { return isGulf ? p.origPriceQar : p.origPrice }
  function pCur(p)      { return isGulf ? 'ر.ق'          : p.currency }

  useEffect(() => {
    Promise.all([
      fetch('/api/pricing').then(r => r.ok ? r.json() : PRICING_DEFAULT).catch(() => PRICING_DEFAULT),
      fetch('/api/geo').then(r => r.ok ? r.json() : {}).catch(() => ({})),
    ]).then(([d, geo]) => {
      setPricing({ ...PRICING_DEFAULT, ...d })
      if (geo.country && GULF_COUNTRIES.has(geo.country)) setZone('gulf')
    })

    const params = new URLSearchParams(window.location.search)
    const g = params.get('gift')
    if (g) { setGiftCode(g.toUpperCase()); validateGift(g.toUpperCase()) }
    trackEvent('payment_page_view')
  }, [])

  async function validateGift(code) {
    if (!code.trim()) return
    setGiftStatus('checking')
    try {
      const res = await fetch(`/api/gift?code=${encodeURIComponent(code.trim())}`)
      const data = await res.json()
      if (data.valid) {
        setGiftData(data)
        setGiftStatus('valid')
        // Auto-select the gifted plan
        const match = PLANS.find(p => p.id === data.plan)
        if (match) setSelected(match.id)
      } else {
        setGiftStatus('invalid')
        setGiftData(null)
      }
    } catch {
      setGiftStatus('invalid')
    }
  }

  const plan = PLANS.find(p => p.id === selected)
  const isGift = giftStatus === 'valid'

  function copyNumber() {
    navigator.clipboard.writeText(D17_NUMBER.replace(/\s/g, '')).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function copyCCP() {
    navigator.clipboard.writeText(CCP_IBAN.replace(/\s/g, '')).catch(() => {})
    setCopiedCCP(true)
    setTimeout(() => setCopiedCCP(false), 2000)
  }

  async function payByCard() {
    if (!selected || !cardEmail.trim()) return
    setCardLoading(true)
    try {
      const res = await fetch('/api/payment/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selected, email: cardEmail.trim() }),
      })
      const data = await res.json()
      if (data.url) {
        trackEvent('payment_stripe_redirect', { plan_name: plan?.name })
        window.location.href = data.url
      }
    } catch {}
    finally { setCardLoading(false) }
  }

  function copyFawra() {
    navigator.clipboard.writeText(FAWRA_NUMBER).catch(() => {})
    setCopiedFawra(true)
    setTimeout(() => setCopiedFawra(false), 2000)
  }

  function waMessage() {
    if (!plan) return ''
    if (isGift) return encodeURIComponent(`مرحباً أمين 👋\nلديّ كود هدية: ${giftCode}\nأريد تفعيل باقة ${plan.name}. شكراً!`)
    const via = method === 'post' ? 'عبر البريد (إيداع CCP)' : method === 'fawra' ? 'عبر فورا' : 'عبر D17'
    return encodeURIComponent(`مرحباً أمين 👋\nلقد أرسلت ${pPrice(plan)} ${pCur(plan)} ${via} للاشتراك في ${plan.name}.\nأرجو تفعيل حسابي.`)
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
          {zone === 'gulf' ? 'الدفع عبر فورا (قطر)' : 'الدفع عبر D17 أو البريد التونسي'}
        </p>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-3 mt-6">
          {[{ n: 1, label: 'اختر الباقة' }, { n: 2, label: 'أتمّ الدفع' }].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-colors ${
                step >= n ? 'bg-[#fbbf24] text-black' : 'bg-white/10 text-white/30'
              }`}>{n}</div>
              <span className={`text-xs font-semibold ${step >= n ? 'text-white/70' : 'text-white/20'}`}>{label}</span>
              {n < 2 && <div className="w-8 h-px bg-white/10 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      {/* ── STEP 1: اختر الباقة ── */}
      {step === 1 && (
        <>
          <div className="max-w-4xl mx-auto px-4 pb-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {PLANS.map(p => (
              <div key={p.id}
                onClick={() => { setSelected(p.id); trackEvent('plan_selected', { plan_name: p.name, plan_price: Number(p.price) }) }}
                className={`rounded-3xl p-6 border cursor-pointer transition-all ${
                  p.highlight
                    ? selected === p.id
                      ? 'bg-[#fbbf24] border-[#fbbf24] ring-4 ring-[#fbbf24]/40'
                      : 'bg-[#fbbf24] border-transparent'
                    : selected === p.id
                      ? 'bg-white/10 border-[#fbbf24] ring-2 ring-[#fbbf24]/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}>
                <div className="text-4xl mb-4">{p.emoji}</div>
                {p.highlight && (
                  <span className="inline-block text-xs font-extrabold bg-black/20 text-black px-3 py-1 rounded-full mb-3">
                    الأكثر طلباً ⭐
                  </span>
                )}
                <h2 className={`text-xl font-extrabold mb-1 ${p.highlight ? 'text-black' : 'text-white'}`}>
                  {p.name}
                </h2>
                <p className={`text-xs font-medium mb-3 ${p.highlight ? 'text-black/60' : 'text-white/30'}`}>
                  {p.desc}
                </p>
                <div className={`mb-0.5 ${p.highlight ? 'text-black' : 'text-white'}`}>
                  <span className="text-3xl font-extrabold">{pPrice(p)}</span>
                  <span className={`text-sm font-semibold mr-1 ${p.highlight ? 'text-black/60' : 'text-white/40'}`}>
                    {pCur(p)}{p.period}
                  </span>
                </div>
                <p className={`text-xs mb-5 ${p.highlight ? 'text-black/30' : 'text-white/20'}`}>
                  عوضاً عن <span className="line-through">{pOrig(p)} {pCur(p)}</span>
                </p>
                <ul className="space-y-2.5">
                  {p.features.map(f => (
                    <li key={f} className={`flex items-center gap-2.5 text-sm font-medium ${p.highlight ? 'text-black' : 'text-white/60'}`}>
                      <Check className={`w-4 h-4 flex-shrink-0 ${p.highlight ? 'text-black' : 'text-[#fbbf24]'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto px-4 pb-16 flex flex-col items-center gap-4">

            {/* Gift code input */}
            <div className="w-full sm:w-80">
              <button onClick={() => setShowGift(g => !g)}
                className="flex items-center gap-2 text-white/30 hover:text-[#fbbf24] text-xs font-bold transition mb-2">
                <Gift className="w-3.5 h-3.5" />
                {showGift ? 'إخفاء' : 'لديك كود هدية؟'}
              </button>
              {showGift && (
                <div className="flex gap-2">
                  <input
                    value={giftCode}
                    onChange={e => { setGiftCode(e.target.value.toUpperCase()); setGiftStatus(null); setGiftData(null) }}
                    placeholder="أدخل الكود"
                    maxLength={12}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-bold placeholder-white/20 outline-none focus:border-[#fbbf24]/40 transition"
                    dir="ltr"
                  />
                  <button onClick={() => validateGift(giftCode)}
                    disabled={!giftCode.trim() || giftStatus === 'checking'}
                    className="px-4 py-2.5 bg-[#fbbf24] text-black rounded-xl font-extrabold text-sm disabled:opacity-40 transition hover:bg-[#f59e0b]">
                    {giftStatus === 'checking' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'تحقق'}
                  </button>
                </div>
              )}
              {giftStatus === 'valid' && (
                <div className="mt-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 flex items-center gap-2">
                  <span className="text-emerald-400 text-xs font-bold">✓ هدية مجانية — {giftData?.planName}</span>
                </div>
              )}
              {giftStatus === 'invalid' && (
                <p className="mt-1.5 text-red-400 text-xs font-medium">الكود غير صحيح أو مستخدم مسبقاً</p>
              )}
            </div>

            {isGift ? (
              <a href={`https://wa.me/${WA}?text=${waMessage()}`} target="_blank" rel="noreferrer"
                className="w-full sm:w-80 py-4 bg-emerald-500 text-white rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 hover:bg-emerald-400 transition">
                <Gift className="w-5 h-5" />
                تفعيل الهدية عبر واتساب
              </a>
            ) : (
              <button
                onClick={() => { if (selected) { trackEvent('payment_step_advance', { plan_name: plan?.name, plan_price: plan?.price }); setStep(2) } }}
                disabled={!selected}
                className={`w-full sm:w-80 py-4 rounded-2xl font-extrabold text-base transition flex items-center justify-center gap-2 ${
                  selected
                    ? 'bg-[#fbbf24] text-black hover:bg-[#f59e0b] cursor-pointer'
                    : 'bg-white/5 text-white/20 cursor-not-allowed'
                }`}>
                <Zap className="w-5 h-5" fill={selected ? 'black' : 'none'} />
                {selected ? `متابعة — ${plan ? pPrice(plan) : ''} ${plan ? pCur(plan) : ''}` : 'اختر باقة أولاً'}
              </button>
            )}

            <div className="flex items-center gap-3 w-full sm:w-80">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/20 text-xs font-medium">أو</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <Link href="/register"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white/5 border border-white/10 text-white/70 font-bold rounded-2xl hover:bg-white/10 hover:text-white transition text-sm">
              <Zap className="w-4 h-4 text-[#fbbf24]" fill="#fbbf24" />
              سجّل الاستبيان الكامل أولاً
            </Link>
            <p className="text-white/20 text-xs font-medium">
              الاستبيان يسمح للمدرب بتخصيص برنامجك بدقة أعلى
            </p>
          </div>
        </>
      )}

      {/* ── STEP 2: اختر طريقة الدفع ── */}
      {step === 2 && plan && (
        <div className="max-w-lg mx-auto px-4 pb-20">

          {/* Summary card */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-6 flex items-center gap-4">
            <div className="text-4xl">{plan.emoji}</div>
            <div>
              <div className="text-white font-extrabold text-lg">{plan.name}</div>
              <div className="text-[#fbbf24] font-extrabold text-2xl">{pPrice(plan)} <span className="text-base">{pCur(plan)}</span></div>
            </div>
            <button onClick={() => { setStep(1); setMethod(null) }} className="mr-auto text-xs text-white/30 hover:text-white/60 underline transition">تغيير</button>
          </div>

          {/* Method selection */}
          {!method && (
            <>
              <p className="text-white/50 text-sm font-bold text-center mb-4">اختر طريقة الدفع</p>
              {isGulf ? (
                /* Gulf: Fawra + Card */
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button onClick={() => { setMethod('fawra'); trackEvent('payment_method_selected', { method: 'fawra', plan_name: plan?.name }) }}
                    className="bg-[#1a1a1a] hover:bg-white/5 border border-white/10 hover:border-[#fbbf24]/40 rounded-3xl p-4 flex flex-col items-center gap-2 transition">
                    <Wallet className="w-7 h-7 text-[#fbbf24]" />
                    <div className="text-center">
                      <p className="text-white font-extrabold text-xs">فورا</p>
                      <p className="text-white/30 text-[10px] mt-0.5">تحويل فوري — قطر</p>
                    </div>
                  </button>
                  <button onClick={() => { setMethod('card'); trackEvent('payment_method_selected', { method: 'card', plan_name: plan?.name }) }}
                    className="bg-[#1a1a1a] hover:bg-white/5 border border-white/10 hover:border-[#fbbf24]/40 rounded-3xl p-4 flex flex-col items-center gap-2 transition relative">
                    <span className="absolute top-2 right-2 text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">جديد</span>
                    <CreditCard className="w-7 h-7 text-[#fbbf24]" />
                    <div className="text-center">
                      <p className="text-white font-extrabold text-xs">بطاقة بنكية</p>
                      <p className="text-white/30 text-[10px] mt-0.5">Visa / Mastercard</p>
                    </div>
                  </button>
                </div>
              ) : (
                /* Maghreb: D17 + Post + Card */
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <button
                    onClick={() => { if (D17_READY) { setMethod('d17'); trackEvent('payment_method_selected', { method: 'd17', plan_name: plan?.name }) } }}
                    disabled={!D17_READY}
                    className={`bg-[#1a1a1a] border border-white/10 rounded-3xl p-4 flex flex-col items-center gap-2 transition relative ${D17_READY ? 'hover:bg-white/5 hover:border-[#fbbf24]/40 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                    {!D17_READY && (
                      <span className="absolute top-2 left-2 text-[9px] font-extrabold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">قريباً</span>
                    )}
                    <Smartphone className="w-7 h-7 text-[#fbbf24]" />
                    <div className="text-center">
                      <p className="text-white font-extrabold text-xs">D17</p>
                      <p className="text-white/30 text-[10px] mt-0.5">تونس</p>
                    </div>
                  </button>
                  <button onClick={() => { setMethod('post'); trackEvent('payment_method_selected', { method: 'post', plan_name: plan?.name }) }}
                    className="bg-[#1a1a1a] hover:bg-white/5 border border-white/10 hover:border-[#fbbf24]/40 rounded-3xl p-4 flex flex-col items-center gap-2 transition">
                    <MapPin className="w-7 h-7 text-[#fbbf24]" />
                    <div className="text-center">
                      <p className="text-white font-extrabold text-xs">البريد</p>
                      <p className="text-white/30 text-[10px] mt-0.5">تونس</p>
                    </div>
                  </button>
                  <button onClick={() => { setMethod('card'); trackEvent('payment_method_selected', { method: 'card', plan_name: plan?.name }) }}
                    className="bg-[#1a1a1a] hover:bg-white/5 border border-white/10 hover:border-[#fbbf24]/40 rounded-3xl p-4 flex flex-col items-center gap-2 transition relative">
                    <span className="absolute top-2 right-2 text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">جديد</span>
                    <CreditCard className="w-7 h-7 text-[#fbbf24]" />
                    <div className="text-center">
                      <p className="text-white font-extrabold text-xs">بطاقة</p>
                      <p className="text-white/30 text-[10px] mt-0.5">دولية</p>
                    </div>
                  </button>
                </div>
              )}
            </>
          )}

          {/* Card payment */}
          {method === 'card' && (
            <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 mb-4">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#fbbf24]" />
                  <h2 className="text-white font-extrabold text-base">الدفع بالبطاقة البنكية</h2>
                </div>
                <button onClick={() => setMethod(null)} className="text-xs text-white/25 hover:text-white/50 underline transition">تغيير</button>
              </div>
              <p className="text-white/50 text-xs mb-4">أدخل بريدك الإلكتروني المسجّل في Amine-Fit لربط الدفع بحسابك تلقائياً.</p>
              <input
                type="email"
                value={cardEmail}
                onChange={e => setCardEmail(e.target.value)}
                placeholder="بريدك الإلكتروني"
                dir="ltr"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium placeholder-white/20 outline-none focus:border-[#fbbf24]/40 transition mb-4"
              />
              <button
                onClick={payByCard}
                disabled={cardLoading || !cardEmail.trim() || !cardEmail.includes('@')}
                className="w-full py-4 bg-[#fbbf24] text-black rounded-2xl font-extrabold text-base flex items-center justify-center gap-2.5 hover:bg-[#f59e0b] transition disabled:opacity-40">
                {cardLoading
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <CreditCard className="w-5 h-5" />}
                {cardLoading ? 'جاري التحويل...' : `ادفع ${pPrice(plan)} ${pCur(plan)} بالبطاقة`}
              </button>
              <p className="text-white/20 text-[10px] text-center mt-3">مدفوعات آمنة عبر Stripe • Visa / Mastercard / Apple Pay</p>
            </div>
          )}

          {/* D17 instructions */}
          {method === 'd17' && (
            <>
              <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 mb-4">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-[#fbbf24]" />
                    <h2 className="text-white font-extrabold text-base">الدفع عبر D17</h2>
                  </div>
                  <button onClick={() => setMethod(null)} className="text-xs text-white/25 hover:text-white/50 underline transition">تغيير</button>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#fbbf24] text-black text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                    <div>
                      <p className="text-white font-bold text-sm mb-1">افتح تطبيق D17</p>
                      <p className="text-white/40 text-xs">أو اتصل بـ <span className="text-white font-bold">*194#</span></p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#fbbf24] text-black text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm mb-2">أرسل <span className="text-[#fbbf24]">{pPrice(plan)} {pCur(plan)}</span> إلى:</p>
                      <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3">
                        <span className="text-white font-extrabold text-xl tracking-widest flex-1 text-center" dir="ltr">{D17_NUMBER}</span>
                        <button onClick={copyNumber} className="text-white/40 hover:text-[#fbbf24] transition flex-shrink-0">
                          {copied ? <CheckCheck className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                      {copied && <p className="text-emerald-400 text-xs mt-1.5 font-medium text-center">تم النسخ ✓</p>}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#fbbf24] text-black text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                    <div>
                      <p className="text-white font-bold text-sm mb-1">أرسل إثبات الدفع على واتساب</p>
                      <p className="text-white/40 text-xs">صورة من D17 تؤكد إتمام التحويل</p>
                    </div>
                  </div>
                </div>
              </div>
              <a href={`https://wa.me/${WA}?text=${waMessage()}`} target="_blank" rel="noreferrer"
                onClick={() => trackEvent('whatsapp_payment_clicked', { method: 'd17', plan_name: plan?.name, plan_price: Number(plan?.price) })}
                className="w-full py-4 bg-[#25d366] text-white rounded-2xl font-extrabold text-base flex items-center justify-center gap-2.5 hover:bg-[#22c55e] transition mb-4">
                <MessageCircle className="w-5 h-5" fill="white" />
                أرسل إثبات الدفع على واتساب
              </a>
            </>
          )}

          {/* Post office instructions */}
          {method === 'post' && (
            <>
              <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 mb-4">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#fbbf24]" />
                    <h2 className="text-white font-extrabold text-base">الدفع عبر مكتب البريد</h2>
                  </div>
                  <button onClick={() => setMethod(null)} className="text-xs text-white/25 hover:text-white/50 underline transition">تغيير</button>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#fbbf24] text-black text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                    <div>
                      <p className="text-white font-bold text-sm mb-1">اذهب لأقرب مكتب بريد تونسي</p>
                      <p className="text-white/40 text-xs">مع بطاقتك الوطنية</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#fbbf24] text-black text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm mb-2">أودع <span className="text-[#fbbf24]">{pPrice(plan)} {pCur(plan)}</span> — IBAN:</p>
                      <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3">
                        <span className="text-white font-bold text-sm tracking-wider flex-1 text-center" dir="ltr">{CCP_IBAN}</span>
                        <button onClick={copyCCP} className="text-white/40 hover:text-[#fbbf24] transition flex-shrink-0">
                          {copiedCCP ? <CheckCheck className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-white/30 text-xs text-center mt-1.5">{CCP_NAME}</p>
                      {copiedCCP && <p className="text-emerald-400 text-xs mt-1 font-medium text-center">تم النسخ ✓</p>}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#fbbf24] text-black text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                    <div>
                      <p className="text-white font-bold text-sm mb-1">صوّر وصل الإيداع وأرسله على واتساب</p>
                      <p className="text-white/40 text-xs">لتأكيد استلام الدفع وتفعيل حسابك</p>
                    </div>
                  </div>
                </div>
              </div>
              <a href={`https://wa.me/${WA}?text=${waMessage()}`} target="_blank" rel="noreferrer"
                onClick={() => trackEvent('whatsapp_payment_clicked', { method: 'post', plan_name: plan?.name, plan_price: Number(plan?.price) })}
                className="w-full py-4 bg-[#25d366] text-white rounded-2xl font-extrabold text-base flex items-center justify-center gap-2.5 hover:bg-[#22c55e] transition mb-4">
                <MessageCircle className="w-5 h-5" fill="white" />
                أرسل إثبات الدفع على واتساب
              </a>
            </>
          )}

          {/* Fawra instructions */}
          {method === 'fawra' && (
            <>
              <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 mb-4">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-[#fbbf24]" />
                    <h2 className="text-white font-extrabold text-base">الدفع عبر فورا</h2>
                  </div>
                  <button onClick={() => setMethod(null)} className="text-xs text-white/25 hover:text-white/50 underline transition">تغيير</button>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#fbbf24] text-black text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                    <div>
                      <p className="text-white font-bold text-sm mb-1">افتح تطبيق فورا على هاتفك</p>
                      <p className="text-white/40 text-xs">تحويل فوري داخل قطر</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#fbbf24] text-black text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm mb-2">
                        أرسل <span className="text-[#fbbf24]">{plan.priceQar} ر.ق</span> إلى:
                      </p>
                      <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3">
                        <span className="text-white font-extrabold text-xl tracking-widest flex-1 text-center" dir="ltr">{FAWRA_NUMBER}</span>
                        <button onClick={copyFawra} className="text-white/40 hover:text-[#fbbf24] transition flex-shrink-0">
                          {copiedFawra ? <CheckCheck className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                      {copiedFawra && <p className="text-emerald-400 text-xs mt-1.5 font-medium text-center">تم النسخ ✓</p>}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#fbbf24] text-black text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                    <div>
                      <p className="text-white font-bold text-sm mb-1">أرسل إثبات التحويل على واتساب</p>
                      <p className="text-white/40 text-xs">صورة من فورا تؤكد إتمام التحويل</p>
                    </div>
                  </div>
                </div>
              </div>
              <a href={`https://wa.me/${WA}?text=${waMessage()}`} target="_blank" rel="noreferrer"
                onClick={() => trackEvent('whatsapp_payment_clicked', { method: 'fawra', plan_name: plan?.name, plan_price: Number(plan?.priceQar) })}
                className="w-full py-4 bg-[#25d366] text-white rounded-2xl font-extrabold text-base flex items-center justify-center gap-2.5 hover:bg-[#22c55e] transition mb-4">
                <MessageCircle className="w-5 h-5" fill="white" />
                أرسل إثبات الدفع على واتساب
              </a>
            </>
          )}

          {/* Note */}
          <div className="bg-[#fbbf24]/5 border border-[#fbbf24]/20 rounded-2xl p-4">
            <p className="text-[#fbbf24]/80 text-xs font-medium text-center leading-relaxed">
              بعد التأكيد سيصلك كود تفعيل على بريدك الإلكتروني خلال ساعة واحدة ✓
            </p>
          </div>

        </div>
      )}

    </div>
  )
}
