import { NextResponse } from 'next/server'
import { isRateLimited } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

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
  'Chin Up':                       IMG('Chin-Up'),
  'Chin-Up':                       IMG('Chin-Up'),
  'Inverted Row':                  IMG('Inverted_Row'),
  'Body Row':                      IMG('Inverted_Row'),
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
  // ── Push-Up family (bodyweight — verified path: Pushups) ─────────────────
  'Push-Up':                       IMG('Pushups'),
  'Push Up':                       IMG('Pushups'),
  'Pushup':                        IMG('Pushups'),
  'Push-Ups':                      IMG('Pushups'),
  'Push Ups':                      IMG('Pushups'),
  'Wide Push-Up':                  IMG('Pushups'),
  'Push-Up (Wide Grip)':           IMG('Pushups'),
  'Wide Grip Push-Up':             IMG('Pushups'),
  'Diamond Push-Up':               IMG('Pushups'),
  'Close-Grip Push-Up':            IMG('Pushups'),
  'Narrow Push-Up':                IMG('Pushups'),
  'Pike Push-Up':                  IMG('Pushups'),
  'Incline Push-Up':               IMG('Pushups'),
  'Decline Push-Up':               IMG('Pushups'),
  'Knee Push-Up':                  IMG('Pushups'),
  'Archer Push-Up':                IMG('Pushups'),
  'Clap Push-Up':                  IMG('Pushups'),
  'Push-Up Hold':                  IMG('Pushups'),
  // ── Pull-Up / Chin-Up family ──────────────────────────────────────────────
  'Pull Up':                       IMG('Pullups'),
  'Pullup':                        IMG('Pullups'),
  'Pull-Up':                       IMG('Pullups'),
  'Pullups':                       IMG('Pullups'),
  'Wide Grip Pull Up':             IMG('Pullups'),
  'Neutral Grip Pull Up':          IMG('Pullups'),
  // ── Legs ───────────────────────────────────────────────────────────────────
  'Squats':                        IMG('Barbell_Full_Squat'),
  'Squat':                         IMG('Barbell_Full_Squat'),
  'Barbell Squat':                 IMG('Barbell_Squat'),
  'Barbell Full Squat':            IMG('Barbell_Full_Squat'),
  'Dumbbell Squat':                IMG('Dumbbell_Squat'),
  'Goblet Squat':                  IMG('Dumbbell_Squat'),
  'Dumbbell Goblet Squat':         IMG('Dumbbell_Squat'),
  'Bodyweight Squat':              IMG('Bodyweight_Squat'),
  'Air Squat':                     IMG('Bodyweight_Squat'),
  'Hack Squat':                    IMG('Hack_Squat'),
  'Barbell Hack Squat':            IMG('Barbell_Hack_Squat'),
  // Bodyweight squats — null prevents substring-match to Barbell_Full_Squat
  'Pistol Squat':                  null,
  'Pistol Squats':                 null,
  'Jump Squat':                    null,
  'Jump Squats':                   null,
  'Jumping Squat':                 null,
  'Sumo Squat':                    null,
  'Box Jump':                      null,
  'Box Jumps':                     null,
  'Broad Jump':                    null,
  'Bulgarian Split Squat':         null,
  'Dumbbell Bulgarian Split Squat':null,
  'Split Squat':                   null,
  'Single-Leg Squat':              null,
  'Lunges':                        IMG('Barbell_Lunge'),
  'Lunge':                         IMG('Barbell_Lunge'),
  'Barbell Lunge':                 IMG('Barbell_Lunge'),
  'Walking Lunge':                 IMG('Barbell_Lunge'),
  'Dumbbell Reverse Lunge':        IMG('Bodyweight_Walking_Lunge'),
  'Dumbbell Walking Lunge':        IMG('Bodyweight_Walking_Lunge'),
  'Reverse Lunge':                 IMG('Bodyweight_Walking_Lunge'),
  'Bodyweight Reverse Lunge':      IMG('Bodyweight_Walking_Lunge'),
  'Hip Thrust':                    IMG('Barbell_Hip_Thrust'),
  'Barbell Hip Thrust':            IMG('Barbell_Hip_Thrust'),
  'Dumbbell Hip Thrust':           IMG('Barbell_Hip_Thrust'),
  'Glute Bridge':                  null,   // bodyweight — barbell hip thrust image is wrong
  'Glute Bridges':                 null,
  'Single-Leg Hip Thrust':         null,
  'Glute Bridge March':            null,
  'Glute Kickback':                IMG('Glute_Kickback'),
  'Donkey Kick':                   IMG('Glute_Kickback'),
  'Donkey Kicks':                  IMG('Glute_Kickback'),
  'Resistance Band Kickback':      IMG('Glute_Kickback'),
  'Leg Press':                     IMG('Leg_Press'),
  'Leg Extension':                 IMG('Leg_Extensions'),
  'Leg Extensions':                IMG('Leg_Extensions'),
  'Leg Curl':                      IMG('Lying_Leg_Curls'),
  'Lying Leg Curl':                IMG('Lying_Leg_Curls'),
  'Calf Raise':                    null,   // barbell calf raise wrong for BW/home
  'Calf Raises':                   null,
  'Standing Calf Raise':           null,
  'Single-Leg Calf Raise':         null,
  'Single Leg Calf Raise':         null,
  'Seated Calf Raise':             IMG('Standing_Barbell_Calf_Raise'),
  // ── Core / Cardio ──────────────────────────────────────────────────────────
  'Plank':                         IMG('Plank'),
  'Plank Hold':                    IMG('Plank'),
  'Crunches':                      IMG('Cross-Body_Crunch'),
  'Crunch':                        IMG('Cross-Body_Crunch'),
  'Leg Raise':                     IMG('Flat_Bench_Lying_Leg_Raise'),
  'Mountain Climbers':             IMG('Mountain_Climbers'),
  'Mountain Climber':              IMG('Mountain_Climbers'),
  // ── Cardio / Machines ─────────────────────────────────────────────────────
  'Rowing Machine':                IMG('Bent_Over_Barbell_Row'),
  'Row Machine':                   IMG('Bent_Over_Barbell_Row'),
  'Walking Lunges':                IMG('Barbell_Lunge'),
  // ── Additional common AI-generated names ──────────────────────────────────
  'Barbell Back Squat':            IMG('Barbell_Full_Squat'),
  'Back Squat':                    IMG('Barbell_Full_Squat'),
  'Front Squat':                   IMG('Barbell_Full_Squat'),
  'Reverse Curl':                  IMG('Barbell_Curl'),
  'Cable Crunch':                  IMG('Cross-Body_Crunch'),
  'Ab Crunch':                     IMG('Cross-Body_Crunch'),
  'Dumbbell Row':                  IMG('Bent_Over_Barbell_Row'),
  'Single Arm Dumbbell Row':       IMG('Bent_Over_Barbell_Row'),
  'One Arm Dumbbell Row':          IMG('Bent_Over_Barbell_Row'),
  'Seated Dumbbell Press':         IMG('Barbell_Shoulder_Press'),
  'Tricep Overhead Extension':     IMG('Triceps_Pushdown'),
  'Skull Crushers':                IMG('Triceps_Pushdown'),
  'Incline Curl':                  IMG('Dumbbell_Alternate_Bicep_Curl'),
  'Spider Curl':                   IMG('Dumbbell_Alternate_Bicep_Curl'),
  'Cable Lateral Raise':           IMG('Side_Lateral_Raise'),
  'Machine Lateral Raise':         IMG('Side_Lateral_Raise'),
  'Hip Abduction':                 IMG('Glute_Kickback'),
  'Seated Leg Curl':               IMG('Lying_Leg_Curls'),
  'Jump Rope':                     IMG('Mountain_Climbers'),
  'Burpee':                        IMG('Mountain_Climbers'),
  'Burpees':                       IMG('Mountain_Climbers'),
  'High Knees':                    IMG('Mountain_Climbers'),
  'Dead Bug':                      IMG('Dead_Bug'),
  'Flutter Kicks':                 IMG('Flutter_Kicks'),
  'Flutter Kick':                  IMG('Flutter_Kicks'),
  'Russian Twist':                 IMG('Cross-Body_Crunch'),
  'Bicycle Crunch':                IMG('Cross-Body_Crunch'),
  'Hanging Leg Raise':             IMG('Flat_Bench_Lying_Leg_Raise'),
  'Ab Wheel Rollout':              IMG('Plank'),
  'Hollow Body Hold':              IMG('Plank'),
  'Superman':                      IMG('Superman'),
  'Superman Hold':                 IMG('Superman'),
  'Hyperextension':                IMG('Good_Morning'),
  'Back Extension':                IMG('Good_Morning'),
  'Rack Pull':                     IMG('Barbell_Deadlift'),
  'Trap Bar Deadlift':             IMG('Barbell_Deadlift'),
  'Hex Bar Deadlift':              IMG('Barbell_Deadlift'),
  'Step Up':                       null,
  'Step-Up':                       null,
  'Curtsy Lunge':                  IMG('Barbell_Lunge'),
  'Lateral Lunge':                 IMG('Barbell_Lunge'),
  'Kettlebell Swing':              null,
  'KB Swing':                      null,
  'Kettlebell Swings':             null,
  // Pull/bodyweight
  'Dead Hang':                     null,
  'Inverted Rows':                 IMG('Inverted_Row'),
  'Scapula Push-Up':               IMG('Push-Up'),
  'Hollow Body':                   IMG('Plank'),
}

// Prefixes the AI prepends — strip and retry lookup
const PREFIXES = [
  'Barbell ','Dumbbell ','Machine ','Cable ','EZ Bar ','EZ-Bar ',
  'Kettlebell ','Band ','Rope ','Smith ','Assisted ','Weighted ',
  'Seated ','Standing ','Lying ','Incline ','Decline ','Close Grip ',
  'Wide Grip ','Narrow Grip ','Reverse ','Single Arm ','One Arm ',
]

function normalize(s) {
  // Normalize hyphens to spaces, collapse extra spaces, trim, lowercase
  return s?.replace(/-/g,' ').replace(/\s+/g,' ').trim().toLowerCase() ?? ''
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
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (await isRateLimited(`ex_img:${ip}`, 60, 60)) {
    return NextResponse.json({ url: null }, { status: 429 })
  }

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
