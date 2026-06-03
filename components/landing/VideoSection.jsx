'use client'
import { useState } from 'react'
import { Play, X, Star, Layers } from 'lucide-react'
import AnimatedPlatformDemo from './AnimatedPlatformDemo'

// When you record a real video, set this env var to your YouTube ID
const VIDEO_ID = process.env.NEXT_PUBLIC_INTRO_VIDEO_ID || ''

export default function VideoSection() {
  const [open, setOpen] = useState(false)

  return (
    <section className="py-20 bg-[#0d0d0d] border-t border-white/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* Left — text */}
          <div>
            <p className="text-gold-400 font-bold text-xs uppercase tracking-widest mb-3">تعرّف على مدرّبك</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-5 tracking-tight">
              من القوات الخاصة<br />
              <span className="text-gold-400">إلى منهجيتي معك</span>
            </h2>
            <p className="text-white/40 text-sm leading-relaxed mb-6 font-medium">
              في هذا المقطع أشرح لك بالتفصيل كيف أصمّم برنامجك — من تحليل بياناتك إلى تسليم خطتك خلال 24 ساعة.
              منهجية مبنية على 10 سنوات مع القوات الخاصة والغواصين البحريين.
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              {['منهجية واضحة', 'نتائج موثّقة', '10 سنوات خبرة'].map(t => (
                <span key={t} className="flex items-center gap-1.5 text-xs text-gold-400 font-bold bg-gold-400/8 border border-gold-400/20 rounded-full px-3 py-1.5">
                  <Star className="w-3 h-3 fill-gold-400" />{t}
                </span>
              ))}
            </div>
            <button onClick={() => setOpen(true)}
              className="flex items-center gap-3 px-6 py-3.5 bg-gold-400 text-black font-extrabold rounded-2xl hover:bg-gold-300 transition-all shadow-lg shadow-gold-400/20">
              <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center">
                <Play className="w-4 h-4 fill-black" />
              </div>
              {VIDEO_ID ? 'شاهد الفيديو التعريفي' : 'جولة داخل المنصة'}
            </button>
          </div>

          {/* Right — thumbnail or live demo preview */}
          {VIDEO_ID ? (
            /* YouTube thumbnail */
            <div className="relative group cursor-pointer" onClick={() => setOpen(true)}>
              <div className="relative rounded-3xl overflow-hidden bg-[#111] border border-white/10 aspect-video">
                <div className="absolute inset-0 bg-gradient-to-br from-gold-400/20 via-[#111] to-[#0a0a0a]" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-6xl mb-3">🎬</div>
                  <p className="text-white/30 text-sm font-bold">فيديو تعريفي — أمين حمدي</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-gold-400 rounded-full flex items-center justify-center shadow-2xl shadow-gold-400/40 group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-8 h-8 fill-black text-black mr-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                  ~2:00 دقيقة
                </div>
              </div>
            </div>
          ) : (
            /* Animated platform demo — plays live in the thumbnail */
            <div className="relative group">
              <AnimatedPlatformDemo autoPlay />
              {/* Click-to-expand overlay */}
              <div
                onClick={() => setOpen(true)}
                className="absolute inset-0 rounded-3xl bg-black/0 group-hover:bg-black/30 transition-all duration-300 cursor-pointer flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  flex items-center gap-2 bg-black/70 border border-white/20 rounded-2xl px-5 py-3 backdrop-blur-sm">
                  <Layers className="w-4 h-4 text-white" />
                  <span className="text-white font-extrabold text-sm">فتح بملء الشاشة</span>
                </div>
              </div>
              {/* Live badge */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/70 border border-white/10 rounded-full px-2.5 py-1 backdrop-blur-sm pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/70 text-[10px] font-extrabold">جولة تفاعلية</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/92 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="w-full max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white font-extrabold text-lg">
                  {VIDEO_ID ? 'فيديو تعريفي — أمين حمدي' : 'جولة داخل المنصة — Amine-Fit'}
                </p>
                {!VIDEO_ID && (
                  <p className="text-white/30 text-xs mt-0.5">6 ميزات رئيسية — تشغيل تلقائي</p>
                )}
              </div>
              <button onClick={() => setOpen(false)}
                className="text-white/50 hover:text-white transition p-2 rounded-xl hover:bg-white/5">
                <X className="w-6 h-6" />
              </button>
            </div>

            {VIDEO_ID ? (
              <div className="aspect-video rounded-2xl overflow-hidden bg-[#111] border border-white/10">
                <iframe
                  src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1`}
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              </div>
            ) : (
              <AnimatedPlatformDemo autoPlay />
            )}
          </div>
        </div>
      )}
    </section>
  )
}
