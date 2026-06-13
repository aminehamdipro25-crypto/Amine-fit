'use client'
import { useState, useEffect } from 'react'
import { Download, X, Share } from 'lucide-react'

export default function PwaInstallBanner() {
  const [show,           setShow]           = useState(false)
  const [isIos,          setIsIos]          = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    // Already installed as PWA — hide banner
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) return

    // User already dismissed
    if (localStorage.getItem('pwa_dismissed_v2')) return

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

    if (ios) {
      // Safari on iOS never fires beforeinstallprompt — show manual instructions
      setIsIos(true)
      setShow(true)
      return
    }

    // Chrome / Edge / Samsung on Android — capture the install event
    function onBeforeInstall(e) {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  function dismiss() {
    localStorage.setItem('pwa_dismissed_v2', '1')
    setShow(false)
  }

  async function install() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    if (outcome === 'accepted') {
      localStorage.setItem('pwa_dismissed_v2', '1')
      setShow(false)
    }
  }

  if (!show) return null

  return (
    <div
      className="fixed bottom-4 inset-x-0 z-[80] flex justify-center px-4"
      role="dialog"
      aria-label="تثبيت التطبيق"
    >
      <div className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <div className="w-12 h-12 bg-[#fbbf24] rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-black font-black text-sm tracking-tight">AF</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-extrabold text-sm">AmineFit</p>
            <p className="text-white/40 text-xs font-medium truncate">
              {isIos ? 'أضف التطبيق لشاشتك الرئيسية' : 'ثبّت التطبيق مجاناً على هاتفك'}
            </p>
          </div>
          <button
            onClick={dismiss}
            className="w-7 h-7 rounded-xl bg-white/8 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/15 transition flex-shrink-0"
            aria-label="إغلاق"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 pb-4">
          {isIos ? (
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 bg-white/5 rounded-xl px-3 py-2.5">
                <span className="w-5 h-5 bg-[#fbbf24] rounded-full flex items-center justify-center text-[10px] font-extrabold text-black flex-shrink-0 mt-0.5">1</span>
                <p className="text-white/60 text-xs leading-relaxed" dir="rtl">
                  افتح هذه الصفحة في <span className="text-white font-bold">Safari</span> ثم اضغط زر
                  {' '}<span className="text-[#fbbf24] font-extrabold">المشاركة</span>{' '}
                  <Share className="w-3.5 h-3.5 inline-block text-[#fbbf24] align-text-bottom"/>
                  {' '}في أسفل الشاشة
                </p>
              </div>
              <div className="flex items-start gap-2.5 bg-white/5 rounded-xl px-3 py-2.5">
                <span className="w-5 h-5 bg-[#fbbf24] rounded-full flex items-center justify-center text-[10px] font-extrabold text-black flex-shrink-0 mt-0.5">2</span>
                <p className="text-white/60 text-xs leading-relaxed" dir="rtl">
                  اختر <span className="text-[#fbbf24] font-extrabold">"أضف إلى الشاشة الرئيسية"</span> من القائمة
                </p>
              </div>
              <button
                onClick={dismiss}
                className="w-full py-2.5 bg-white/8 text-white/40 font-bold rounded-xl text-xs hover:bg-white/12 transition mt-1"
              >
                لاحقاً
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <p className="text-white/40 text-xs leading-relaxed" dir="rtl">
                خططك الغذائية والتدريبية ورسائل مدربك — في تطبيق يعمل حتى بدون انترنت.
              </p>
              <button
                onClick={install}
                className="w-full py-3 bg-[#fbbf24] text-black font-extrabold rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-amber-400 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                تثبيت التطبيق
              </button>
              <button
                onClick={dismiss}
                className="w-full py-2 text-white/25 font-medium text-xs hover:text-white/50 transition"
              >
                لا شكراً
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
