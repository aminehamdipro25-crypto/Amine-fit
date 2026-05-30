import Link from 'next/link'
import { ArrowLeft, Star, CheckCircle2 } from 'lucide-react'

const badges = [
  '✓ بدون عقود ملزمة',
  '✓ أول أسبوع مجاناً',
  '✓ دعم 7 أيام/7',
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden
      bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900">

      {/* Decorative blobs */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
        <div className="max-w-3xl">

          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8 backdrop-blur-sm">
            <div className="flex -space-x-1">
              {['أ','س','ك'].map((l,i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-emerald-400 flex items-center justify-center text-white text-xs font-bold border-2 border-white/20">
                  {l}
                </div>
              ))}
            </div>
            <span className="text-white/90 text-sm font-medium">+100 مشترك يثقون بنا</span>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            حوّل جسمك مع{' '}
            <span className="bg-gradient-to-r from-primary-400 to-emerald-400 bg-clip-text text-transparent">
              مدرب شخصي
            </span>
            <br />محترف ومعتمد
          </h1>

          {/* Subtitle */}
          <p className="text-white/70 text-lg sm:text-xl mb-8 leading-relaxed max-w-2xl">
            برامج تدريبية وغذائية مخصصة بالكامل لأهدافك —
            نظام جداول التبادل الغذائي المعتمد، مع متابعة يومية دقيقة لضمان نتائجك.
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-3 mb-10">
            {badges.map(b => (
              <span key={b} className="bg-white/10 border border-white/15 text-white/80 text-sm px-4 py-1.5 rounded-full backdrop-blur-sm">
                {b}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#contact"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-emerald-500
                text-white font-bold text-lg rounded-2xl shadow-2xl shadow-primary-900/50
                hover:shadow-primary-600/40 hover:scale-105 transition-all">
              ابدأ رحلتك الآن
              <ArrowLeft className="w-5 h-5" />
            </a>
            <a href="#pricing"
              className="flex items-center justify-center gap-2 px-8 py-4
                bg-white/10 border border-white/20 text-white font-bold text-lg rounded-2xl
                hover:bg-white/20 transition-all backdrop-blur-sm">
              اكتشف الباقات
            </a>
          </div>
        </div>

        {/* Floating stats cards */}
        <div className="absolute left-4 lg:left-16 bottom-20 hidden lg:grid grid-cols-2 gap-3">
          {[
            { val: '100+', label: 'مشترك نشط', color: 'from-primary-500 to-primary-600' },
            { val: '95%',  label: 'نسبة النجاح', color: 'from-emerald-500 to-emerald-600' },
            { val: '5+',   label: 'سنوات خبرة',  color: 'from-amber-500 to-orange-500' },
            { val: '500+', label: 'تحويل ناجح',  color: 'from-pink-500 to-rose-500' },
          ].map(s => (
            <div key={s.label}
              className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-4 text-center animate-float min-w-[110px]"
              style={{ animationDelay: `${Math.random() * 1}s` }}>
              <p className={`text-2xl font-extrabold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.val}</p>
              <p className="text-white/70 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 inset-x-0">
        <svg viewBox="0 0 1440 60" className="fill-slate-50 w-full">
          <path d="M0,0 C360,60 1080,60 1440,0 L1440,60 L0,60 Z" />
        </svg>
      </div>
    </section>
  )
}
