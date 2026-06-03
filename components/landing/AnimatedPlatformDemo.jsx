'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'

const SCENE_MS = 5000
const TICK_MS  = 60

/* ────────────────── Scene Components ────────────────── */

function DashboardScene({ p }) {
  const stats = [
    { v: '18 / 30', l: 'يوم التقدم',   c: 'text-gold-400'   },
    { v: '82.5 كغ', l: 'الوزن الحالي', c: 'text-white'       },
    { v: '1,840',   l: 'kcal اليوم',   c: 'text-emerald-400' },
    { v: '−3.7 كغ', l: 'خسرتها',       c: 'text-emerald-400' },
  ]
  const ringPct = Math.min(p, 1) * 60
  return (
    <div className="p-4 h-full flex flex-col gap-2.5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-gold-400 rounded-lg flex items-center justify-center text-sm flex-shrink-0">⚡</div>
        <span className="text-white font-extrabold text-xs">لوحة التحكم — Ahmad M.</span>
        <span className="mr-auto text-white/25 text-[10px] font-mono" dir="ltr">Mon Jun 03 2026</span>
      </div>
      {/* Progress ring */}
      <div className="flex items-center gap-3 bg-white/[0.04] border border-white/8 rounded-xl p-3"
        style={{ opacity: p > 0.05 ? 1 : 0, transition: 'opacity 0.5s' }}>
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-14 h-14" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
            <circle cx="18" cy="18" r="14" fill="none" stroke="#fbbf24" strokeWidth="3"
              strokeDasharray={`${(ringPct * 0.879).toFixed(1)} 87.96`}
              strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.3s ease' }} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold text-gold-400">
            {Math.round(ringPct)}%
          </span>
        </div>
        <div>
          <p className="text-white font-extrabold text-sm leading-tight">تقدم البرنامج</p>
          <p className="text-white/40 text-xs mt-0.5">18 يوم من 30 مكتمل</p>
          <div className="flex gap-0.5 mt-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className={`w-4 h-1.5 rounded-full transition-all ${i < 5 ? 'bg-gold-400' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>
      </div>
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 flex-1">
        {stats.map((s, i) => (
          <div key={i}
            className="bg-white/[0.03] border border-white/8 rounded-xl p-3 flex flex-col justify-between"
            style={{
              opacity:   p > 0.15 + i * 0.12 ? 1 : 0,
              transform: `translateY(${p > 0.15 + i * 0.12 ? 0 : 6}px)`,
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}>
            <p className={`text-base font-extrabold leading-none ${s.c}`}>{s.v}</p>
            <p className="text-white/30 text-[11px] font-medium mt-1">{s.l}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function NutritionScene({ p }) {
  const meals = [
    { icon: '🌅', name: 'الفطور',  time: '07:00', kcal: 420, note: 'شوفان + بيض + موز' },
    { icon: '☀️',  name: 'الغداء', time: '13:00', kcal: 650, note: 'أرز + دجاج + خضار' },
    { icon: '🌙', name: 'العشاء',  time: '19:30', kcal: 480, note: 'تونة + بطاطا + سلطة' },
  ]
  return (
    <div className="p-4 h-full flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center text-sm flex-shrink-0">🥗</div>
        <span className="text-white font-extrabold text-xs">الخطة الغذائية — الاثنين</span>
        <span className="mr-auto text-emerald-400 font-extrabold text-[10px]">1,550 kcal</span>
      </div>
      {/* Macros bar */}
      <div className="bg-white/[0.04] border border-white/8 rounded-xl p-3"
        style={{ opacity: p > 0.08 ? 1 : 0, transition: 'opacity 0.5s' }}>
        <div className="flex justify-between text-[10px] font-extrabold mb-1.5">
          <span className="text-blue-400">بروتين 35%</span>
          <span className="text-yellow-400">كارب 47%</span>
          <span className="text-rose-400">دهون 18%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden flex">
          <div className="bg-blue-400 transition-all duration-1000 ease-out"   style={{ width: p > 0.12 ? '35%' : '0%' }} />
          <div className="bg-yellow-400 transition-all duration-1000 ease-out" style={{ width: p > 0.17 ? '47%' : '0%', transitionDelay:'0.1s' }} />
          <div className="bg-rose-400 flex-1 transition-all duration-1000 ease-out" style={{ opacity: p > 0.22 ? 1 : 0, transitionDelay:'0.2s' }} />
        </div>
      </div>
      {/* Meal cards */}
      <div className="flex flex-col gap-2 flex-1">
        {meals.map((m, i) => (
          <div key={i}
            className="flex items-center gap-3 bg-white/[0.03] border border-white/8 rounded-xl px-3 py-3"
            style={{
              opacity:   p > 0.22 + i * 0.2 ? 1 : 0,
              transform: `translateX(${p > 0.22 + i * 0.2 ? 0 : -10}px)`,
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}>
            <div className="w-8 h-8 bg-emerald-500/15 border border-emerald-500/20 rounded-lg flex items-center justify-center text-base flex-shrink-0">
              {m.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-1">
                <p className="text-white font-bold text-xs">{m.name}</p>
                <p className="text-emerald-400 font-extrabold text-xs flex-shrink-0">{m.kcal} kcal</p>
              </div>
              <p className="text-white/30 text-[10px] truncate mt-0.5">{m.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TrainingScene({ p }) {
  const exercises = [
    { name: 'Bench Press',     sets: '4', reps: '8',   rest: '90s', muscle: 'Chest' },
    { name: 'Incline DB Press',sets: '3', reps: '10',  rest: '75s', muscle: 'Chest' },
    { name: 'Pull-Up',         sets: '4', reps: 'Max', rest: '90s', muscle: 'Back'  },
    { name: 'Barbell Row',     sets: '3', reps: '10',  rest: '75s', muscle: 'Back'  },
    { name: 'Overhead Press',  sets: '3', reps: '10',  rest: '60s', muscle: 'Shoulders' },
  ]
  return (
    <div className="p-4 h-full flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center text-sm flex-shrink-0">🏋️</div>
        <div>
          <p className="text-white font-extrabold text-xs leading-none" dir="ltr">Push / Pull — Day A</p>
          <p className="text-white/30 text-[10px] mt-0.5">Week 3 — الاثنين</p>
        </div>
        <div className="mr-auto bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5">
          <span className="text-blue-400 text-[10px] font-extrabold" dir="ltr">WARM UP ✓</span>
        </div>
      </div>
      {/* Column headers */}
      <div className="grid grid-cols-4 px-3 text-[9px] text-white/20 font-extrabold uppercase tracking-wider">
        <span className="col-span-2">Exercise</span>
        <span className="text-center">Sets × Reps</span>
        <span className="text-center">Rest</span>
      </div>
      {/* Exercise rows */}
      <div className="flex flex-col gap-1.5 flex-1 overflow-hidden">
        {exercises.map((ex, i) => (
          <div key={i}
            className="grid grid-cols-4 items-center bg-white/[0.03] border border-white/8 rounded-xl px-3 py-2"
            style={{
              opacity:   p > i * 0.13 ? 1 : 0,
              transform: `translateY(${p > i * 0.13 ? 0 : 5}px)`,
              transition: 'opacity 0.35s ease, transform 0.35s ease',
            }}>
            <div className="col-span-2">
              <p className="text-white font-bold text-xs" dir="ltr">{ex.name}</p>
              <p className="text-white/25 text-[9px]" dir="ltr">{ex.muscle}</p>
            </div>
            <p className="text-gold-400 font-extrabold text-xs text-center" dir="ltr">{ex.sets}×{ex.reps}</p>
            <p className="text-white/40 text-xs text-center font-mono" dir="ltr">{ex.rest}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProgressScene({ p }) {
  const data  = [86.2, 84.8, 83.5, 82.5]
  const weeks = ['W1', 'W2', 'W3', 'W4']
  const max   = 87
  const min   = 81
  const toH   = (w) => ((w - min) / (max - min)) * 100

  return (
    <div className="p-4 h-full flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-orange-500/20 border border-orange-500/30 rounded-lg flex items-center justify-center text-sm flex-shrink-0">📊</div>
        <span className="text-white font-extrabold text-xs">تتبع التقدم — الشهر الأول</span>
        <div className="mr-auto bg-emerald-500/15 border border-emerald-500/25 rounded-full px-2 py-0.5"
          style={{ opacity: p > 0.5 ? 1 : 0, transition: 'opacity 0.5s' }}>
          <span className="text-emerald-400 font-extrabold text-[10px]">−3.7 كغ ↓</span>
        </div>
      </div>
      {/* Bar chart */}
      <div className="flex-1 bg-white/[0.03] border border-white/8 rounded-xl p-3 flex items-end gap-3 relative overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-3 flex flex-col justify-between pointer-events-none">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="border-t border-white/[0.05] w-full" />
          ))}
        </div>
        {data.map((w, i) => {
          const h    = toH(w)
          const show = p > i * 0.18
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 relative z-10">
              <p className="text-white font-extrabold text-[10px]"
                style={{ opacity: show && p > i * 0.18 + 0.1 ? 1 : 0, transition: 'opacity 0.3s' }}
                dir="ltr">{w}</p>
              <div className="w-full rounded-t-lg overflow-hidden"
                style={{
                  height: '120px',
                  display: 'flex',
                  alignItems: 'flex-end',
                }}>
                <div className="w-full rounded-t-lg"
                  style={{
                    height:     show ? `${h}%` : '0%',
                    background: `linear-gradient(to top, #fbbf24, #fbbf24aa)`,
                    transition: 'height 0.7s ease',
                    minHeight:  show ? '12px' : '0',
                  }} />
              </div>
              <p className="text-white/30 text-[9px] font-mono" dir="ltr">{weeks[i]}</p>
            </div>
          )
        })}
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2"
        style={{ opacity: p > 0.65 ? 1 : 0, transition: 'opacity 0.5s' }}>
        {[
          { v: '−3.7 كغ', l: 'الوزن' },
          { v: '−4.2 سم', l: 'الخصر' },
          { v: '18.5%',   l: 'الدهون' },
        ].map((a, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/8 rounded-xl p-2 text-center">
            <p className="text-emerald-400 font-extrabold text-sm">{a.v}</p>
            <p className="text-white/30 text-[10px]">{a.l}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function CheckinScene({ p }) {
  const items = [
    { icon: '💧', label: 'شرب الماء',       value: '2.8 L',   ok: true },
    { icon: '😴', label: 'ساعات النوم',     value: '7h 30m',  ok: true },
    { icon: '🏋️', label: 'التدريب',         value: 'مكتمل',  ok: true },
    { icon: '🥗', label: 'الالتزام الغذائي', value: '90%',    ok: true },
  ]
  return (
    <div className="p-4 h-full flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center text-sm flex-shrink-0">📝</div>
        <span className="text-white font-extrabold text-xs">التقرير الأسبوعي — الأسبوع 3</span>
        <span className="mr-auto text-purple-400 font-extrabold text-[10px]">4 / 4 ✓</span>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {items.map((item, i) => (
          <div key={i}
            className="flex items-center gap-3 bg-white/[0.03] border border-white/8 rounded-xl px-3 py-3"
            style={{
              opacity:   p > 0.08 + i * 0.15 ? 1 : 0,
              transform: `translateX(${p > 0.08 + i * 0.15 ? 0 : 12}px)`,
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}>
            <div className="w-8 h-8 bg-emerald-500/15 border border-emerald-500/25 rounded-xl flex items-center justify-center text-sm flex-shrink-0">
              {item.icon}
            </div>
            <span className="text-white/70 font-medium text-xs flex-1">{item.label}</span>
            <span className="text-emerald-400 font-extrabold text-xs">{item.value}</span>
            <span className="text-emerald-400 text-xs">✓</span>
          </div>
        ))}
      </div>
      <div
        className="bg-gold-400 text-black font-extrabold text-xs rounded-2xl py-3 text-center"
        style={{ opacity: p > 0.78 ? 1 : 0, transition: 'opacity 0.5s' }}>
        إرسال التقرير الأسبوعي ✓
      </div>
    </div>
  )
}

function CoachScene({ p }) {
  return (
    <div className="p-4 h-full flex flex-col gap-2.5">
      {/* Coach header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)' }}>أ</div>
        <div>
          <p className="text-white font-extrabold text-xs leading-none">أمين حمدي — مدرّبك</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-[10px]">متاح الآن</span>
          </div>
        </div>
      </div>
      {/* Messages */}
      <div className="flex flex-col gap-3 flex-1 overflow-hidden">
        <div className="bg-white/[0.04] border border-white/8 rounded-2xl rounded-tl-sm p-4"
          style={{ opacity: p > 0.08 ? 1 : 0, transform: `translateY(${p > 0.08 ? 0 : 8}px)`, transition: 'all 0.5s ease' }}>
          <p className="text-white/80 text-xs leading-relaxed">
            💪 أحسنت هذا الأسبوع — الوزن ينزل بوتيرة ممتازة. عدّلت لك جلسة الأربعاء لزيادة حجم التدريب وفقاً لتقريرك.
          </p>
          <p className="text-white/20 text-[9px] mt-2">قبل 2 ساعة ✓✓</p>
        </div>
        <div className="bg-gold-400/8 border border-gold-400/20 rounded-2xl p-4"
          style={{ opacity: p > 0.35 ? 1 : 0, transform: `translateY(${p > 0.35 ? 0 : 8}px)`, transition: 'all 0.5s ease' }}>
          <p className="text-gold-400 font-extrabold text-[10px] mb-1.5">📋 تحديث البرنامج</p>
          <p className="text-white/55 text-xs leading-relaxed">الأسبوع القادم: Wednesday أُضيفت مجموعة إضافية للظهر — Pull-Ups 4×Max</p>
        </div>
        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/8 rounded-2xl p-3"
          style={{ opacity: p > 0.62 ? 1 : 0, transition: 'opacity 0.5s' }}>
          <span className="text-2xl flex-shrink-0">📅</span>
          <div className="flex-1">
            <p className="text-white/70 font-bold text-xs">التقرير الأسبوعي القادم</p>
            <p className="text-white/30 text-[10px] mt-0.5">السبت القادم — 3 أيام</p>
          </div>
          <div className="bg-gold-400/10 border border-gold-400/20 rounded-full px-2 py-1 flex-shrink-0">
            <span className="text-gold-400 text-[10px] font-extrabold">تذكير ✓</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ────────────────── Scene Registry ────────────────── */

const SCENES = [
  { key: 'dashboard', label: 'لوحة التحكم',     icon: '🏠', render: (p) => <DashboardScene p={p} /> },
  { key: 'nutrition', label: 'الخطة الغذائية',  icon: '🥗', render: (p) => <NutritionScene p={p} /> },
  { key: 'training',  label: 'برنامج التدريب',  icon: '🏋️', render: (p) => <TrainingScene p={p}  /> },
  { key: 'progress',  label: 'تتبع التقدم',     icon: '📊', render: (p) => <ProgressScene p={p}  /> },
  { key: 'checkin',   label: 'التقرير الأسبوعي',icon: '📝', render: (p) => <CheckinScene p={p}  /> },
  { key: 'coach',     label: 'متابعة المدرب',   icon: '💬', render: (p) => <CoachScene p={p}    /> },
]

/* ────────────────── Main Component ────────────────── */

export default function AnimatedPlatformDemo({ autoPlay = true }) {
  const [scene,   setScene]   = useState(0)
  const [pct,     setPct]     = useState(0)
  const [playing, setPlaying] = useState(autoPlay)

  useEffect(() => {
    if (!playing) return
    const step = TICK_MS / SCENE_MS
    const id = setInterval(() => {
      setPct(prev => {
        const next = prev + step
        if (next >= 1) {
          setScene(s => (s + 1) % SCENES.length)
          return 0
        }
        return next
      })
    }, TICK_MS)
    return () => clearInterval(id)
  }, [playing])

  function jumpTo(i) {
    setScene(i)
    setPct(0)
    setPlaying(true)
  }

  const totalPct = (scene + pct) / SCENES.length

  return (
    <div className="relative w-full bg-[#0d0d0d] border border-white/10 rounded-3xl overflow-hidden"
      style={{ aspectRatio: '16/9' }}>

      {/* Scene content */}
      <div className="absolute inset-0 overflow-hidden">
        {SCENES[scene].render(pct)}
      </div>

      {/* Scanline overlay for "screen" feel */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        }} />

      {/* Bottom controls gradient + bar */}
      <div className="absolute bottom-0 inset-x-0">
        <div className="bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-10 pb-3 px-4">
          {/* Progress bar */}
          <div className="h-[2px] bg-white/10 rounded-full mb-3 overflow-hidden">
            <div className="h-full bg-gold-400 rounded-full"
              style={{ width: `${totalPct * 100}%`, transition: `width ${TICK_MS}ms linear` }} />
          </div>
          {/* Controls */}
          <div className="flex items-center gap-2.5">
            {/* Play/Pause */}
            <button onClick={() => setPlaying(v => !v)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center flex-shrink-0">
              {playing
                ? <Pause className="w-3 h-3 text-white fill-white" />
                : <Play  className="w-3 h-3 text-white fill-white ml-px" />}
            </button>
            {/* Restart */}
            <button onClick={() => { setScene(0); setPct(0); setPlaying(true) }}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-3 h-3 text-white" />
            </button>
            {/* Label */}
            <span className="text-white/60 text-xs font-bold flex-1 truncate">
              {SCENES[scene].icon} {SCENES[scene].label}
            </span>
            {/* Scene dots */}
            <div className="flex items-center gap-1.5">
              {SCENES.map((_, i) => (
                <button key={i} onClick={() => jumpTo(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === scene
                      ? 'w-4 h-1.5 bg-gold-400'
                      : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/50'
                  }`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
