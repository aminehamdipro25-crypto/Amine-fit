'use client'
import { useState } from 'react'
import { Gift, Copy, CheckCircle2, Users } from 'lucide-react'

const WA_NUMBER = '97430653759'

export default function Referral() {
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}?ref=friend`
    : 'https://amine-fit.vercel.app?ref=friend'

  function copy() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  function shareWhatsApp() {
    const msg = `🏋️ اكتشفت منصة Amine-Fit للتدريب الشخصي — المدرب أمين حمدي خبرة 10 سنوات في القوات الخاصة. جربها معي!\n\n${shareUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="py-20 bg-[#0a0a0a] border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="rounded-3xl border border-gold-400/20 bg-gradient-to-br from-gold-400/5 via-transparent to-transparent overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* Left — copy */}
            <div className="px-8 py-10">
              <div className="inline-flex items-center gap-2 border border-gold-400/25 bg-gold-400/8 rounded-full px-3 py-1.5 mb-5">
                <Gift className="w-4 h-4 text-gold-400" />
                <span className="text-gold-400 text-xs font-extrabold uppercase tracking-wider">ادعُ أصدقاءك</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 leading-tight tracking-tight">
                شارك نجاحك<br />
                <span className="text-gold-400">واكسب معاً</span>
              </h2>
              <p className="text-white/40 text-sm leading-relaxed mb-6 font-medium">
                أنت تحب ما تراه؟ شارك الرابط مع صديق — وعند اشتراكه أخبر المدرب ليحصل كلاكما على أسبوع مجاني إضافي.
              </p>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex -space-x-2 -space-x-reverse">
                  {['م', 'س', 'أ', 'ي'].map((l, i) => (
                    <div key={i}
                      className="w-8 h-8 rounded-full bg-gold-400/20 border-2 border-[#0a0a0a] flex items-center justify-center text-gold-400 text-xs font-extrabold">
                      {l}
                    </div>
                  ))}
                </div>
                <p className="text-white/40 text-xs font-medium">
                  <span className="text-white font-bold">12+</span> صديق دعاه عملاؤنا هذا الشهر
                </p>
              </div>

              <div className="flex items-stretch gap-2">
                <div className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3 min-w-0">
                  <span className="text-white/40 text-xs font-mono truncate select-all">{shareUrl}</span>
                </div>
                <button onClick={copy}
                  className="flex items-center gap-1.5 px-4 py-3 bg-gold-400 hover:bg-gold-300 text-black font-extrabold text-xs rounded-2xl transition-all whitespace-nowrap">
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'تم النسخ!' : 'نسخ'}
                </button>
              </div>
            </div>

            {/* Right — share options */}
            <div className="px-8 py-10 border-t lg:border-t-0 lg:border-r border-white/5 flex flex-col justify-center gap-4">
              <p className="text-white/30 text-xs font-extrabold uppercase tracking-widest mb-2">شارك عبر</p>

              <button onClick={shareWhatsApp}
                className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-white/8 hover:border-emerald-500/30 bg-white/3 hover:bg-emerald-500/8 transition-all group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)' }}>
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-sm group-hover:text-emerald-400 transition">واتساب</p>
                  <p className="text-white/30 text-xs">شارك مباشرة مع صديق</p>
                </div>
              </button>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: 'Amine-Fit', text: 'برنامج تدريبي متخصص مع المدرب أمين حمدي', url: shareUrl })
                  } else {
                    copy()
                  }
                }}
                className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-white/8 hover:border-gold-400/30 bg-white/3 hover:bg-gold-400/5 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-gold-400" />
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-sm group-hover:text-gold-400 transition">مشاركة عامة</p>
                  <p className="text-white/30 text-xs">مشاركة عبر أي تطبيق</p>
                </div>
              </button>

              <div className="mt-2 bg-white/3 border border-white/8 rounded-2xl px-4 py-3">
                <p className="text-white/50 text-xs leading-relaxed">
                  💡 <span className="text-white/70 font-bold">كيف يعمل؟</span> أرسل الرابط لصديقك، عند اشتراكه أبلغ المدرب باسم صديقك عبر واتساب وستحصلون على مكافأة الأسبوع المجاني.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
