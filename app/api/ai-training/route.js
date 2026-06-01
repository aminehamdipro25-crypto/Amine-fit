import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'

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

  const body = await req.json()
  const { goal, level, daysPerWeek, equipment, injuries, age, gender } = body
  const n = parseInt(daysPerWeek) || 3

  const goalMap = { loss: 'fat loss and metabolic conditioning', gain: 'muscle hypertrophy and strength', maintain: 'general fitness and maintenance' }
  const levelMap = { beginner: 'beginner (0-1 year)', intermediate: 'intermediate (1-3 years)', advanced: 'advanced (3+ years)' }
  const equipMap = { gym: 'full commercial gym', home: 'home gym (dumbbells, bands, pull-up bar)', bodyweight: 'bodyweight only' }

  if (!process.env.ANTHROPIC_API_KEY) {
    const fb = FALLBACKS[n] || FALLBACKS[3]
    return NextResponse.json({ ...fb, daysPerWeek: n, ai: false })
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

  const safeInjuries = injuries ? String(injuries).slice(0, 200) : ''

  const userPrompt = `Create a ${n}-day/week training program:
- Goal: ${goalMap[goal] || 'general fitness'}
- Level: ${levelMap[level] || 'intermediate (1-3 years)'}
- Equipment: ${equipMap[equipment] || 'full gym'}
- Client: ${age ? age + ' years old' : 'age unspecified'}, ${gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : 'unspecified gender'}
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
