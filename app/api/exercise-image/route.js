import { NextResponse } from 'next/server'

// Static map → GitHub raw CDN (yuhonas/free-exercise-db) — no API call, always fast
const BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'
const IMG  = f => `${BASE}${f}/images/0.jpg`

const STATIC_MAP = {
  // Chest
  'Bench Press':              IMG('Barbell_Bench_Press_-_Medium_Grip'),
  'Barbell Bench Press':      IMG('Barbell_Bench_Press_-_Medium_Grip'),
  'Dumbbell Bench Press':     IMG('Dumbbell_Bench_Press'),
  'Incline Bench Press':      IMG('Barbell_Incline_Bench_Press_-_Medium_Grip'),
  'Incline Dumbbell Press':   IMG('Dumbbell_Incline_Bench_Press'),
  'Decline Press':            IMG('Barbell_Decline_Bench_Press'),
  'Chest Fly':                IMG('Dumbbell_Flyes'),
  'Cable Fly':                IMG('Cable_Cross-over'),
  'Push Up':                  IMG('Push-up'),
  'Dips':                     IMG('Chest_Dip'),
  // Back
  'Barbell Row':              IMG('Bent_Over_Barbell_Row'),
  'Seated Row':               IMG('Seated_Cable_Rows'),
  'Cable Row':                IMG('Seated_Cable_Rows'),
  'Lat Pulldown':             IMG('Lat_Pulldown_V-Bar'),
  'Pull Up':                  IMG('Pullup'),
  'Wide Grip Pull Up':        IMG('Wide-grip_Barbell_Curl'),
  'Romanian Deadlift':        IMG('Barbell_Romanian_Deadlift'),
  'Deadlift':                 IMG('Barbell_Deadlift'),
  // Shoulders
  'Shoulder Press':           IMG('Barbell_Shoulder_Press_-_Behind_Neck'),
  'Barbell Shoulder Press':   IMG('Barbell_Shoulder_Press_-_Behind_Neck'),
  'Overhead Press':           IMG('Barbell_Shoulder_Press_-_Behind_Neck'),
  'Military Press':           IMG('Barbell_Shoulder_Press_-_Behind_Neck'),
  'Lateral Raise':            IMG('Side_Lateral_Raise'),
  'Front Raise':              IMG('Front_Dumbbell_Raise'),
  'Dumbbell Front Raise':     IMG('Front_Dumbbell_Raise'),
  // Arms
  'Bicep Curl':               IMG('Barbell_Curl'),
  'Dumbbell Bicep Curl':      IMG('Dumbbell_Alternate_Bicep_Curl'),
  'Cable Bicep Curl':         IMG('Cable_Curl'),
  'Hammer Curl':              IMG('Hammer_Curl'),
  'Dumbbell Hammer Curl':     IMG('Hammer_Curl'),
  'Tricep Pushdown':          IMG('Tricep_Pushdown_-_Rope_Attachment'),
  'Tricep Extension':         IMG('Barbell_Lying_Triceps_Press'),
  // Legs
  'Squats':                   IMG('Barbell_Full_Squat'),
  'Barbell Squat':            IMG('Barbell_Full_Squat'),
  'Dumbbell Squat':           IMG('Dumbbell_Squat'),
  'Lunges':                   IMG('Barbell_Lunge'),
  'Hip Thrust':               IMG('Barbell_Hip_Thrust'),
  'Leg Press':                IMG('Leg_Press'),
  'Leg Extension':            IMG('Leg_Extensions'),
  'Leg Curl':                 IMG('Lying_Leg_Curls'),
  'Calf Raise':               IMG('Standing_Barbell_Calf_Raise'),
  'Calf Raises':              IMG('Standing_Barbell_Calf_Raise'),
  'Jump Squat':               IMG('Barbell_Jump_Squat'),
  'Box Jump':                 IMG('Box_Jump'),
  'Wall Sit':                 IMG('Wall_Squat'),
  // Core / Cardio
  'Plank':                    IMG('Front_Plank_with_Arm_Extension'),
  'Plank Hold':               IMG('Front_Plank_with_Arm_Extension'),
  'Side Plank':               IMG('Side_Plank'),
  'Crunches':                 IMG('Cross-Body_Crunch'),
  'Leg Raise':                IMG('Flat_Bench_Lying_Leg_Raise'),
  'Mountain Climbers':        IMG('Mountain_Climber'),
  'Burpee':                   IMG('Burpees_Over_the_Bar'),
  'High Knees':               IMG('Quick_Jump_on_Toes_(Slow)'),
}

// Normalise lookup key
function key(name) {
  return name?.toLowerCase().trim() ?? ''
}

const cache = new Map()

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name')?.trim()
  if (!name) return NextResponse.json({ url: null })

  // 1. Static map first — instant, no API call
  const staticUrl = STATIC_MAP[name] ?? STATIC_MAP[Object.keys(STATIC_MAP).find(k => key(k) === key(name))]
  if (staticUrl) return NextResponse.json({ url: staticUrl })

  // 2. Cached wger.de result
  const cacheKey = key(name)
  if (cache.has(cacheKey)) return NextResponse.json({ url: cache.get(cacheKey) })

  // 3. wger.de API fallback for unlisted exercises
  try {
    const res = await fetch(
      `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(name)}&language=english&format=json`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) throw new Error(`wger ${res.status}`)
    const data = await res.json()

    let url = data.suggestions?.[0]?.data?.image || null
    // wger may return relative paths — make absolute
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
