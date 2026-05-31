'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2, Dumbbell, Star, Flame, Wind,
  Play, ChevronDown, Moon,
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getYoutubeThumbnail(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null
}

function repsDisplay(sets, reps) {
  if (!sets && !reps) return null
  return { sets: sets ? String(sets) : null, reps: reps ? String(reps) : null }
}

const MUSCLE_MAP = {
  'صدر':    { en: 'CHEST',     emoji: '💪' },
  'ظهر':    { en: 'BACK',      emoji: '🏋️' },
  'كتف':    { en: 'SHOULDERS', emoji: '⚡' },
  'ذراع':   { en: 'ARMS',      emoji: '💪' },
  'أرجل':   { en: 'LEGS',      emoji: '🦵' },
  'بطن':    { en: 'CORE',      emoji: '🎯' },
  'كارديو': { en: 'CARDIO',    emoji: '🏃' },
  'كامل':   { en: 'FULL BODY', emoji: '🔥' },
}
function getMuscleInfo(focus) {
  for (const [k, v] of Object.entries(MUSCLE_MAP)) {
    if (focus?.includes(k)) return v
  }
  return { en: 'WORKOUT', emoji: '🏋️' }
}

// ─── Warm Up / Cool Down Banner ───────────────────────────────────────────────

function SectionBanner({ type }) {
  const isWarmup = type === 'warmup'
  return (
    <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-[#0a0a0a]">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#fbbf24]/10 flex items-center justify-center flex-shrink-0">
          {isWarmup
            ? <Flame className="w-4 h-4 text-[#fbbf24]" />
            : <Wind  className="w-4 h-4 text-[#fbbf24]" />}
        </div>
        <div>
          <p className="text-white font-extrabold text-sm tracking-wide">
            {isWarmup ? 'WARM UP' : 'COOL DOWN'}
          </p>
          <p className="text-white/35 text-[11px] font-medium">
            {isWarmup ? 'حرّك مفاصلك وسخّن عضلاتك' : 'تمدد وسرّع تعافي العضلات'}
          </p>
        </div>
      </div>
      <span className="text-[#fbbf24] font-extrabold text-xs bg-[#fbbf24]/10 px-3 py-1 rounded-full flex-shrink-0">
        {isWarmup ? '10 د' : '5 د'}
      </span>
    </div>
  )
}

// ─── Exercise Row (Today Card) ────────────────────────────────────────────────

function ExerciseRow({ ex, done, onToggle, isLast, number }) {
  const [flash, setFlash] = useState(false)
  const thumb = getYoutubeThumbnail(ex.videoUrl)
  const info  = repsDisplay(ex.sets, ex.reps)

  function handleToggle() {
    if (!done) { setFlash(true); setTimeout(() => setFlash(false), 600) }
    onToggle()
  }

  return (
    <div className={`flex items-center gap-3 py-3.5 transition-all duration-300 ${!isLast ? 'border-b border-slate-100' : ''} ${done ? 'opacity-50' : ''} ${flash ? 'bg-[#fbbf24]/8' : ''}`}>
      {/* Number badge */}
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-extrabold transition-all ${done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
        {done ? '✓' : number}
      </div>

      {/* Thumbnail */}
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

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`font-extrabold text-sm leading-tight transition-all ${done ? 'line-through text-slate-300' : 'text-slate-900'}`}>
          {ex.name}
        </p>
        {info && (
          <p className="text-[11px] font-semibold mt-0.5 flex items-center gap-1.5" dir="ltr">
            {info.sets && <><span className="text-slate-400">Sets:</span><span className="text-slate-700 font-extrabold">{info.sets}</span></>}
            {info.sets && info.reps && <span className="text-slate-200">·</span>}
            {info.reps && <><span className="text-slate-400">Reps:</span><span className="text-slate-700 font-extrabold">{info.reps}</span></>}
            {ex.rest && <><span className="text-slate-200">·</span><span className="text-slate-400">{ex.rest}</span></>}
          </p>
        )}
        {ex.note && (
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">💡 {ex.note}</p>
        )}
      </div>

      {/* Checkbox */}
      <button onClick={handleToggle}
        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 active:scale-90 ${
          done ? 'bg-[#fbbf24] border-[#fbbf24] scale-105' : 'border-slate-200 hover:border-[#fbbf24] hover:scale-110'
        }`}>
        {done && <CheckCircle2 className="w-[15px] h-[15px] text-black" />}
      </button>
    </div>
  )
}

// ─── Today's Workout ──────────────────────────────────────────────────────────

function TodayWorkout({ day, idx }) {
  const [done, setDone] = useState({})
  const exList  = day.exercises || []
  const total   = exList.length
  const doneCount = Object.values(done).filter(Boolean).length
  const allDone   = total > 0 && doneCount === total
  const info = getMuscleInfo(day.focus)
  const todayStr = new Date().toLocaleDateString('ar-SA', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="rounded-3xl overflow-hidden" style={{ boxShadow: '0 20px 60px -10px rgba(0,0,0,0.35)' }}>

      {/* ── Hero ── */}
      <div className="relative px-6 py-8" style={{ background: 'linear-gradient(135deg,#0a0a0a 0%,#18181b 100%)' }}>
        <span className="absolute left-5 bottom-3 text-[100px] leading-none opacity-[0.04] select-none pointer-events-none">
          {info.emoji}
        </span>

        {/* Today badge */}
        <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold bg-[#fbbf24] text-black px-3 py-1 rounded-full uppercase tracking-widest mb-4">
          ✦ تمرين اليوم
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-5xl font-black text-white leading-none tracking-tighter">{info.en}</h2>
            <p className="text-[#fbbf24] font-extrabold text-base mt-2">{day.name || `اليوم ${idx + 1}`}</p>
            <p className="text-white/30 text-xs mt-1 font-medium">{todayStr}</p>
          </div>
          <div className="text-right flex-shrink-0 pb-1">
            <p className="text-4xl font-black text-[#fbbf24] leading-none">{total}</p>
            <p className="text-white/30 text-[10px] font-bold mt-1">تمرين</p>
          </div>
        </div>

        {/* Progress bar */}
        {doneCount > 0 && (
          <div className="mt-5">
            <div className="flex justify-between mb-2">
              <span className="text-[11px] text-white/30 font-bold">التقدم</span>
              <span className="text-[11px] text-[#fbbf24] font-extrabold">{doneCount}/{total}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] rounded-full transition-all duration-500"
                style={{ width: `${(doneCount / total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Program Preview ── */}
      <div className="bg-white">
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-50">
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
            <div className="py-8 text-center text-slate-300 text-sm">لا توجد تمارين لهذا اليوم</div>
          )}

          <SectionBanner type="cooldown" />

          {allDone && (
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-center py-4 rounded-2xl font-extrabold text-sm shadow-lg shadow-emerald-500/25">
              🏆 أنجزت تمرين اليوم! عمل رائع
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Rest Day ─────────────────────────────────────────────────────────────────

function RestDay() {
  return (
    <div className="rounded-3xl overflow-hidden" style={{ boxShadow: '0 20px 60px -10px rgba(0,0,0,0.3)' }}>
      <div className="relative px-6 py-12 text-center" style={{ background: 'linear-gradient(135deg,#0a0a0a 0%,#18181b 100%)' }}>
        <span className="absolute inset-0 flex items-center justify-center text-[130px] leading-none opacity-[0.04] select-none pointer-events-none">🌙</span>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold bg-white/10 text-white/40 px-3 py-1 rounded-full uppercase tracking-widest mb-5">
            ✦ اليوم
          </div>
          <h2 className="text-5xl font-black text-white leading-none tracking-tighter">REST</h2>
          <p className="text-white/50 font-bold text-base mt-2">يوم راحة</p>
          <p className="text-white/20 text-xs mt-3 max-w-xs mx-auto leading-relaxed font-medium">
            الراحة جزء أساسي من البرنامج — دع عضلاتك تتعافى وتنمو
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Other Day (compact accordion) ───────────────────────────────────────────

function OtherDay({ day, idx }) {
  const [open, setOpen] = useState(false)
  const info  = getMuscleInfo(day.focus)
  const total = day.exercises?.length || 0

  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-4 text-right">
        <div className="w-10 h-10 rounded-xl bg-[#0a0a0a] flex items-center justify-center flex-shrink-0">
          <span className="text-xl leading-none">{info.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-sm text-slate-900 truncate">{day.name || `اليوم ${idx + 1}`}</p>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            {day.focus && `${day.focus} · `}{total} تمارين
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-slate-50 px-4 pb-4 pt-3 space-y-2">
          <SectionBanner type="warmup" />

          <div className="bg-white border border-slate-100 rounded-2xl px-3">
            {day.exercises?.map((ex, i) => {
              const thumb = getYoutubeThumbnail(ex.videoUrl)
              return (
                <div key={i}
                  className={`flex items-center gap-3 py-3 ${i < (day.exercises.length - 1) ? 'border-b border-slate-50' : ''}`}>
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#111] flex-shrink-0">
                    {thumb
                      ? <img src={thumb} alt={ex.name} className="w-full h-full object-cover" loading="lazy" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <Dumbbell className="w-4 h-4 text-[#fbbf24]/40" />
                        </div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-slate-900 truncate">{ex.name}</p>
                    <p className="text-[10px] font-semibold mt-0.5 flex items-center gap-1" dir="ltr">
                    {ex.sets && <><span className="text-slate-400">Sets:</span><span className="text-slate-600 font-bold">{ex.sets}</span></>}
                    {ex.sets && ex.reps && <span className="text-slate-200 mx-0.5">·</span>}
                    {ex.reps && <><span className="text-slate-400">Reps:</span><span className="text-slate-600 font-bold">{ex.reps}</span></>}
                  </p>
                  </div>
                  {ex.videoUrl && (
                    <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer"
                       className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 hover:bg-[#fbbf24]/20 transition-colors">
                      <Play className="w-3 h-3 text-slate-500" fill="currentColor" />
                    </a>
                  )}
                </div>
              )
            })}
          </div>

          <SectionBanner type="cooldown" />
        </div>
      )}
    </div>
  )
}

// ─── No Plan State ────────────────────────────────────────────────────────────

function NoPlan() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="relative rounded-3xl overflow-hidden" style={{
        background: 'linear-gradient(135deg,#0a0a0a 0%,#111827 60%,#1f2937 100%)',
        minHeight: 280,
      }}>
        {[
          { e:'🏋️', t:'8%',  l:'3%',  s:80, d:-15 },
          { e:'💪',  t:'12%', r:'4%',  s:66, d:20 },
          { e:'⚡',  t:'55%', l:'2%',  s:60, d:0 },
          { e:'🔥',  t:'58%', r:'4%',  s:64, d:12 },
          { e:'🏃',  t:'25%', l:'40%', s:96, d:8 },
          { e:'🎯',  t:'70%', l:'26%', s:50, d:0 },
          { e:'💥',  t:'16%', l:'22%', s:48, d:-8 },
          { e:'🥊',  t:'64%', r:'20%', s:56, d:15 },
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
          <h1 className="text-2xl font-extrabold text-white mb-2">الخطة التدريبية قيد الإعداد</h1>
          <p className="text-white/40 text-sm max-w-xs leading-relaxed font-medium">
            يعمل المدرب أمين على تصميم برنامج تدريبي مخصص لك بناءً على هدفك ومستواك الحالي.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { emoji:'📋', title:'برنامج مخصص',  desc:'مصمم لهدفك وجدولك' },
          { emoji:'🎯', title:'تمارين مفصّلة', desc:'مجموعات، تكرارات، راحة' },
          { emoji:'📈', title:'تطور تدريجي',  desc:'يتطور معك أسبوعاً بأسبوع' },
        ].map(x => (
          <div key={x.title} className="bg-white rounded-2xl p-4 border border-slate-100 text-center shadow-sm">
            <div className="text-3xl mb-2">{x.emoji}</div>
            <p className="font-extrabold text-slate-900 text-xs mb-1">{x.title}</p>
            <p className="text-[10px] text-slate-400 font-medium">{x.desc}</p>
          </div>
        ))}
      </div>
      <p className="text-center text-slate-400 text-xs">
        للاستفسار:{' '}
        <a href="tel:+97430653759" className="text-[#c9973b] font-bold">تواصل مع المدرب أمين</a>
      </p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TrainingPlan() {
  const router  = useRouter()
  const [client,  setClient]  = useState(null)
  const [loading, setLoading] = useState(true)
  const todayIdx = new Date().getDay() // 0=Sun … 6=Sat

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

  const todayDay = todayIdx < plan.days.length ? plan.days[todayIdx] : null
  const totalExercises = plan.days.reduce((acc, d) => acc + (d.exercises?.length || 0), 0)

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-8">

      {/* ── Today ── */}
      {todayDay ? <TodayWorkout day={todayDay} idx={todayIdx} /> : <RestDay />}

      {/* ── Quick Stats ── */}
      {[plan.daysPerWeek, plan.duration, plan.level, totalExercises].some(Boolean) && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { emoji:'📅', label:'أيام/أسبوع', val: plan.daysPerWeek },
            { emoji:'⏱️', label:'المدة',      val: plan.duration ? `${plan.duration}د` : null },
            { emoji:'🎯', label:'المستوى',    val: plan.level },
            { emoji:'💪', label:'تمارين',     val: totalExercises || null },
          ].filter(s => s.val).map(s => (
            <div key={s.label} className="bg-[#0a0a0a] rounded-2xl p-3 text-center border border-white/5">
              <div className="text-xl mb-1">{s.emoji}</div>
              <p className="text-sm font-extrabold text-[#fbbf24] leading-none">{s.val}</p>
              <p className="text-[9px] text-white/25 font-semibold mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Other Days ── */}
      {plan.days.length > 1 && (
        <>
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2 pt-1">
            <span>📅</span> باقي البرنامج
          </p>
          <div className="space-y-2">
            {plan.days.map((day, i) => {
              if (i === todayIdx) return null
              return <OtherDay key={i} day={day} idx={i} />
            })}
          </div>
        </>
      )}

      {/* ── Coach Tips ── */}
      {plan.tips?.length > 0 && (
        <div className="rounded-2xl overflow-hidden">
          <div className="px-5 py-4 flex items-center gap-2 bg-[#0a0a0a]">
            <Star className="w-4 h-4 text-[#fbbf24]" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-widest">نصائح المدرب</h2>
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
        أسئلة؟{' '}
        <a href="tel:+97430653759" className="text-[#c9973b] font-bold hover:underline">تواصل مع المدرب أمين</a>
      </p>
    </div>
  )
}
