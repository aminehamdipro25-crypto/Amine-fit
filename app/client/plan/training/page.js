'use client'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2, Dumbbell, Star, Flame, Wind, Play,
  ChevronLeft, ChevronRight,
} from 'lucide-react'

// ─── Schedule Patterns ────────────────────────────────────────────────────────
// Training weekday indices per days/week (0=Sun 1=Mon … 6=Sat)
const SCHEDULE = {
  1: [1],
  2: [1, 4],
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 5, 6],
  6: [1, 2, 3, 4, 5, 6],
  7: [0, 1, 2, 3, 4, 5, 6],
}

// ─── Labels ───────────────────────────────────────────────────────────────────
const DAY_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
const DAYS_AR   = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']

// ─── Muscle Info ──────────────────────────────────────────────────────────────
const MUSCLE_MAP = {
  'صدر':    { en:'CHEST',     emoji:'💪' },
  'ظهر':    { en:'BACK',      emoji:'🏋️' },
  'كتف':    { en:'SHOULDERS', emoji:'⚡' },
  'ذراع':   { en:'ARMS',      emoji:'💪' },
  'أرجل':   { en:'LEGS',      emoji:'🦵' },
  'بطن':    { en:'CORE',      emoji:'🎯' },
  'كارديو': { en:'CARDIO',    emoji:'🏃' },
  'كامل':   { en:'FULL BODY', emoji:'🔥' },
}

function getMuscleInfo(focus) {
  for (const [k, v] of Object.entries(MUSCLE_MAP)) {
    if (focus?.includes(k)) return v
  }
  if (focus) {
    const lf = focus.toLowerCase()
    if (lf.includes('push') || lf.includes('chest'))             return { en:'PUSH',      emoji:'💪' }
    if (lf.includes('pull') || lf.includes('back'))              return { en:'PULL',      emoji:'🏋️' }
    if (lf.includes('leg'))                                       return { en:'LEGS',      emoji:'🦵' }
    if (lf.includes('shoulder'))                                  return { en:'SHOULDERS', emoji:'⚡' }
    if (lf.includes('arm') || lf.includes('bicep') || lf.includes('tricep')) return { en:'ARMS', emoji:'💪' }
    if (lf.includes('core') || lf.includes('abs'))               return { en:'CORE',      emoji:'🎯' }
    if (lf.includes('cardio') || lf.includes('hiit'))            return { en:'CARDIO',    emoji:'🏃' }
    if (lf.includes('full') || lf.includes('body'))              return { en:'FULL BODY', emoji:'🔥' }
    // If focus is already an English word, capitalise it
    if (/^[a-zA-Z\s]+$/.test(focus)) return { en: focus.toUpperCase(), emoji:'🏋️' }
  }
  return { en:'WORKOUT', emoji:'🏋️' }
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────
function startOfDay(date) {
  const d = new Date(date); d.setHours(0,0,0,0); return d
}
function isSameDay(a, b) {
  return a.getDate() === b.getDate() &&
         a.getMonth() === b.getMonth() &&
         a.getFullYear() === b.getFullYear()
}
function getWeekStart(date) {
  const d = startOfDay(date)
  d.setDate(d.getDate() - d.getDay())
  return d
}
function getWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(d.getDate() + i); return d
  })
}
function getSchedule(n) {
  const k = Math.min(Math.max(1, Number(n) || 4), 7)
  return SCHEDULE[k] || SCHEDULE[4]
}
function getPlanDayIndex(date, schedule) {
  const idx = schedule.indexOf(date.getDay())
  return idx === -1 ? null : idx
}

// ─── YouTube Thumbnail ────────────────────────────────────────────────────────
function getYoutubeThumbnail(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null
}

// ─── Section Banner ───────────────────────────────────────────────────────────
function SectionBanner({ type }) {
  const isWarmup = type === 'warmup'
  return (
    <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-[#0a0a0a]">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#fbbf24]/10 flex items-center justify-center flex-shrink-0">
          {isWarmup ? <Flame className="w-4 h-4 text-[#fbbf24]" /> : <Wind className="w-4 h-4 text-[#fbbf24]" />}
        </div>
        <div>
          <p className="text-white font-extrabold text-sm tracking-wide">{isWarmup ? 'WARM UP' : 'COOL DOWN'}</p>
          <p className="text-white/35 text-[11px] font-medium">
            {isWarmup ? 'Mobilize joints · warm up muscles' : 'Stretch · accelerate recovery'}
          </p>
        </div>
      </div>
      <span className="text-[#fbbf24] font-extrabold text-xs bg-[#fbbf24]/10 px-3 py-1 rounded-full flex-shrink-0">
        {isWarmup ? '10 min' : '5 min'}
      </span>
    </div>
  )
}

// ─── Exercise Row ─────────────────────────────────────────────────────────────
function ExerciseRow({ ex, done, onToggle, isLast, number }) {
  const [flash, setFlash] = useState(false)
  const thumb = getYoutubeThumbnail(ex.videoUrl)

  function handleToggle() {
    if (!done) { setFlash(true); setTimeout(() => setFlash(false), 600) }
    onToggle()
  }

  return (
    <div className={`flex items-center gap-3 py-3.5 transition-all duration-300
      ${!isLast ? 'border-b border-slate-100' : ''}
      ${done ? 'opacity-50' : ''}
      ${flash ? 'bg-[#fbbf24]/8 -mx-1 px-1 rounded-xl' : ''}
    `}>
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-extrabold transition-all duration-300
        ${done ? 'bg-emerald-100 text-emerald-600 scale-110' : 'bg-slate-100 text-slate-500'}
      `}>
        {done ? '✓' : number}
      </div>

      <div className="relative flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-[#111]">
        {thumb
          ? <img src={thumb} alt={ex.name} className="w-full h-full object-cover" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-[#fbbf24]/40" />
            </div>
        }
        {ex.videoUrl && (
          <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer"
            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 active:opacity-100 transition-opacity">
            <Play className="w-3.5 h-3.5 text-white" fill="white" />
          </a>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-extrabold text-sm leading-tight transition-all ${done ? 'line-through text-slate-300' : 'text-slate-900'}`}>
          {ex.name}
        </p>
        <p className="text-[11px] font-semibold mt-0.5 flex items-center gap-1.5" dir="ltr">
          {ex.sets && <><span className="text-slate-400">Sets:</span><span className="text-slate-700 font-extrabold">{ex.sets}</span></>}
          {ex.sets && ex.reps && <span className="text-slate-200">·</span>}
          {ex.reps && <><span className="text-slate-400">Reps:</span><span className="text-slate-700 font-extrabold">{ex.reps}</span></>}
          {ex.rest && <><span className="text-slate-200">·</span><span className="text-slate-400 text-[10px]">{ex.rest}</span></>}
        </p>
        {ex.note && <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">💡 {ex.note}</p>}
      </div>

      <button onClick={handleToggle}
        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 active:scale-90
          ${done ? 'bg-[#fbbf24] border-[#fbbf24] scale-105' : 'border-slate-200 hover:border-[#fbbf24] hover:scale-110'}
        `}>
        {done && <CheckCircle2 className="w-[15px] h-[15px] text-black" />}
      </button>
    </div>
  )
}

// ─── Week Navigator ───────────────────────────────────────────────────────────
function WeekNavigator({ today, selectedDate, onSelect, schedule }) {
  const [weekOffset, setWeekOffset] = useState(0)

  const weekStart = useMemo(() => {
    const ws = getWeekStart(today)
    ws.setDate(ws.getDate() + weekOffset * 7)
    return ws
  }, [today, weekOffset])

  const days = useMemo(() => getWeekDays(weekStart), [weekStart])

  const monthLabel = useMemo(() => {
    const mid = days[3]
    return `${MONTHS_AR[mid.getMonth()]} ${mid.getFullYear()}`
  }, [days])

  return (
    <div className="bg-[#0a0a0a] rounded-2xl px-4 py-4 select-none">
      {/* Month + arrows */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setWeekOffset(o => o - 1)}
          className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90">
          <ChevronRight className="w-4 h-4" />
        </button>
        <p className="text-white/50 text-xs font-bold tracking-wider">{monthLabel}</p>
        <button onClick={() => setWeekOffset(o => o + 1)}
          className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Day columns */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const isToday    = isSameDay(day, today)
          const isSelected = isSameDay(day, selectedDate)
          const isTraining = getPlanDayIndex(day, schedule) !== null

          return (
            <button key={i} onClick={() => onSelect(startOfDay(day))}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all duration-200 active:scale-95
                ${isSelected
                  ? 'bg-[#fbbf24]'
                  : isToday
                    ? 'bg-white/8 ring-1 ring-[#fbbf24]/40'
                    : 'hover:bg-white/5'}
              `}>
              <span className={`text-[9px] font-bold uppercase tracking-wide
                ${isSelected ? 'text-black' : 'text-white/30'}
              `}>
                {DAY_SHORT[day.getDay()]}
              </span>
              <span className={`text-sm font-extrabold leading-none
                ${isSelected ? 'text-black' : isToday ? 'text-[#fbbf24]' : 'text-white/75'}
              `}>
                {day.getDate()}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full transition-colors
                ${isSelected ? 'bg-black/25' : isTraining ? 'bg-[#fbbf24]/70' : 'bg-white/8'}
              `} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Workout Card ─────────────────────────────────────────────────────────────
function WorkoutCard({ day, date, isToday }) {
  const [done, setDone]   = useState({})
  const exList   = day.exercises || []
  const total    = exList.length
  const doneCount = Object.values(done).filter(Boolean).length
  const allDone  = total > 0 && doneCount === total
  const info     = getMuscleInfo(day.focus)
  const dateLabel = `${DAYS_AR[date.getDay()]}, ${date.getDate()} ${MONTHS_AR[date.getMonth()]}`

  return (
    <div className="rounded-3xl overflow-hidden" style={{ boxShadow:'0 20px 60px -10px rgba(0,0,0,0.35)' }}>

      {/* Hero */}
      <div className="relative px-6 py-8" style={{ background:'linear-gradient(135deg,#0a0a0a 0%,#18181b 100%)' }}>
        <span className="absolute left-4 bottom-2 text-[110px] leading-none opacity-[0.04] select-none pointer-events-none">
          {info.emoji}
        </span>

        <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold bg-[#fbbf24] text-black px-3 py-1 rounded-full uppercase tracking-widest mb-4">
          {isToday ? "✦ TODAY'S WORKOUT" : '✦ WORKOUT'}
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-5xl font-black text-white leading-none tracking-tighter">{info.en}</h2>
            {day.name && <p className="text-[#fbbf24] font-extrabold text-sm mt-2">{day.name}</p>}
            <p className="text-white/30 text-xs mt-1 font-medium">{dateLabel}</p>
          </div>
          <div className="text-right flex-shrink-0 pb-1">
            <p className="text-4xl font-black text-[#fbbf24] leading-none">{total}</p>
            <p className="text-white/30 text-[10px] font-bold mt-1 uppercase tracking-wide">Exercises</p>
          </div>
        </div>

        {doneCount > 0 && (
          <div className="mt-5">
            <div className="flex justify-between mb-1.5">
              <span className="text-[11px] text-white/30 font-bold uppercase tracking-wide">Progress</span>
              <span className="text-[11px] text-[#fbbf24] font-extrabold">{doneCount}/{total}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] rounded-full transition-all duration-500"
                style={{ width:`${(doneCount / total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Exercises */}
      <div className="bg-white">
        <div className="px-5 pt-4 pb-3 border-b border-slate-50 flex items-center justify-between">
          <p className="text-[11px] font-extrabold text-slate-300 uppercase tracking-[0.15em]">Program Preview</p>
          {day.description && (
            <p className="text-[10px] text-slate-300 max-w-[160px] truncate">{day.description}</p>
          )}
        </div>

        <div className="px-4 pt-3 pb-5 space-y-2">
          <SectionBanner type="warmup" />

          {total > 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl px-3">
              {exList.map((ex, i) => (
                <ExerciseRow
                  key={i} ex={ex} number={i + 1}
                  done={!!done[i]}
                  onToggle={() => setDone(d => ({ ...d, [i]: !d[i] }))}
                  isLast={i === exList.length - 1}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-300 text-sm">No exercises for this day</div>
          )}

          <SectionBanner type="cooldown" />

          {allDone && (
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-center py-4 rounded-2xl font-extrabold text-sm shadow-lg shadow-emerald-500/25">
              🏆 Workout Complete! Great job!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Rest Card ────────────────────────────────────────────────────────────────
function RestCard({ date, isToday }) {
  const dateLabel = `${DAYS_AR[date.getDay()]}, ${date.getDate()} ${MONTHS_AR[date.getMonth()]}`

  return (
    <div className="rounded-3xl overflow-hidden" style={{ boxShadow:'0 20px 60px -10px rgba(0,0,0,0.3)' }}>
      <div className="relative px-6 py-14 text-center" style={{ background:'linear-gradient(135deg,#0a0a0a 0%,#18181b 100%)' }}>
        <span className="absolute inset-0 flex items-center justify-center text-[140px] leading-none opacity-[0.04] select-none pointer-events-none">🌙</span>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold bg-white/8 text-white/40 px-3 py-1 rounded-full uppercase tracking-widest mb-5">
            {isToday ? '✦ TODAY' : '✦ DAY OFF'}
          </div>
          <h2 className="text-5xl font-black text-white leading-none tracking-tighter">REST</h2>
          <p className="text-white/50 font-bold text-base mt-2">يوم الراحة</p>
          <p className="text-white/25 text-xs mt-1 font-medium">{dateLabel}</p>
          <p className="text-white/20 text-xs mt-4 max-w-xs mx-auto leading-relaxed font-medium">
            Rest is part of the program — let your muscles recover and grow stronger
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar({ plan }) {
  const totalEx = plan.days.reduce((acc, d) => acc + (d.exercises?.length || 0), 0)
  const items = [
    { icon:'💪', label:'Exercises', val: totalEx || null },
    { icon:'🎯', label:'Level',     val: plan.level || null },
    { icon:'⏱️', label:'Duration',  val: plan.duration ? `${plan.duration}m` : null },
    { icon:'📅', label:'Days/wk',   val: plan.daysPerWeek || plan.days.length || null },
  ].filter(i => i.val)

  if (!items.length) return null
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map(s => (
        <div key={s.label} className="bg-[#0a0a0a] rounded-2xl p-3 text-center border border-white/5">
          <div className="text-xl mb-1">{s.icon}</div>
          <p className="text-sm font-extrabold text-[#fbbf24] leading-none">{s.val}</p>
          <p className="text-[9px] text-white/25 font-semibold mt-1 uppercase tracking-wide">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

// ─── No Plan ──────────────────────────────────────────────────────────────────
function NoPlan() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="relative rounded-3xl overflow-hidden" style={{
        background:'linear-gradient(135deg,#0a0a0a 0%,#111827 60%,#1f2937 100%)',
        minHeight:280,
      }}>
        {[
          { e:'🏋️', t:'8%',  l:'3%',  s:80, d:-15 },
          { e:'💪',  t:'12%', r:'4%',  s:66, d:20  },
          { e:'⚡',  t:'55%', l:'2%',  s:60, d:0   },
          { e:'🔥',  t:'58%', r:'4%',  s:64, d:12  },
          { e:'🏃',  t:'25%', l:'40%', s:96, d:8   },
          { e:'🎯',  t:'70%', l:'26%', s:50, d:0   },
          { e:'💥',  t:'16%', l:'22%', s:48, d:-8  },
          { e:'🥊',  t:'64%', r:'20%', s:56, d:15  },
        ].map((x, i) => (
          <span key={i} className="absolute select-none pointer-events-none opacity-[0.07]"
            style={{ top:x.t, left:x.l, right:x.r, fontSize:x.s, lineHeight:1, transform:`rotate(${x.d}deg)` }}>
            {x.e}
          </span>
        ))}
        <div className="relative z-10 flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-[#fbbf24]/10 border border-[#fbbf24]/20 flex items-center justify-center mb-5">
            <Dumbbell className="w-10 h-10 text-[#fbbf24]" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">Training Plan Coming Soon</h1>
          <p className="text-white/40 text-sm max-w-xs leading-relaxed font-medium">
            Coach Amine is designing a personalized training program for you based on your goals and current level.
          </p>
        </div>
      </div>
      <p className="text-center text-slate-400 text-xs pb-2">
        Questions?{' '}
        <a href="tel:+97430653759" className="text-[#c9973b] font-bold">Contact Coach Amine</a>
      </p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TrainingPlan() {
  const router = useRouter()
  const [client,  setClient]  = useState(null)
  const [loading, setLoading] = useState(true)

  const today = useMemo(() => startOfDay(new Date()), [])
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()))

  useEffect(() => {
    fetch('/api/client/me')
      .then(r => {
        if (r.status === 401) { router.push('/client/login'); return null }
        return r.json()
      })
      .then(d => { if (d) setClient(d) })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-2 border-[#fbbf24] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!client) return null

  const plan = client.plan?.training
  if (!plan?.days?.length) return <NoPlan />

  const daysPerWeek = Number(plan.daysPerWeek) || plan.days.length
  const schedule    = getSchedule(daysPerWeek)
  const isToday     = isSameDay(selectedDate, today)
  const planDayIdx  = getPlanDayIndex(selectedDate, schedule)
  const currentDay  = (planDayIdx !== null && planDayIdx < plan.days.length)
    ? plan.days[planDayIdx]
    : null

  const headerDate = `${DAYS_AR[selectedDate.getDay()]}, ${selectedDate.getDate()} ${MONTHS_AR[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-8">

      {/* ── Header ── */}
      <div>
        <p className="text-[11px] font-extrabold text-slate-300 uppercase tracking-[0.15em]">MY PLAN</p>
        <h1 className="text-xl font-extrabold text-slate-900 mt-0.5">{headerDate}</h1>
      </div>

      {/* ── Week Navigator ── */}
      <WeekNavigator
        today={today}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        schedule={schedule}
      />

      {/* ── Stats Bar ── */}
      <StatsBar plan={plan} />

      {/* ── Workout or Rest (key resets done-state on day change) ── */}
      {currentDay
        ? <WorkoutCard key={selectedDate.toISOString()} day={currentDay} date={selectedDate} isToday={isToday} />
        : <RestCard                                                       date={selectedDate} isToday={isToday} />
      }

      {/* ── Coach Tips ── */}
      {plan.tips?.length > 0 && (
        <div className="rounded-2xl overflow-hidden">
          <div className="px-5 py-4 flex items-center gap-2 bg-[#0a0a0a]">
            <Star className="w-4 h-4 text-[#fbbf24]" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-widest">Coach Tips</h2>
          </div>
          <div className="bg-[#111] px-5 py-4 space-y-3">
            {plan.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-[#fbbf24] text-black rounded-full flex items-center justify-center text-[11px] font-extrabold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-white/60 font-medium leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-slate-400 text-xs pb-2">
        Questions?{' '}
        <a href="tel:+97430653759" className="text-[#c9973b] font-bold hover:underline">Contact Coach Amine</a>
      </p>
    </div>
  )
}
