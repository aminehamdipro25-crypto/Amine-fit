'use client'
import { useState } from 'react'
import { Check, Zap, MessageCircle, Copy, CheckCheck, Smartphone, MapPin } from 'lucide-react'
import Link from 'next/link'

const WA          = '97430653759'
const D17_NUMBER  = 'XX XXX XXX'   // ← ضع رقم D17 هنا بعد التفعيل
const CCP_NUMBER  = 'XXXXXXXX'     // ← ضع رقم الحساب الجاري CCP هنا

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
  const [selected, setSelected]   = useState(null)
  const [copied, setCopied]       = useState(false)
  const [copiedCCP, setCopiedCCP] = useState(false)
  const [step, setStep]           = useState(1) // 1=اختر الباقة  2=ادفع
  const [method, setMethod]       = useState(null) // 'd17' | 'post'

  const plan = PLANS.find(p => p.id === selected)

  function copyNumber() {
    navigator.clipboard.writeText(D17_NUMBER.replace(/\s/g, '')).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function copyCCP() {
    navigator.clipboard.writeText(CCP_NUMBER.replace(/\s/g, '')).catch(() => {})
    setCopiedCCP(true)
    setTimeout(() => setCopiedCCP(false), 2000)
  }

  function waMessage() {
    if (!plan) return ''
    const via = method === 'post' ? 'عبر البريد (إيداع CCP)' : 'عبر D17'
    return encodeURIComponent(
      `مرحباً أمين 👋\nلقد أرسلت ${plan.price} ${plan.currency} ${via} للاشتراك في ${plan.name}.\nأرجو تفعيل حسابي.`
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
        <p className="text-white/40 text-base font-medium">الدفع عبر تطبيق D17 — البريد التونسي</p>

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
                onClick={() => setSelected(p.id)}
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
                <div className={`mb-1 ${p.highlight ? 'text-black' : 'text-white'}`}>
                  <span className="text-3xl font-extrabold">{p.price}</span>
                  <span className={`text-sm font-semibold mr-1 ${p.highlight ? 'text-black/60' : 'text-white/40'}`}>
                    {p.currency}{p.period}
                  </span>
                </div>
                <p className={`text-xs mb-5 ${p.highlight ? 'text-black/40' : 'text-white/20'}`}>
                  عوضاً عن {p.origPrice} {p.currency}
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
            <button
              onClick={() => selected && setStep(2)}
              disabled={!selected}
              className={`w-full sm:w-80 py-4 rounded-2xl font-extrabold text-base transition flex items-center justify-center gap-2 ${
                selected
                  ? 'bg-[#fbbf24] text-black hover:bg-[#f59e0b] cursor-pointer'
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
              }`}>
              <Zap className="w-5 h-5" fill={selected ? 'black' : 'none'} />
              {selected ? `متابعة — ${plan?.price} ${plan?.currency}` : 'اختر باقة أولاً'}
            </button>

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
              <div className="text-[#fbbf24] font-extrabold text-2xl">{plan.price} <span className="text-base">{plan.currency}</span></div>
            </div>
            <button onClick={() => { setStep(1); setMethod(null) }} className="mr-auto text-xs text-white/30 hover:text-white/60 underline transition">تغيير</button>
          </div>

          {/* Method selection */}
          {!method && (
            <>
              <p className="text-white/50 text-sm font-bold text-center mb-4">اختر طريقة الدفع</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button onClick={() => setMethod('d17')}
                  className="bg-[#1a1a1a] hover:bg-white/5 border border-white/10 hover:border-[#fbbf24]/40 rounded-3xl p-5 flex flex-col items-center gap-3 transition">
                  <Smartphone className="w-8 h-8 text-[#fbbf24]" />
                  <div className="text-center">
                    <p className="text-white font-extrabold text-sm">تطبيق D17</p>
                    <p className="text-white/30 text-xs mt-0.5">أسرع — من هاتفك</p>
                  </div>
                </button>
                <button onClick={() => setMethod('post')}
                  className="bg-[#1a1a1a] hover:bg-white/5 border border-white/10 hover:border-[#fbbf24]/40 rounded-3xl p-5 flex flex-col items-center gap-3 transition">
                  <MapPin className="w-8 h-8 text-[#fbbf24]" />
                  <div className="text-center">
                    <p className="text-white font-extrabold text-sm">مكتب البريد</p>
                    <p className="text-white/30 text-xs mt-0.5">إيداع نقدي مباشر</p>
                  </div>
                </button>
              </div>
            </>
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
                      <p className="text-white font-bold text-sm mb-2">أرسل <span className="text-[#fbbf24]">{plan.price} {plan.currency}</span> إلى:</p>
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
                      <p className="text-white font-bold text-sm mb-2">أودع <span className="text-[#fbbf24]">{plan.price} {plan.currency}</span> في الحساب الجاري:</p>
                      <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3">
                        <span className="text-white font-extrabold text-xl tracking-widest flex-1 text-center" dir="ltr">{CCP_NUMBER}</span>
                        <button onClick={copyCCP} className="text-white/40 hover:text-[#fbbf24] transition flex-shrink-0">
                          {copiedCCP ? <CheckCheck className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                      {copiedCCP && <p className="text-emerald-400 text-xs mt-1.5 font-medium text-center">تم النسخ ✓</p>}
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
