'use client'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2, Dumbbell, Star, Flame, Wind, Play,
  ChevronLeft, ChevronRight, ChevronDown,
} from 'lucide-react'

// ─── Schedule Patterns ────────────────────────────────────────────────────────
const SCHEDULE = {
  1: [1], 2: [1,4], 3: [1,3,5], 4: [1,2,4,5],
  5: [1,2,3,5,6], 6: [1,2,3,4,5,6], 7: [0,1,2,3,4,5,6],
}

// ─── Labels (Maghrebi / North-African Arabic month names) ─────────────────────
const DAY_SHORT     = ['Su','Mo','Tu','We','Th','Fr','Sa']
const MONTHS_MAGHREBI = [
  'جانفي','فيفري','مارس','أفريل','ماي','جوان',
  'جويلية','أوت','سبتمبر','أكتوبر','نوفمبر','ديسمبر',
]

// ─── Arabic → English exercise name map ──────────────────────────────────────
const TRANS_MAP = {
  // Transliterated names
  'سكوات':'Squats','بلانك':'Plank','كاف ريز':'Calf Raise','كاف ريزيز':'Calf Raises',
  'بنش بريس':'Bench Press','ديدليفت':'Deadlift','ديدلفت':'Deadlift',
  'ليغ بريس':'Leg Press','ليج بريس':'Leg Press','ليغ كيرل':'Leg Curl','ليج كيرل':'Leg Curl',
  'هامر كيرل':'Hammer Curl','هامر كيرل دمبل':'Dumbbell Hammer Curl',
  'بايسبس كيرل':'Bicep Curl','بايسبس كيبل':'Cable Bicep Curl',
  'ترايبسس كيبل':'Tricep Pushdown','ترايسبس كيبل':'Tricep Pushdown',
  'ترايسبس بوش داون':'Tricep Pushdown','ترايبسس':'Tricep Pushdown','ترايسبس':'Tricep Extension',
  'بوش أب':'Push Up','بوشاب':'Push Up','بول أب':'Pull Up','بولاب':'Pull Up',
  'رو بار':'Barbell Row','لات بول داون':'Lat Pulldown','لات بولداون':'Lat Pulldown',
  'شولدر بريس':'Shoulder Press','أوفر هيد بريس':'Overhead Press',
  'لاتيرال ريز':'Lateral Raise','كيبل رو':'Cable Row','سيتد رو':'Seated Row',
  'سكوات بالبار':'Barbell Squat','سكوات دمبل':'Dumbbell Squat',
  'لونج':'Lunges','لنج':'Lunges','هيب ثراست':'Hip Thrust','هيب ثرست':'Hip Thrust',
  'ليغ اكستينشن':'Leg Extension','ليج اكستنشن':'Leg Extension',
  'رومانيان ديدليفت':'Romanian Deadlift','رومانيان ديدلفت':'Romanian Deadlift',
  'إنكلاين بريس':'Incline Press','انكلاين بنش':'Incline Bench Press',
  'ديكلاين بريس':'Decline Press','كيبل فلاي':'Cable Fly',
  'كرنش':'Crunches','كرانشيز':'Crunches','ليغ ريز':'Leg Raise',
  'ماونتن كلايمبر':'Mountain Climbers','بيرباي':'Burpee','بربي':'Burpee',
  'هاي نيز':'High Knees','جامب سكوات':'Jump Squat','باكس جامب':'Box Jump',
  'سكوات جامب':'Jump Squat','وول سيت':'Wall Sit',
  'بلانك بسط':'Plank Hold','سايد بلانك':'Side Plank',
  'ديب':'Dips','ديبس':'Dips','شست فلاي':'Chest Fly','فلاي':'Chest Fly',
  // Descriptive Arabic names (AI-generated)
  'ضغط الصدر بالبار':'Bench Press','ضغط الصدر':'Bench Press',
  'ضغط الصدر بالدمبل':'Dumbbell Bench Press',
  'ضغط الصدر المائل':'Incline Bench Press','الضغط المائل':'Incline Bench Press',
  'الضغط المائل بالدمبل':'Incline Dumbbell Press','الدمبيل الإمالة':'Incline Dumbbell Press',
  'ضغط مائل بالدمبل':'Incline Dumbbell Press','دمبل انكلاين':'Incline Dumbbell Press',
  'الضغط الأفقي':'Decline Press','ضغط الصدر النازل':'Decline Press',
  'تمرين الفراشة':'Chest Fly','فراشة الصدر':'Chest Fly',
  'رفع الأثقال من الأرض':'Deadlift','الرفع الميت':'Deadlift',
  'رفع ميت رومانيا':'Romanian Deadlift','الرفع الميت الروماني':'Romanian Deadlift',
  'تجعيل الذراعين':'Bicep Curl','ثني الذراع':'Bicep Curl','تجعيل الذراع':'Bicep Curl',
  'تجعيل البايسبس':'Bicep Curl','ثني الذراع بالدمبل':'Dumbbell Bicep Curl',
  'تجعيل هامر':'Hammer Curl','هامر':'Hammer Curl',
  'مد الذراع الخلفي':'Tricep Extension','تمرين الترايسبس':'Tricep Pushdown',
  'مد الذراع بالكيبل':'Tricep Pushdown','دفع الكيبل للأسفل':'Tricep Pushdown',
  'تمديد الترايسبس':'Tricep Extension',
  'شد الظهر العلوي':'Lat Pulldown','الشد العلوي':'Lat Pulldown','الشد الأمامي':'Lat Pulldown',
  'الشد بالبار':'Lat Pulldown','لات برولداون':'Lat Pulldown',
  'تجديف بالبار':'Barbell Row','التجديف بالبار':'Barbell Row','تجديف الظهر':'Barbell Row',
  'صف بالكيبل':'Cable Row','التجديف بالكيبل':'Cable Row','تجديف جالس':'Seated Row',
  'عقلة':'Pull Up','عقلة واسعة':'Wide Grip Pull Up',
  'ضغط الكتف بالبار':'Barbell Shoulder Press','ضغط الكتف':'Shoulder Press',
  'ضغط الأكتاف':'Shoulder Press','ضغط عسكري':'Military Press',
  'الضغط العسكري':'Military Press','الضغط العلوي':'Overhead Press',
  'رفع جانبي':'Lateral Raise','رفع جانبي دمبل':'Lateral Raise',
  'الرفع الجانبي':'Lateral Raise','رفع الكتفين':'Lateral Raise',
  'رفع أمامي':'Front Raise','رفع أمامي دمبل':'Dumbbell Front Raise',
  'القرفصاء':'Squats','الجلوس':'Squats','قرفصاء بالبار':'Barbell Squat',
  'لانج':'Lunges','خطوة للأمام':'Lunges','خطوات':'Lunges',
  'جسر الأرداف':'Hip Thrust','رفع الأرداف':'Hip Thrust','رفع الحوض':'Hip Thrust',
  'ضغط الأرجل':'Leg Press','مد الساق':'Leg Extension',
  'تجعيل الساق':'Leg Curl','ثني الركبة':'Leg Curl',
  'رفع الكعبين':'Calf Raise','رفع الأصابع':'Calf Raise',
  'البلانك':'Plank','تمرين البلانك':'Plank',
  'الكرنش':'Crunches','تمارين البطن':'Crunches',
  'رفع الساقين':'Leg Raise','رفع الرجلين':'Leg Raise',
  'تسلق الجبل':'Mountain Climbers','تمرين التسلق':'Mountain Climbers',
  'قفزة المربع':'Box Jump','القفز العمودي':'Box Jump',
}

function normalizeName(name) {
  if (!name) return name
  if (/^[a-zA-Z0-9\s\-\/()]+$/.test(name)) return name  // already English
  const trimmed = name.trim()
  // Exact match
  if (TRANS_MAP[trimmed]) return TRANS_MAP[trimmed]
  // Strip common Arabic prefixes: "تمرين", "تمرين ال", "ال"
  const stripped = trimmed.replace(/^تمرين\s+(ال)?/,'').replace(/^ال/,'').trim()
  if (TRANS_MAP[stripped]) return TRANS_MAP[stripped]
  // Sort longest keys first to avoid partial-match collisions
  const keys = Object.keys(TRANS_MAP).sort((a, b) => b.length - a.length)
  for (const ar of keys) {
    if (name.includes(ar)) return TRANS_MAP[ar]
  }
  for (const ar of keys) {
    if (stripped.includes(ar)) return TRANS_MAP[ar]
  }
  return name
}

// ─── Muscle Info ──────────────────────────────────────────────────────────────
const MUSCLE_MAP = {
  'صدر':{'en':'CHEST','emoji':'💪'},'ظهر':{'en':'BACK','emoji':'🏋️'},
  'كتف':{'en':'SHOULDERS','emoji':'⚡'},'ذراع':{'en':'ARMS','emoji':'💪'},
  'أرجل':{'en':'LEGS','emoji':'🦵'},'بطن':{'en':'CORE','emoji':'🎯'},
  'كارديو':{'en':'CARDIO','emoji':'🏃'},'كامل':{'en':'FULL BODY','emoji':'🔥'},
}
function getMuscleInfo(focus) {
  for (const [k,v] of Object.entries(MUSCLE_MAP)) if (focus?.includes(k)) return v
  if (focus) {
    const lf = focus.toLowerCase()
    if (lf.includes('push')||lf.includes('chest')) return {en:'PUSH',emoji:'💪'}
    if (lf.includes('pull')||lf.includes('back'))  return {en:'PULL',emoji:'🏋️'}
    if (lf.includes('leg'))                         return {en:'LEGS',emoji:'🦵'}
    if (lf.includes('shoulder'))                    return {en:'SHOULDERS',emoji:'⚡'}
    if (lf.includes('arm')||lf.includes('bicep')||lf.includes('tricep')) return {en:'ARMS',emoji:'💪'}
    if (lf.includes('core')||lf.includes('abs'))    return {en:'CORE',emoji:'🎯'}
    if (lf.includes('cardio')||lf.includes('hiit')) return {en:'CARDIO',emoji:'🏃'}
    if (lf.includes('full')||lf.includes('body'))   return {en:'FULL BODY',emoji:'🔥'}
    if (/^[a-zA-Z\s]+$/.test(focus)) return {en:focus.toUpperCase(),emoji:'🏋️'}
  }
  return {en:'WORKOUT',emoji:'🏋️'}
}

// ─── Date Helpers ─────────────────────────────────────────────────────────────
function startOfDay(d) { const x=new Date(d); x.setHours(0,0,0,0); return x }
function isSameDay(a,b) { return a.getDate()===b.getDate()&&a.getMonth()===b.getMonth()&&a.getFullYear()===b.getFullYear() }
function getWeekStart(date) { const d=startOfDay(date); d.setDate(d.getDate()-d.getDay()); return d }
function getWeekDays(ws) { return Array.from({length:7},(_,i)=>{ const d=new Date(ws); d.setDate(d.getDate()+i); return d }) }
function getSchedule(n) { const k=Math.min(Math.max(1,Number(n)||4),7); return SCHEDULE[k]||SCHEDULE[4] }
function getPlanDayIndex(date,schedule) { const i=schedule.indexOf(date.getDay()); return i===-1?null:i }
// Format: "4 جوان 2026"
function fmtDate(d) { return `${d.getDate()} ${MONTHS_MAGHREBI[d.getMonth()]} ${d.getFullYear()}` }

// ─── YouTube Thumbnail ────────────────────────────────────────────────────────
function getThumb(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null
}

// ─── Section Banner ───────────────────────────────────────────────────────────
function SectionBanner({type}) {
  const wu = type==='warmup'
  return (
    <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-[#0a0a0a]">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#fbbf24]/10 flex items-center justify-center flex-shrink-0">
          {wu ? <Flame className="w-4 h-4 text-[#fbbf24]"/> : <Wind className="w-4 h-4 text-[#fbbf24]"/>}
        </div>
        <div>
          <p className="text-white font-extrabold text-sm tracking-wide">{wu?'WARM UP':'COOL DOWN'}</p>
          <p className="text-white/35 text-[11px] font-medium">
            {wu ? 'Mobilize joints · warm up muscles' : 'Stretch · accelerate recovery'}
          </p>
        </div>
      </div>
      <span className="text-[#fbbf24] font-extrabold text-xs bg-[#fbbf24]/10 px-3 py-1 rounded-full flex-shrink-0">
        {wu ? '10 min' : '5 min'}
      </span>
    </div>
  )
}

// ─── Exercise Row (expandable set tracker) ────────────────────────────────────
function ExerciseRow({ex, isLast, number, onComplete}) {
  const name      = normalizeName(ex.name)
  const ytThumb   = getThumb(ex.videoUrl)
  const numSets   = Math.max(1, Number(ex.sets) || 3)
  const targetReps = String(ex.reps || '')

  const isTimeBased = /\d+\s*s(ec)?$|amrap|hold/i.test(targetReps)
  const showRest  = isTimeBased && !!ex.rest

  const [expanded, setExpanded] = useState(false)
  const [sets, setSets] = useState(() =>
    Array.from({length: numSets}, () => ({done:false, reps:'', weight:''}))
  )
  const [imgSrc, setImgSrc] = useState(ytThumb)

  const doneSets = sets.filter(s=>s.done).length
  const allDone  = doneSets === numSets

  useEffect(() => { onComplete?.(allDone) }, [allDone]) // eslint-disable-line

  // Fetch exercise illustration from wger.de if no YouTube thumbnail
  useEffect(() => {
    if (ytThumb) { setImgSrc(ytThumb); return }
    const en = normalizeName(ex.name)
    if (!en || !/^[a-zA-Z]/.test(en)) return
    fetch(`/api/exercise-image?name=${encodeURIComponent(en)}`)
      .then(r => r.json())
      .then(d => { if (d.url) setImgSrc(d.url) })
      .catch(() => {})
  }, [ex.name]) // eslint-disable-line

  function updateSet(i, field, val) {
    setSets(prev => prev.map((s,j) => j===i ? {...s,[field]:val} : s))
  }
  function toggleSet(i) {
    setSets(prev => prev.map((s,j) => j===i ? {...s, done:!s.done} : s))
  }

  return (
    <div className={`transition-all duration-200 ${!isLast ? 'border-b border-slate-100' : ''}`}>

      {/* ── Header row ── */}
      <div
        className="flex items-center gap-3 py-3 cursor-pointer select-none"
        onClick={() => setExpanded(e=>!e)}>

        {/* Square image — always visible, left-most */}
        <div className="relative flex-shrink-0 w-[90px] h-[90px] rounded-xl overflow-hidden bg-slate-100 shadow-sm">
          {imgSrc
            ? <img src={imgSrc} alt={name} className="w-full h-full object-cover" loading="lazy"
                onError={() => setImgSrc(null)} />
            : <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                <Dumbbell className="w-6 h-6 text-slate-300"/>
              </div>}
          {ex.videoUrl && (
            <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer"
              onClick={e=>e.stopPropagation()}
              className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 active:opacity-100 transition-opacity rounded-xl">
              <Play className="w-5 h-5 text-white" fill="white"/>
            </a>
          )}
          {/* Completion overlay */}
          {allDone && (
            <div className="absolute inset-0 bg-emerald-500/80 flex items-center justify-center">
              <span className="text-white text-xl font-extrabold">✓</span>
            </div>
          )}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <p className={`font-extrabold text-sm leading-tight transition-all
            ${allDone ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
            {name}
          </p>
          <p className="text-[11px] font-semibold mt-1 flex items-center gap-1.5 flex-wrap" dir="ltr">
            {ex.sets && <><span className="text-slate-400">Sets:</span><span className="text-slate-700 font-extrabold">{ex.sets}</span></>}
            {ex.sets && ex.reps && <span className="text-slate-200">·</span>}
            {ex.reps && <><span className="text-slate-400">Reps:</span><span className="text-slate-700 font-extrabold">{ex.reps}</span></>}
            {showRest && <><span className="text-slate-200">·</span><span className="text-slate-400 text-[10px]">{ex.rest}</span></>}
          </p>
          {doneSets > 0 && !allDone && (
            <p className="text-[10px] text-[#d97706] font-bold mt-1">{doneSets}/{numSets} sets done</p>
          )}
        </div>

        {/* Badge number */}
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-extrabold
          ${allDone ? 'bg-emerald-100 text-emerald-600'
            : doneSets > 0 ? 'bg-amber-100 text-amber-600'
            : 'bg-slate-100 text-slate-500'}`}>
          {doneSets > 0 && !allDone ? `${doneSets}/${numSets}` : number}
        </div>

        <ChevronDown className={`w-4 h-4 text-slate-300 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}/>
      </div>

      {/* ── Expanded set tracker ── */}
      {expanded && (
        <div className="pb-4 px-1">
          {ex.note && (
            <p className="text-[10px] text-slate-400 mb-2 px-2 leading-relaxed">💡 {ex.note}</p>
          )}
          <div className="rounded-xl overflow-hidden border border-slate-100">
            {/* Table header */}
            <div className="grid grid-cols-[22px_1fr_1fr_28px] gap-1.5 items-center px-2.5 py-1.5 bg-slate-50 border-b border-slate-100">
              <p className="text-[9px] font-extrabold text-slate-400 uppercase">#</p>
              <p className="text-[9px] font-extrabold text-slate-400 uppercase text-center">Reps</p>
              <p className="text-[9px] font-extrabold text-slate-400 uppercase text-center">kg</p>
              <p className="text-[9px] font-extrabold text-slate-400 uppercase text-center">✓</p>
            </div>
            {/* Set rows */}
            {sets.map((s,i) => (
              <div key={i} className={`grid grid-cols-[22px_1fr_1fr_28px] gap-1.5 items-center px-2.5 py-1.5 transition-colors
                ${i < sets.length-1 ? 'border-b border-slate-50' : ''}
                ${s.done ? 'bg-emerald-50/60' : 'bg-white'}`}>
                <p className={`text-[11px] font-extrabold ${s.done ? 'text-emerald-600' : 'text-slate-400'}`}>{i+1}</p>
                <input
                  type="number" inputMode="numeric"
                  placeholder={targetReps || '—'}
                  value={s.reps}
                  onChange={e => updateSet(i,'reps',e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1 text-xs font-bold text-slate-900 text-center outline-none focus:border-[#fbbf24] focus:bg-white transition-all"
                />
                <input
                  type="number" inputMode="decimal"
                  placeholder="—"
                  value={s.weight}
                  onChange={e => updateSet(i,'weight',e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1 text-xs font-bold text-slate-900 text-center outline-none focus:border-[#fbbf24] focus:bg-white transition-all"
                />
                <button onClick={()=>toggleSet(i)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 active:scale-90 mx-auto
                    ${s.done ? 'bg-[#fbbf24] border-[#fbbf24] scale-105' : 'border-slate-200 hover:border-[#fbbf24]'}`}>
                  {s.done && <CheckCircle2 className="w-3 h-3 text-black"/>}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Week Navigator ───────────────────────────────────────────────────────────
function WeekNavigator({today, selectedDate, onSelect, schedule}) {
  const [weekOffset, setWeekOffset] = useState(0)

  const weekStart = useMemo(() => {
    const ws = getWeekStart(today); ws.setDate(ws.getDate()+weekOffset*7); return ws
  }, [today, weekOffset])

  const days = useMemo(() => getWeekDays(weekStart), [weekStart])

  const monthLabel = useMemo(() => {
    const mid = days[3]
    return `${MONTHS_MAGHREBI[mid.getMonth()]} ${mid.getFullYear()}`
  }, [days])

  return (
    <div className="bg-[#0a0a0a] rounded-2xl px-4 py-4 select-none">
      <div className="flex items-center justify-between mb-3">
        <button onClick={()=>setWeekOffset(o=>o-1)}
          className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90">
          <ChevronRight className="w-4 h-4"/>
        </button>
        <p className="text-white/50 text-xs font-bold tracking-wider">{monthLabel}</p>
        <button onClick={()=>setWeekOffset(o=>o+1)}
          className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90">
          <ChevronLeft className="w-4 h-4"/>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day,i) => {
          const isToday    = isSameDay(day,today)
          const isSelected = isSameDay(day,selectedDate)
          const isTraining = getPlanDayIndex(day,schedule) !== null
          return (
            <button key={i} onClick={()=>onSelect(startOfDay(day))}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all duration-200 active:scale-95
                ${isSelected ? 'bg-[#fbbf24]' : isToday ? 'bg-white/8 ring-1 ring-[#fbbf24]/40' : 'hover:bg-white/5'}`}>
              <span className={`text-[9px] font-bold uppercase tracking-wide ${isSelected?'text-black':'text-white/30'}`}>
                {DAY_SHORT[day.getDay()]}
              </span>
              <span className={`text-sm font-extrabold leading-none
                ${isSelected?'text-black':isToday?'text-[#fbbf24]':'text-white/75'}`}>
                {day.getDate()}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full transition-colors
                ${isSelected?'bg-black/25':isTraining?'bg-[#fbbf24]/70':'bg-white/8'}`}/>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Workout Card ─────────────────────────────────────────────────────────────
function WorkoutCard({day, date, isToday}) {
  const exList   = day.exercises || []
  const total    = exList.length
  const info     = getMuscleInfo(day.focus)
  const [doneExercises, setDoneExercises] = useState(new Set())

  const handleComplete = useCallback((idx, done) => {
    setDoneExercises(prev => {
      const next = new Set(prev)
      done ? next.add(idx) : next.delete(idx)
      return next
    })
  }, [])

  const doneCount = doneExercises.size
  const allDone   = doneCount === total && total > 0

  return (
    <div className="rounded-3xl overflow-hidden" style={{boxShadow:'0 20px 60px -10px rgba(0,0,0,0.35)'}}>

      {/* Hero */}
      <div className="relative px-6 py-8" style={{background:'linear-gradient(135deg,#0a0a0a 0%,#18181b 100%)'}}>
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
            <p className="text-white/30 text-xs mt-1 font-medium">{fmtDate(date)}</p>
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
              <div className="h-full bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] rounded-full transition-all duration-500"
                style={{width:`${(doneCount/total)*100}%`}}/>
            </div>
          </div>
        )}
      </div>

      {/* Exercises */}
      <div className="bg-white">
        <div className="px-5 pt-4 pb-3 border-b border-slate-50 flex items-center justify-between">
          <p className="text-[11px] font-extrabold text-slate-300 uppercase tracking-[0.15em]">Program Preview</p>
          {day.description && <p className="text-[10px] text-slate-300 max-w-[160px] truncate">{day.description}</p>}
        </div>
        <div className="px-4 pt-3 pb-5 space-y-2">
          <SectionBanner type="warmup"/>
          {total > 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl px-3">
              {exList.map((ex,i) => (
                <ExerciseRow
                  key={i} ex={ex} number={i+1}
                  isLast={i===exList.length-1}
                  onComplete={(done) => handleComplete(i, done)}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-300 text-sm">No exercises for this day</div>
          )}
          <SectionBanner type="cooldown"/>
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
function RestCard({date, isToday}) {
  return (
    <div className="rounded-3xl overflow-hidden" style={{boxShadow:'0 20px 60px -10px rgba(0,0,0,0.3)'}}>
      <div className="relative px-6 py-14 text-center" style={{background:'linear-gradient(135deg,#0a0a0a 0%,#18181b 100%)'}}>
        <span className="absolute inset-0 flex items-center justify-center text-[140px] leading-none opacity-[0.04] select-none pointer-events-none">🌙</span>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold bg-white/8 text-white/40 px-3 py-1 rounded-full uppercase tracking-widest mb-5">
            {isToday ? '✦ TODAY' : '✦ DAY OFF'}
          </div>
          <h2 className="text-5xl font-black text-white leading-none tracking-tighter">REST</h2>
          <p className="text-white/50 font-bold text-base mt-2">يوم الراحة</p>
          <p className="text-white/25 text-xs mt-1 font-medium">{fmtDate(date)}</p>
          <p className="text-white/20 text-xs mt-4 max-w-xs mx-auto leading-relaxed font-medium">
            Rest is part of the program — let your muscles recover and grow stronger
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar({plan}) {
  const totalEx = plan.days.reduce((acc,d)=>acc+(d.exercises?.length||0),0)
  const items = [
    {icon:'💪',label:'Exercises', val:totalEx||null},
    {icon:'🎯',label:'Level',     val:plan.level||null},
    {icon:'⏱️',label:'Duration',  val:plan.duration?`${plan.duration}m`:null},
    {icon:'📅',label:'Days/wk',   val:plan.days.length||null},
  ].filter(i=>i.val)
  if (!items.length) return null
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map(s=>(
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
      <div className="relative rounded-3xl overflow-hidden" style={{background:'linear-gradient(135deg,#0a0a0a 0%,#111827 60%,#1f2937 100%)',minHeight:280}}>
        {[{e:'🏋️',t:'8%',l:'3%',s:80,d:-15},{e:'💪',t:'12%',r:'4%',s:66,d:20},{e:'⚡',t:'55%',l:'2%',s:60,d:0},{e:'🔥',t:'58%',r:'4%',s:64,d:12},{e:'🏃',t:'25%',l:'40%',s:96,d:8},{e:'🎯',t:'70%',l:'26%',s:50,d:0},{e:'💥',t:'16%',l:'22%',s:48,d:-8},{e:'🥊',t:'64%',r:'20%',s:56,d:15}].map((x,i)=>(
          <span key={i} className="absolute select-none pointer-events-none opacity-[0.07]" style={{top:x.t,left:x.l,right:x.r,fontSize:x.s,lineHeight:1,transform:`rotate(${x.d}deg)`}}>{x.e}</span>
        ))}
        <div className="relative z-10 flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-[#fbbf24]/10 border border-[#fbbf24]/20 flex items-center justify-center mb-5">
            <Dumbbell className="w-10 h-10 text-[#fbbf24]"/>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">خطة التدريب قادمة قريباً</h1>
          <p className="text-white/40 text-sm max-w-xs leading-relaxed font-medium">
            المدرب أمين يصمم لك برنامجاً تدريبياً مخصصاً بناءً على أهدافك ومستواك الحالي.
          </p>
        </div>
      </div>
      <p className="text-center text-slate-400 text-xs pb-2">
        أسئلة؟ <a href="tel:+97430653759" className="text-[#c9973b] font-bold">تواصل مع المدرب أمين</a>
      </p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TrainingPlan() {
  const router = useRouter()
  const [client, setClient]   = useState(null)
  const [loading, setLoading] = useState(true)
  const today = useMemo(()=>startOfDay(new Date()),[])
  const [selectedDate, setSelectedDate] = useState(()=>startOfDay(new Date()))

  useEffect(()=>{
    fetch('/api/client/me')
      .then(r=>{ if(r.status===401){router.push('/client/login');return null} return r.json() })
      .then(d=>{ if(d) setClient(d) })
      .finally(()=>setLoading(false))
  },[router])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-2 border-[#fbbf24] border-t-transparent rounded-full animate-spin"/>
    </div>
  )
  if (!client) return null

  const plan = client.plan?.training
  if (!plan?.days?.length) return <NoPlan/>

  const daysPerWeek = plan.days.length   // always trust actual saved days
  const schedule    = getSchedule(daysPerWeek)
  const isToday     = isSameDay(selectedDate, today)
  const planDayIdx  = getPlanDayIndex(selectedDate, schedule)
  const currentDay  = (planDayIdx!==null && planDayIdx<plan.days.length) ? plan.days[planDayIdx] : null

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-8">

      {/* Header */}
      <div>
        <p className="text-[11px] font-extrabold text-slate-300 uppercase tracking-[0.15em]">خطتي</p>
        <h1 className="text-xl font-extrabold text-slate-900 mt-0.5">{fmtDate(selectedDate)}</h1>
      </div>

      {/* Week Navigator */}
      <WeekNavigator today={today} selectedDate={selectedDate} onSelect={setSelectedDate} schedule={schedule}/>

      {/* Stats */}
      <StatsBar plan={plan}/>

      {/* Workout or Rest */}
      {currentDay
        ? <WorkoutCard key={selectedDate.toISOString()} day={currentDay} date={selectedDate} isToday={isToday}/>
        : <RestCard                                                        date={selectedDate} isToday={isToday}/>
      }

      {/* Coach Tips */}
      {plan.tips?.length > 0 && (
        <div className="rounded-2xl overflow-hidden">
          <div className="px-5 py-4 flex items-center gap-2 bg-[#0a0a0a]">
            <Star className="w-4 h-4 text-[#fbbf24]"/>
            <h2 className="text-sm font-extrabold text-white uppercase tracking-widest">نصائح المدرب</h2>
          </div>
          <div className="bg-[#111] px-5 py-4 space-y-3">
            {plan.tips.map((tip,i)=>(
              <div key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-[#fbbf24] text-black rounded-full flex items-center justify-center text-[11px] font-extrabold flex-shrink-0 mt-0.5">{i+1}</span>
                <span className="text-sm text-white/60 font-medium leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-slate-400 text-xs pb-2">
        أسئلة؟ <a href="tel:+97430653759" className="text-[#c9973b] font-bold hover:underline">تواصل مع المدرب أمين</a>
      </p>
    </div>
  )
}
