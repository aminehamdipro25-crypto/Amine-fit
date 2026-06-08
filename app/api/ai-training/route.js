import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { isRateLimited } from '@/lib/rateLimit'

const SYSTEM_PROMPT = `You are an elite personal trainer and strength & conditioning specialist. Generate scientifically-sound, personalized training programs.

CRITICAL RULES:
- Exercise names MUST be in English ONLY — use standard English gym terminology (e.g., "Barbell Back Squat", "Lat Pulldown", "Dumbbell Shoulder Press", "Plank", "Calf Raise")
- NEVER write Arabic transliterations of exercise names (FORBIDDEN: "سكوات", "بلانك", "ليغ بريس", "كاف ريز" — use their English originals instead)
- tips[] and note fields may be in Arabic
- Day names must be in English (e.g., "Push Day", "Legs Day", "Upper Body A")
- The "focus" field must be one of these Arabic values only: صدر | ظهر | كتف | ذراع | أرجل | بطن | كارديو | كامل | صدر وكتف | ظهر وبايسبس
- Return ONLY valid JSON — no markdown fences, no explanations
- rest values: use "30s", "45s", "60s", "90s", "2 min", "3 min"
- reps values: strings like "8-10", "12", "15", "30s", "AMRAP", "each side"
- Include 4-7 exercises per day
- Order: heavy compound movements first, isolation last`

const FALLBACKS = {
  2: {
    title: 'برنامج 2 أيام — جسم كامل',
    days: [
      {
        name: 'Full Body A',
        focus: 'جسم كامل',
        exercises: [
          { name: 'Barbell Back Squat', sets: 4, reps: '8-10', rest: '2 min', notes: 'Keep chest up' },
          { name: 'Barbell Bench Press', sets: 3, reps: '8-10', rest: '90s', notes: 'Control the descent' },
          { name: 'Barbell Bent-Over Row', sets: 3, reps: '8-10', rest: '90s', notes: 'Retract scapula' },
          { name: 'Dumbbell Overhead Press', sets: 3, reps: '10-12', rest: '60s', notes: 'Brace core' },
          { name: 'Plank', sets: 3, reps: '45s hold', rest: '45s', notes: 'Neutral spine' },
        ],
      },
      {
        name: 'Full Body B',
        focus: 'جسم كامل',
        exercises: [
          { name: 'Romanian Deadlift', sets: 4, reps: '8-10', rest: '2 min', notes: 'Hip hinge, soft knees' },
          { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '90s', notes: 'Full range of motion' },
          { name: 'Lat Pulldown', sets: 3, reps: '10-12', rest: '90s', notes: 'Pull to upper chest' },
          { name: 'Dumbbell Lateral Raise', sets: 3, reps: '12-15', rest: '45s', notes: 'Lead with elbows' },
          { name: 'Cable Crunch', sets: 3, reps: '15-20', rest: '45s', notes: 'Exhale at contraction' },
        ],
      },
    ],
  },
  3: {
    daysPerWeek: 3, duration: 60, level: 'intermediate',
    note: 'اتبع البرنامج بانتظام وستلاحظ النتائج خلال 4-6 أسابيع.',
    tips: ['سخّن جيداً قبل كل جلسة (10 دقائق)', 'ركّز على الأداء الصحيح قبل زيادة الأوزان', 'اشرب ماء كافياً طوال التمرين'],
    days: [
      { name: 'Push Day', focus: 'صدر وكتف', description: 'صدر وكتف وترايسبس', exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: '8-10', rest: '90s', note: 'حافظ على لمس الصدر في كل تكرار' },
        { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '60s', note: '' },
        { name: 'Overhead Press', sets: 4, reps: '8-10', rest: '90s', note: '' },
        { name: 'Lateral Raise', sets: 3, reps: '15', rest: '45s', note: 'ارفع ببطء للأسفل' },
        { name: 'Tricep Pushdown', sets: 3, reps: '15', rest: '45s', note: '' },
      ]},
      { name: 'Pull Day', focus: 'ظهر وبايسبس', description: 'ظهر وبايسبس', exercises: [
        { name: 'Wide-Grip Pull-Up', sets: 4, reps: '6-8', rest: '90s', note: 'ابدأ الحركة بعضلة الظهر لا الذراع' },
        { name: 'Barbell Row', sets: 4, reps: '8-10', rest: '90s', note: '' },
        { name: 'Lat Pulldown', sets: 3, reps: '12', rest: '60s', note: '' },
        { name: 'Barbell Curl', sets: 3, reps: '10-12', rest: '60s', note: '' },
        { name: 'Hammer Curl', sets: 3, reps: '12', rest: '45s', note: '' },
      ]},
      { name: 'Legs Day', focus: 'أرجل', description: 'أرجل كاملة', exercises: [
        { name: 'Barbell Back Squat', sets: 4, reps: '8-10', rest: '2 min', note: 'ظهر مستقيم والركبة لا تتجاوز القدم' },
        { name: 'Leg Press', sets: 3, reps: '12', rest: '90s', note: '' },
        { name: 'Romanian Deadlift', sets: 3, reps: '10-12', rest: '90s', note: '' },
        { name: 'Leg Curl', sets: 3, reps: '15', rest: '60s', note: '' },
        { name: 'Standing Calf Raise', sets: 4, reps: '20', rest: '45s', note: '' },
      ]},
    ],
  },
  4: {
    daysPerWeek: 4, duration: 60, level: 'intermediate',
    note: 'برنامج Upper/Lower مثالي للنمو المتوازن.',
    tips: ['اتبع تسلسل التمارين للحصول على أفضل النتائج', 'زد الأوزان تدريجياً كل أسبوعين', 'النوم الكافي (7-8 ساعات) ضروري للتعافي'],
    days: [
      { name: 'Upper Body A', focus: 'صدر وظهر', description: 'الجزء العلوي أ — صدر وظهر', exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: '6-8', rest: '2 min', note: '' },
        { name: 'Barbell Row', sets: 4, reps: '6-8', rest: '2 min', note: '' },
        { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '90s', note: '' },
        { name: 'Cable Row', sets: 3, reps: '10-12', rest: '90s', note: '' },
      ]},
      { name: 'Lower Body A', focus: 'أرجل', description: 'الجزء السفلي أ — كوادريسبس', exercises: [
        { name: 'Barbell Back Squat', sets: 4, reps: '6-8', rest: '2 min', note: '' },
        { name: 'Leg Press', sets: 3, reps: '12', rest: '90s', note: '' },
        { name: 'Leg Extension', sets: 3, reps: '15', rest: '60s', note: '' },
        { name: 'Standing Calf Raise', sets: 4, reps: '15', rest: '45s', note: '' },
      ]},
      { name: 'Upper Body B', focus: 'كتف', description: 'الجزء العلوي ب — كتف وذراعين', exercises: [
        { name: 'Overhead Press', sets: 4, reps: '8-10', rest: '90s', note: '' },
        { name: 'Lat Pulldown', sets: 4, reps: '8-10', rest: '90s', note: '' },
        { name: 'Lateral Raise', sets: 3, reps: '15', rest: '45s', note: '' },
        { name: 'Barbell Curl', sets: 3, reps: '10-12', rest: '60s', note: '' },
        { name: 'Tricep Pushdown', sets: 3, reps: '12', rest: '60s', note: '' },
      ]},
      { name: 'Lower Body B', focus: 'أرجل وبطن', description: 'الجزء السفلي ب — هامسترينج وبطن', exercises: [
        { name: 'Romanian Deadlift', sets: 4, reps: '8-10', rest: '90s', note: 'ظهر مستقيم طوال الحركة' },
        { name: 'Walking Lunge', sets: 3, reps: '12 each', rest: '60s', note: '' },
        { name: 'Leg Curl', sets: 3, reps: '12', rest: '60s', note: '' },
        { name: 'Plank', sets: 3, reps: '45s', rest: '30s', note: '' },
        { name: 'Cable Crunch', sets: 3, reps: '20', rest: '30s', note: '' },
      ]},
    ],
  },
  6: {
    title: 'برنامج 6 أيام — Push/Pull/Legs',
    days: [
      {
        name: 'Push A',
        focus: 'صدر وكتف وترايسبس',
        exercises: [
          { name: 'Barbell Bench Press', sets: 4, reps: '6-8', rest: '2 min', notes: 'Arch back slightly' },
          { name: 'Incline Dumbbell Press', sets: 3, reps: '8-10', rest: '90s', notes: 'Full ROM' },
          { name: 'Dumbbell Overhead Press', sets: 3, reps: '8-10', rest: '90s', notes: 'Brace core' },
          { name: 'Cable Lateral Raise', sets: 3, reps: '12-15', rest: '45s', notes: 'Lead with elbows' },
          { name: 'Tricep Rope Pushdown', sets: 3, reps: '12-15', rest: '45s', notes: 'Full extension' },
          { name: 'Overhead Tricep Extension', sets: 3, reps: '12-15', rest: '45s', notes: 'Keep elbows in' },
        ],
      },
      {
        name: 'Pull A',
        focus: 'ظهر وبايسبس',
        exercises: [
          { name: 'Barbell Bent-Over Row', sets: 4, reps: '6-8', rest: '2 min', notes: 'Retract scapula' },
          { name: 'Weighted Pull-Up', sets: 3, reps: '6-8', rest: '2 min', notes: 'Full dead hang' },
          { name: 'Seated Cable Row', sets: 3, reps: '10-12', rest: '90s', notes: 'Elbows back' },
          { name: 'Face Pull', sets: 3, reps: '15-20', rest: '45s', notes: 'External rotation' },
          { name: 'Barbell Curl', sets: 3, reps: '10-12', rest: '60s', notes: 'No swinging' },
          { name: 'Hammer Curl', sets: 3, reps: '12-15', rest: '45s', notes: 'Neutral grip' },
        ],
      },
      {
        name: 'Legs A',
        focus: 'أرجل وبطن',
        exercises: [
          { name: 'Barbell Back Squat', sets: 4, reps: '6-8', rest: '3 min', notes: 'Depth below parallel' },
          { name: 'Romanian Deadlift', sets: 3, reps: '8-10', rest: '2 min', notes: 'Hip hinge' },
          { name: 'Leg Press', sets: 3, reps: '10-12', rest: '90s', notes: 'Full range' },
          { name: 'Leg Curl', sets: 3, reps: '12-15', rest: '60s', notes: 'Slow eccentric' },
          { name: 'Calf Raise', sets: 4, reps: '15-20', rest: '45s', notes: 'Full stretch at bottom' },
          { name: 'Ab Wheel Rollout', sets: 3, reps: '10-12', rest: '60s', notes: 'Control throughout' },
        ],
      },
      {
        name: 'Push B',
        focus: 'صدر وكتف وترايسبس',
        exercises: [
          { name: 'Incline Barbell Press', sets: 4, reps: '8-10', rest: '2 min', notes: 'Upper chest focus' },
          { name: 'Dumbbell Flat Fly', sets: 3, reps: '12-15', rest: '60s', notes: 'Slight elbow bend' },
          { name: 'Arnold Press', sets: 3, reps: '10-12', rest: '90s', notes: 'Rotate on the way up' },
          { name: 'Dumbbell Lateral Raise', sets: 4, reps: '15-20', rest: '45s', notes: 'Drop set last set' },
          { name: 'Skull Crusher', sets: 3, reps: '10-12', rest: '60s', notes: 'Lower to forehead' },
          { name: 'Cable Chest Fly', sets: 3, reps: '15-20', rest: '45s', notes: 'Squeeze at center' },
        ],
      },
      {
        name: 'Pull B',
        focus: 'ظهر وبايسبس',
        exercises: [
          { name: 'Deadlift', sets: 4, reps: '5', rest: '3 min', notes: 'Neutral spine throughout' },
          { name: 'Lat Pulldown', sets: 3, reps: '10-12', rest: '90s', notes: 'Pull to upper chest' },
          { name: 'One-Arm Dumbbell Row', sets: 3, reps: '10-12', rest: '60s', notes: 'Elbow high' },
          { name: 'Reverse Fly', sets: 3, reps: '15-20', rest: '45s', notes: 'Rear delt focus' },
          { name: 'Preacher Curl', sets: 3, reps: '10-12', rest: '60s', notes: 'Full extension' },
          { name: 'Concentration Curl', sets: 3, reps: '12-15', rest: '45s', notes: 'Peak contraction' },
        ],
      },
      {
        name: 'Legs B',
        focus: 'أرجل وبطن',
        exercises: [
          { name: 'Front Squat', sets: 4, reps: '6-8', rest: '3 min', notes: 'Elbows high' },
          { name: 'Bulgarian Split Squat', sets: 3, reps: '10-12', rest: '90s', notes: 'Per leg' },
          { name: 'Hack Squat', sets: 3, reps: '10-12', rest: '90s', notes: 'Controlled descent' },
          { name: 'Leg Extension', sets: 3, reps: '15-20', rest: '45s', notes: 'Quad isolation' },
          { name: 'Seated Calf Raise', sets: 4, reps: '15-20', rest: '45s', notes: 'Soleus focus' },
          { name: 'Hanging Leg Raise', sets: 3, reps: '12-15', rest: '60s', notes: 'Posterior tilt pelvis' },
        ],
      },
    ],
  },
  5: {
    daysPerWeek: 5, duration: 75, level: 'intermediate',
    note: 'برنامج PPL المتقدم لأقصى نمو عضلي.',
    tips: ['الراحة بين الأيام الشديدة أمر حيوي', 'تغذية ما بعد التمرين خلال 30-60 دقيقة', 'وثّق أوزانك وتكراراتك في كل جلسة'],
    days: [
      { name: 'Push A', focus: 'صدر', description: 'دفع أ — صدر ثقيل', exercises: [
        { name: 'Barbell Bench Press', sets: 5, reps: '5', rest: '3 min', note: '' },
        { name: 'Incline Dumbbell Press', sets: 4, reps: '8-10', rest: '90s', note: '' },
        { name: 'Cable Fly', sets: 3, reps: '15', rest: '60s', note: '' },
        { name: 'Overhead Press', sets: 3, reps: '10', rest: '90s', note: '' },
        { name: 'Tricep Dip', sets: 3, reps: '12', rest: '60s', note: '' },
      ]},
      { name: 'Pull A', focus: 'ظهر', description: 'سحب أ — ظهر ثقيل', exercises: [
        { name: 'Deadlift', sets: 4, reps: '5', rest: '3 min', note: 'أهم تمرين في البرنامج — ركّز على الأداء' },
        { name: 'Wide-Grip Pull-Up', sets: 4, reps: '6-8', rest: '90s', note: '' },
        { name: 'Cable Row', sets: 3, reps: '12', rest: '60s', note: '' },
        { name: 'Barbell Curl', sets: 3, reps: '10-12', rest: '60s', note: '' },
      ]},
      { name: 'Legs Day', focus: 'أرجل', description: 'أرجل شاملة', exercises: [
        { name: 'Barbell Back Squat', sets: 5, reps: '5', rest: '3 min', note: '' },
        { name: 'Leg Press', sets: 4, reps: '10', rest: '90s', note: '' },
        { name: 'Romanian Deadlift', sets: 3, reps: '12', rest: '90s', note: '' },
        { name: 'Leg Curl', sets: 3, reps: '15', rest: '60s', note: '' },
        { name: 'Standing Calf Raise', sets: 5, reps: '20', rest: '45s', note: '' },
      ]},
      { name: 'Push B', focus: 'كتف', description: 'دفع ب — كتف', exercises: [
        { name: 'Overhead Press', sets: 5, reps: '5', rest: '2 min', note: '' },
        { name: 'Arnold Press', sets: 3, reps: '10-12', rest: '60s', note: '' },
        { name: 'Lateral Raise', sets: 4, reps: '15', rest: '45s', note: '' },
        { name: 'Front Raise', sets: 3, reps: '15', rest: '45s', note: '' },
        { name: 'Tricep Pushdown', sets: 3, reps: '15', rest: '45s', note: '' },
      ]},
      { name: 'Pull B', focus: 'ظهر وبايسبس', description: 'سحب ب — ظهر وبايسبس', exercises: [
        { name: 'Lat Pulldown', sets: 4, reps: '10-12', rest: '90s', note: '' },
        { name: 'Barbell Row', sets: 4, reps: '8-10', rest: '90s', note: '' },
        { name: 'Face Pull', sets: 3, reps: '15', rest: '45s', note: '' },
        { name: 'Hammer Curl', sets: 3, reps: '12', rest: '60s', note: '' },
        { name: 'Reverse Curl', sets: 3, reps: '12', rest: '45s', note: '' },
      ]},
    ],
  },
}

export async function POST(req) {
  const deny = await requireAdmin()
  if (deny) return deny

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (await isRateLimited(`ai_training:${ip}`, 20, 3600)) {
    return NextResponse.json({ error: 'تجاوزت الحد المسموح — حاول لاحقاً' }, { status: 429 })
  }

  const body = await req.json()
  const { goal, level, daysPerWeek, equipment, injuries, age, gender } = body

  const VALID_GOALS  = new Set(['loss', 'gain', 'maintain', 'performance'])
  const VALID_LEVELS = new Set(['beginner', 'intermediate', 'advanced'])
  const VALID_EQUIP  = new Set(['gym', 'home', 'bodyweight'])
  const VALID_GENDER = new Set(['male', 'female'])

  const safeGoal  = VALID_GOALS.has(goal)   ? goal      : 'maintain'
  const safeLevel = VALID_LEVELS.has(level) ? level     : 'intermediate'
  const safeEquip = VALID_EQUIP.has(equipment) ? equipment : 'gym'
  const safeGender = VALID_GENDER.has(gender) ? gender   : null
  const n = Math.min(Math.max(parseInt(daysPerWeek) || 3, 2), 6)
  const safeAge = age && /^\d{1,3}$/.test(String(age)) ? parseInt(age) : null

  const goalMap = { loss: 'fat loss and metabolic conditioning', gain: 'muscle hypertrophy and strength', maintain: 'general fitness and maintenance', performance: 'athletic performance' }
  const levelMap = { beginner: 'beginner (0-1 year)', intermediate: 'intermediate (1-3 years)', advanced: 'advanced (3+ years)' }
  const equipMap = { gym: 'full commercial gym', home: 'home gym (dumbbells, bands, pull-up bar)', bodyweight: 'bodyweight only' }

  if (!process.env.ANTHROPIC_API_KEY) {
    const fb = FALLBACKS[n] || FALLBACKS[3]
    return NextResponse.json({ ...fb, daysPerWeek: n, level: safeLevel, ai: false })
  }

  const schema = `{
  "daysPerWeek": ${n},
  "duration": <minutes per session>,
  "level": "<beginner|intermediate|advanced>",
  "note": "<Arabic motivational note>",
  "tips": ["<Arabic tip>", "<Arabic tip>", "<Arabic tip>"],
  "days": [
    {
      "name": "<English day name>",
      "focus": "<Arabic from: صدر|ظهر|كتف|ذراع|أرجل|بطن|كارديو|كامل|صدر وكتف|ظهر وبايسبس>",
      "description": "<Arabic brief description>",
      "exercises": [
        { "name": "<English exercise name>", "sets": <number>, "reps": "<string>", "rest": "<string>", "note": "<Arabic tip or empty>" }
      ]
    }
  ]
}`

  const safeInjuries = (injuries ?? '').toString()
    .replace(/[<>"'`\\{}()[\];=\n\r]/g, '')
    .trim()
    .slice(0, 150)

  const userPrompt = `Create a ${n}-day/week training program:
- Goal: ${goalMap[safeGoal]}
- Level: ${levelMap[safeLevel]}
- Equipment: ${equipMap[safeEquip]}
- Client: ${safeAge ? safeAge + ' years old' : 'age unspecified'}, ${safeGender === 'male' ? 'Male' : safeGender === 'female' ? 'Female' : 'unspecified gender'}
${safeInjuries ? `- Injuries/Limitations: ${safeInjuries}` : ''}

Return exactly this JSON (${n} days):
${schema}`

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })
    const raw = response.content[0].text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    const plan = JSON.parse(raw)
    return NextResponse.json({ ...plan, ai: true })
  } catch (err) {
    console.error('[ai-training] fallback:', err.message)
    const fb = FALLBACKS[n] || FALLBACKS[3]
    return NextResponse.json({ ...fb, daysPerWeek: n, ai: false })
  }
}
