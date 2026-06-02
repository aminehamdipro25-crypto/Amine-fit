import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { getSubmissionById } from '@/lib/submissions'

// ── Method selection based on client profile ──────────────────────────────────
function selectMethod(client) {
  const goal     = client.goal || 'maintain'
  const level    = client.trainingExperience || 'beginner'
  const activity = client.activityLevel || 'moderate'
  const days     = parseInt(client.availableDays) || 4
  const hasLimit = client.hasChronicDisease === 'yes' || client.medications

  if (hasLimit) return 'liss_strength'
  if (goal === 'loss' && days <= 3) return 'tabata'
  if (goal === 'loss') return 'hiit_zone2'
  if (goal === 'gain' && level === 'beginner') return 'progressive_overload'
  if (goal === 'gain') return 'rpe_periodization'
  if (goal === 'performance') return 'polarized'
  if (goal === 'maintain') return 'hybrid'
  return 'circuit'
}

const METHOD_LABELS = {
  hiit_zone2:           { name: 'HIIT + Zone 2', emoji: '🔥', tagline: 'حرق الدهون الأمثل علمياً' },
  tabata:               { name: 'Tabata Protocol', emoji: '⚡', tagline: 'الحد الأقصى في أقل وقت ممكن' },
  progressive_overload: { name: 'Progressive Overload', emoji: '💪', tagline: 'بناء العضلة بمنهج علمي تدريجي' },
  rpe_periodization:    { name: 'RPE-Based Periodization', emoji: '📈', tagline: 'تدوير التدريب لنمو متواصل' },
  polarized:            { name: 'Polarized Training (80/20)', emoji: '🏆', tagline: 'منهج النخبة للأداء الرياضي' },
  hybrid:               { name: 'Hybrid Strength-Cardio', emoji: '⚖️', tagline: 'قوة + لياقة في برنامج واحد متوازن' },
  liss_strength:        { name: 'LISS + Strength', emoji: '🌿', tagline: 'تدريب آمن ومتوازن مع مراعاة الحالة الصحية' },
  circuit:              { name: 'MetCon Circuit Training', emoji: '🔄', tagline: 'لياقة شاملة عبر دوائر تدريبية متكاملة' },
}

const SYSTEM_PROMPT = `You are a world-class strength and conditioning scientist with expertise in evidence-based training methodology. Generate highly personalized training protocols.

CRITICAL OUTPUT RULES:
- Return ONLY valid JSON — no markdown, no explanations, no extra text
- Exercise names MUST be in English (e.g., "Box Jump", "Kettlebell Swing", "Sprint Interval")
- All Arabic fields: whyYou, science, weeklyStructure[].description, keyPrinciples[].desc, weekNotes
- Day names in English inside weeklyStructure[].day
- intensityLevel must be one of: "low" | "moderate" | "high" | "very-high"
- duration values like "20 دقيقة", "45 دقيقة"
- heartRateZone like "Zone 2 — 120-140 bpm" or null if not applicable`

function buildPrompt(client, methodKey) {
  const method = METHOD_LABELS[methodKey]
  const goal = { loss: 'حرق الدهون', gain: 'بناء العضلات', maintain: 'الحفاظ على الوزن', performance: 'أداء رياضي متقدم' }[client.goal] || 'لياقة عامة'
  const level = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' }[client.trainingExperience] || 'مبتدئ'
  const activ = { sedentary: 'خامل', light: 'خفيف', moderate: 'متوسط', active: 'نشط', veryActive: 'نشط جداً' }[client.activityLevel] || 'متوسط'

  return `Generate a complete ${method.name} training protocol for this client:

CLIENT PROFILE:
- Goal: ${goal}
- Training Experience: ${level}
- Activity Level: ${activ}
- Age: ${client.age || '?'} years | Gender: ${client.gender === 'male' ? 'Male' : 'Female'}
- Weight: ${client.weight || '?'} kg | Height: ${client.height || '?'} cm
- Target Weight: ${client.targetWeight || '?'} kg
- Sleep: ${client.sleepHours || '7'} hours/night
- Work type: ${client.workActivity || 'office'}
- Sport type: ${client.sportType || 'none'}
- Health issues: ${client.hasChronicDisease === 'yes' ? client.chronicDiseaseNote : 'none'}
- Medications: ${client.medications || 'none'}
- Psychological stress: ${client.hasPsychStress || 'no'}

Return this exact JSON structure:
{
  "methodKey": "${methodKey}",
  "methodName": "${method.name}",
  "emoji": "${method.emoji}",
  "tagline": "${method.tagline}",
  "whyYou": "2-3 sentences in Arabic explaining why THIS exact protocol fits THIS client's data",
  "science": "1-2 sentences in Arabic about the scientific evidence behind this method",
  "weeklyStructure": [
    {
      "day": "Day name in English (e.g. Monday / Session 1)",
      "type": "Workout type in English",
      "duration": "X دقيقة",
      "intensityLevel": "low|moderate|high|very-high",
      "heartRateZone": "Zone X — XX-XX bpm or null",
      "description": "Arabic description of this session",
      "exercises": ["Exercise 1 in English", "Exercise 2 in English"],
      "notes": "Arabic coaching cue for this day"
    }
  ],
  "keyPrinciples": [
    { "title": "Principle name in English", "desc": "Arabic explanation" }
  ],
  "weeklyStats": {
    "sessions": number,
    "totalMinutes": number,
    "intensityProfile": "Arabic summary e.g. يومان عالي + يومان منخفض"
  },
  "weekNotes": "Arabic overall coaching note for the week",
  "recoveryTips": ["Arabic tip 1", "Arabic tip 2", "Arabic tip 3"]
}`
}

// ── Fallback protocols if AI fails ────────────────────────────────────────────
const FALLBACKS = {
  hiit_zone2: {
    methodKey: 'hiit_zone2', methodName: 'HIIT + Zone 2', emoji: '🔥',
    tagline: 'حرق الدهون الأمثل علمياً',
    whyYou: 'الجمع بين Zone 2 و HIIT يُحقق أعلى معدل حرق دهون ممكن — Zone 2 يُحسّن الكفاءة الأيضية بينما HIIT يرفع معدل الأيض الأساسي لـ 24 ساعة بعد التمرين.',
    science: 'أثبتت دراسات Gibala (2012) و Laursen (2019) أن هذا التوليف يحرق 28% دهوناً أكثر من الكارديو التقليدي.',
    weeklyStructure: [
      { day: 'Monday', type: 'Zone 2 Cardio', duration: '45 دقيقة', intensityLevel: 'low', heartRateZone: 'Zone 2 — 120-140 bpm', description: 'كارديو هوائي طويل المدى بكثافة منخفضة لبناء القاعدة الهوائية', exercises: ['Brisk Walking', 'Cycling', 'Light Jogging'], notes: 'ينبغي أن تستطيع التحدث بجملة كاملة أثناء التمرين' },
      { day: 'Wednesday', type: 'HIIT', duration: '25 دقيقة', intensityLevel: 'very-high', heartRateZone: 'Zone 4-5 — 160-185 bpm', description: '8 جولات من الشدة القصوى لتحفيز الحرق الأيضي', exercises: ['Sprint Intervals (30s on / 30s off)', 'Burpee', 'Mountain Climber', 'Jump Squat'], notes: 'الدفع الكامل في فترات العمل — التعافي التام في فترات الراحة' },
      { day: 'Friday', type: 'Zone 2 Cardio', duration: '40 دقيقة', intensityLevel: 'low', heartRateZone: 'Zone 2 — 120-140 bpm', description: 'جلسة هوائية ثانية لتعزيز الحرق وبناء الاستقامة', exercises: ['Swimming', 'Cycling', 'Elliptical'], notes: 'ركّز على الاسترداد النشط' },
      { day: 'Saturday', type: 'HIIT + Core', duration: '30 دقيقة', intensityLevel: 'high', heartRateZone: 'Zone 4 — 155-175 bpm', description: 'تدريب متكامل يجمع الشدة العالية مع تقوية العضلة الوسطى', exercises: ['Kettlebell Swing', 'Box Jump', 'Battle Rope', 'Plank Hold (60s)', 'Russian Twist'], notes: 'لا تتجاوز 90 ثانية راحة بين الجولات' },
    ],
    keyPrinciples: [
      { title: 'Zone 2 Aerobic Base', desc: 'بناء القاعدة الهوائية يحسّن كفاءة الميتوكوندريا ويجعل الجسم يعتمد على الدهون كمصدر طاقة أساسي' },
      { title: 'EPOC Effect', desc: 'HIIT يُولّد تأثير EPOC (زيادة استهلاك الأكسجين بعد التمرين) لمدة تصل إلى 24 ساعة' },
      { title: 'Polarized Intensity', desc: 'معظم التدريب بشدة منخفضة (80%) وجرعة من الشدة العالية (20%) — هذا التوليف هو الأكثر فعالية علمياً' },
    ],
    weeklyStats: { sessions: 4, totalMinutes: 140, intensityProfile: 'يومان Zone 2 منخفض + يومان HIIT عالٍ' },
    weekNotes: 'لا تُضِف جلسات إضافية — جودة التعافي بين الجلسات بالغة الأهمية. النوم 7-8 ساعات ضروري للحرق.',
    recoveryTips: ['نم 7-8 ساعات يومياً — النوم هو أقوى أداة تعافٍ', 'اشرب 3 لترات ماء يومياً في أيام التمرين', 'تمدد لمدة 10 دقائق بعد كل جلسة HIIT'],
  },
}

export async function POST(req) {
  const deny = await requireAdmin()
  if (deny) return deny

  const { clientId } = await req.json()
  if (!clientId) return NextResponse.json({ error: 'clientId مطلوب' }, { status: 400 })

  const client = await getSubmissionById(clientId)
  if (!client) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })

  const methodKey = selectMethod(client)

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ protocol: FALLBACKS[methodKey] || FALLBACKS.hiit_zone2 })
  }

  try {
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        system:     SYSTEM_PROMPT,
        messages:   [{ role: 'user', content: buildPrompt(client, methodKey) }],
      }),
    })

    if (!aiRes.ok) throw new Error(`AI ${aiRes.status}`)
    const aiData = await aiRes.json()
    const raw    = aiData.content?.[0]?.text?.trim() || ''
    const protocol = JSON.parse(raw)
    return NextResponse.json({ protocol })
  } catch (err) {
    console.error('[ai-protocol]', err.message)
    return NextResponse.json({ protocol: FALLBACKS[methodKey] || FALLBACKS.hiit_zone2 })
  }
}
