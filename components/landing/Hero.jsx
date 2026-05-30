import Link from 'next/link'
import { ArrowLeft, Star, Zap } from 'lucide-react'

const badges = [
  'بدون عقود ملزمة',
  'أول أسبوع مجاناً',
  'دعم 7 أيام/7',
]

const stats = [
  { val: '100+', label: 'مشترك نشط' },
  { val: '95%',  label: 'نسبة النجاح' },
  { val: '5+',   label: 'سنوات خبرة' },
  { val: '500+', label: 'تحويل ناجح' },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0a0a0a]">

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

      {/* Gold glow */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gold-400/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gold-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
        <div className="max-w-3xl">

          {/* Pill badge */}
          <div className="inline-flex items-center gap-3 border border-gold-400/30 bg-gold-400/5 rounded-full px-4 py-2 mb-8">
            <div className="flex -space-x-1">
              {['أ','س','ك'].map((l, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-gold-400 flex items-center justify-center text-black text-xs font-extrabold border-2 border-[#0a0a0a]">
                  {l}
                </div>
              ))}
            </div>
            <span className="text-white/70 text-sm font-medium">+100 مشترك يثقون بنا</span>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-gold-400 fill-gold-400" />)}
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-[1.05] mb-6 tracking-tight">
            حوّل جسمك<br />
            مع{' '}
            <span className="text-gold-400">مدرب شخصي</span>
            <br />محترف ومعتمد
          </h1>

          {/* Subtitle */}
          <p className="text-white/40 text-lg sm:text-xl mb-8 leading-relaxed max-w-xl font-medium">
            برامج تدريبية وغذائية مخصصة بالكامل — نظام جداول التبادل الغذائي
            المعتمد مع متابعة يومية لضمان نتائجك.
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-10">
            {badges.map(b => (
              <span key={b} className="flex items-center gap-1.5 text-sm text-white/50 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400 inline-block" />
                {b}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/register"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gold-400 text-black font-extrabold text-lg rounded-2xl shadow-xl shadow-gold-400/20 hover:bg-gold-300 hover:shadow-gold-400/30 hover:scale-[1.02] transition-all">
              <Zap className="w-5 h-5" fill="black" />
              ابدأ رحلتك الآن
            </a>
            <a href="#pricing"
              className="flex items-center justify-center gap-2 px-8 py-4 border border-white/10 text-white/70 font-bold text-lg rounded-2xl hover:bg-white/5 hover:text-white hover:border-white/20 transition-all">
              اكتشف الباقات
              <ArrowLeft className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Stats — desktop */}
        <div className="absolute left-4 lg:left-16 bottom-24 hidden lg:grid grid-cols-2 gap-3">
          {stats.map((s, i) => (
            <div key={s.label}
              className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[110px]"
              style={{ animationDelay: `${i * 0.15}s` }}>
              <p className="text-2xl font-extrabold text-gold-400">{s.val}</p>
              <p className="text-white/40 text-xs mt-0.5 font-semibold">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom divider */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  )
}
