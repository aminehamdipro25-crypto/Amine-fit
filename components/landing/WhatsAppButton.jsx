'use client'
import { useState } from 'react'
import { X, ChevronLeft } from 'lucide-react'

const WA_NUMBER = '97430653759'

const FAQS = [
  { q: 'ما هي الباقات المتاحة والأسعار؟',     msg: 'مرحباً أمين، أريد معرفة الباقات المتاحة والأسعار' },
  { q: 'كيف يصلني البرنامج بعد التسجيل؟',   msg: 'مرحباً أمين، كيف يصلني البرنامج بعد التسجيل؟' },
  { q: 'هل يمكنني التدريب من المنزل؟',        msg: 'مرحباً أمين، هل يمكن التدريب من المنزل بدون معدات؟' },
  { q: 'هل هناك ضمان استرداد المبلغ؟',        msg: 'مرحباً أمين، هل هناك ضمان استرداد المبلغ؟' },
  { q: 'هل البرنامج مناسب للمبتدئين؟',        msg: 'مرحباً أمين، أنا مبتدئ هل البرنامج يناسبني؟' },
]

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  )
}

export default function WhatsAppButton() {
  const [open, setOpen]       = useState(false)
  const [tooltip, setTooltip] = useState(true)

  function openWA(msg = 'مرحباً أمين، أريد الاستفسار عن برامج التدريب والتغذية') {
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
    setOpen(false)
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">

      {/* ── Chat panel ── */}
      {open && (
        <div className="w-72 bg-[#1a1a1a] border border-white/10 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3"
            style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-extrabold text-sm">
                أح
              </div>
              <div>
                <p className="text-white font-extrabold text-sm leading-none mb-0.5">أمين حمدي</p>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                  <span className="text-white/80 text-xs">متصل الآن</span>
                </span>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 pt-4 pb-3">
            {/* Greeting bubble */}
            <div className="bg-white/6 border border-white/8 rounded-2xl rounded-tr-sm px-4 py-3 mb-4">
              <p className="text-white/80 text-xs leading-relaxed">
                مرحباً 👋 كيف يمكنني مساعدتك؟<br />
                اختر سؤالاً أو تواصل معي مباشرةً.
              </p>
            </div>

            {/* FAQ buttons */}
            <div className="space-y-2 mb-4">
              {FAQS.map((f, i) => (
                <button key={i} onClick={() => openWA(f.msg)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white/4 hover:bg-emerald-500/10 border border-white/8 hover:border-emerald-500/30 rounded-xl text-white/65 hover:text-white text-xs font-bold transition-all text-right">
                  <span>{f.q}</span>
                  <ChevronLeft className="w-3.5 h-3.5 flex-shrink-0 opacity-40" />
                </button>
              ))}
            </div>

            {/* Direct CTA */}
            <button onClick={() => openWA()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-extrabold text-sm transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)' }}>
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
              تواصل مباشرة عبر واتساب
            </button>
          </div>
          <p className="text-center text-white/20 text-xs pb-3">الرسائل مشفّرة عبر واتساب</p>
        </div>
      )}

      {/* ── Tooltip ── */}
      {!open && tooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-white text-gray-800 text-sm font-bold px-4 py-2.5 rounded-2xl shadow-xl shadow-black/20 whitespace-nowrap animate-bounce-slow">
          <span>💬 تواصل معي مباشرة</span>
          <button onClick={e => { e.stopPropagation(); setTooltip(false) }}
            className="text-gray-400 hover:text-gray-600 transition ml-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Main button ── */}
      <button
        onClick={() => { setOpen(o => !o); setTooltip(false) }}
        aria-label="تواصل عبر واتساب"
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40 hover:scale-110 transition-transform"
        style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)' }}>
        {open ? <X className="w-6 h-6 text-white" /> : <WaIcon />}
      </button>
    </div>
  )
}
