import Link from 'next/link'
import { Utensils, Dumbbell, FlaskConical, TrendingUp, Zap, ArrowLeft } from 'lucide-react'

/* ─── Mini mockup: Nutrition Plan ──────────────────────────────────────────── */
function NutritionMockup() {
  return (
    <div className="space-y-3">
      {/* Macro bars */}
      <div className="space-y-2">
        {/* Protein */}
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-[10px] font-bold w-14 shrink-0 text-left">Protein</span>
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }} />
          </div>
          <span className="text-blue-400 text-[10px] font-extrabold w-10 text-left shrink-0">140g</span>
        </div>
        {/* Carbs */}
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-[10px] font-bold w-14 shrink-0 text-left">Carbs</span>
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '80%' }} />
          </div>
          <span className="text-emerald-400 text-[10px] font-extrabold w-10 text-left shrink-0">185g</span>
        </div>
        {/* Fat */}
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-[10px] font-bold w-14 shrink-0 text-left">Fat</span>
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '40%' }} />
          </div>
          <span className="text-amber-400 text-[10px] font-extrabold w-10 text-left shrink-0">55g</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/8" />

      {/* Meal time chips */}
      <div className="flex flex-wrap gap-1.5 justify-end">
        {[
          { label: 'الإفطار', time: '08:00', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
          { label: 'الغداء',  time: '13:30', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
          { label: 'العشاء',  time: '20:00', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
        ].map(m => (
          <span key={m.label}
            className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full border ${m.color}`}>
            {m.label} <span className="opacity-60 font-mono">{m.time}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── Mini mockup: Workout Plan ─────────────────────────────────────────────── */
function WorkoutMockup() {
  const exercises = [
    { name: 'Bench Press', sets: '4 × 8',  dot: 'bg-red-500' },
    { name: 'Squats',      sets: '4 × 10', dot: 'bg-orange-400' },
    { name: 'Pull Up',     sets: '3 × 8',  dot: 'bg-yellow-400' },
  ]
  return (
    <div className="space-y-2">
      {exercises.map((ex, i) => (
        <div key={ex.name}
          className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2 border border-white/8">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ex.dot}`} />
            <span className="text-white/80 text-[11px] font-bold tracking-wide font-mono">{ex.name}</span>
          </div>
          <span className="text-gold-400 text-[10px] font-extrabold bg-gold-400/10 border border-gold-400/20 px-2 py-0.5 rounded-full font-mono">
            {ex.sets}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ─── Mini mockup: Science Lab ──────────────────────────────────────────────── */
function LabMockup() {
  const zones = [
    { label: 'Z1', color: 'bg-blue-500',   w: 'w-[18%]' },
    { label: 'Z2', color: 'bg-emerald-500', w: 'w-[28%]' },
    { label: 'Z3', color: 'bg-yellow-400',  w: 'w-[22%]' },
    { label: 'Z4', color: 'bg-orange-500',  w: 'w-[18%]' },
    { label: 'Z5', color: 'bg-red-500',     w: 'w-[14%]' },
  ]
  return (
    <div className="space-y-3">
      {/* Zone bars */}
      <div className="flex items-end gap-1 h-10">
        {zones.map((z, i) => (
          <div key={z.label} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-white/30 text-[8px] font-bold">{z.label}</span>
            <div className={`w-full rounded-t-md ${z.color}`}
              style={{ height: `${28 + i * 4}px`, opacity: 0.85 }} />
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-white/8" />

      {/* Protocol card */}
      <div className="bg-white/5 border border-emerald-500/20 rounded-xl px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🔥</span>
          <div>
            <p className="text-white/80 text-[10px] font-extrabold">HIIT + Zone 2</p>
            <p className="text-white/30 text-[9px]">بروتوكول مخصص</p>
          </div>
        </div>
        <span className="text-[9px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full">
          🔥 مفعّل
        </span>
      </div>
    </div>
  )
}

/* ─── Mini mockup: Progress Tracking ────────────────────────────────────────── */
function ProgressMockup() {
  return (
    <div className="space-y-3">
      {/* Water tracker */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-white/40 text-[9px] font-bold">الماء اليومي</span>
          <span className="text-blue-400 text-[9px] font-extrabold">5/8 أكواب</span>
        </div>
        <div className="flex gap-1.5 justify-end">
          {[...Array(8)].map((_, i) => (
            <span key={i} className={`text-sm ${i < 5 ? 'opacity-100' : 'opacity-20'}`}>
              💧
            </span>
          ))}
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: '62%' }} />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/8" />

      {/* Weight log */}
      <div className="bg-white/5 border border-white/8 rounded-xl px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-white/30 text-[9px]">آخر تسجيل</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-white/60 text-[11px] font-bold">88 كغ</span>
          <span className="text-white/20 text-[10px]">→</span>
          <span className="text-emerald-400 text-[11px] font-extrabold">86.5 كغ</span>
          <span className="text-emerald-400 text-[10px]">↓</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Feature cards data ─────────────────────────────────────────────────────── */
const features = [
  {
    icon: Utensils,
    title: 'الخطة الغذائية المخصصة',
    desc: 'خطة سعرات حرارية مخصصة مع توزيع دقيق للماكروز وجداول الوجبات اليومية',
    accent: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    mockup: NutritionMockup,
  },
  {
    icon: Dumbbell,
    title: 'البرنامج التدريبي العلمي',
    desc: 'برنامج تدريبي مبني على مبادئ RPE والحمل التدريجي مع تمارين موضحة بالصور',
    accent: 'text-blue-400',
    iconBg: 'bg-blue-500/10 border-blue-500/20',
    mockup: WorkoutMockup,
  },
  {
    icon: FlaskConical,
    title: 'المختبر العلمي 🔬',
    desc: 'بروتوكول تدريبي مُصمَّم من المدرب بناءً على بياناتك الصحية ومستواك الفعلي',
    accent: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    mockup: LabMockup,
  },
  {
    icon: TrendingUp,
    title: 'متابعة التقدم اليومي',
    desc: 'سجّل وزنك ومياهك يومياً وتابع رحلتك بمخططات بيانية واضحة',
    accent: 'text-purple-400',
    iconBg: 'bg-purple-500/10 border-purple-500/20',
    mockup: ProgressMockup,
  },
]

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export default function PlatformTour() {
  return (
    <section className="py-24 bg-[#0a0a0a] relative overflow-hidden">

      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gold-400/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gold-400/3 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-gold-400 font-bold text-xs uppercase tracking-widest mb-3">
            داخل المنصة
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            كل ما تحتاجه في مكان واحد
          </h2>
          <p className="text-white/30 text-base font-medium mt-3 max-w-lg mx-auto">
            منصة متكاملة تجمع التغذية والتدريب والمتابعة في واجهة واحدة سهلة الاستخدام
          </p>
        </div>

        {/* 2×2 Feature cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          {features.map((f) => {
            const Icon = f.icon
            const Mockup = f.mockup
            return (
              <div key={f.title}
                className="group bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-5
                           hover:border-white/20 hover:bg-white/[0.07] hover:-translate-y-0.5
                           transition-all duration-300">

                {/* Card header */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${f.iconBg}`}>
                    <Icon className={`w-5 h-5 ${f.accent}`} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="text-white font-extrabold text-sm leading-tight">{f.title}</h3>
                    <p className="text-white/35 text-xs font-medium mt-0.5 leading-snug">{f.desc}</p>
                  </div>
                </div>

                {/* Mini UI mockup */}
                <div className="bg-[#0d0d0d] border border-white/8 rounded-xl p-4 flex-1">
                  <Mockup />
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA card */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10"
          style={{ background: 'linear-gradient(135deg, #111111 0%, #0e0e0e 50%, #111111 100%)' }}>

          {/* Inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-gold-400/5 via-transparent to-gold-400/3 pointer-events-none" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-400/30 to-transparent" />

          <div className="relative px-6 py-12 sm:py-16 flex flex-col items-center text-center gap-6">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gold-400/8 border border-gold-400/20 rounded-full px-4 py-1.5">
              <Zap className="w-3.5 h-3.5 text-gold-400" fill="currentColor" />
              <span className="text-gold-400 text-[11px] font-extrabold uppercase tracking-widest">
                تجربة مجانية
              </span>
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                مستعد لتجربة المنصة؟
              </h3>
              <p className="text-white/40 text-sm sm:text-base font-medium">
                جولة تجريبية كاملة — بدون تسجيل، بدون بيانات
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/client/demo"
                className="flex items-center gap-2.5 bg-gold-400 text-black font-extrabold px-8 py-4 rounded-2xl
                           hover:bg-gold-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-gold-400/25
                           transition-all shadow-lg shadow-gold-400/15 text-base">
                <Zap className="w-5 h-5" fill="black" />
                جرّب المنصة الآن ⚡
              </Link>

              <Link
                href="#pricing"
                className="flex items-center gap-2 text-white/50 font-bold text-sm
                           hover:text-white/80 transition-colors px-4 py-4">
                اختر باقتك
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>

      </div>

      {/* Bottom section divider */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
    </section>
  )
}
