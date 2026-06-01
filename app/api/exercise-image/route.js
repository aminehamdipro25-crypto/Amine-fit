import { NextResponse } from 'next/server'

// All paths verified with HTTP HEAD against yuhonas/free-exercise-db main branch
const BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'
const IMG  = f => `${BASE}${f}/0.jpg`

const STATIC_MAP = {
  // ── Chest ──────────────────────────────────────────────────────────────────
  'Bench Press':                   IMG('Barbell_Bench_Press_-_Medium_Grip'),
  'Barbell Bench Press':           IMG('Barbell_Bench_Press_-_Medium_Grip'),
  'Dumbbell Bench Press':          IMG('Dumbbell_Bench_Press'),
  'Flat Dumbbell Press':           IMG('Dumbbell_Bench_Press'),
  'Incline Bench Press':           IMG('Barbell_Incline_Bench_Press_-_Medium_Grip'),
  'Barbell Incline Bench Press':   IMG('Barbell_Incline_Bench_Press_-_Medium_Grip'),
  'Incline Dumbbell Press':        IMG('Incline_Dumbbell_Press'),
  'Incline Press':                 IMG('Incline_Dumbbell_Press'),
  'Decline Press':                 IMG('Decline_Barbell_Bench_Press'),
  'Decline Bench Press':           IMG('Decline_Barbell_Bench_Press'),
  'Chest Fly':                     IMG('Dumbbell_Flyes'),
  'Dumbbell Fly':                  IMG('Dumbbell_Flyes'),
  'Dumbbell Flye':                 IMG('Dumbbell_Flyes'),
  'Dumbbell Flyes':                IMG('Dumbbell_Flyes'),
  'Pec Deck':                      IMG('Dumbbell_Flyes'),
  'Pec Deck Fly':                  IMG('Dumbbell_Flyes'),
  'Cable Fly':                     IMG('Cable_Crossover'),
  'Cable Crossover':               IMG('Cable_Crossover'),
  'Cable Chest Press':             IMG('Cable_Chest_Press'),
  'Chest Press':                   IMG('Cable_Chest_Press'),
  'Dips':                          IMG('Bench_Dips'),
  'Chest Dip':                     IMG('Bench_Dips'),
  'Bench Dips':                    IMG('Bench_Dips'),
  // ── Back ───────────────────────────────────────────────────────────────────
  'Barbell Row':                   IMG('Bent_Over_Barbell_Row'),
  'Bent Over Row':                 IMG('Bent_Over_Barbell_Row'),
  'Bent Over Barbell Row':         IMG('Bent_Over_Barbell_Row'),
  'Seal Row':                      IMG('Bent_Over_Barbell_Row'),
  'Pendlay Row':                   IMG('Bent_Over_Barbell_Row'),
  'T-Bar Row':                     IMG('Bent_Over_Barbell_Row'),
  'T Bar Row':                     IMG('Bent_Over_Barbell_Row'),
  'Chest Supported Row':           IMG('Bent_Over_Barbell_Row'),
  'Seated Row':                    IMG('Seated_Cable_Rows'),
  'Cable Row':                     IMG('Seated_Cable_Rows'),
  'Seated Cable Row':              IMG('Seated_Cable_Rows'),
  'Lat Pulldown':                  IMG('Seated_Cable_Rows'),
  'Pull Up':                       IMG('Chin-Up'),
  'Pullup':                        IMG('Chin-Up'),
  'Chin Up':                       IMG('Chin-Up'),
  'Chin-Up':                       IMG('Chin-Up'),
  'Wide Grip Pull Up':             IMG('Band_Assisted_Pull-Up'),
  'Neutral Grip Pull Up':          IMG('Chin-Up'),
  'Face Pull':                     IMG('Face_Pull'),
  'Cable Face Pull':               IMG('Cable_Face_Pull'),
  'Romanian Deadlift':             IMG('Romanian_Deadlift'),
  'Barbell Romanian Deadlift':     IMG('Romanian_Deadlift'),
  'Stiff Leg Deadlift':            IMG('Romanian_Deadlift'),
  'Deadlift':                      IMG('Barbell_Deadlift'),
  'Barbell Deadlift':              IMG('Barbell_Deadlift'),
  'Sumo Deadlift':                 IMG('Sumo_Deadlift'),
  'Good Morning':                  IMG('Good_Morning'),
  // ── Shoulders ──────────────────────────────────────────────────────────────
  'Shoulder Press':                IMG('Barbell_Shoulder_Press'),
  'Barbell Shoulder Press':        IMG('Barbell_Shoulder_Press'),
  'Overhead Press':                IMG('Barbell_Shoulder_Press'),
  'Barbell Overhead Press':        IMG('Barbell_Shoulder_Press'),
  'Military Press':                IMG('Barbell_Shoulder_Press'),
  'Dumbbell Shoulder Press':       IMG('Barbell_Shoulder_Press'),
  'Arnold Press':                  IMG('Arnold_Dumbbell_Press'),
  'Arnold Dumbbell Press':         IMG('Arnold_Dumbbell_Press'),
  'Lateral Raise':                 IMG('Side_Lateral_Raise'),
  'Dumbbell Lateral Raise':        IMG('Side_Lateral_Raise'),
  'Side Lateral Raise':            IMG('Side_Lateral_Raise'),
  'Upright Row':                   IMG('Bent_Over_Barbell_Row'),
  'Front Raise':                   IMG('Front_Dumbbell_Raise'),
  'Dumbbell Front Raise':          IMG('Front_Dumbbell_Raise'),
  'Front Dumbbell Raise':          IMG('Front_Dumbbell_Raise'),
  // ── Arms ───────────────────────────────────────────────────────────────────
  'Bicep Curl':                    IMG('Barbell_Curl'),
  'Barbell Curl':                  IMG('Barbell_Curl'),
  'Dumbbell Bicep Curl':           IMG('Dumbbell_Alternate_Bicep_Curl'),
  'Dumbbell Curl':                 IMG('Dumbbell_Alternate_Bicep_Curl'),
  'Cable Bicep Curl':              IMG('Barbell_Curl'),
  'Cable Curl':                    IMG('Barbell_Curl'),
  'Preacher Curl':                 IMG('Preacher_Curl'),
  'EZ Bar Curl':                   IMG('Preacher_Curl'),
  'Concentration Curl':            IMG('Dumbbell_Alternate_Bicep_Curl'),
  'Hammer Curl':                   IMG('Alternate_Hammer_Curl'),
  'Dumbbell Hammer Curl':          IMG('Alternate_Hammer_Curl'),
  'Tricep Pushdown':               IMG('Triceps_Pushdown'),
  'Triceps Pushdown':              IMG('Triceps_Pushdown'),
  'Tricep Extension':              IMG('Triceps_Pushdown'),
  'Triceps Extension':             IMG('Triceps_Pushdown'),
  'Triceps Rope Pushdown':         IMG('Triceps_Pushdown'),
  'Rope Pushdown':                 IMG('Triceps_Pushdown'),
  'Skull Crusher':                 IMG('Triceps_Pushdown'),
  'Overhead Tricep Extension':     IMG('Triceps_Pushdown'),
  'Tricep Dips':                   IMG('Bench_Dips'),
  // ── Legs ───────────────────────────────────────────────────────────────────
  'Squats':                        IMG('Barbell_Full_Squat'),
  'Squat':                         IMG('Barbell_Full_Squat'),
  'Barbell Squat':                 IMG('Barbell_Squat'),
  'Barbell Full Squat':            IMG('Barbell_Full_Squat'),
  'Dumbbell Squat':                IMG('Dumbbell_Squat'),
  'Hack Squat':                    IMG('Hack_Squat'),
  'Barbell Hack Squat':            IMG('Barbell_Hack_Squat'),
  'Sumo Squat':                    IMG('Barbell_Full_Squat'),
  'Jump Squat':                    IMG('Barbell_Full_Squat'),
  'Bulgarian Split Squat':         IMG('Barbell_Lunge'),
  'Split Squat':                   IMG('Barbell_Lunge'),
  'Lunges':                        IMG('Barbell_Lunge'),
  'Lunge':                         IMG('Barbell_Lunge'),
  'Barbell Lunge':                 IMG('Barbell_Lunge'),
  'Walking Lunge':                 IMG('Barbell_Lunge'),
  'Hip Thrust':                    IMG('Barbell_Hip_Thrust'),
  'Barbell Hip Thrust':            IMG('Barbell_Hip_Thrust'),
  'Glute Bridge':                  IMG('Barbell_Hip_Thrust'),
  'Glute Kickback':                IMG('Glute_Kickback'),
  'Leg Press':                     IMG('Leg_Press'),
  'Leg Extension':                 IMG('Leg_Extensions'),
  'Leg Extensions':                IMG('Leg_Extensions'),
  'Leg Curl':                      IMG('Lying_Leg_Curls'),
  'Lying Leg Curl':                IMG('Lying_Leg_Curls'),
  'Calf Raise':                    IMG('Standing_Barbell_Calf_Raise'),
  'Calf Raises':                   IMG('Standing_Barbell_Calf_Raise'),
  'Standing Calf Raise':           IMG('Standing_Barbell_Calf_Raise'),
  // ── Core / Cardio ──────────────────────────────────────────────────────────
  'Plank':                         IMG('Plank'),
  'Plank Hold':                    IMG('Plank'),
  'Crunches':                      IMG('Cross-Body_Crunch'),
  'Crunch':                        IMG('Cross-Body_Crunch'),
  'Leg Raise':                     IMG('Flat_Bench_Lying_Leg_Raise'),
  'Mountain Climbers':             IMG('Mountain_Climbers'),
  'Mountain Climber':              IMG('Mountain_Climbers'),
}

// Prefixes the AI prepends — strip and retry lookup
const PREFIXES = [
  'Barbell ','Dumbbell ','Machine ','Cable ','EZ Bar ','EZ-Bar ',
  'Kettlebell ','Band ','Rope ','Smith ','Assisted ','Weighted ',
  'Seated ','Standing ','Lying ','Incline ','Decline ','Close Grip ',
  'Wide Grip ','Narrow Grip ','Reverse ','Single Arm ','One Arm ',
]

function normalize(s) {
  // Collapse extra spaces, trim, lowercase
  return s?.replace(/\s+/g,' ').trim().toLowerCase() ?? ''
}

function lookup(name) {
  if (!name) return undefined
  const n = name.replace(/\s+/g,' ').trim()
  // 1. Exact match
  if (STATIC_MAP[n] !== undefined) return STATIC_MAP[n]
  // 2. Case-insensitive exact
  const lower = normalize(n)
  for (const k of Object.keys(STATIC_MAP)) {
    if (normalize(k) === lower) return STATIC_MAP[k]
  }
  // 3. Plural/singular normalisation (add/remove trailing s)
  const deS = lower.endsWith('s') ? lower.slice(0,-1) : lower + 's'
  for (const k of Object.keys(STATIC_MAP)) {
    if (normalize(k) === deS) return STATIC_MAP[k]
  }
  // 4. Strip leading modifier prefix and recurse
  for (const pre of PREFIXES) {
    if (n.toLowerCase().startsWith(pre.toLowerCase())) {
      const r = lookup(n.slice(pre.length))
      if (r !== undefined) return r
    }
  }
  // 5. Substring: longest key first (key contained in name or vice-versa)
  const keys = Object.keys(STATIC_MAP).sort((a,b) => b.length - a.length)
  for (const k of keys) {
    const kl = normalize(k)
    if (STATIC_MAP[k] && (lower.includes(kl) || kl.includes(lower))) {
      return STATIC_MAP[k]
    }
  }
  return undefined
}

const cache = new Map()

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name')?.trim()
  if (!name) return NextResponse.json({ url: null })

  // 1. Static map + fuzzy (instant, no network)
  const staticUrl = lookup(name)
  if (staticUrl !== undefined) return NextResponse.json({ url: staticUrl })

  // 2. Cached wger result
  const cacheKey = normalize(name)
  if (cache.has(cacheKey)) return NextResponse.json({ url: cache.get(cacheKey) })

  // 3. wger.de fallback for anything not in map
  try {
    const res = await fetch(
      `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(name)}&language=english&format=json`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) throw new Error(`wger ${res.status}`)
    const data = await res.json()

    let url = data.suggestions?.[0]?.data?.image || null
    if (url && url.startsWith('/')) url = `https://wger.de${url}`

    if (!url) {
      const baseId = data.suggestions?.[0]?.data?.base_id
      if (baseId) {
        const r2 = await fetch(
          `https://wger.de/api/v2/exerciseimage/?exercise_base=${baseId}&format=json&limit=1`,
          { signal: AbortSignal.timeout(4000) }
        )
        if (r2.ok) {
          const d2 = await r2.json()
          url = d2.results?.[0]?.image || null
          if (url && url.startsWith('/')) url = `https://wger.de${url}`
        }
      }
    }

    cache.set(cacheKey, url)
    return NextResponse.json({ url })
  } catch {
    cache.set(cacheKey, null)
    return NextResponse.json({ url: null })
  }
}
