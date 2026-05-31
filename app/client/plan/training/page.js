'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Clock, Zap, RotateCcw, ChevronDown, ChevronUp,
  Play, CheckCircle2, Dumbbell, Star,
} from 'lucide-react'

const DAYS_AR = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']

const MUSCLE_COLORS = {
  'صدر':    'bg-blue-100 text-blue-700',
  'ظهر':    'bg-emerald-100 text-emerald-700',
  'كتف':    'bg-violet-100 text-violet-700',
  'ذراع':   'bg-orange-100 text-orange-700',
  'أرجل':   'bg-red-100 text-red-700',
  'بطن':    'bg-yellow-100 text-yellow-700',
  'كارديو': 'bg-pink-100 text-pink-700',
  'كامل':   'bg-slate-100 text-slate-700',
}
function getMuscleColor(focus) {
  for (const key of Object.keys(MUSCLE_COLORS)) {
    if (focus?.includes(key)) return MUSCLE_COLORS[key]
  }
  return 'bg-slate-100 text-slate-600'
}

function ExerciseCard({ ex, idx }) {
  const [done, setDone] = useState(false)
  return (
    <div className={`rounded-2xl border-2 transition-all duration-200 ${done ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-100 bg-white'}`}>
      <div className="flex items-start gap-3 p-4">
        <button onClick={() => setDone(d => !d)}
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200 hover:border-emerald-300'}`}>
          {done && <CheckCircle2 className="w-4 h-4 text-white" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className={`font-extrabold text-sm leading-tight ${done ? 'line-through text-slate-400' : 'text-slate-900'}`}>
              {ex.name}
            </p>
            <span className="text-[10px] font-extrabold text-black bg-[#fbbf24] px-2 py-0.5 rounded-full flex-shrink-0">
              {idx + 1}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ex.sets && (
              <div className="flex items-center gap-1 bg-[#0a0a0a] text-white rounded-lg px-2.5 py-1">
                <RotateCcw className="w-3 h-3 text-[#fbbf24]" />
                <span className="text-xs font-bold">{ex.sets} مجموعات</span>
              </div>
            )}
            {ex.reps && (
              <div className="flex items-center gap-1 bg-slate-100 text-slate-700 rounded-lg px-2.5 py-1">
                <Zap className="w-3 h-3 text-slate-400" />
                <span className="text-xs font-bold">{ex.reps} تكرار</span>
              </div>
            )}
            {ex.rest && (
              <div className="flex items-center gap-1 bg-slate-100 text-slate-700 rounded-lg px-2.5 py-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="text-xs font-bold">{ex.rest}</span>
              </div>
            )}
          </div>
          {ex.note && (
            <p className="text-xs text-slate-500 mt-2 font-medium bg-slate-50 rounded-xl px-3 py-2 leading-relaxed border border-slate-100">
              💡 {ex.note}
            </p>
          )}
          {ex.videoUrl && (
            <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition">
              <Play className="w-3 h-3" fill="currentColor" /> شاهد الشرح
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function DayCard({ day, idx, isToday }) {
  const [open, setOpen] = useState(isToday)
  const totalEx = day.exercises?.length || 0

  return (
    <div className={`rounded-2xl overflow-hidden transition-all ${isToday ? 'ring-2 ring-[#fbbf24] shadow-lg shadow-[#fbbf24]/10' : 'border border-slate-100 bg-white shadow-sm'}`}
      style={isToday ? { background: 'linear-gradient(135deg,#0a0a0a,#111827)' } : {}}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-4 p-5 text-right">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-extrabold text-lg ${isToday ? 'bg-[#fbbf24] text-black' : 'bg-slate-100 text-slate-600'}`}>
          {idx + 1}
        </div>
        <div className="flex-1 text-right">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className={`font-extrabold text-sm ${isToday ? 'text-white' : 'text-slate-900'}`}>
              {day.name || `اليوم ${idx + 1}`}
            </p>
            {isToday && (
              <span className="text-[10px] font-extrabold bg-[#fbbf24] text-black px-2 py-0.5 rounded-full">اليوم ✦</span>
            )}
          </div>
          {day.focus && (
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isToday ? 'bg-white/10 text-white/50' : getMuscleColor(day.focus)}`}>
              {day.focus}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {totalEx > 0 && (
            <span className={`text-xs font-bold ${isToday ? 'text-white/40' : 'text-slate-400'}`}>{totalEx} ت</span>
          )}
          {open
            ? <ChevronUp className={`w-4 h-4 ${isToday ? 'text-white/30' : 'text-slate-300'}`} />
            : <ChevronDown className={`w-4 h-4 ${isToday ? 'text-white/30' : 'text-slate-300'}`} />
          }
        </div>
      </button>

      {open && (
        <div className={`px-5 pb-5 space-y-3 ${isToday ? 'border-t border-white/10 pt-4' : 'border-t border-slate-50 pt-4'}`}>
          {day.description && (
            <p className={`text-sm font-medium leading-relaxed ${isToday ? 'text-white/50' : 'text-slate-500'}`}>
              {day.description}
            </p>
          )}
          {day.exercises?.length > 0
            ? day.exercises.map((ex, j) => <ExerciseCard key={j} ex={ex} idx={j} />)
            : <p className={`text-sm text-center py-6 ${isToday ? 'text-white/20' : 'text-slate-200'}`}>لا توجد تمارين</p>
          }
        </div>
      )}
    </div>
  )
}

export default function TrainingPlan() {
  const router  = useRouter()
  const [client,  setClient]  = useState(null)
  const [loading, setLoading] = useState(true)
  const todayIdx = new Date().getDay()

  useEffect(() => {
    fetch('/api/client/me')
      .then(r => { if (r.status === 401) { router.push('/client/login'); return null } return r.json() })
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

  /* ── NO PLAN ── */
  if (!plan?.days?.length) {
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

  /* ── HAS PLAN ── */
  const totalExercises = plan.days.reduce((acc, d) => acc + (d.exercises?.length || 0), 0)

  return (
    <div className="space-y-5 max-w-2xl mx-auto">

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden" style={{
        background: 'linear-gradient(135deg,#0a0a0a 0%,#111827 50%,#1f2937 100%)',
        minHeight: 190,
      }}>
        {[
          { e:'🏋️', t:'8%',  l:'2%',  s:80, d:-15 },
          { e:'💪',  t:'12%', r:'4%',  s:64, d:20 },
          { e:'⚡',  t:'55%', l:'1%',  s:60, d:0 },
          { e:'🔥',  t:'58%', r:'3%',  s:64, d:12 },
          { e:'🏃',  t:'22%', l:'40%', s:96, d:8 },
        ].map((x, i) => (
          <span key={i} className="absolute select-none pointer-events-none opacity-[0.07]"
            style={{ top:x.t, left:x.l, right:x.r, fontSize:x.s, lineHeight:1, transform:`rotate(${x.d}deg)` }}>
            {x.e}
          </span>
        ))}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute opacity-5" style={{
            width:'200%', height:'2px', background:'linear-gradient(90deg,transparent,#fbbf24,transparent)',
            top:'62%', left:'-50%', transform:'rotate(-8deg)',
          }} />
        </div>
        <div className="relative z-10 px-6 py-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[#fbbf24]/60 text-xs font-extrabold uppercase tracking-widest mb-2">برنامجك المخصص</p>
            <h1 className="text-3xl font-extrabold text-white leading-tight">
              الخطة<br /><span className="text-[#fbbf24]">التدريبية</span>
            </h1>
            {plan.note && <p className="text-white/40 text-sm mt-3 max-w-xs leading-relaxed">{plan.note}</p>}
          </div>
          <div className="text-6xl opacity-80 select-none flex-shrink-0">🏋️</div>
        </div>
      </div>

      {/* Stats */}
      {[plan.daysPerWeek, plan.duration, plan.level, totalExercises].some(Boolean) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { emoji:'📅', label:'أيام/أسبوع', val: plan.daysPerWeek },
            { emoji:'⏱️', label:'المدة',      val: plan.duration ? `${plan.duration} د` : null },
            { emoji:'🎯', label:'المستوى',    val: plan.level },
            { emoji:'💪', label:'التمارين',   val: totalExercises || null },
          ].filter(s => s.val).map(s => (
            <div key={s.label} className="bg-[#0a0a0a] rounded-2xl p-4 text-center border border-white/5">
              <div className="text-2xl mb-1">{s.emoji}</div>
              <p className="text-lg font-extrabold text-[#fbbf24]">{s.val}</p>
              <p className="text-[10px] text-white/30 font-semibold mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Weekly schedule */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">الجدول الأسبوعي</p>
        <div className="grid grid-cols-7 gap-1.5">
          {DAYS_AR.map((d, i) => {
            const hasTraining = i < plan.days.length
            const isToday = i === todayIdx
            return (
              <div key={d} className={`rounded-xl py-2.5 text-center transition-all ${
                isToday && hasTraining ? 'bg-[#fbbf24] shadow-md shadow-[#fbbf24]/30'
                : isToday ? 'bg-slate-900'
                : hasTraining ? 'bg-[#0a0a0a]'
                : 'bg-slate-50'
              }`}>
                <p className={`text-[9px] font-bold leading-none mb-1 ${
                  isToday && hasTraining ? 'text-black' : isToday || hasTraining ? 'text-white' : 'text-slate-300'}`}>
                  {d.slice(0,2)}
                </p>
                <p className={`text-xs ${
                  isToday && hasTraining ? 'text-black' : hasTraining ? 'text-[#fbbf24]' : 'text-slate-200'}`}>
                  {hasTraining ? '●' : '·'}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Days */}
      <div className="space-y-3">
        <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <span>💪</span> أيام التدريب
        </p>
        {plan.days.map((day, i) => (
          <DayCard key={i} day={day} idx={i} isToday={i === todayIdx} />
        ))}
      </div>

      {/* Tips */}
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

      <p className="text-center text-slate-400 text-xs pb-4">
        أسئلة؟{' '}
        <a href="tel:+97430653759" className="text-[#c9973b] font-bold hover:underline">تواصل مع المدرب أمين</a>
      </p>
    </div>
  )
}
