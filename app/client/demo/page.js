'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  Zap, LayoutDashboard, Utensils, Dumbbell, TrendingUp, BookOpen,
  ArrowLeft, Clock, Droplets, CheckCircle2, Lock, Menu, X,
  FlaskConical, ArrowRight
} from 'lucide-react'

const DEMO = {
  name: 'محمد أحمد',
  age: 26,
  weight: 88,
  targetWeight: 75,
  height: 178,
  goal: 'loss',
  plan: {
    nutrition: {
      calories: 1850,
      protein: 140,
      carbs: 185,
      fat: 55,
      meals: [
        { name: 'الإفطار',       time: '08:00', calories: 450 },
        { name: 'وجبة خفيفة',   time: '11:00', calories: 280 },
        { name: 'الغداء',        time: '13:30', calories: 620 },
        { name: 'وجبة مسائية',  time: '17:00', calories: 250 },
        { name: 'العشاء',        time: '20:00', calories: 250 },
      ]
    },
    training: { daysPerWeek: 4 }
  }
}

const navItems = [
  { icon: LayoutDashboard, label: 'الرئيسية',       active: true },
  { icon: Utensils,        label: 'الخطة الغذائية', active: false },
  { icon: Dumbbell,        label: 'الخطة التدريبية', active: false },
  { icon: TrendingUp,      label: 'متابعة التقدم',  active: false },
  { icon: BookOpen,        label: 'يوميتي 💧',       active: false },
]

function DemoSidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/70 z-20 lg:hidden backdrop-blur-sm" onClick={onClose} />}
      <aside className={`
        fixed top-0 right-0 h-full z-30 w-60
        bg-[#0a0a0a] flex flex-col border-l border-white/5
        lg:static transition-transform duration-300
        ${open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between px-5 py-6 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gold-400 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-black" fill="black" />
            </div>
            <span className="text-white font-extrabold text-sm tracking-wider uppercase">
              Amine<span className="text-gold-400">Fit</span>
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/30 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-0.5">
          <p className="text-white/20 text-[10px] uppercase tracking-widest px-3 mb-4 font-bold">بوابتك الشخصية</p>
          {navItems.map(({ icon: Icon, label, active }) => (
            <div key={label}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl
                ${active ? 'bg-gold-400 text-black' : 'text-white/40'}`}>
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-black' : 'text-white/25'}`} />
              <span className={`font-bold text-sm flex-1 ${active ? 'text-black' : ''}`}>{label}</span>
              {!active && <Lock className="w-3 h-3 text-white/15" />}
            </div>
          ))}
        </nav>

        <div className="px-4 pb-5 pt-3 border-t border-white/5">
          <Link href="/register"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gold-400 text-black font-extrabold text-sm hover:bg-gold-300 transition shadow-lg shadow-gold-400/20">
            <Zap className="w-4 h-4" fill="black" />
            سجّل الآن
          </Link>
        </div>
      </aside>
    </>
  )
}

function WaterDemo() {
  const [water, setWater] = useState(5)
  const goal = 8
  const pct = Math.round((water / goal) * 100)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
            <Droplets className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="font-extrabold text-slate-800 text-sm">شرب الماء اليوم</p>
            <p className="text-[10px] text-slate-400 font-medium">اضغط كوب لتسجيله</p>
          </div>
        </div>
        <span className="text-xs font-bold text-amber-500 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">تجريبي</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {Array.from({ length: goal }).map((_, i) => (
          <button key={i} onClick={() => setWater(i < water ? i : i + 1)}
            className={`w-9 h-9 rounded-xl text-lg transition-all active:scale-90 select-none
              ${i < water ? 'bg-blue-500 shadow-sm' : 'bg-slate-100 grayscale opacity-40'}`}>
            💧
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-sm font-extrabold text-slate-800">{water} / {goal} أكواب</span>
          <span className="text-xs font-bold text-slate-400">{(water * 0.25).toFixed(2)} لتر · {pct}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }} />
        </div>
        {pct >= 100 && <p className="text-xs font-bold text-blue-600 text-center">🎉 وصلت هدف اليوم! ممتاز</p>}
      </div>
    </div>
  )
}

export default function DemoPage() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#f5f5f5] overflow-hidden">

      {/* Demo banner */}
      <div className="fixed top-0 inset-x-0 z-50 bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-4 py-2.5 flex items-center gap-3 shadow-lg">
        <FlaskConical className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-bold flex-1">
          وضع العرض التجريبي — هذه نسخة تجريبية من منصة Amine-Fit
        </span>
        <Link href="/register"
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-black text-white text-xs font-extrabold hover:bg-black/80 transition whitespace-nowrap">
          سجّل الآن ←
        </Link>
      </div>

      <DemoSidebar open={open} onClose={() => setOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden mt-[44px]">

        {/* Header */}
        <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center gap-4">
          <button onClick={() => setOpen(true)}
            className="lg:hidden w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="w-8 h-8 rounded-full bg-[#0a0a0a] text-gold-400 flex items-center justify-center font-extrabold text-sm">
            م
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-5 max-w-3xl mx-auto">

            {/* Welcome hero */}
            <div className="relative rounded-3xl overflow-hidden" style={{
              background: 'linear-gradient(135deg, #0a0a0a 0%, #111827 60%, #0a0a0a 100%)',
              minHeight: 180
            }}>
              <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                {[
                  { e: '🥗', top: '5%',  left: '1%',  size: 60, deg: -15 },
                  { e: '🍎', top: '50%', left: '2%',  size: 50, deg: 10 },
                  { e: '🥦', top: '70%', left: '10%', size: 44, deg: -8 },
                  { e: '💧', top: '28%', left: '12%', size: 38, deg: 0 },
                ].map((item, i) => (
                  <span key={`f${i}`} className="absolute opacity-[0.12]" style={{
                    top: item.top, left: item.left, fontSize: item.size, lineHeight: 1,
                    transform: `rotate(${item.deg}deg)`,
                  }}>{item.e}</span>
                ))}
                {[
                  { e: '🏋️', top: '5%',  right: '2%',  size: 64, deg: 15 },
                  { e: '💪',  top: '50%', right: '3%',  size: 52, deg: -10 },
                  { e: '🔥',  top: '70%', right: '12%', size: 48, deg: 8 },
                  { e: '⚡',  top: '28%', right: '14%', size: 40, deg: 0 },
                ].map((item, i) => (
                  <span key={`g${i}`} className="absolute opacity-[0.12]" style={{
                    top: item.top, right: item.right, fontSize: item.size, lineHeight: 1,
                    transform: `rotate(${item.deg}deg)`,
                  }}>{item.e}</span>
                ))}
                <div className="absolute opacity-[0.06]" style={{
                  width: '200%', height: '2px',
                  background: 'linear-gradient(90deg,transparent,#fbbf24,transparent)',
                  top: '55%', left: '-50%',
                  transform: 'rotate(-5deg)',
                }} />
              </div>

              <div className="relative z-10 px-6 py-7 flex items-center justify-between gap-4">
                <div>
                  <p className="text-white/30 text-xs font-extrabold uppercase tracking-widest mb-2">بوابتك الشخصية</p>
                  <h1 className="text-2xl font-extrabold text-white">
                    مرحباً، <span className="text-gold-400">{DEMO.name.split(' ')[0]}</span> ⚡
                  </h1>
                  <p className="text-white/30 text-sm mt-2 font-medium">برنامجك جاهز — ابدأ رحلتك اليوم 🚀</p>
                </div>
                <div className="w-14 h-14 bg-gold-400 rounded-2xl flex items-center justify-center text-black font-extrabold text-2xl flex-shrink-0 shadow-lg shadow-gold-400/20">
                  م
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'الوزن الحالي',   val: `${DEMO.weight} كغ`,        emoji: '⚖️' },
                { label: 'الوزن المستهدف', val: `${DEMO.targetWeight} كغ`,  emoji: '🎯' },
                { label: 'الطول',          val: `${DEMO.height} سم`,         emoji: '📏' },
                { label: 'العمر',          val: `${DEMO.age} سنة`,           emoji: '🎂' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                  <div className="text-2xl mb-1">{s.emoji}</div>
                  <p className="text-xl font-extrabold text-slate-900">{s.val}</p>
                  <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Plan cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Nutrition */}
              <div className="relative rounded-2xl overflow-hidden cursor-pointer group hover:-translate-y-0.5 hover:shadow-xl transition-all" style={{ minHeight: 160 }}>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #059669 100%)' }} />
                <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                  {['🥗','🍎','🥦','🥑'].map((e, i) => (
                    <span key={i} className="absolute opacity-[0.15]" style={{
                      fontSize: [52,42,36,38][i],
                      top: ['8%','55%','70%','30%'][i],
                      right: ['5%','8%','20%','2%'][i],
                      transform: `rotate(${[-15,10,-8,20][i]}deg)`,
                      lineHeight: 1,
                    }}>{e}</span>
                  ))}
                </div>
                <div className="relative z-10 p-5">
                  <div className="text-4xl mb-3">🥗</div>
                  <h3 className="font-extrabold text-lg mb-1 text-white">الخطة الغذائية</h3>
                  <p className="text-sm font-medium text-emerald-200">
                    {DEMO.plan.nutrition.calories} سعرة • {DEMO.plan.nutrition.meals.length} وجبات
                  </p>
                  <div className="flex items-center gap-1 mt-4 text-white text-sm font-bold">
                    عرض الخطة <ArrowLeft className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Training */}
              <div className="relative rounded-2xl overflow-hidden cursor-pointer group hover:-translate-y-0.5 hover:shadow-xl transition-all" style={{ minHeight: 160 }}>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1f2937 50%, #111827 100%)' }} />
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute opacity-[0.15]" style={{
                    width: '200%', height: '2px',
                    background: 'linear-gradient(90deg,transparent,#fbbf24,transparent)',
                    top: '60%', left: '-50%', transform: 'rotate(-8deg)',
                  }} />
                </div>
                <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                  {['🏋️','💪','🔥','⚡'].map((e, i) => (
                    <span key={i} className="absolute opacity-[0.12]" style={{
                      fontSize: [52,44,38,36][i],
                      top: ['8%','55%','72%','28%'][i],
                      right: ['5%','8%','22%','2%'][i],
                      transform: `rotate(${[15,-10,8,0][i]}deg)`,
                      lineHeight: 1,
                    }}>{e}</span>
                  ))}
                </div>
                <div className="relative z-10 p-5">
                  <div className="text-4xl mb-3">🏋️</div>
                  <h3 className="font-extrabold text-lg mb-1 text-white">الخطة التدريبية</h3>
                  <p className="text-sm font-medium text-gold-400/80">
                    {DEMO.plan.training.daysPerWeek} أيام/أسبوع
                  </p>
                  <div className="flex items-center gap-1 mt-4 text-gold-400 text-sm font-bold">
                    عرض الخطة <ArrowLeft className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Water tracker */}
            <WaterDemo />

            {/* Goal status */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <div className="text-3xl flex-shrink-0">📉</div>
              <div className="flex-1">
                <p className="font-extrabold text-slate-900 text-sm">هدفك: خسارة وزن</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">الحالة: ✅ نشط</p>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> نشط
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] rounded-3xl p-8 text-center border border-white/5">
              <div className="text-4xl mb-4">⚡</div>
              <h2 className="text-2xl font-extrabold text-white mb-3">
                هل أنت مستعد لبدء رحلتك؟
              </h2>
              <p className="text-white/50 text-sm mb-6 font-medium leading-relaxed">
                سجّل استبيانك وسيراجع المدرب أمين بياناتك ويعدّ لك خطة غذائية وتدريبية مخصصة
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/register"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-gold-400 hover:bg-gold-300 text-black font-extrabold rounded-2xl transition-all shadow-lg shadow-gold-400/20 text-base">
                  <Zap className="w-5 h-5" fill="black" />
                  سجّل الآن مجاناً
                </Link>
                <a href="https://wa.me/97430653759"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold rounded-2xl transition-all text-base">
                  تواصل مع المدرب
                </a>
              </div>
            </div>

            <p className="text-center text-slate-400 text-xs font-medium pb-2">
              هذه نسخة تجريبية — البيانات المعروضة غير حقيقية
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
