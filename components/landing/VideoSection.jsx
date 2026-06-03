'use client'
import { useState } from 'react'
import { Play, X, Star } from 'lucide-react'

// Set NEXT_PUBLIC_INTRO_VIDEO_ID to your YouTube video ID when ready
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
              شاهد الفيديو التعريفي
            </button>
          </div>

          {/* Right — video thumbnail */}
          <div className="relative group cursor-pointer" onClick={() => setOpen(true)}>
            <div className="relative rounded-3xl overflow-hidden bg-[#111] border border-white/10 aspect-video">
              {/* Thumbnail background */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold-400/20 via-[#111] to-[#0a0a0a]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-6xl mb-3">🎬</div>
                <p className="text-white/30 text-sm font-bold">فيديو تعريفي — أمين حمدي</p>
              </div>
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-gold-400 rounded-full flex items-center justify-center shadow-2xl shadow-gold-400/40 group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-8 h-8 fill-black text-black mr-1" />
                </div>
              </div>
              {/* Duration badge */}
              <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                ~2:00 دقيقة
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="w-full max-w-3xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white font-extrabold">فيديو تعريفي — أمين حمدي</p>
              <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white transition p-2">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-video rounded-2xl overflow-hidden bg-[#111] border border-white/10">
              {VIDEO_ID ? (
                <iframe
                  src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1`}
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="text-6xl mb-4">🎬</div>
                  <p className="text-white font-extrabold text-lg mb-2">الفيديو قادم قريباً</p>
                  <p className="text-white/40 text-sm">يجري تصوير الفيديو التعريفي — تابعونا</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
