import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { getSubmissionById } from '@/lib/submissions'

// ── Heart Rate Zone calculator (Tanaka formula — more accurate than 220-age) ──
function calcZones(age) {
  const maxHR = Math.round(208 - 0.7 * (parseInt(age) || 30))
  return {
    max: maxHR,
    z1: { min: Math.round(maxHR * 0.50), max: Math.round(maxHR * 0.60), name: 'Zone 1 — Active Recovery',   pct: '50-60%' },
    z2: { min: Math.round(maxHR * 0.60), max: Math.round(maxHR * 0.70), name: 'Zone 2 — Aerobic Base',       pct: '60-70%' },
    z3: { min: Math.round(maxHR * 0.70), max: Math.round(maxHR * 0.80), name: 'Zone 3 — Aerobic Capacity',   pct: '70-80%' },
    z4: { min: Math.round(maxHR * 0.80), max: Math.round(maxHR * 0.90), name: 'Zone 4 — Lactate Threshold',  pct: '80-90%' },
    z5: { min: Math.round(maxHR * 0.90), max: maxHR,                    name: 'Zone 5 — VO₂ Max / Redline',  pct: '90-100%' },
  }
}

// ── Method selection based on full client profile ─────────────────────────────
function selectMethod(client) {
  const goal     = client.goal || 'maintain'
  const level    = client.trainingExperience || 'beginner'
  const activity = client.activityLevel || 'moderate'
  const location = client.trainingLocation || 'gym'

  const hasHealthLimit = client.hasChronicDisease === 'yes' ||
    client.hasHormonalIssues === 'yes' ||
    client.hasDigestiveIssues === 'yes' ||
    (client.medications && client.medications.trim() !== '')

  const hasPhysicalLimit = client.hasPhysicalLimitations === 'yes'
  const isHomeOnly = location === 'home'

  if (hasHealthLimit || hasPhysicalLimit)                return 'liss_strength'
  if (goal === 'loss' && activity === 'sedentary')       return isHomeOnly ? 'circuit' : 'liss_strength'
  if (goal === 'loss' && (activity === 'light' || activity === 'moderate')) return 'hiit_zone2'
  if (goal === 'loss' && (activity === 'active' || activity === 'veryActive')) return 'tabata'
  if (goal === 'gain' && level === 'beginner')           return isHomeOnly ? 'circuit' : 'progressive_overload'
  if (goal === 'gain' && level === 'intermediate')       return 'rpe_periodization'
  if (goal === 'gain' && level === 'advanced')           return 'rpe_periodization'
  if (goal === 'performance')                            return 'polarized'
  if (goal === 'maintain' && level === 'advanced')       return 'hybrid'
  if (goal === 'maintain')                               return isHomeOnly ? 'circuit' : 'hybrid'
  return 'circuit'
}

const METHOD_LABELS = {
  hiit_zone2:           { name: 'HIIT + Zone 2',              emoji: '🔥', tagline: 'حرق الدهون الأمثل علمياً' },
  tabata:               { name: 'Tabata Protocol',            emoji: '⚡', tagline: 'الحد الأقصى في أقل وقت ممكن' },
  progressive_overload: { name: 'Progressive Overload',       emoji: '💪', tagline: 'بناء العضلة بمنهج علمي تدريجي' },
  rpe_periodization:    { name: 'RPE-Based Periodization',    emoji: '📈', tagline: 'تدوير التدريب لنمو متواصل' },
  polarized:            { name: 'Polarized Training (80/20)', emoji: '🏆', tagline: 'منهج النخبة للأداء الرياضي' },
  hybrid:               { name: 'Hybrid Strength-Cardio',     emoji: '⚖️', tagline: 'قوة + لياقة في برنامج واحد متوازن' },
  liss_strength:        { name: 'LISS + Functional Strength', emoji: '🌿', tagline: 'تدريب آمن ومتوازن مع مراعاة الحالة الصحية' },
  circuit:              { name: 'MetCon Circuit Training',    emoji: '🔄', tagline: 'لياقة شاملة عبر دوائر تدريبية متكاملة' },
}

const SYSTEM_PROMPT = `You are a world-class strength and conditioning scientist (CSCS, PhD) specializing in evidence-based training protocols. Your recommendations are grounded in the latest peer-reviewed research (2020-2024).

EVIDENCE BASE: Reference these landmark studies where relevant:
- Zone 2 training: Seiler (2010, 2019), Maunder et al. (2021), Iñigo San Millán research
- HIIT: Gibala et al. (2022), MacInnis & Gibala (2017), Weston et al. (2023)
- Resistance training: Schoenfeld (2020, 2022), Krieger meta-analysis (2021), Ralston et al. (2022)
- Periodization: Harries et al. (2015), Williams et al. (2017), Bartolomei et al. (2021)
- RPE/RIR: Helms et al. (2020), Zourdos et al. (2021)

CRITICAL OUTPUT RULES:
- Return ONLY valid JSON — no markdown, no explanations, no extra text
- Exercise names MUST be in English (standard gym terminology)
- All Arabic fields: whyYou, science, weeklyStructure[].description, keyPrinciples[].desc, weekNotes, recoveryTips[]
- Day names in English inside weeklyStructure[].day
- intensityLevel must be exactly one of: "low" | "moderate" | "high" | "very-high"
- heartRateZone: use EXACT computed zones provided in the prompt (e.g. "Zone 2 — 118-138 bpm")
- All 5 zones must be used appropriately across the weekly structure
- duration: Arabic format like "45 دقيقة"
- Include warm-up and cool-down guidance in session notes`

function buildPrompt(client, methodKey) {
  const method = METHOD_LABELS[methodKey]
  const zones  = calcZones(client.age)

  const goal     = { loss: 'Fat Loss', gain: 'Muscle Gain', maintain: 'Weight Maintenance', performance: 'Athletic Performance' }[client.goal] || 'General Fitness'
  const level    = { beginner: 'Beginner (0-1 yr)', intermediate: 'Intermediate (1-3 yr)', advanced: 'Advanced (3+ yr)' }[client.trainingExperience] || 'Beginner'
  const activ    = { sedentary: 'Sedentary (desk job, no exercise)', light: 'Lightly Active (1-2×/week)', moderate: 'Moderately Active (3-4×/week)', active: 'Active (5-6×/week)', veryActive: 'Very Active (athlete/physical job)' }[client.activityLevel] || 'Moderate'
  const stress   = { yes: 'High psychological stress', no: 'No stress', sometimes: 'Occasional stress' }[client.hasPsychStress] || 'Unknown'
  const location = { gym: 'Gym (full equipment)', home: 'Home (limited/no equipment — bodyweight focus)', outdoor: 'Outdoor (park, track — no equipment)', combination: 'Combination (gym + home/outdoor)' }[client.trainingLocation] || 'Gym'
  const days     = client.availableTrainingDays ? `${client.availableTrainingDays} days/week` : '3-4 days/week'
  const timeline = { '1month': 'Urgent — under 1 month', '3months': '1-3 months', '6months': '3-6 months', long: 'Long-term (6+ months)' }[client.goalTimeline] || 'No specific deadline'
  const commit   = { high: 'High commitment', medium: 'Medium commitment', low: 'Low commitment' }[client.commitment] || 'Medium'
  const appetite = { high: 'High appetite (overeating tendency)', medium: 'Normal appetite', low: 'Low appetite (undereating tendency)' }[client.appetite] || 'Normal'

  // Full health profile
  const healthFlags = [
    client.hasChronicDisease     === 'yes' ? `Chronic disease: ${client.chronicDiseaseNote || 'yes'}` : null,
    client.hasDigestiveIssues    === 'yes' ? `Digestive issues: ${client.digestiveIssuesNote || 'yes'}` : null,
    client.hasHormonalIssues     === 'yes' ? `Hormonal issues: ${client.hormonalIssuesNote || 'yes'}` : null,
    client.hasPhysicalLimitations=== 'yes' ? `Physical limitations/injuries: ${client.physicalLimitationsNote || 'yes'}` : null,
    client.medications?.trim()              ? `Medications: ${client.medications}` : null,
    client.foodAllergy?.trim()              ? `Allergies: ${client.foodAllergy}` : null,
  ].filter(Boolean).join('\n- ') || 'None reported'

  // Medical data section
  const medicalData = [
    client.hasInBody === 'yes' && client.inBodyNote?.trim() ? `Body composition (InBody): ${client.inBodyNote}` : null,
    client.hasNFS    === 'yes' && client.nfsNote?.trim()    ? `Blood tests (NFS): ${client.nfsNote}` : null,
  ].filter(Boolean).join('\n- ') || 'No recent tests provided'

  return `Generate a complete ${method.name} training protocol for this client.

═══ CLIENT PROFILE ═══
Goal: ${goal} | Timeline: ${timeline}
Training Experience: ${level} | Commitment: ${commit}
Activity Level: ${activ}
Age: ${client.age || '?'} yrs | Gender: ${client.gender === 'male' ? 'Male' : 'Female'}
Weight: ${client.weight || '?'} kg | Height: ${client.height || '?'} cm | Target: ${client.targetWeight || '?'} kg
Sleep: ${client.sleepHours || '7'} hrs/night | Stress: ${stress} | Appetite: ${appetite}
Hydration: ${client.waterIntake || '?'} L/day
Work type: ${client.workActivity || 'office work'}
Sport/activity background: ${client.sportType || 'none'}
Previous programs: ${client.previousPrograms?.trim() || 'none mentioned'}

═══ TRAINING ENVIRONMENT ═══
Location: ${location}
Available training days: ${days}
IMPORTANT: Generate EXACTLY ${client.availableTrainingDays || '3'} sessions in weeklyStructure.
${location.includes('Home') || location.includes('home') ? 'CRITICAL: Use only bodyweight exercises or minimal equipment (dumbbells, resistance bands). NO barbell/machine exercises.' : ''}
${location.includes('Outdoor') || location.includes('outdoor') ? 'CRITICAL: Use outdoor-compatible exercises only (running, bodyweight, sprints). NO gym equipment.' : ''}

═══ HEALTH STATUS ═══
- ${healthFlags}

═══ MEDICAL DATA ═══
- ${medicalData}

═══ PERSONALIZED HEART RATE ZONES (Tanaka formula: 208 − 0.7×age) ═══
Max HR: ${zones.max} bpm
Zone 1 (${zones.z1.pct}): ${zones.z1.min}–${zones.z1.max} bpm — Active Recovery
Zone 2 (${zones.z2.pct}): ${zones.z2.min}–${zones.z2.max} bpm — Aerobic Base (fat oxidation peak)
Zone 3 (${zones.z3.pct}): ${zones.z3.min}–${zones.z3.max} bpm — Aerobic Capacity (tempo)
Zone 4 (${zones.z4.pct}): ${zones.z4.min}–${zones.z4.max} bpm — Lactate Threshold
Zone 5 (${zones.z5.pct}): ${zones.z5.min}–${zones.z5.max} bpm — VO₂ Max / Redline

Use EXACTLY these bpm values in heartRateZone fields. Assign appropriate zones per session type.

═══ REQUIRED JSON OUTPUT ═══
{
  "methodKey": "${methodKey}",
  "methodName": "${method.name}",
  "emoji": "${method.emoji}",
  "tagline": "${method.tagline}",
  "maxHR": ${zones.max},
  "zoneRanges": {
    "z1": "${zones.z1.min}–${zones.z1.max} bpm",
    "z2": "${zones.z2.min}–${zones.z2.max} bpm",
    "z3": "${zones.z3.min}–${zones.z3.max} bpm",
    "z4": "${zones.z4.min}–${zones.z4.max} bpm",
    "z5": "${zones.z5.min}–${zones.z5.max} bpm"
  },
  "whyYou": "2-3 Arabic sentences explaining why THIS protocol fits THIS specific client — reference their actual data (age, goal, health status, level)",
  "science": "1-2 Arabic sentences citing 2022-2024 research evidence for this method",
  "weeklyStructure": [
    {
      "day": "English day name",
      "type": "Session type in English",
      "duration": "X دقيقة",
      "intensityLevel": "low|moderate|high|very-high",
      "heartRateZone": "Zone X — XXX–XXX bpm",
      "description": "Arabic session description",
      "exercises": ["ExerciseName1", "ExerciseName2", "ExerciseName3"],
      "warmUp": "Arabic warm-up instruction (3-5 min)",
      "coolDown": "Arabic cool-down instruction (3-5 min)",
      "notes": "Arabic coaching cue"
    }
  ],
  "keyPrinciples": [
    { "title": "English principle name", "desc": "Arabic explanation with scientific basis" }
  ],
  "weeklyStats": {
    "sessions": number,
    "totalMinutes": number,
    "intensityProfile": "Arabic: e.g. يومان Zone 2 + يوم Zone 4-5"
  },
  "weekNotes": "Arabic overall coaching note",
  "recoveryTips": ["Arabic tip 1", "Arabic tip 2", "Arabic tip 3"]
}`
}

// ── Fallback ──────────────────────────────────────────────────────────────────
function buildFallback(client, methodKey) {
  const zones = calcZones(client.age)
  return {
    methodKey, methodName: METHOD_LABELS[methodKey]?.name || 'HIIT + Zone 2',
    emoji: METHOD_LABELS[methodKey]?.emoji || '🔥',
    tagline: METHOD_LABELS[methodKey]?.tagline || 'حرق الدهون الأمثل علمياً',
    maxHR: zones.max,
    zoneRanges: {
      z1: `${zones.z1.min}–${zones.z1.max} bpm`,
      z2: `${zones.z2.min}–${zones.z2.max} bpm`,
      z3: `${zones.z3.min}–${zones.z3.max} bpm`,
      z4: `${zones.z4.min}–${zones.z4.max} bpm`,
      z5: `${zones.z5.min}–${zones.z5.max} bpm`,
    },
    whyYou: 'الجمع بين Zone 2 و HIIT يُحقق أعلى معدل حرق دهون بناءً على هدفك ومستوى نشاطك — Zone 2 يُحسّن كفاءة الميتوكوندريا بينما HIIT يرفع معدل الأيض الأساسي لـ 24 ساعة.',
    science: 'Gibala et al. (2022) و Seiler (2019) أثبتوا أن هذا التوليف يُعظّم حرق الدهون مع تحسين اللياقة القلبية بشكل متوازٍ.',
    weeklyStructure: [
      { day: 'Monday', type: 'Zone 2 Cardio', duration: '45 دقيقة', intensityLevel: 'low', heartRateZone: `Zone 2 — ${zones.z2.min}–${zones.z2.max} bpm`, description: 'كارديو هوائي طويل المدى لبناء القاعدة الأيضية', exercises: ['Brisk Walking', 'Cycling', 'Light Jogging'], warmUp: 'مشي خفيف 5 دقائق مع تمدد ديناميكي', coolDown: 'تمدد ثابت 5 دقائق للساقين والورك', notes: 'يجب أن تستطيع التحدث بجملة كاملة أثناء التمرين — إذا لهثت فالشدة مرتفعة جداً' },
      { day: 'Wednesday', type: 'HIIT', duration: '25 دقيقة', intensityLevel: 'very-high', heartRateZone: `Zone 4-5 — ${zones.z4.min}–${zones.z5.max} bpm`, description: '8 جولات Tabata (20 ثانية شدة / 10 ثانية راحة)', exercises: ['Sprint Intervals', 'Burpee', 'Mountain Climber', 'Jump Squat'], warmUp: 'إحماء ديناميكي 5 دقائق: لف الركبة، قفزات خفيفة', coolDown: 'مشي بطيء 5 دقائق + تنفس عميق', notes: 'الدفع الكامل في فترات العمل — التعافي التام في فترات الراحة' },
      { day: 'Friday', type: 'Zone 2 + Zone 3', duration: '40 دقيقة', intensityLevel: 'moderate', heartRateZone: `Zone 2-3 — ${zones.z2.min}–${zones.z3.max} bpm`, description: 'جلسة هوائية تدريجية تجمع الكثافة المنخفضة والمتوسطة', exercises: ['Swimming', 'Cycling', 'Elliptical'], warmUp: 'إطالة ديناميكية 3 دقائق', coolDown: 'تمدد ثابت شامل 5 دقائق', notes: 'ابدأ بـ Zone 2 لـ 20 دقيقة ثم ارفع الشدة تدريجياً إلى Zone 3' },
      { day: 'Saturday', type: 'HIIT + Core', duration: '30 دقيقة', intensityLevel: 'high', heartRateZone: `Zone 4 — ${zones.z4.min}–${zones.z4.max} bpm`, description: 'دوائر تدريبية عالية الشدة مع تقوية العضلة الوسطى', exercises: ['Kettlebell Swing', 'Box Jump', 'Battle Rope', 'Plank Hold', 'Russian Twist'], warmUp: 'إحماء كامل 5 دقائق: حركات مفصلية وتمدد نشط', coolDown: 'تمدد عضلات البطن والظهر والورك 5 دقائق', notes: 'لا تتجاوز 90 ثانية راحة بين الجولات — الهدف 4 جولات كاملة' },
    ],
    keyPrinciples: [
      { title: 'Zone 2 Mitochondrial Efficiency', desc: 'Zone 2 يُحسّن كفاءة الميتوكوندريا ويُعلّم الجسم على استخدام الدهون كمصدر طاقة أساسي — الأساس العلمي لأبحاث San Millán (2021)' },
      { title: 'EPOC Effect (Afterburn)', desc: 'HIIT يُولّد Excess Post-exercise Oxygen Consumption يرفع معدل الحرق لـ 14-24 ساعة بعد الانتهاء — Bahr & Sejersted (1991) محدَّث بـ Gibala (2022)' },
      { title: 'Polarized Intensity Distribution', desc: '80% من حجم التدريب بشدة منخفضة (Zone 1-2) و 20% بشدة عالية (Zone 4-5) — هذا التوزيع هو الأكثر فعالية علمياً بحسب Seiler (2019)' },
    ],
    weeklyStats: { sessions: 4, totalMinutes: 140, intensityProfile: 'يومان Zone 2 + يومان Zone 4-5' },
    weekNotes: 'جودة التعافي بين الجلسات بالغة الأهمية. النوم 7-8 ساعات ضروري للتكيّف الأيضي. لا تُضِف جلسات إضافية قبل 4 أسابيع.',
    recoveryTips: ['نم 7-8 ساعات يومياً — النوم هو الأداة الأولى للتعافي والنمو', 'اشرب ماءً كافياً (35 مل/كغ يومياً)', 'تمدد 10 دقائق بعد كل جلسة شدة عالية'],
  }
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
    return NextResponse.json({ protocol: buildFallback(client, methodKey) })
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
        max_tokens: 2500,
        system:     SYSTEM_PROMPT,
        messages:   [{ role: 'user', content: buildPrompt(client, methodKey) }],
      }),
    })

    if (!aiRes.ok) throw new Error(`AI ${aiRes.status}`)
    const aiData  = await aiRes.json()
    const raw     = aiData.content?.[0]?.text?.trim() || ''
    const protocol = JSON.parse(raw)
    return NextResponse.json({ protocol })
  } catch (err) {
    console.error('[ai-protocol]', err.message)
    return NextResponse.json({ protocol: buildFallback(client, methodKey) })
  }
}
