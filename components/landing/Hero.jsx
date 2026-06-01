import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Star, Zap, Shield, Award } from 'lucide-react'

const stats = [
  { val: '10+',  label: 'سنوات خبرة',      emoji: '📅' },
  { val: '100+', label: 'مشترك نشط',       emoji: '💪' },
  { val: '95%',  label: 'نسبة النجاح',      emoji: '🎯' },
  { val: '12+',  label: 'شهادة معتمدة',    emoji: '🏆' },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0a0a0a]">

      {/* ── Coach photo — all sizes, stronger overlay on mobile ─────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Image
          src="/coach-hero.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          style={{ objectPosition: '35% center' }}
        />
        {/* Mobile: heavy dark overlay so text stays readable */}
        <div className="absolute inset-0 lg:hidden"
          style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.75) 0%, rgba(10,10,10,0.65) 50%, rgba(10,10,10,0.85) 100%)' }} />
        {/* Desktop: gradient keeps right side dark for text */}
        <div className="absolute inset-0 hidden lg:block" style={{
          background: 'linear-gradient(to right, rgba(10,10,10,0.08) 0%, rgba(10,10,10,0.55) 38%, rgba(10,10,10,0.92) 58%, #0a0a0a 78%)',
        }} />
        {/* Top & bottom fade */}
        <div className="absolute inset-x-0 top-0 h-40"
          style={{ background: 'linear-gradient(to bottom, #0a0a0a 0%, transparent 100%)' }} />
        <div className="absolute inset-x-0 bottom-0 h-40"
          style={{ background: 'linear-gradient(to top, #0a0a0a 0%, transparent 100%)' }} />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

      {/* Gold glows */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-gold-400/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gold-400/4 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 w-full">
        <div className="max-w-3xl">

          {/* Trust badge */}
          <div className="inline-flex items-center gap-3 border border-gold-400/25 bg-gold-400/5 rounded-full px-4 py-2 mb-8">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-gold-400" />
              <span className="text-gold-400 text-xs font-extrabold uppercase tracking-wider">مدرب معتمد</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-gold-400 fill-gold-400" />)}
            </div>
            <span className="text-white/50 text-xs font-medium">+100 عميل راضٍ</span>
          </div>

          {/* Main heading — powerful & unique */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
            من القوات<br />
            الخاصة البحرية<br />
            <span className="text-gold-400">إلى قوّتك الشخصية</span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/40 text-lg sm:text-xl mb-3 leading-relaxed max-w-xl font-medium">
            خبير رياضي وتغذوي معتمد بخلفية عسكرية نخبوية —
            أكثر من <strong className="text-white/70">10 سنوات</strong> تدريب القوات الخاصة والغوص البحري
            في خدمة هدفك الآن.
          </p>

          {/* Micro credentials */}
          <div className="flex flex-wrap gap-2 mb-10">
            {[
              '🎓 بكالوريوس علوم الرياضة',
              '🥗 مدرب تغذية معتمد',
              '🧠 علم النفس الرياضي',
              '🏋️ مدرب شخصي معتمد',
              '🧘 يوغا علاجية',
            ].map(b => (
              <span key={b} className="flex items-center gap-1 text-xs text-white/40 font-semibold bg-white/5 border border-white/8 rounded-full px-3 py-1">
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
            <a href="#about"
              className="flex items-center justify-center gap-2 px-8 py-4 border border-white/10 text-white/70 font-bold text-lg rounded-2xl hover:bg-white/5 hover:text-white hover:border-white/20 transition-all">
              من هو أمين؟
              <ArrowLeft className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Stats — desktop */}
        <div className="absolute left-4 lg:left-16 bottom-24 hidden lg:grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label}
              className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[110px]">
              <div className="text-lg mb-1">{s.emoji}</div>
              <p className="text-2xl font-extrabold text-gold-400">{s.val}</p>
              <p className="text-white/40 text-xs mt-0.5 font-semibold">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  )
}
