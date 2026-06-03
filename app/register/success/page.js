'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Smartphone, MapPin, Copy, CheckCheck, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'

const WA         = '97430653759'
const D17_NUMBER = 'XX XXX XXX' // ← يُحدَّث بعد التفعيل
const CCP_IBAN   = 'TN59 1780 1000 0002 1931 0870'
const CCP_NAME   = 'HAMDI AMINE B JALOUL'

const PLANS = {
  'برنامج التدريب': { price: '50',  label: 'برنامج التدريب',  emoji: '🏋️' },
  'الباقة الشهرية': { price: '125', label: 'الباقة الشهرية',  emoji: '⚡' },
  'باقة 3 أشهر':   { price: '300', label: 'باقة 3 أشهر',    emoji: '🏆' },
}

function SuccessContent() {
  const params   = useSearchParams()
  const planName = params.get('plan') || ''
  const plan     = PLANS[planName]

  const [method, setMethod]     = useState(null)   // 'd17' | 'post'
  const [copied, setCopied]     = useState(false)
  const [sent, setSent]         = useState(false)

  function copy(text) {
    navigator.clipboard.writeText(text.replace(/\s/g, '')).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function waMsg() {
    const via = method === 'post' ? 'عبر البريد التونسي (إيداع)' : 'عبر D17'
    return encodeURIComponent(
      `مرحباً أمين 👋\nلقد أكملت تسجيل الاستبيان وأرسلت الدفع ${via}.\n` +
      (plan ? `الباقة: ${plan.label} — ${plan.price} د.ت\n` : '') +
      `أرجو تفعيل حسابي. شكراً!`
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" dir="rtl">
      <div className="max-w-lg mx-auto px-4 pt-12 pb-20">

        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-10">
          <div className="w-9 h-9 bg-[#fbbf24] rounded-xl flex items-center justify-center font-black text-black text-sm">AF</div>
          <span className="font-extrabold text-lg text-white">Amine-Fit</span>
        </div>

        {/* Journey steps */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {[
            { n: 1, label: 'التسجيل',  done: true  },
            { n: 2, label: 'الدفع',    done: false, active: true },
            { n: 3, label: 'التفعيل',  done: false },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-1">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold ${
                  s.done   ? 'bg-emerald-500 text-white' :
                  s.active ? 'bg-[#fbbf24] text-black ring-4 ring-[#fbbf24]/30' :
                             'bg-white/10 text-white/30'
                }`}>
                  {s.done ? '✓' : s.n}
                </div>
                <span className={`text-xs font-bold ${s.active ? 'text-[#fbbf24]' : s.done ? 'text-emerald-400' : 'text-white/25'}`}>{s.label}</span>
              </div>
              {i < 2 && <div className="w-10 h-px bg-white/10 mb-4" />}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/15 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-extrabold mb-2">تم التسجيل ✅</h1>
          <p className="text-white/40 text-sm">الخطوة الأخيرة — أرسل الدفع لتفعيل حسابك</p>
        </div>

        {/* Plan card */}
        {plan && (
          <div className="bg-[#fbbf24]/5 border border-[#fbbf24]/20 rounded-2xl px-5 py-4 flex items-center gap-4 mb-6">
            <span className="text-3xl">{plan.emoji}</span>
            <div>
              <p className="text-white/50 text-xs font-bold">الباقة المختارة</p>
              <p className="text-white font-extrabold text-base">{plan.label}</p>
            </div>
            <div className="mr-auto text-left">
              <p className="text-[#fbbf24] font-extrabold text-2xl">{plan.price}</p>
              <p className="text-white/30 text-xs">د.ت</p>
            </div>
          </div>
        )}

        {/* Method selector */}
        {!method && (
          <div>
            <p className="text-white/50 text-sm font-bold text-center mb-4">اختر طريقة الدفع</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button onClick={() => setMethod('d17')}
                className="bg-[#1a1a1a] hover:bg-white/5 border border-white/10 hover:border-[#fbbf24]/40 rounded-2xl p-5 flex flex-col items-center gap-3 transition cursor-pointer">
                <Smartphone className="w-7 h-7 text-[#fbbf24]" />
                <div className="text-center">
                  <p className="text-white font-extrabold text-sm">تطبيق D17</p>
                  <p className="text-white/30 text-xs mt-0.5">تحويل فوري</p>
                </div>
              </button>
              <button onClick={() => setMethod('post')}
                className="bg-[#1a1a1a] hover:bg-white/5 border border-white/10 hover:border-[#fbbf24]/40 rounded-2xl p-5 flex flex-col items-center gap-3 transition cursor-pointer">
                <MapPin className="w-7 h-7 text-[#fbbf24]" />
                <div className="text-center">
                  <p className="text-white font-extrabold text-sm">مكتب البريد</p>
                  <p className="text-white/30 text-xs mt-0.5">إيداع نقدي</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* D17 instructions */}
        {method === 'd17' && (
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5 mb-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#fbbf24]" />
                <p className="text-white font-extrabold text-sm">الدفع عبر D17</p>
              </div>
              <button onClick={() => setMethod(null)} className="text-white/25 text-xs hover:text-white/50 underline">تغيير</button>
            </div>
            <div className="space-y-4">
              <Step n={1} title="افتح تطبيق D17" sub="أو اتصل بـ *194#" />
              <Step n={2} title={`أرسل ${plan?.price || ''} د.ت إلى:`}>
                <NumberBox value={D17_NUMBER} onCopy={() => copy(D17_NUMBER)} copied={copied} />
              </Step>
              <Step n={3} title="أرسل إثبات الدفع على واتساب" sub="صورة من D17 تؤكد التحويل" />
            </div>
          </div>
        )}

        {/* Post office instructions */}
        {method === 'post' && (
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5 mb-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#fbbf24]" />
                <p className="text-white font-extrabold text-sm">الدفع عبر مكتب البريد</p>
              </div>
              <button onClick={() => setMethod(null)} className="text-white/25 text-xs hover:text-white/50 underline">تغيير</button>
            </div>
            <div className="space-y-4">
              <Step n={1} title="اذهب لأقرب مكتب بريد تونسي" sub="معك بطاقتك الوطنية" />
              <Step n={2} title={`أودع ${plan?.price || ''} د.ت — IBAN:`}>
                <NumberBox value={CCP_IBAN} onCopy={() => copy(CCP_IBAN)} copied={copied} />
                <p className="text-white/25 text-xs text-center mt-1">{CCP_NAME}</p>
              </Step>
              <Step n={3} title="صوّر وصل الإيداع وأرسله على واتساب" sub="لتأكيد الدفع وتفعيل حسابك" />
            </div>
          </div>
        )}

        {/* WhatsApp CTA */}
        {method && !sent && (
          <a href={`https://wa.me/${WA}?text=${waMsg()}`} target="_blank" rel="noreferrer"
            onClick={() => setSent(true)}
            className="w-full py-4 bg-[#25d366] text-white rounded-2xl font-extrabold text-base flex items-center justify-center gap-2.5 hover:bg-[#22c55e] transition mb-4 shadow-lg shadow-green-900/30">
            <MessageCircle className="w-5 h-5" fill="white" />
            أرسلت الدفع — فعّل حسابي على واتساب
          </a>
        )}

        {sent && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center mb-4">
            <p className="text-emerald-400 font-extrabold text-base mb-1">✅ ممتاز! في انتظار تأكيد أمين</p>
            <p className="text-white/40 text-xs">ستصلك رسالة تفعيل على بريدك الإلكتروني خلال ساعة</p>
          </div>
        )}

        {/* No plan / fallback WA */}
        {!plan && !method && (
          <a href={`https://wa.me/${WA}?text=${encodeURIComponent('مرحباً أمين، أكملت التسجيل وأريد معرفة كيفية الدفع وتفعيل حسابي.')}`}
            target="_blank" rel="noreferrer"
            className="w-full py-4 bg-[#25d366] text-white rounded-2xl font-extrabold text-base flex items-center justify-center gap-2.5 hover:bg-[#22c55e] transition mb-4">
            <MessageCircle className="w-5 h-5" fill="white" />
            تواصل مع أمين للدفع
          </a>
        )}

        <div className="text-center">
          <Link href="/" className="text-white/20 text-sm hover:text-white/40 transition">العودة للرئيسية</Link>
        </div>
      </div>
    </div>
  )
}

function Step({ n, title, sub, children }) {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-[#fbbf24] text-black text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">{n}</div>
      <div className="flex-1">
        <p className="text-white font-bold text-sm mb-1">{title}</p>
        {sub && <p className="text-white/35 text-xs mb-2">{sub}</p>}
        {children}
      </div>
    </div>
  )
}

function NumberBox({ value, onCopy, copied }) {
  return (
    <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3">
      <span className="text-white font-bold text-sm tracking-wider flex-1 text-center" dir="ltr">{value}</span>
      <button onClick={onCopy} className="text-white/35 hover:text-[#fbbf24] transition flex-shrink-0">
        {copied ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  )
}
