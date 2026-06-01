import { NextResponse } from 'next/server'

// Verified working paths from yuhonas/free-exercise-db (path = exercises/{folder}/0.jpg)
const BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'
const IMG  = f => `${BASE}${f}/0.jpg`

const STATIC_MAP = {
  // ── Chest ──────────────────────────────────────────────────────────────────
  'Bench Press':                 IMG('Barbell_Bench_Press_-_Medium_Grip'),
  'Barbell Bench Press':         IMG('Barbell_Bench_Press_-_Medium_Grip'),
  'Dumbbell Bench Press':        IMG('Dumbbell_Bench_Press'),
  'Flat Dumbbell Press':         IMG('Dumbbell_Bench_Press'),
  'Incline Bench Press':         IMG('Barbell_Incline_Bench_Press_-_Medium_Grip'),
  'Barbell Incline Bench Press': IMG('Barbell_Incline_Bench_Press_-_Medium_Grip'),
  'Incline Dumbbell Press':      IMG('Incline_Dumbbell_Press'),
  'Incline Press':               IMG('Incline_Dumbbell_Press'),
  'Decline Press':               IMG('Decline_Barbell_Bench_Press'),
  'Decline Bench Press':         IMG('Decline_Barbell_Bench_Press'),
  'Chest Fly':                   IMG('Dumbbell_Flyes'),
  'Dumbbell Fly':                IMG('Dumbbell_Flyes'),
  'Dumbbell Flyes':              IMG('Dumbbell_Flyes'),
  'Machine Chest Fly':           IMG('Dumbbell_Flyes'),
  'Cable Fly':                   IMG('Cable_Crossover'),
  'Cable Crossover':             IMG('Cable_Crossover'),
  'Dips':                        IMG('Bench_Dips'),
  'Chest Dip':                   IMG('Bench_Dips'),
  'Bench Dips':                  IMG('Bench_Dips'),
  // ── Back ───────────────────────────────────────────────────────────────────
  'Barbell Row':                 IMG('Bent_Over_Barbell_Row'),
  'Bent Over Row':               IMG('Bent_Over_Barbell_Row'),
  'Bent Over Barbell Row':       IMG('Bent_Over_Barbell_Row'),
  'Seated Row':                  IMG('Seated_Cable_Rows'),
  'Cable Row':                   IMG('Seated_Cable_Rows'),
  'Seated Cable Row':            IMG('Seated_Cable_Rows'),
  'Lat Pulldown':                IMG('Seated_Cable_Rows'),
  'Pull Up':                     IMG('Band_Assisted_Pull-Up'),
  'Pullup':                      IMG('Band_Assisted_Pull-Up'),
  'Wide Grip Pull Up':           IMG('Band_Assisted_Pull-Up'),
  'Romanian Deadlift':           IMG('Romanian_Deadlift'),
  'Barbell Romanian Deadlift':   IMG('Romanian_Deadlift'),
  'Deadlift':                    IMG('Barbell_Deadlift'),
  'Barbell Deadlift':            IMG('Barbell_Deadlift'),
  // ── Shoulders ──────────────────────────────────────────────────────────────
  'Shoulder Press':              IMG('Barbell_Shoulder_Press'),
  'Barbell Shoulder Press':      IMG('Barbell_Shoulder_Press'),
  'Overhead Press':              IMG('Barbell_Shoulder_Press'),
  'Barbell Overhead Press':      IMG('Barbell_Shoulder_Press'),
  'Military Press':              IMG('Barbell_Shoulder_Press'),
  'Dumbbell Shoulder Press':     IMG('Barbell_Shoulder_Press'),
  'Lateral Raise':               IMG('Side_Lateral_Raise'),
  'Dumbbell Lateral Raise':      IMG('Side_Lateral_Raise'),
  'Side Lateral Raise':          IMG('Side_Lateral_Raise'),
  'Front Raise':                 IMG('Front_Dumbbell_Raise'),
  'Dumbbell Front Raise':        IMG('Front_Dumbbell_Raise'),
  'Front Dumbbell Raise':        IMG('Front_Dumbbell_Raise'),
  // ── Arms ───────────────────────────────────────────────────────────────────
  'Bicep Curl':                  IMG('Barbell_Curl'),
  'Barbell Curl':                IMG('Barbell_Curl'),
  'Dumbbell Bicep Curl':         IMG('Dumbbell_Alternate_Bicep_Curl'),
  'Dumbbell Curl':               IMG('Dumbbell_Alternate_Bicep_Curl'),
  'Cable Bicep Curl':            IMG('Barbell_Curl'),
  'Cable Curl':                  IMG('Barbell_Curl'),
  'Hammer Curl':                 IMG('Alternate_Hammer_Curl'),
  'Dumbbell Hammer Curl':        IMG('Alternate_Hammer_Curl'),
  'Tricep Pushdown':             IMG('Triceps_Pushdown'),
  'Triceps Pushdown':            IMG('Triceps_Pushdown'),
  'Tricep Extension':            IMG('Triceps_Pushdown'),
  'Triceps Extension':           IMG('Triceps_Pushdown'),
  'Triceps Rope Pushdown':       IMG('Triceps_Pushdown'),
  'Rope Pushdown':               IMG('Triceps_Pushdown'),
  // ── Legs ───────────────────────────────────────────────────────────────────
  'Squats':                      IMG('Barbell_Full_Squat'),
  'Squat':                       IMG('Barbell_Full_Squat'),
  'Barbell Squat':               IMG('Barbell_Squat'),
  'Barbell Full Squat':          IMG('Barbell_Full_Squat'),
  'Dumbbell Squat':              IMG('Dumbbell_Squat'),
  'Jump Squat':                  IMG('Barbell_Full_Squat'),
  'Lunges':                      IMG('Barbell_Lunge'),
  'Lunge':                       IMG('Barbell_Lunge'),
  'Barbell Lunge':               IMG('Barbell_Lunge'),
  'Hip Thrust':                  IMG('Barbell_Hip_Thrust'),
  'Barbell Hip Thrust':          IMG('Barbell_Hip_Thrust'),
  'Glute Bridge':                IMG('Barbell_Hip_Thrust'),
  'Leg Press':                   IMG('Leg_Press'),
  'Leg Extension':               IMG('Leg_Extensions'),
  'Leg Extensions':              IMG('Leg_Extensions'),
  'Leg Curl':                    IMG('Lying_Leg_Curls'),
  'Lying Leg Curl':              IMG('Lying_Leg_Curls'),
  'Calf Raise':                  IMG('Standing_Barbell_Calf_Raise'),
  'Calf Raises':                 IMG('Standing_Barbell_Calf_Raise'),
  'Standing Calf Raise':         IMG('Standing_Barbell_Calf_Raise'),
  // ── Core / Cardio ──────────────────────────────────────────────────────────
  'Plank':                       IMG('Plank'),
  'Plank Hold':                  IMG('Plank'),
  'Crunches':                    IMG('Cross-Body_Crunch'),
  'Crunch':                      IMG('Cross-Body_Crunch'),
  'Leg Raise':                   IMG('Flat_Bench_Lying_Leg_Raise'),
  'Mountain Climbers':           IMG('Mountain_Climbers'),
  'Mountain Climber':            IMG('Mountain_Climbers'),
}

// Equipment prefixes the AI tends to prepend — strip and retry
const PREFIXES = ['Barbell ','Dumbbell ','Machine ','Cable ','EZ Bar ','Kettlebell ','Band ','Rope ','Smith ']

function lookup(name) {
  if (!name) return undefined
  // 1. exact
  if (STATIC_MAP[name] !== undefined) return STATIC_MAP[name]
  // 2. case-insensitive exact
  const lower = name.toLowerCase()
  for (const k of Object.keys(STATIC_MAP)) {
    if (k.toLowerCase() === lower) return STATIC_MAP[k]
  }
  // 3. strip leading equipment prefix, retry
  for (const pre of PREFIXES) {
    if (name.startsWith(pre)) {
      const stripped = name.slice(pre.length)
      const r = lookup(stripped)
      if (r !== undefined) return r
    }
  }
  // 4. substring: any key contained in name or vice-versa (longest key first)
  const keys = Object.keys(STATIC_MAP).sort((a, b) => b.length - a.length)
  for (const k of keys) {
    if (STATIC_MAP[k] && (lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower))) {
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

  // 1. Static map (instant, no network)
  const staticUrl = lookup(name)
  if (staticUrl !== undefined) return NextResponse.json({ url: staticUrl })

  // 2. Cache
  const cacheKey = name.toLowerCase()
  if (cache.has(cacheKey)) return NextResponse.json({ url: cache.get(cacheKey) })

  // 3. wger.de fallback for unlisted exercises
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
