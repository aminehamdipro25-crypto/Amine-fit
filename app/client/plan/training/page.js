'use client'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2, Dumbbell, Star, Flame, Wind, Play, X,
  ChevronLeft, ChevronRight, ChevronDown, Printer,
  BookCheck, Clock, Loader2,
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

// Returns 0-based plan day index using startDate anchor, or null if it's a rest day
// or the plan period has ended (endDateStr). Counts training-day occurrences from
// startDate to queryDate and wraps by planDaysCount.
function getPlanDayFromStart(queryDate, schedule, startDateStr, planDaysCount, endDateStr) {
  if (!startDateStr) return getPlanDayIndex(queryDate, schedule)  // legacy fallback

  const d     = startOfDay(queryDate)
  const start = startOfDay(new Date(startDateStr))

  if (+d < +start) return null  // before plan was assigned
  if (endDateStr && +d > +startOfDay(new Date(endDateStr))) return null  // plan period ended

  const dow = d.getDay()
  if (!schedule.includes(dow)) return null  // not a training weekday

  // Count training-day occurrences from start through d (inclusive)
  let count = 0
  const cursor = new Date(start)
  while (+cursor <= +d) {
    if (schedule.includes(cursor.getDay())) count++
    cursor.setDate(cursor.getDate() + 1)
  }

  if (count === 0) return null
  return (count - 1) % planDaysCount
}

// Returns true if `date` is a training day given the plan's schedule, startDate and endDate.
function isTrainingDay(date, schedule, startDateStr, endDateStr) {
  const d = startOfDay(date)
  if (startDateStr && +d < +startOfDay(new Date(startDateStr))) return false
  if (endDateStr   && +d > +startOfDay(new Date(endDateStr)))   return false
  return schedule.includes(date.getDay())
}

// ─── YouTube helpers ──────────────────────────────────────────────────────────
function getVideoId(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}
// Parse a rest string ("90s", "2 min", "٩٠ ثانية", "3 min") into seconds
function parseRestSeconds(rest) {
  const s = String(rest || '').toLowerCase().trim()
  const min = s.match(/(\d+)\s*(min|m\b|دقيقة|دقائق|د)/)
  if (min) return parseInt(min[1], 10) * 60
  const sec = s.match(/(\d+)\s*(s|sec|ث|ثانية|ثوان)/)
  if (sec) return parseInt(sec[1], 10)
  const num = s.match(/^(\d+)/)
  return num ? parseInt(num[1], 10) : 0
}
function fmtRest(sec) {
  const m = Math.floor(sec / 60), s = sec % 60
  return m > 0 ? `${m}:${String(s).padStart(2,'0')}` : `${s}s`
}
// Map a rep range to a training intensity zone (professional touch)
function repZone(reps) {
  const s = String(reps || '')
  if (/amrap/i.test(s)) return { label: 'حتى الفشل', cls: 'text-red-600 bg-red-50' }
  if (/s|hold|ثانية|ث\b/i.test(s) && !/\d+\s*-\s*\d+/.test(s)) return null // time-based (plank etc.)
  const n = parseInt(s.match(/\d+/)?.[0] || '', 10)
  if (!n) return null
  if (n <= 5)  return { label: 'Zone قوة قصوى', cls: 'text-red-600 bg-red-50' }
  if (n <= 8)  return { label: 'Zone قوة',       cls: 'text-orange-600 bg-orange-50' }
  if (n <= 12) return { label: 'Zone تضخيم',      cls: 'text-violet-600 bg-violet-50' }
  return { label: 'Zone تحمّل', cls: 'text-emerald-600 bg-emerald-50' }
}

// Curated direct-tutorial videos for the core compound lifts (verified, high-view,
// stable). Anything not here falls back to the reliable YouTube search link, so a
// link is never broken. Keyed by lowercased exercise name (+ common aliases).
const EXERCISE_VIDEOS = {
  // ── Core compound lifts ──
  'barbell back squat':     'https://www.youtube.com/watch?v=8PMjqgR8Wa8',
  'back squat':             'https://www.youtube.com/watch?v=8PMjqgR8Wa8',
  'barbell squat':          'https://www.youtube.com/watch?v=8PMjqgR8Wa8',
  'barbell bench press':    'https://www.youtube.com/watch?v=Pp8rHcFVIYg',
  'bench press':            'https://www.youtube.com/watch?v=Pp8rHcFVIYg',
  'deadlift':               'https://www.youtube.com/watch?v=GxsLrTzyGUU',
  'conventional deadlift':  'https://www.youtube.com/watch?v=GxsLrTzyGUU',
  'barbell row':            'https://www.youtube.com/watch?v=rqTOAM8WoeM',
  'barbell bent-over row':  'https://www.youtube.com/watch?v=rqTOAM8WoeM',
  'bent-over row':          'https://www.youtube.com/watch?v=rqTOAM8WoeM',
  'overhead press':         'https://www.youtube.com/watch?v=F3QY5vMz_6I',
  'barbell overhead press': 'https://www.youtube.com/watch?v=F3QY5vMz_6I',
  'pull-up':                'https://www.youtube.com/watch?v=6zyx46Vpato',
  'pull up':                'https://www.youtube.com/watch?v=6zyx46Vpato',
  'wide-grip pull-up':      'https://www.youtube.com/watch?v=6zyx46Vpato',
  // ── Common accessories ──
  'romanian deadlift':          'https://www.youtube.com/watch?v=uhghy9pFIPY',
  'barbell romanian deadlift':  'https://www.youtube.com/watch?v=uhghy9pFIPY',
  'dumbbell romanian deadlift': 'https://www.youtube.com/watch?v=uhghy9pFIPY',
  'lat pulldown':               'https://www.youtube.com/watch?v=SALxEARiMkw',
  'dumbbell shoulder press':    'https://www.youtube.com/watch?v=guW_ENwLOMI',
  'shoulder press':             'https://www.youtube.com/watch?v=guW_ENwLOMI',
  'dumbbell lateral raise':     'https://www.youtube.com/watch?v=Y29xKcze8Ik',
  'lateral raise':              'https://www.youtube.com/watch?v=Y29xKcze8Ik',
  'cable lateral raise':        'https://www.youtube.com/watch?v=Y29xKcze8Ik',
  'barbell curl':               'https://www.youtube.com/watch?v=QZEqB6wUPxQ',
  'barbell bicep curl':         'https://www.youtube.com/watch?v=QZEqB6wUPxQ',
  'bicep curl':                 'https://www.youtube.com/watch?v=QZEqB6wUPxQ',
  'plank':                      'https://www.youtube.com/watch?v=mwlp75MS6Rg',
  'push-up':                    'https://www.youtube.com/watch?v=WDIpL0pjun0',
  'push up':                    'https://www.youtube.com/watch?v=WDIpL0pjun0',
  'dumbbell goblet squat':      'https://www.youtube.com/watch?v=k_EhLGvM8TQ',
  'goblet squat':               'https://www.youtube.com/watch?v=k_EhLGvM8TQ',
  'hip thrust':                 'https://www.youtube.com/watch?v=pBH7pKHn-dI',
  'barbell hip thrust':         'https://www.youtube.com/watch?v=pBH7pKHn-dI',
  'dumbbell hip thrust':        'https://www.youtube.com/watch?v=pBH7pKHn-dI',
  'leg press':                  'https://www.youtube.com/watch?v=8nm863C0c60',
}
// Ordered keyword matchers (most-specific FIRST). When an exercise name isn't an
// exact key above — e.g. "Incline Dumbbell Bench Press", "Sumo Deadlift",
// "Front Squat", "Seated Cable Row" — we still resolve it to a verified curated
// video by movement pattern, so far more exercises open directly instead of
// falling back to the YouTube search link. Every URL below is one of the same
// verified videos used in EXERCISE_VIDEOS (no unverified IDs).
const VIDEO_MATCHERS = [
  [/romanian deadlift|\brdl\b|stiff[- ]?leg/,              'https://www.youtube.com/watch?v=uhghy9pFIPY'],
  [/goblet squat/,                                          'https://www.youtube.com/watch?v=k_EhLGvM8TQ'],
  [/hip thrust|glute bridge/,                               'https://www.youtube.com/watch?v=pBH7pKHn-dI'],
  [/lat ?pulldown|pull[- ]?down/,                           'https://www.youtube.com/watch?v=SALxEARiMkw'],
  [/pull[- ]?up|chin[- ]?up/,                               'https://www.youtube.com/watch?v=6zyx46Vpato'],
  [/lateral raise|side raise|side lateral/,                 'https://www.youtube.com/watch?v=Y29xKcze8Ik'],
  [/overhead press|military press|\bohp\b/,                 'https://www.youtube.com/watch?v=F3QY5vMz_6I'],
  [/shoulder press/,                                        'https://www.youtube.com/watch?v=guW_ENwLOMI'],
  [/bench press|chest press/,                               'https://www.youtube.com/watch?v=Pp8rHcFVIYg'],
  [/bent[- ]?over row|barbell row|\bbent row\b|seated row|cable row/, 'https://www.youtube.com/watch?v=rqTOAM8WoeM'],
  [/deadlift/,                                              'https://www.youtube.com/watch?v=GxsLrTzyGUU'],
  [/leg press/,                                             'https://www.youtube.com/watch?v=8nm863C0c60'],
  [/\bcurl\b/,                                              'https://www.youtube.com/watch?v=QZEqB6wUPxQ'],
  [/squat/,                                                 'https://www.youtube.com/watch?v=8PMjqgR8Wa8'],
  [/push[- ]?up|press[- ]?up/,                              'https://www.youtube.com/watch?v=WDIpL0pjun0'],
  [/plank/,                                                 'https://www.youtube.com/watch?v=mwlp75MS6Rg'],
]
function resolveVideoUrl(ex) {
  if (ex.videoUrl) return ex.videoUrl
  const raw = String(ex.name || '').trim().toLowerCase()
  if (!raw) return null
  // Try exact key, then a punctuation-normalized key, then movement-pattern match
  if (EXERCISE_VIDEOS[raw]) return EXERCISE_VIDEOS[raw]
  const norm = raw.replace(/[_/]+/g, ' ').replace(/\s+/g, ' ').trim()
  if (EXERCISE_VIDEOS[norm]) return EXERCISE_VIDEOS[norm]
  for (const [re, url] of VIDEO_MATCHERS) if (re.test(norm)) return url
  return null
}
function getThumb(url) {
  const id = getVideoId(url)
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null
}

// ─── Video Modal ──────────────────────────────────────────────────────────────
function VideoModal({ videoId, onClose }) {
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`
  return (
    <div className="fixed inset-0 bg-black/85 z-[60] flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <button onClick={onClose}
          className="flex items-center gap-1.5 text-white/50 hover:text-white mb-3 text-sm font-bold transition ml-auto">
          <X className="w-4 h-4"/> إغلاق
        </button>
        <div className="relative w-full rounded-2xl overflow-hidden bg-black" style={{paddingBottom:'56.25%'}}>
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
          />
        </div>
        {/* Guaranteed fallback — opens the tutorial on YouTube directly if the embed fails */}
        <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-1.5 text-white/50 hover:text-white text-xs font-bold transition">
          <Play className="w-3 h-3" fill="currentColor"/> افتح الشرح على يوتيوب
        </a>
      </div>
    </div>
  )
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

// ─── Cardio Section (shown when the coach added cardio to the program) ─────────
function CardioSection({cardio}) {
  if (!cardio?.has_cardio) return null
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#0a0a0a] to-[#161616] px-4 py-3.5 border border-[#fbbf24]/15">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#fbbf24]/10 flex items-center justify-center flex-shrink-0">
            <span className="text-base">🏃</span>
          </div>
          <div>
            <p className="text-white font-extrabold text-sm tracking-wide">CARDIO</p>
            {cardio.type && <p className="text-white/55 text-[11px] font-medium">{cardio.type}</p>}
          </div>
        </div>
        {cardio.duration && (
          <span className="text-[#fbbf24] font-extrabold text-xs bg-[#fbbf24]/10 px-3 py-1 rounded-full flex-shrink-0">
            {cardio.duration}
          </span>
        )}
      </div>
      {(cardio.note || cardio.intensity) && (
        <p className="text-white/40 text-[11px] mt-2 leading-relaxed">
          {cardio.note || ''}{cardio.intensity ? `${cardio.note ? ' · ' : ''}شدة ${cardio.intensity}` : ''}
        </p>
      )}
    </div>
  )
}

// ─── Exercise Row (expandable set tracker) ────────────────────────────────────
function ExerciseRow({ex, isLast, number, last, onComplete, onSetsUpdate}) {
  const name       = normalizeName(ex.name)
  const videoId    = getVideoId(resolveVideoUrl(ex))
  const ytThumb    = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null
  const numSets    = Math.max(1, Number(ex.sets) || 3)
  const targetReps = String(ex.reps || '')

  const isTimeBased = /\d+\s*s(ec)?$|amrap|hold/i.test(targetReps)
  const showRest   = isTimeBased && !!ex.rest

  const [expanded,   setExpanded]   = useState(false)
  const [showVideo,  setShowVideo]  = useState(false)
  const [sets,       setSets]       = useState(() =>
    Array.from({length: numSets}, () => ({done:false, reps:'', weight:''}))
  )
  const [imgSrc, setImgSrc] = useState(ytThumb)
  const [restEnd,  setRestEnd]  = useState(0)   // timestamp when the rest ends
  const [restLeft, setRestLeft] = useState(0)   // seconds remaining (drives the UI)

  const doneSets = sets.filter(s=>s.done).length
  const allDone  = doneSets === numSets

  useEffect(() => { onComplete?.(allDone) }, [allDone]) // eslint-disable-line
  useEffect(() => { onSetsUpdate?.(sets) }, [sets])    // eslint-disable-line

  // Rest countdown — ticks while a rest is active; vibrates when it ends
  useEffect(() => {
    if (!restEnd) { setRestLeft(0); return }
    const tick = () => {
      const left = Math.ceil((restEnd - Date.now()) / 1000)
      if (left <= 0) { setRestEnd(0); setRestLeft(0); try { navigator.vibrate?.([120,60,120]) } catch {} }
      else setRestLeft(left)
    }
    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [restEnd])

  // Fetch exercise illustration if no YouTube thumbnail
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
    setSets(prev => {
      const next = prev.map((s,j) => j===i ? {...s, done:!s.done} : s)
      // Starting a rest when a set is newly completed (not the final set)
      if (next[i].done && !prev[i].done && i < numSets - 1) {
        const rs = parseRestSeconds(ex.rest)
        if (rs > 0) setRestEnd(Date.now() + rs * 1000)
      }
      return next
    })
  }

  // YouTube search fallback URL for exercises with no image/video
  const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent((name||ex.name)+' exercise tutorial')}`
  const hasVideo    = !!videoId

  return (
    <>
      {showVideo && videoId && (
        <VideoModal videoId={videoId} onClose={() => setShowVideo(false)} />
      )}

      <div className={`transition-all duration-200 ${!isLast ? 'border-b border-slate-100' : ''}`}>

        {/* ── Header row ── */}
        <div
          className="flex items-center gap-3 py-3 cursor-pointer select-none"
          onClick={() => setExpanded(e=>!e)}>

          {/* Square image / thumbnail */}
          <div className="relative flex-shrink-0 w-[90px] h-[90px] rounded-xl overflow-hidden bg-slate-100 shadow-sm">
            {imgSrc
              ? <img src={imgSrc} alt={name} className="w-full h-full object-cover" loading="lazy"
                  onError={() => setImgSrc(null)} />
              : <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
                  <Dumbbell className="w-6 h-6 text-slate-300"/>
                  <span className="text-[8px] font-bold text-slate-300 text-center px-1 leading-tight">No image</span>
                </div>}

            {/* Play overlay — opens modal if video, opens YouTube search if no video */}
            {hasVideo ? (
              <button
                onClick={e=>{ e.stopPropagation(); setShowVideo(true) }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 active:opacity-100 transition-opacity rounded-xl">
                <Play className="w-5 h-5 text-white" fill="white"/>
              </button>
            ) : (
              <a href={ytSearchUrl} target="_blank" rel="noopener noreferrer"
                onClick={e=>e.stopPropagation()}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 active:opacity-100 transition-opacity rounded-xl">
                <div className="flex flex-col items-center gap-1">
                  <Play className="w-4 h-4 text-white" fill="white"/>
                  <span className="text-[8px] font-bold text-white/80">Tutorial</span>
                </div>
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
              {repZone(ex.reps) && (
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${repZone(ex.reps).cls}`} dir="rtl">
                  {repZone(ex.reps).label}
                </span>
              )}
            </p>
            {doneSets > 0 && !allDone && (
              <p className="text-[10px] text-[#d97706] font-bold mt-1">{doneSets}/{numSets} sets done</p>
            )}
            {last?.weight > 0 && (
              <p className="text-[10px] font-bold mt-1 flex items-center gap-1 text-emerald-600" dir="rtl">
                <span>🔁 آخر مرة: {last.weight} كغ × {last.reps || '—'}</span>
                <span className="text-emerald-500/70">— تفوّق عليه!</span>
              </p>
            )}
            {/* Tutorial pill */}
            {hasVideo ? (
              <button
                onClick={e=>{ e.stopPropagation(); setShowVideo(true) }}
                className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-[#fbbf24] bg-[#fbbf24]/10 px-2 py-0.5 rounded-full hover:bg-[#fbbf24]/20 transition active:scale-95">
                <Play className="w-2.5 h-2.5" fill="currentColor"/> Tutorial
              </button>
            ) : (
              <a href={ytSearchUrl} target="_blank" rel="noopener noreferrer"
                onClick={e=>e.stopPropagation()}
                className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full hover:bg-slate-200 transition w-fit">
                <Play className="w-2.5 h-2.5"/> Find Tutorial
              </a>
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

        {/* ── Expanded: image left + set tracker right ── */}
        {expanded && (
          <div className="pb-3 px-1">
            {ex.note && (
              <p className="text-[10px] text-slate-400 mb-2 px-1 leading-relaxed">💡 {ex.note}</p>
            )}
            <div className="flex gap-2 items-stretch" dir="ltr">

              {/* Large image — left */}
              <div className="flex-shrink-0 w-[120px] rounded-xl overflow-hidden bg-slate-100 self-stretch min-h-[100px] relative">
                {imgSrc
                  ? <img src={imgSrc} alt={name} className="w-full h-full object-cover"
                      onError={() => setImgSrc(null)} />
                  : <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2">
                      <Dumbbell className="w-8 h-8 text-slate-300"/>
                      <a href={ytSearchUrl} target="_blank" rel="noopener noreferrer"
                        className="text-[9px] font-bold text-slate-400 text-center leading-tight hover:text-slate-600 transition underline">
                        Find on YouTube
                      </a>
                    </div>}
                {hasVideo && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 active:opacity-100 transition-opacity rounded-xl">
                    <Play className="w-6 h-6 text-white" fill="white"/>
                  </button>
                )}
              </div>

              {/* Set tracker — right */}
              <div className="flex-1 rounded-xl overflow-hidden border border-slate-100">
                <div className="grid grid-cols-[18px_1fr_1fr_26px] gap-1 items-center px-2 py-1.5 bg-slate-50 border-b border-slate-100">
                  <p className="text-[8px] font-extrabold text-slate-400 uppercase">#</p>
                  <p className="text-[8px] font-extrabold text-slate-400 uppercase text-center">Reps</p>
                  <p className="text-[8px] font-extrabold text-slate-400 uppercase text-center">kg</p>
                  <p className="text-[8px] font-extrabold text-slate-400 uppercase text-center">✓</p>
                </div>
                {sets.map((s,i) => (
                  <div key={i} className={`grid grid-cols-[18px_1fr_1fr_26px] gap-1 items-center px-2 py-1.5 transition-colors
                    ${i < sets.length-1 ? 'border-b border-slate-50' : ''}
                    ${s.done ? 'bg-emerald-50/60' : 'bg-white'}`}>
                    <p className={`text-[10px] font-extrabold ${s.done ? 'text-emerald-600' : 'text-slate-400'}`}>{i+1}</p>
                    <input
                      type="number" inputMode="numeric"
                      placeholder={targetReps || '—'}
                      value={s.reps}
                      onChange={e => updateSet(i,'reps',e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-1 py-1 text-[10px] font-bold text-slate-900 text-center outline-none focus:border-[#fbbf24] focus:bg-white transition-all"
                    />
                    <input
                      type="number" inputMode="decimal"
                      placeholder={last?.weight ? String(last.weight) : "—"}
                      value={s.weight}
                      onChange={e => updateSet(i,'weight',e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md px-1 py-1 text-[10px] font-bold text-slate-900 text-center outline-none focus:border-[#fbbf24] focus:bg-white transition-all"
                    />
                    <button onClick={()=>toggleSet(i)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 active:scale-90 mx-auto
                        ${s.done ? 'bg-[#fbbf24] border-[#fbbf24] scale-105' : 'border-slate-200 hover:border-[#fbbf24]'}`}>
                      {s.done && <CheckCircle2 className="w-2.5 h-2.5 text-black"/>}
                    </button>
                  </div>
                ))}
              </div>

            </div>

            {restLeft > 0 && (
              <div className="mt-2 flex items-center gap-3 bg-[#0a0a0a] rounded-xl px-4 py-2.5">
                <span className="text-base flex-shrink-0">⏱️</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wide">راحة بين المجموعات</p>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-[#fbbf24] transition-all duration-300 ease-linear"
                      style={{ width: `${Math.min(100, (restLeft / Math.max(1, parseRestSeconds(ex.rest))) * 100)}%` }} />
                  </div>
                </div>
                <span className="text-[#fbbf24] font-extrabold text-lg tabular-nums flex-shrink-0">{fmtRest(restLeft)}</span>
                <button onClick={() => setRestEnd(0)} className="text-white/30 hover:text-white/60 text-xs font-bold flex-shrink-0">تخطي</button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

// ─── Week Navigator ───────────────────────────────────────────────────────────
function WeekNavigator({today, selectedDate, onSelect, schedule, startDate, endDate}) {
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
          const isTraining = isTrainingDay(day, schedule, startDate, endDate)
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

// ─── Workout Save Modal ───────────────────────────────────────────────────────
function WorkoutSaveModal({ day, dayIndex, workoutSets, sessionStart, onClose, onSaved }) {
  const [duration, setDuration] = useState(() => Math.max(1, Math.round((Date.now() - sessionStart) / 60000)))
  const [rating,   setRating]   = useState(4)
  const [notes,    setNotes]    = useState('')
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  const exList = day.exercises || []

  async function handleSave() {
    setSaving(true)
    const exercises = exList.map((ex, i) => ({
      name: ex.name,
      sets: (workoutSets[i] || []).map(s => ({ weight: s.weight ? +s.weight : 0, reps: s.reps ? +s.reps : 0, done: !!s.done })),
    }))
    try {
      const res = await fetch('/api/client/workout-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayIndex: dayIndex ?? 0,
          dayName:  day.name  || 'Workout',
          focus:    day.focus || '',
          durationMins: Math.min(300, Math.max(1, +duration || 1)),
          exercises,
          notes:  notes.trim().slice(0, 500),
          rating: Math.min(5, Math.max(1, +rating)),
        }),
      })
      if (res.ok) { setSaved(true); setTimeout(() => { onSaved?.(); onClose() }, 1500) }
    } catch {}
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-[70] flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-[#0a0a0a] px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-[#fbbf24] text-xs font-extrabold uppercase tracking-widest mb-0.5">سجّل جلستك</p>
            <p className="text-white font-extrabold text-base">{day.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition">
            <X className="w-4 h-4"/>
          </button>
        </div>

        {saved ? (
          <div className="px-6 py-10 text-center">
            <div className="text-5xl mb-3">🏆</div>
            <p className="text-xl font-extrabold text-slate-800">تم الحفظ!</p>
            <p className="text-slate-400 text-sm mt-1">أحسنت — جلستك سُجّلت بنجاح</p>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-5">
            {/* Duration */}
            <div>
              <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5"/> مدة التمرين (دقيقة)
              </label>
              <div className="flex items-center gap-3">
                <button onClick={() => setDuration(d => Math.max(1, d-5))} className="w-9 h-9 rounded-xl bg-slate-100 font-extrabold text-slate-600 hover:bg-slate-200 transition text-lg">-</button>
                <input type="number" value={duration} onChange={e => setDuration(+e.target.value)} min={1} max={300}
                  className="flex-1 text-center text-2xl font-extrabold text-slate-800 outline-none bg-slate-50 rounded-xl py-2"/>
                <button onClick={() => setDuration(d => Math.min(300, d+5))} className="w-9 h-9 rounded-xl bg-slate-100 font-extrabold text-slate-600 hover:bg-slate-200 transition text-lg">+</button>
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2">كيف كانت الجلسة؟</label>
              <div className="flex gap-2 justify-center">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setRating(n)}
                    className={`w-10 h-10 rounded-xl text-xl transition-all ${n <= rating ? 'bg-[#fbbf24]/20 scale-110' : 'bg-slate-100 opacity-40'}`}>
                    ⭐
                  </button>
                ))}
              </div>
              <p className="text-center text-xs text-slate-400 mt-1 font-medium">
                {['','ضعيف','مقبول','جيد','ممتاز','رائع! 🔥'][rating]}
              </p>
            </div>

            {/* Exercises summary */}
            <div className="bg-slate-50 rounded-2xl px-4 py-3 space-y-1.5">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">{exList.length} تمارين</p>
              {exList.map((ex, i) => {
                const sets = workoutSets[i] || []
                const doneSets = sets.filter(s => s.done).length
                return (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600 truncate max-w-[180px]">{ex.name}</span>
                    <span className={`text-xs font-extrabold ${doneSets === (sets.length || ex.sets) ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {doneSets}/{sets.length || ex.sets} جولة
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2">ملاحظات (اختياري)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} maxLength={500} rows={2}
                placeholder="كيف شعرت؟ هل زدت الأوزان؟..."
                className="w-full text-sm text-slate-700 bg-slate-50 rounded-2xl px-4 py-3 outline-none resize-none placeholder:text-slate-300 font-medium"
                dir="rtl"/>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full py-3.5 bg-[#0a0a0a] text-[#fbbf24] font-extrabold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#1a1a1a] transition disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <BookCheck className="w-4 h-4"/>}
              {saving ? 'جاري الحفظ...' : 'سجّل الجلسة'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Workout Card ─────────────────────────────────────────────────────────────
function WorkoutCard({day, date, isToday, dayIndex}) {
  const exList   = day.exercises || []
  const total    = exList.length
  const info     = getMuscleInfo(day.focus)
  const [doneExercises, setDoneExercises] = useState(new Set())
  const [workoutSets,   setWorkoutSets]   = useState({})
  const [showSave,      setShowSave]      = useState(false)
  const [sessionStart]                    = useState(Date.now)
  const [lastPerf,      setLastPerf]      = useState({})   // exercise name → best set last time

  // Load workout history once → show each exercise's last performance to beat
  useEffect(() => {
    let cancelled = false
    fetch('/api/client/workout-log')
      .then(r => (r.ok ? r.json() : []))
      .then(logs => {
        if (cancelled || !Array.isArray(logs)) return
        const perf = {}
        // logs are appended in order; walk newest→oldest, keep the first (latest) per exercise
        for (let k = logs.length - 1; k >= 0; k--) {
          for (const ex of (logs[k].exercises || [])) {
            const key = String(ex.name || '').trim().toLowerCase()
            if (!key || perf[key]) continue
            const best = (ex.sets || [])
              .filter(s => Number(s.weight) > 0)
              .sort((a, b) => Number(b.weight) - Number(a.weight))[0]
            if (best) perf[key] = { weight: Number(best.weight), reps: Number(best.reps) }
          }
        }
        setLastPerf(perf)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const handleComplete = useCallback((idx, done) => {
    setDoneExercises(prev => {
      const next = new Set(prev)
      done ? next.add(idx) : next.delete(idx)
      return next
    })
  }, [])

  const handleSetsUpdate = useCallback((idx, sets) => {
    setWorkoutSets(prev => ({...prev, [idx]: sets}))
  }, [])

  const doneCount = doneExercises.size
  const allDone   = doneCount === total && total > 0

  return (
    <>
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
          <div className="text-right flex-shrink-0 pb-1 flex flex-col items-end gap-2">
            <p className="text-4xl font-black text-[#fbbf24] leading-none">{total}</p>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-wide">Exercises</p>
            <button onClick={() => window.print()}
              className="print:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/70 text-[11px] font-bold rounded-xl transition">
              <Printer className="w-3 h-3" /> Print
            </button>
          </div>
        </div>
        <style>{`@media print { .print\\:hidden { display:none !important } aside, header { display:none !important } }`}</style>
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
                  last={lastPerf[String(ex.name||'').trim().toLowerCase()]}
                  onComplete={(done) => handleComplete(i, done)}
                  onSetsUpdate={(sets) => handleSetsUpdate(i, sets)}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-300 text-sm">No exercises for this day</div>
          )}
          <SectionBanner type="cooldown"/>
          <CardioSection cardio={day.cardio}/>
          {allDone && (
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-center py-4 rounded-2xl font-extrabold text-sm shadow-lg shadow-emerald-500/25">
              🏆 Workout Complete! Great job!
            </div>
          )}
          {/* Save workout button — visible once at least 1 exercise is started */}
          {doneCount > 0 && (
            <button onClick={() => setShowSave(true)}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-[#fbbf24] font-extrabold rounded-2xl transition-all active:scale-95 shadow-lg mt-1">
              <BookCheck className="w-4 h-4"/>
              سجّل جلستك {allDone ? '🏆' : `(${doneCount}/${total})`}
            </button>
          )}
        </div>
      </div>
    </div>

    {showSave && (
      <WorkoutSaveModal
        day={day}
        dayIndex={dayIndex}
        workoutSets={workoutSets}
        sessionStart={sessionStart}
        onClose={() => setShowSave(false)}
        onSaved={() => {}}
      />
    )}
    </>
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
const LEVEL_AR_CLIENT = { beginner:'مبتدئ', intermediate:'متوسط', advanced:'متقدم', returning:'عودة بعد انقطاع' }
function StatsBar({plan}) {
  const totalEx = plan.days.reduce((acc,d)=>acc+(d.exercises?.length||0),0)
  const items = [
    {icon:'💪',label:'Exercises', val:totalEx||null},
    {icon:'🎯',label:'المستوى',   val:plan.level ? (LEVEL_AR_CLIENT[plan.level] || plan.level) : null},
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

// ─── Plan Feedback ────────────────────────────────────────────────────────────
function PlanFeedback({ type }) {
  const [feedback, setFeedback] = useState(undefined)  // undefined=loading, null=none
  const [rating,   setRating]   = useState(0)
  const [note,     setNote]     = useState('')
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  useEffect(() => {
    fetch('/api/client/plan-feedback')
      .then(r => r.ok ? r.json() : { feedback: null })
      .then(d => setFeedback(d.feedback?.[type] || null))
      .catch(() => setFeedback(null))
  }, [type])

  async function submit() {
    if (!rating) return
    setSaving(true)
    try {
      await fetch('/api/client/plan-feedback', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ type, rating, note }),
      })
      setFeedback({ rating, note, ratedAt: new Date().toISOString() })
      setSaved(true)
    } finally { setSaving(false) }
  }

  if (feedback === undefined) return null

  const existing = feedback

  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
      <p className="text-sm font-extrabold text-slate-800 mb-3">
        {existing ? '⭐ تقييمك للبرنامج التدريبي' : 'كيف تجد البرنامج التدريبي؟'}
      </p>
      {existing && !saved ? (
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[1,2,3,4,5].map(n => (
              <span key={n} className={`text-2xl ${n <= existing.rating ? 'opacity-100' : 'opacity-20'}`}>⭐</span>
            ))}
          </div>
          {existing.note && <p className="text-xs text-slate-500 font-medium flex-1 truncate">"{existing.note}"</p>}
          <button onClick={() => { setRating(existing.rating); setNote(existing.note || ''); setSaved(false); setFeedback(null) }}
            className="text-xs text-slate-400 hover:text-slate-600 transition font-medium flex-shrink-0">تعديل</button>
        </div>
      ) : saved ? (
        <p className="text-emerald-600 text-sm font-bold">✅ شكراً على تقييمك!</p>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2 justify-center">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setRating(n)}
                className={`text-3xl transition-all active:scale-90 ${n <= rating ? 'opacity-100 scale-110' : 'opacity-25 hover:opacity-60'}`}>
                ⭐
              </button>
            ))}
          </div>
          {rating > 0 && (
            <>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} maxLength={300}
                placeholder="ملاحظاتك (اختياري)..."
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-amber-400 transition resize-none" />
              <button onClick={submit} disabled={saving}
                className="w-full py-2.5 bg-[#0a0a0a] text-[#fbbf24] font-bold rounded-xl text-sm hover:bg-[#1a1a1a] transition disabled:opacity-50">
                {saving ? 'جاري الإرسال...' : 'إرسال التقييم'}
              </button>
            </>
          )}
        </div>
      )}
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
  const startDate   = plan.startDate || null  // ISO string set when admin uploads the plan
  // Plan runs until the subscription ends. If there is no subscription end date,
  // the weekly schedule simply repeats (getPlanDayFromStart cycles via modulo) —
  // we must NOT invent a 30-day cutoff, which would silently "end" the plan for
  // an active client who has no explicit end date.
  const endDate     = client.subscriptionEndDate || null
  const isToday     = isSameDay(selectedDate, today)
  const planEnded   = endDate && +startOfDay(selectedDate) > +startOfDay(new Date(endDate))
  const planDayIdx  = getPlanDayFromStart(selectedDate, schedule, startDate, plan.days.length, endDate)
  const currentDay  = (planDayIdx !== null) ? plan.days[planDayIdx] : null

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-8">

      {/* Header */}
      <div>
        <p className="text-[11px] font-extrabold text-slate-300 uppercase tracking-[0.15em]">خطتي</p>
        <h1 className="text-xl font-extrabold text-slate-900 mt-0.5">{fmtDate(selectedDate)}</h1>
      </div>

      {/* Week Navigator */}
      <WeekNavigator today={today} selectedDate={selectedDate} onSelect={setSelectedDate} schedule={schedule} startDate={startDate} endDate={endDate}/>

      {/* Stats */}
      <StatsBar plan={plan}/>

      {/* Workout or Rest */}
      {planEnded
        ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-sm">
            <div className="text-5xl mb-3">🏁</div>
            <h2 className="text-lg font-extrabold text-slate-800">انتهت مدة هذه الخطة</h2>
            <p className="text-sm text-slate-400 mt-1.5">تواصل مع المدرب أمين لتجديد خطتك التدريبية</p>
          </div>
        )
        : currentDay
        ? <WorkoutCard key={selectedDate.toISOString()} day={currentDay} date={selectedDate} isToday={isToday} dayIndex={planDayIdx}/>
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

      {/* Plan Feedback */}
      <PlanFeedback type="training" />

      <p className="text-center text-slate-400 text-xs pb-2">
        أسئلة؟ <a href="tel:+97430653759" className="text-[#c9973b] font-bold hover:underline">تواصل مع المدرب أمين</a>
      </p>
    </div>
  )
}
