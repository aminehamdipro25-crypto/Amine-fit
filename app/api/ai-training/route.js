import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { isRateLimited } from '@/lib/rateLimit'
import { getExerciseListForPrompt, validateAndFix } from '@/lib/exerciseDb'

export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT_BASE = `You are an elite personal trainer and strength & conditioning specialist. Generate scientifically-sound, personalized training programs.

CRITICAL RULES:
- Exercise names MUST be in English ONLY — use standard English gym terminology (e.g., "Barbell Back Squat", "Lat Pulldown", "Dumbbell Shoulder Press", "Plank", "Calf Raise")
- NEVER write Arabic transliterations of exercise names (FORBIDDEN: "سكوات", "بلانك", "ليغ بريس", "كاف ريز" — use their English originals instead)
- tips[], note, and description fields may be in Arabic
- Day names must be in English (e.g., "Push Day", "Legs Day", "Upper Body A")
- The "focus" field must be one of these Arabic values only: صدر | ظهر | كتف | ذراع | أرجل | بطن | كارديو | كامل | صدر وكتف | ظهر وبايسبس
- Return ONLY valid JSON — no markdown fences, no explanations
- rest values: use "30s", "45s", "60s", "90s", "2 min", "3 min"
- reps values: strings like "8-10", "12", "15", "30s", "AMRAP", "each side"
- Include 4-7 exercises per day
- Order: heavy compound movements first, isolation last
- NEVER place the same muscle group on consecutive days

GOAL-SPECIFIC PROGRAMMING — apply the matching protocol with precision:

BULK (muscle mass / hypertrophy / bulking phase):
- Reps: 6-12 | Rest: 60-90s
- Volume: 16-20 working sets per muscle per week
- Progressive overload: add "+2.5 kg or +1 rep" instruction in note on all main compound exercises
- Exercise order: heavy compound first (Squat/Deadlift/Bench/Row/OHP), then isolation
- Include drop sets on last set of at least 1 isolation exercise per day
- Recommended splits: PPL or Upper/Lower for 4-6 days; Full Body for 2-3 days

CUT (fat loss / shredding / cutting phase):
- Reps: 12-20 | Rest: 30-60s
- Volume: 12-16 working sets per muscle per week
- Supersets: group exercises in superset pairs (antagonist muscles: chest+back, biceps+triceps)
- Circuit finisher: mandatory 3-exercise metabolic circuit at end of each day (no rest between exercises, 45s rest after each round, 3 rounds total)
- Main compound lifts: always keep 8-10 reps minimum — never drop below 6 reps on Squat/Deadlift/Bench
- Include 1 cardio/conditioning exercise per day (Box Jump, Burpee, Jump Rope, or Mountain Climber)

RECOMP (body recomposition — simultaneous fat loss + muscle gain):
- Reps: 6-8 for compound movements, 12-15 for isolation | Rest: 60-75s
- Strategy: start each day with 2 heavy compound sets (6-8 reps), then moderate volume (12-15 reps)
- Preferred split: Full Body or Upper/Lower to hit each muscle 2× per week
- Include both a strength element (heavy compound) AND a metabolic element (superset or mini-circuit) per session
- Progressive overload: note "+1 rep or +2.5 kg" every 2 sessions

STRENGTH (maximal strength / powerlifting):
- Reps: 1-5 for main lifts, 6-8 for accessories | Rest: 3-5 min for main lifts, 90s for accessories
- MANDATORY main lifts (rotate by day): Barbell Back Squat, Conventional Deadlift, Barbell Bench Press, Barbell Overhead Press
- Program structure: 5×5 or 4×3 for main lift, then 3×6-8 accessories targeting weak points
- Accessories ONLY: Paused Squat, Romanian Deadlift, Close-Grip Bench, Pendlay Row, Good Morning, Deficit Deadlift — NO isolation curls, fly variations, or pump work
- Warmup MUST include ramping sets noted in warmup field: bar×10 → 50%×5 → 75%×3 → 90%×1 → working weight
- Every exercise note must reference carryover to the main lift

PERFORMANCE (athletic performance / explosiveness / agility):
- Reps: power 3-5 (3 min rest) + strength 5-8 (2 min) + explosive 8-12 (60-90s) — mix all three each session
- MUST include per week minimum: Box Jump or Broad Jump or Depth Jump; Medicine Ball Slam or Rotational Throw; Sprint Drill or Agility Ladder
- Multi-planar: include ≥1 lateral movement (Side Lunge, Lateral Shuffle) and ≥1 rotational movement per session
- End each session with a 4-min conditioning block (Sled Push alternative, Battle Rope, or 3-exercise circuit)
- Zero pure isolation exercises — every movement must have direct sport-transfer value
- Core: include Pallof Press, Copenhagen Plank, Dead Bug, or Anti-Rotation Press every session

FITNESS (general fitness / health / sustainable conditioning):
- Reps: 10-15 | Rest: 45-60s
- Balanced volume: equal push/pull/lower/core every session
- Sustainable: stop 2 reps before failure — longevity and consistency over maximum intensity
- Cardio integration: include 1 moderate-intensity cardio exercise per session (10-15 min equivalent)
- Variety: suggest an alternative exercise in the note field for each main movement
- Preferred split: Full Body for 2-3 days; Upper/Lower for 4 days

SPLIT PREFERENCES — enforce strictly when specified:
- auto: choose optimal split for the goal and number of days
- ppl: day names MUST follow Push/Pull/Legs naming (Push A, Pull Day, Legs Day, etc.)
- ul: strictly alternate Upper Body and Lower Body days
- fb: Full Body — each day must have ≥1 compound push, ≥1 compound pull, ≥1 lower body compound, ≥1 core movement
- bro: one primary muscle group per day (Chest Day, Back Day, Legs Day, Shoulders Day, Arms Day) — requires ≥5 days

EQUIPMENT RULES — STRICTLY FOLLOW:
- gym (commercial): barbells, cables, machines, dumbbells — all available
- home: dumbbells, resistance bands, pull-up bar ONLY — NO barbells, NO cable machines, NO leg press, NO smith machine; substitute → DB Romanian Deadlift instead of Barbell RDL, DB Row instead of Cable Row, DB Press instead of Barbell Bench, Resistance Band Pull-Apart instead of Face Pull
- bodyweight: absolutely NO weights; use Push-Up (all variations), Pull-Up, Chin-Up, Dip, Inverted Row, Bodyweight Squat, Bulgarian Split Squat (bodyweight), Pistol Squat, Glute Bridge, Hip Thrust, Pike Push-Up, Plank variations, Mountain Climber, Burpee, Jump Squat

WARMUP & COOLDOWN — required in every day:
- warmup: 2-3 exercises (5-10 min total) — light cardio + dynamic stretching relevant to the day's muscles
- cooldown: 2-3 exercises (5 min total) — static stretches for worked muscles, held 20-30s each`

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
      { name: 'Push Day', focus: 'صدر وكتف', description: 'صدر وكتف وترايسبس',
        warmup: [
          { name: 'Arm Circles + Band Pull-Apart', duration: '3 min', note: 'دفئ مفصل الكتف جيداً' },
          { name: 'Light Dumbbell Press', duration: '2×15', note: '50% من وزن التمرين' },
        ],
        exercises: [
          { name: 'Barbell Bench Press', sets: 4, reps: '8-10', rest: '90s', note: 'حافظ على لمس الصدر في كل تكرار' },
          { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '60s', note: '' },
          { name: 'Overhead Press', sets: 4, reps: '8-10', rest: '90s', note: '' },
          { name: 'Lateral Raise', sets: 3, reps: '15', rest: '45s', note: 'ارفع ببطء للأسفل' },
          { name: 'Tricep Pushdown', sets: 3, reps: '15', rest: '45s', note: '' },
        ],
        cooldown: [
          { name: 'Chest Doorway Stretch', duration: '30s hold', note: 'افتح ذراعيك على الحائط واضغط للأمام' },
          { name: 'Cross-Body Shoulder Stretch', duration: '30s each', note: 'اسحب الذراع بلطف عبر الصدر' },
        ],
      },
      { name: 'Pull Day', focus: 'ظهر وبايسبس', description: 'ظهر وبايسبس',
        warmup: [
          { name: 'Cat-Cow + Thoracic Rotation', duration: '3 min', note: 'تحريك العمود الفقري' },
          { name: 'Resistance Band Row', duration: '2×15', note: 'خفيف لتنشيط عضلة الظهر' },
        ],
        exercises: [
          { name: 'Wide-Grip Pull-Up', sets: 4, reps: '6-8', rest: '90s', note: 'ابدأ الحركة بعضلة الظهر لا الذراع' },
          { name: 'Barbell Row', sets: 4, reps: '8-10', rest: '90s', note: '' },
          { name: 'Lat Pulldown', sets: 3, reps: '12', rest: '60s', note: '' },
          { name: 'Barbell Curl', sets: 3, reps: '10-12', rest: '60s', note: '' },
          { name: 'Hammer Curl', sets: 3, reps: '12', rest: '45s', note: '' },
        ],
        cooldown: [
          { name: 'Child\'s Pose', duration: '45s', note: 'تمدد للظهر العلوي' },
          { name: 'Bicep Wall Stretch', duration: '30s each', note: 'ابسط ذراعك على الحائط واستدر للخارج' },
        ],
      },
      { name: 'Legs Day', focus: 'أرجل', description: 'أرجل كاملة',
        warmup: [
          { name: 'Leg Swing + Hip Circle', duration: '3 min', note: 'تحريك مفصل الورك بالكامل' },
          { name: 'Bodyweight Squat', duration: '2×15', note: 'بدون وزن لتنشيط الأرجل' },
        ],
        exercises: [
          { name: 'Barbell Back Squat', sets: 4, reps: '8-10', rest: '2 min', note: 'ظهر مستقيم والركبة لا تتجاوز القدم' },
          { name: 'Leg Press', sets: 3, reps: '12', rest: '90s', note: '' },
          { name: 'Romanian Deadlift', sets: 3, reps: '10-12', rest: '90s', note: '' },
          { name: 'Leg Curl', sets: 3, reps: '15', rest: '60s', note: '' },
          { name: 'Standing Calf Raise', sets: 4, reps: '20', rest: '45s', note: '' },
        ],
        cooldown: [
          { name: 'Standing Quad Stretch', duration: '30s each', note: 'امسك كاحلك وادفع الورك للأمام' },
          { name: 'Seated Hamstring Stretch', duration: '45s each', note: 'امد الرجل واميل للأمام' },
          { name: 'Pigeon Pose', duration: '45s each', note: 'لفك توتر عضلة الورك' },
        ],
      },
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

// Home & bodyweight fallback programs (no barbell / no cables / no machines)
const FALLBACKS_HOME = {
  2: {
    daysPerWeek: 2, duration: 50, level: 'beginner',
    note: 'برنامج منزلي 2 أيام — جسم كامل بدمبل ومطاط وعارضة سحب.',
    tips: ['سخّن 5 دقائق قبل كل جلسة', 'راحة يوم على الأقل بين الجلستين', 'ركّز على الأداء الصحيح قبل زيادة الوزن'],
    days: [
      {
        name: 'Full Body A',
        focus: 'كامل',
        description: 'جسم كامل — دفع وسحب وأرجل',
        warmup: [
          { name: 'Arm Circles + Band Pull-Apart', duration: '3 min', note: 'دفئ الكتف والمفاصل' },
          { name: 'Bodyweight Squat', duration: '2×10', note: 'تنشيط الأرجل' },
        ],
        exercises: [
          { name: 'Push-Up',                    sets: 4, reps: '10-15', rest: '60s', note: 'صدر مستقيم — نزول بطيء' },
          { name: 'Dumbbell Row',                sets: 3, reps: '10-12', rest: '60s', note: 'كوع للسقف' },
          { name: 'Dumbbell Goblet Squat',       sets: 3, reps: '12',    rest: '90s', note: 'ظهر مستقيم' },
          { name: 'Dumbbell Shoulder Press',     sets: 3, reps: '10-12', rest: '60s', note: 'اضغط للأعلى بالكامل' },
          { name: 'Plank',                       sets: 3, reps: '40s hold', rest: '30s', note: '' },
        ],
        cooldown: [
          { name: 'Chest Doorway Stretch',       duration: '30s hold', note: '' },
          { name: 'Seated Hamstring Stretch',    duration: '40s each', note: '' },
        ],
      },
      {
        name: 'Full Body B',
        focus: 'كامل',
        description: 'جسم كامل — سحب وأرداف وبطن',
        warmup: [
          { name: 'Leg Swing + Hip Circle',      duration: '3 min', note: 'تحريك مفصل الورك' },
          { name: 'Knee Push-Up',                duration: '2×10', note: '' },
        ],
        exercises: [
          { name: 'Pull-Up',                     sets: 4, reps: '5-8',   rest: '90s', note: 'ابدأ من امتداد كامل' },
          { name: 'Dumbbell Romanian Deadlift',  sets: 3, reps: '12',    rest: '90s', note: 'ركبة خفيف — ظهر مستقيم' },
          { name: 'Dumbbell Reverse Lunge',      sets: 3, reps: '10 each', rest: '60s', note: '' },
          { name: 'Dumbbell Curl',               sets: 3, reps: '12',    rest: '45s', note: '' },
          { name: 'Mountain Climber',            sets: 3, reps: '30s',   rest: '30s', note: '' },
        ],
        cooldown: [
          { name: "Child's Pose",                duration: '45s', note: '' },
          { name: 'Standing Quad Stretch',       duration: '30s each', note: '' },
        ],
      },
    ],
  },
  3: {
    daysPerWeek: 3, duration: 50, level: 'beginner',
    note: 'برنامج منزلي فعّال — كل ما تحتاجه دمبل ومطاط وعارضة سحب.',
    tips: ['سخّن 5 دقائق بالجري في مكانك أو Jumping Jacks', 'ركّز على الأداء الصحيح قبل زيادة الوزن', 'خصّص 60 ثانية تمدد بعد كل جلسة'],
    days: [
      { name: 'Push Day', focus: 'صدر وكتف',
        warmup: [
          { name: 'Arm Circles + Band Pull-Apart', duration: '3 min', note: 'دفئ الكتف جيداً' },
          { name: 'Knee Push-Up', duration: '2×10', note: 'بطء في الهبوط' },
        ],
        exercises: [
          { name: 'Push-Up', sets: 4, reps: '10-15', rest: '60s', note: 'صدر مستقيم ونزول بطيء' },
          { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10-12', rest: '60s', note: 'اضغط للأعلى بالكامل' },
          { name: 'Incline Push-Up', sets: 3, reps: '12', rest: '45s', note: 'يدك على كرسي أو طاولة' },
          { name: 'Dumbbell Lateral Raise', sets: 3, reps: '15', rest: '45s', note: 'ذراعان بطيء للأسفل' },
          { name: 'Resistance Band Tricep Pushdown', sets: 3, reps: '15', rest: '45s', note: 'ثبّت المطاط فوق الباب' },
        ],
        cooldown: [
          { name: 'Chest Doorway Stretch', duration: '30s hold', note: '' },
          { name: 'Cross-Body Shoulder Stretch', duration: '30s each', note: '' },
        ],
      },
      { name: 'Pull Day', focus: 'ظهر وبايسبس',
        warmup: [
          { name: 'Cat-Cow Stretch', duration: '2 min', note: '' },
          { name: 'Resistance Band Row', duration: '2×15', note: '' },
        ],
        exercises: [
          { name: 'Pull-Up', sets: 4, reps: '5-8', rest: '90s', note: 'ابدأ من امتداد كامل' },
          { name: 'Dumbbell Row', sets: 3, reps: '10-12', rest: '60s', note: 'كوع للسقف' },
          { name: 'Resistance Band Pull-Apart', sets: 3, reps: '20', rest: '30s', note: 'أداة ممتازة للكفة' },
          { name: 'Dumbbell Curl', sets: 3, reps: '12', rest: '45s', note: '' },
          { name: 'Hammer Curl', sets: 3, reps: '12', rest: '45s', note: '' },
        ],
        cooldown: [
          { name: "Child's Pose", duration: '45s', note: '' },
          { name: 'Bicep Wall Stretch', duration: '30s each', note: '' },
        ],
      },
      { name: 'Legs & Core', focus: 'أرجل وبطن',
        warmup: [
          { name: 'Leg Swing + Hip Circle', duration: '3 min', note: '' },
          { name: 'Bodyweight Squat', duration: '2×15', note: '' },
        ],
        exercises: [
          { name: 'Dumbbell Goblet Squat', sets: 4, reps: '12', rest: '90s', note: 'ظهر مستقيم' },
          { name: 'Dumbbell Romanian Deadlift', sets: 3, reps: '12', rest: '90s', note: 'ركبة خفيف' },
          { name: 'Dumbbell Reverse Lunge', sets: 3, reps: '10 each', rest: '60s', note: '' },
          { name: 'Glute Bridge', sets: 3, reps: '20', rest: '45s', note: 'اضغط الأرداف في الأعلى' },
          { name: 'Plank', sets: 3, reps: '40s hold', rest: '30s', note: '' },
        ],
        cooldown: [
          { name: 'Standing Quad Stretch', duration: '30s each', note: '' },
          { name: 'Seated Hamstring Stretch', duration: '40s each', note: '' },
        ],
      },
    ],
  },
  4: {
    daysPerWeek: 4, duration: 55, level: 'intermediate',
    note: 'برنامج Upper/Lower المنزلي — دمبل ومطاط وعارضة فقط. راحة يوم بين كل يومين متتاليين.',
    tips: [
      'سخّن 5 دقائق بالحركة الديناميكية قبل كل جلسة',
      'زد وزن الدمبل عندما تنهي التكرارات بسهولة تامة',
      'النوم 7-8 ساعات عامل أساسي في بناء العضل',
    ],
    days: [
      {
        name: 'Upper A — Push',
        focus: 'صدر وكتف',
        description: 'دفع — صدر وكتف وترايسبس',
        warmup: [
          { name: 'Arm Circles + Band Pull-Apart', duration: '3 min', note: 'دفئ مفصل الكتف جيداً' },
          { name: 'Knee Push-Up', duration: '2×10', note: 'نزول بطيء 3 ثوانٍ' },
        ],
        exercises: [
          { name: 'Push-Up', sets: 4, reps: '12-15', rest: '60s', note: 'صدر مستقيم — نزول بطيء' },
          { name: 'Dumbbell Floor Press', sets: 4, reps: '10-12', rest: '60s', note: 'مرفقك بزاوية 45° من الجسم' },
          { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10-12', rest: '60s', note: 'اضغط للأعلى بالكامل' },
          { name: 'Incline Push-Up', sets: 3, reps: '12-15', rest: '45s', note: 'يدك على كرسي أو أريكة' },
          { name: 'Dumbbell Lateral Raise', sets: 3, reps: '15', rest: '45s', note: 'ارفع ببطء للأسفل' },
          { name: 'Resistance Band Tricep Pushdown', sets: 3, reps: '15-20', rest: '45s', note: 'ثبّت المطاط فوق الباب' },
        ],
        cooldown: [
          { name: 'Chest Doorway Stretch', duration: '30s hold', note: 'افتح ذراعيك على إطار الباب واضغط للأمام' },
          { name: 'Cross-Body Shoulder Stretch', duration: '30s each', note: 'اسحب الذراع بلطف عبر الصدر' },
        ],
      },
      {
        name: 'Lower A — Quad Focus',
        focus: 'أرجل',
        description: 'أرجل أ — تركيز على الكوادريسبس',
        warmup: [
          { name: 'Leg Swing + Hip Circle', duration: '3 min', note: 'تحريك مفصل الورك بالكامل' },
          { name: 'Bodyweight Squat', duration: '2×15', note: 'بطيء للأسفل' },
        ],
        exercises: [
          { name: 'Dumbbell Goblet Squat', sets: 4, reps: '12', rest: '90s', note: 'ظهر مستقيم وركبة تتبع القدم' },
          { name: 'Dumbbell Bulgarian Split Squat', sets: 3, reps: '10 each', rest: '60s', note: 'قدمك الخلفية على كرسي' },
          { name: 'Dumbbell Reverse Lunge', sets: 3, reps: '12 each', rest: '60s', note: 'الجذع منتصب' },
          { name: 'Resistance Band Leg Extension', sets: 3, reps: '20', rest: '45s', note: 'ثبّت المطاط خلفك على الكرسي' },
          { name: 'Standing Calf Raise', sets: 4, reps: '20-25', rest: '45s', note: 'امسك دمبل للمقاومة — ارفع على أطراف أصابعك بالكامل' },
        ],
        cooldown: [
          { name: 'Standing Quad Stretch', duration: '30s each', note: 'امسك كاحلك وادفع الورك للأمام' },
          { name: 'Kneeling Hip Flexor Stretch', duration: '40s each', note: 'ركبة على الأرض — ادفع الجسم للأمام' },
        ],
      },
      {
        name: 'Upper B — Pull',
        focus: 'ظهر وبايسبس',
        description: 'سحب — ظهر وبايسبس',
        warmup: [
          { name: 'Cat-Cow + Thoracic Rotation', duration: '3 min', note: 'تحريك العمود الفقري' },
          { name: 'Resistance Band Row', duration: '2×15', note: 'خفيف لتنشيط عضلة الظهر' },
        ],
        exercises: [
          { name: 'Pull-Up', sets: 4, reps: '6-8', rest: '90s', note: 'ابدأ الحركة بعضلة الظهر لا الذراع' },
          { name: 'Dumbbell Row', sets: 4, reps: '10-12', rest: '60s', note: 'كوع للسقف — اسحب تجاه الورك' },
          { name: 'Resistance Band Pull-Apart', sets: 3, reps: '20', rest: '30s', note: 'أداة ممتازة لتقوية الكفة المدوّرة' },
          { name: 'Dumbbell Rear Delt Fly', sets: 3, reps: '15', rest: '45s', note: 'انحنِ للأمام — ذراعان خلفاً' },
          { name: 'Dumbbell Curl', sets: 3, reps: '12', rest: '45s', note: 'مرفقك ثابت بجانب الجسم' },
          { name: 'Hammer Curl', sets: 3, reps: '12', rest: '45s', note: 'قبضة محايدة — للبراكياليس' },
        ],
        cooldown: [
          { name: "Child's Pose", duration: '45s', note: 'تمدد للظهر العلوي والسفلي' },
          { name: 'Bicep Wall Stretch', duration: '30s each', note: 'ابسط ذراعك على الحائط واستدر للخارج' },
        ],
      },
      {
        name: 'Lower B — Hip Focus',
        focus: 'أرجل وبطن',
        description: 'أرجل ب — هامسترينج وأرداف وبطن',
        warmup: [
          { name: 'Glute Bridge March', duration: '3 min', note: 'تنشيط عضلات الأرداف' },
          { name: 'Hip Circle', duration: '1 min each side', note: '' },
        ],
        exercises: [
          { name: 'Dumbbell Romanian Deadlift', sets: 4, reps: '12', rest: '90s', note: 'ركبة خفيف مكسورة — ظهر مستقيم' },
          { name: 'Dumbbell Hip Thrust', sets: 3, reps: '15', rest: '60s', note: 'كتفك على الكنبة — اضغط الأرداف في الأعلى' },
          { name: 'Dumbbell Walking Lunge', sets: 3, reps: '12 each', rest: '60s', note: '' },
          { name: 'Resistance Band Kickback', sets: 3, reps: '20 each', rest: '30s', note: 'قف أمام الباب وثبّت المطاط على كاحلك' },
          { name: 'Plank', sets: 3, reps: '45s hold', rest: '30s', note: 'جسم مستقيم كالخشبة' },
          { name: 'Dumbbell Russian Twist', sets: 3, reps: '20', rest: '30s', note: '10 لكل جانب' },
        ],
        cooldown: [
          { name: 'Seated Hamstring Stretch', duration: '45s each', note: 'امد الرجل واميل للأمام' },
          { name: 'Pigeon Pose', duration: '45s each', note: 'لفك توتر عضلة الورك' },
        ],
      },
    ],
  },
  5: {
    daysPerWeek: 5, duration: 55, level: 'intermediate',
    note: 'برنامج Push/Pull/Legs المنزلي المتقدم — كثافة عالية بدمبل ومطاط وعارضة فقط.',
    tips: [
      'راحة بين الجلسات الشديدة ضرورية — لا تتجاهل يوم الراحة',
      'سجّل أوزانك وتكراراتك لتتابع التقدم أسبوعاً بعد أسبوع',
      'وجبة بروتين بعد التمرين خلال 30-60 دقيقة تُسرّع التعافي',
    ],
    days: [
      {
        name: 'Push A',
        focus: 'صدر وكتف',
        description: 'دفع أ — صدر وكتف وترايسبس',
        warmup: [
          { name: 'Band Pull-Apart + Arm Circles', duration: '3 min', note: '' },
          { name: 'Knee Push-Up', duration: '2×12', note: '' },
        ],
        exercises: [
          { name: 'Push-Up', sets: 4, reps: '15-20', rest: '60s', note: 'هذا هو تمرينك الأساسي — أتقنه' },
          { name: 'Dumbbell Floor Press', sets: 4, reps: '10-12', rest: '60s', note: 'مرفق بزاوية 45° من الجسم' },
          { name: 'Dumbbell Shoulder Press', sets: 4, reps: '10-12', rest: '60s', note: '' },
          { name: 'Dumbbell Lateral Raise', sets: 3, reps: '15', rest: '45s', note: 'ارفع ببطء للأسفل' },
          { name: 'Close-Grip Push-Up', sets: 3, reps: '12', rest: '45s', note: 'يداك بمسافة ضيقة — للترايسبس' },
          { name: 'Resistance Band Tricep Pushdown', sets: 3, reps: '15-20', rest: '45s', note: '' },
        ],
        cooldown: [
          { name: 'Chest Doorway Stretch', duration: '30s', note: '' },
          { name: 'Cross-Body Shoulder Stretch', duration: '30s each', note: '' },
        ],
      },
      {
        name: 'Pull A',
        focus: 'ظهر وبايسبس',
        description: 'سحب أ — ظهر وبايسبس',
        warmup: [
          { name: 'Cat-Cow Stretch', duration: '2 min', note: '' },
          { name: 'Resistance Band Row', duration: '2×15', note: '' },
        ],
        exercises: [
          { name: 'Pull-Up', sets: 4, reps: '6-8', rest: '90s', note: '' },
          { name: 'Dumbbell Row', sets: 4, reps: '10-12', rest: '60s', note: '' },
          { name: 'Resistance Band Pull-Apart', sets: 3, reps: '20', rest: '30s', note: '' },
          { name: 'Dumbbell Rear Delt Fly', sets: 3, reps: '15', rest: '45s', note: '' },
          { name: 'Dumbbell Curl', sets: 3, reps: '12', rest: '45s', note: '' },
          { name: 'Hammer Curl', sets: 3, reps: '12', rest: '45s', note: '' },
        ],
        cooldown: [
          { name: "Child's Pose", duration: '45s', note: '' },
          { name: 'Bicep Wall Stretch', duration: '30s each', note: '' },
        ],
      },
      {
        name: 'Legs Day',
        focus: 'أرجل',
        description: 'أرجل شاملة — كوادريسبس وهامسترينج وأرداف',
        warmup: [
          { name: 'Leg Swing + Hip Circle', duration: '3 min', note: '' },
          { name: 'Bodyweight Squat', duration: '2×15', note: '' },
        ],
        exercises: [
          { name: 'Dumbbell Goblet Squat', sets: 4, reps: '12', rest: '90s', note: '' },
          { name: 'Dumbbell Romanian Deadlift', sets: 4, reps: '12', rest: '90s', note: '' },
          { name: 'Dumbbell Bulgarian Split Squat', sets: 3, reps: '10 each', rest: '60s', note: '' },
          { name: 'Dumbbell Hip Thrust', sets: 3, reps: '15', rest: '60s', note: '' },
          { name: 'Standing Calf Raise', sets: 4, reps: '20', rest: '45s', note: 'امسك دمبل للمقاومة' },
        ],
        cooldown: [
          { name: 'Standing Quad Stretch', duration: '30s each', note: '' },
          { name: 'Seated Hamstring Stretch', duration: '45s each', note: '' },
          { name: 'Pigeon Pose', duration: '40s each', note: '' },
        ],
      },
      {
        name: 'Push B',
        focus: 'كتف',
        description: 'دفع ب — كتف وترايسبس',
        warmup: [
          { name: 'Arm Circles + Band Pull-Apart', duration: '3 min', note: '' },
          { name: 'Pike Push-Up', duration: '2×8', note: '' },
        ],
        exercises: [
          { name: 'Dumbbell Shoulder Press', sets: 4, reps: '10-12', rest: '60s', note: 'دورة كاملة للكتف' },
          { name: 'Dumbbell Arnold Press', sets: 3, reps: '10-12', rest: '60s', note: 'ابدأ بالكفوف تجاهك ودوّر عند الرفع' },
          { name: 'Dumbbell Lateral Raise', sets: 4, reps: '15-20', rest: '45s', note: 'Drop set في الجولة الأخيرة' },
          { name: 'Dumbbell Front Raise', sets: 3, reps: '12', rest: '45s', note: '' },
          { name: 'Decline Push-Up', sets: 3, reps: '12-15', rest: '45s', note: 'رجلاك على كرسي — للصدر العلوي' },
          { name: 'Resistance Band Overhead Tricep Extension', sets: 3, reps: '15', rest: '45s', note: '' },
        ],
        cooldown: [
          { name: 'Cross-Body Shoulder Stretch', duration: '30s each', note: '' },
          { name: 'Tricep Overhead Stretch', duration: '30s each', note: '' },
        ],
      },
      {
        name: 'Pull B + Core',
        focus: 'ظهر وبطن',
        description: 'سحب ب — ظهر وبطن',
        warmup: [
          { name: 'Cat-Cow + Thoracic Rotation', duration: '3 min', note: '' },
          { name: 'Dead Hang', duration: '20s hold', note: '' },
        ],
        exercises: [
          { name: 'Chin-Up', sets: 4, reps: '6-8', rest: '90s', note: 'قبضة متجهة نحوك — أيسر على البايسبس' },
          { name: 'Dumbbell Romanian Deadlift', sets: 3, reps: '12', rest: '60s', note: 'تنشيط الظهر السفلي' },
          { name: 'Resistance Band Face Pull', sets: 3, reps: '20', rest: '30s', note: 'ثبّت المطاط أمامك على مستوى الوجه' },
          { name: 'Dumbbell Concentration Curl', sets: 3, reps: '12', rest: '45s', note: '' },
          { name: 'Plank', sets: 3, reps: '45s hold', rest: '30s', note: '' },
          { name: 'Mountain Climber', sets: 3, reps: '30s', rest: '30s', note: '' },
        ],
        cooldown: [
          { name: "Child's Pose", duration: '45s', note: '' },
          { name: 'Lat Stretch', duration: '30s each', note: 'امسك إطار الباب برفع ذراع — اميل للجانب' },
        ],
      },
    ],
  },
}

const FALLBACKS_BW = {
  2: {
    daysPerWeek: 2, duration: 40, level: 'beginner',
    note: 'برنامج وزن الجسم 2 أيام — جسم كامل بلا معدات.',
    tips: ['راحة يوم على الأقل بين الجلستين', 'نزول بطيء في كل تكرار = نتائج أفضل', 'زد التكرارات تدريجياً كل أسبوع'],
    days: [
      {
        name: 'Full Body A',
        focus: 'كامل',
        description: 'جسم كامل — دفع وأرجل وبطن',
        warmup: [
          { name: 'Jumping Jacks',   duration: '3 min', note: '' },
          { name: 'Knee Push-Up',    duration: '2×10', note: '' },
        ],
        exercises: [
          { name: 'Push-Up',         sets: 4, reps: '10-15', rest: '60s', note: 'نزول 3 ثوانٍ' },
          { name: 'Pike Push-Up',    sets: 3, reps: '10',    rest: '60s', note: 'ورك للسماء — للكتف' },
          { name: 'Bodyweight Squat',sets: 4, reps: '20',    rest: '60s', note: 'فخذ موازٍ للأرض' },
          { name: 'Glute Bridge',    sets: 3, reps: '20',    rest: '45s', note: 'اضغط الأرداف في الأعلى' },
          { name: 'Plank',           sets: 3, reps: '40s hold', rest: '30s', note: '' },
        ],
        cooldown: [
          { name: 'Chest Doorway Stretch', duration: '30s hold', note: '' },
          { name: 'Standing Quad Stretch', duration: '30s each', note: '' },
        ],
      },
      {
        name: 'Full Body B',
        focus: 'كامل',
        description: 'جسم كامل — سحب وقدرة وتحمّل',
        warmup: [
          { name: 'Leg Swing + Hip Circle', duration: '3 min', note: '' },
          { name: 'Scapula Push-Up',        duration: '2×10', note: '' },
        ],
        exercises: [
          { name: 'Pull-Up',           sets: 4, reps: '5-8',    rest: '90s', note: 'ابدأ من امتداد كامل' },
          { name: 'Inverted Row',      sets: 3, reps: '10-12',  rest: '60s', note: 'طاولة أو عارضة منخفضة' },
          { name: 'Jump Squat',        sets: 3, reps: '12',     rest: '60s', note: 'هبوط هادئ على أمشاط القدم' },
          { name: 'Tricep Dip',        sets: 3, reps: '12',     rest: '45s', note: 'على كرسي ثابت' },
          { name: 'Mountain Climber',  sets: 3, reps: '30s',    rest: '30s', note: '' },
        ],
        cooldown: [
          { name: "Child's Pose",             duration: '45s', note: '' },
          { name: 'Seated Hamstring Stretch', duration: '40s each', note: '' },
        ],
      },
    ],
  },
  3: {
    daysPerWeek: 3, duration: 45, level: 'beginner',
    note: 'برنامج وزن الجسم فقط — لا تحتاج أي معدات.',
    tips: ['نفّذ كل تمرين بتركيز كامل', 'انتبه لنزول بطيء في كل تكرار', 'راحة كافية بين الجلسات'],
    days: [
      { name: 'Push Day', focus: 'صدر وكتف',
        warmup: [
          { name: 'Jumping Jacks', duration: '3 min', note: '' },
          { name: 'Knee Push-Up', duration: '2×10', note: '' },
        ],
        exercises: [
          { name: 'Push-Up', sets: 4, reps: '10-15', rest: '60s', note: 'نزول 3 ثوانٍ' },
          { name: 'Diamond Push-Up', sets: 3, reps: '10', rest: '60s', note: 'يديك قريبتان' },
          { name: 'Pike Push-Up', sets: 3, reps: '10', rest: '60s', note: 'ورك للسماء' },
          { name: 'Tricep Dip', sets: 3, reps: '12', rest: '45s', note: 'على كرسي ثابت' },
        ],
        cooldown: [
          { name: 'Chest Stretch', duration: '30s hold', note: '' },
          { name: 'Shoulder Stretch', duration: '30s each', note: '' },
        ],
      },
      { name: 'Pull Day', focus: 'ظهر',
        warmup: [
          { name: 'Cat-Cow', duration: '2 min', note: '' },
          { name: 'Scapula Push-Up', duration: '2×10', note: '' },
        ],
        exercises: [
          { name: 'Pull-Up', sets: 4, reps: '5-8', rest: '90s', note: 'ابدأ من امتداد كامل' },
          { name: 'Chin-Up', sets: 3, reps: '6-8', rest: '90s', note: '' },
          { name: 'Inverted Row', sets: 3, reps: '10-12', rest: '60s', note: 'طاولة أو عارضة منخفضة' },
          { name: 'Superman Hold', sets: 3, reps: '15', rest: '45s', note: '' },
        ],
        cooldown: [
          { name: "Child's Pose", duration: '45s', note: '' },
          { name: 'Lat Stretch', duration: '30s each', note: '' },
        ],
      },
      { name: 'Legs & Core', focus: 'أرجل وبطن',
        warmup: [
          { name: 'Leg Swing', duration: '2 min', note: '' },
          { name: 'Bodyweight Squat', duration: '2×15', note: '' },
        ],
        exercises: [
          { name: 'Bodyweight Squat', sets: 4, reps: '20', rest: '60s', note: '' },
          { name: 'Reverse Lunge', sets: 3, reps: '12 each', rest: '60s', note: '' },
          { name: 'Glute Bridge', sets: 3, reps: '25', rest: '45s', note: '' },
          { name: 'Jump Squat', sets: 3, reps: '10', rest: '45s', note: 'هبوط خفيف على الأمشاط' },
          { name: 'Plank', sets: 3, reps: '45s hold', rest: '30s', note: '' },
        ],
        cooldown: [
          { name: 'Standing Quad Stretch', duration: '30s each', note: '' },
          { name: 'Pigeon Pose', duration: '40s each', note: '' },
        ],
      },
    ],
  },
  4: {
    daysPerWeek: 4, duration: 45, level: 'beginner',
    note: 'برنامج وزن الجسم 4 أيام — لا تحتاج أي معدات. فقط جسمك وإرادتك.',
    tips: [
      'ركّز على إتقان الأداء أولاً قبل زيادة التكرارات',
      'النزول البطيء (3 ثوانٍ) يضاعف صعوبة التمرين ويبني عضلاً أفضل',
      'خذ راحة كاملة بين كل يومين متتاليين',
    ],
    days: [
      {
        name: 'Push Day',
        focus: 'صدر وكتف',
        description: 'دفع — صدر وكتف وترايسبس',
        warmup: [
          { name: 'Jumping Jacks', duration: '3 min', note: '' },
          { name: 'Knee Push-Up', duration: '2×10', note: 'بطيء' },
        ],
        exercises: [
          { name: 'Push-Up', sets: 4, reps: '12-15', rest: '60s', note: 'هذا تمرينك الأساسي — أتقنه' },
          { name: 'Wide Push-Up', sets: 3, reps: '12', rest: '60s', note: 'يداك أعرض من الكتف بـ 20 سم' },
          { name: 'Pike Push-Up', sets: 3, reps: '10', rest: '60s', note: 'ورك للسماء — للكتف' },
          { name: 'Diamond Push-Up', sets: 3, reps: '10', rest: '60s', note: 'يداك كالماسة — للترايسبس' },
          { name: 'Tricep Dip', sets: 3, reps: '12', rest: '45s', note: 'يداك على كرسي ثابت' },
        ],
        cooldown: [
          { name: 'Chest Doorway Stretch', duration: '30s hold', note: 'افتح ذراعيك وأدر كتفيك للخلف' },
          { name: 'Cross-Body Shoulder Stretch', duration: '30s each', note: '' },
        ],
      },
      {
        name: 'Lower A — Quad Focus',
        focus: 'أرجل',
        description: 'أرجل أ — تركيز على الكوادريسبس',
        warmup: [
          { name: 'Leg Swing + Hip Circle', duration: '3 min', note: '' },
          { name: 'Bodyweight Squat', duration: '2×15', note: '' },
        ],
        exercises: [
          { name: 'Bodyweight Squat', sets: 4, reps: '20', rest: '60s', note: 'ظهر مستقيم — الفخذ موازٍ للأرض' },
          { name: 'Jump Squat', sets: 3, reps: '12', rest: '60s', note: 'هبوط خفيف على أمشاط القدم' },
          { name: 'Reverse Lunge', sets: 3, reps: '12 each', rest: '60s', note: 'الجذع منتصب' },
          { name: 'Step-Up', sets: 3, reps: '12 each', rest: '45s', note: 'استخدم درج أو كرسي متين' },
          { name: 'Single-Leg Calf Raise', sets: 3, reps: '20 each', rest: '45s', note: 'استمسك بالحائط للتوازن' },
        ],
        cooldown: [
          { name: 'Standing Quad Stretch', duration: '30s each', note: '' },
          { name: 'Kneeling Hip Flexor Stretch', duration: '40s each', note: '' },
        ],
      },
      {
        name: 'Pull Day',
        focus: 'ظهر',
        description: 'سحب — ظهر وبايسبس',
        warmup: [
          { name: 'Cat-Cow Stretch', duration: '2 min', note: '' },
          { name: 'Scapula Push-Up', duration: '2×10', note: '' },
        ],
        exercises: [
          { name: 'Pull-Up', sets: 4, reps: '5-8', rest: '90s', note: 'ابدأ من امتداد كامل' },
          { name: 'Chin-Up', sets: 3, reps: '6-8', rest: '90s', note: 'قبضة متجهة نحوك' },
          { name: 'Inverted Row', sets: 3, reps: '10-12', rest: '60s', note: 'طاولة أو عارضة منخفضة' },
          { name: 'Superman Hold', sets: 3, reps: '15', rest: '45s', note: 'ارفع يديك وقدميك معاً' },
          { name: 'Dead Hang', sets: 3, reps: '30s hold', rest: '60s', note: 'تمدد للكتف والظهر' },
        ],
        cooldown: [
          { name: "Child's Pose", duration: '45s', note: '' },
          { name: 'Lat Stretch', duration: '30s each', note: '' },
        ],
      },
      {
        name: 'Lower B + Core',
        focus: 'أرجل وبطن',
        description: 'أرجل ب — هامسترينج وأرداف وبطن',
        warmup: [
          { name: 'Glute Bridge March', duration: '3 min', note: '' },
          { name: 'Glute Bridge', duration: '2×15', note: '' },
        ],
        exercises: [
          { name: 'Glute Bridge', sets: 4, reps: '20', rest: '45s', note: 'اضغط الأرداف في أعلى نقطة' },
          { name: 'Single-Leg Hip Thrust', sets: 3, reps: '12 each', rest: '60s', note: 'كتفك على الكنبة أو السرير' },
          { name: 'Bulgarian Split Squat', sets: 3, reps: '10 each', rest: '60s', note: 'وزن الجسم فقط — قدمك الخلفية على كرسي' },
          { name: 'Donkey Kick', sets: 3, reps: '20 each', rest: '30s', note: 'اضغط الأرداف في أعلى نقطة' },
          { name: 'Plank', sets: 3, reps: '45s hold', rest: '30s', note: '' },
          { name: 'Mountain Climber', sets: 3, reps: '30s', rest: '30s', note: '' },
        ],
        cooldown: [
          { name: 'Seated Hamstring Stretch', duration: '45s each', note: '' },
          { name: 'Pigeon Pose', duration: '40s each', note: '' },
        ],
      },
    ],
  },
  5: {
    daysPerWeek: 5, duration: 45, level: 'intermediate',
    note: 'برنامج وزن الجسم المتقدم 5 أيام — تدريب عالي الكثافة بلا معدات.',
    tips: [
      'النزول البطيء (3-4 ثوانٍ) يجعل كل تكرار أكثر صعوبة ويبني عضلاً أكثر',
      'اهدف إلى زيادة التكرارات أو الجولات كل أسبوع',
      'الراحة النشطة (مشي، تمدد) في أيام العطلة أفضل من الراحة الكاملة',
    ],
    days: [
      {
        name: 'Push A',
        focus: 'صدر وكتف',
        description: 'دفع أ — صدر وكتف وترايسبس',
        warmup: [
          { name: 'Jumping Jacks', duration: '3 min', note: '' },
          { name: 'Knee Push-Up', duration: '2×10', note: '' },
        ],
        exercises: [
          { name: 'Push-Up', sets: 4, reps: '15-20', rest: '60s', note: 'الأساس — نزول 3 ثوانٍ' },
          { name: 'Decline Push-Up', sets: 3, reps: '12', rest: '60s', note: 'رجلاك على كرسي — للصدر العلوي' },
          { name: 'Pike Push-Up', sets: 3, reps: '12', rest: '60s', note: 'ورك للسماء' },
          { name: 'Diamond Push-Up', sets: 3, reps: '10-12', rest: '60s', note: '' },
          { name: 'Tricep Dip', sets: 3, reps: '15', rest: '45s', note: '' },
        ],
        cooldown: [
          { name: 'Chest Doorway Stretch', duration: '30s', note: '' },
          { name: 'Cross-Body Shoulder Stretch', duration: '30s each', note: '' },
        ],
      },
      {
        name: 'Pull Day',
        focus: 'ظهر',
        description: 'سحب — ظهر وبايسبس',
        warmup: [
          { name: 'Cat-Cow', duration: '2 min', note: '' },
          { name: 'Scapula Push-Up', duration: '2×10', note: '' },
        ],
        exercises: [
          { name: 'Pull-Up', sets: 4, reps: '6-8', rest: '90s', note: '' },
          { name: 'Chin-Up', sets: 3, reps: '6-8', rest: '90s', note: '' },
          { name: 'Inverted Row', sets: 3, reps: '12', rest: '60s', note: '' },
          { name: 'Superman Hold', sets: 3, reps: '15', rest: '45s', note: '' },
          { name: 'Dead Hang', sets: 3, reps: '30s hold', rest: '60s', note: '' },
        ],
        cooldown: [
          { name: "Child's Pose", duration: '45s', note: '' },
          { name: 'Lat Stretch', duration: '30s each', note: '' },
        ],
      },
      {
        name: 'Legs Power',
        focus: 'أرجل',
        description: 'أرجل — قوة انفجارية',
        warmup: [
          { name: 'Leg Swing + Hip Circle', duration: '3 min', note: '' },
          { name: 'Bodyweight Squat', duration: '2×15', note: '' },
        ],
        exercises: [
          { name: 'Jump Squat', sets: 4, reps: '12', rest: '60s', note: 'هبوط هادئ — اثنِ الركبة عند الهبوط' },
          { name: 'Broad Jump', sets: 3, reps: '8', rest: '60s', note: 'اقفز للأمام بأقصى قوة' },
          { name: 'Reverse Lunge', sets: 3, reps: '12 each', rest: '60s', note: '' },
          { name: 'Bulgarian Split Squat', sets: 3, reps: '10 each', rest: '60s', note: '' },
          { name: 'Single-Leg Calf Raise', sets: 4, reps: '20 each', rest: '45s', note: '' },
        ],
        cooldown: [
          { name: 'Standing Quad Stretch', duration: '30s each', note: '' },
          { name: 'Seated Hamstring Stretch', duration: '45s each', note: '' },
          { name: 'Pigeon Pose', duration: '40s each', note: '' },
        ],
      },
      {
        name: 'Push B',
        focus: 'صدر',
        description: 'دفع ب — حجم وتحمّل',
        warmup: [
          { name: 'Arm Circles', duration: '2 min', note: '' },
          { name: 'Knee Push-Up', duration: '2×12', note: '' },
        ],
        exercises: [
          { name: 'Wide Push-Up', sets: 4, reps: '15', rest: '45s', note: 'يداك أعرض — للصدر الخارجي' },
          { name: 'Incline Push-Up', sets: 3, reps: '15', rest: '45s', note: 'يداك على الأريكة أو طاولة' },
          { name: 'Push-Up Hold', sets: 3, reps: '5 reps (5s pause at bottom)', rest: '60s', note: 'ابقَ في المنتصف 5 ثوانٍ' },
          { name: 'Pike Push-Up', sets: 3, reps: '12', rest: '60s', note: '' },
          { name: 'Tricep Dip', sets: 3, reps: '15', rest: '45s', note: '' },
        ],
        cooldown: [
          { name: 'Chest Stretch', duration: '30s', note: '' },
          { name: 'Tricep Overhead Stretch', duration: '30s each', note: '' },
        ],
      },
      {
        name: 'Full Body — Core & Conditioning',
        focus: 'كامل',
        description: 'جسم كامل — تكييف وبطن وتحمّل',
        warmup: [
          { name: 'High Knees', duration: '2 min', note: '' },
          { name: 'Jumping Jacks', duration: '1 min', note: '' },
        ],
        exercises: [
          { name: 'Burpee', sets: 3, reps: '10', rest: '60s', note: 'تمرين كامل الجسم الأمثل' },
          { name: 'Glute Bridge', sets: 3, reps: '20', rest: '45s', note: '' },
          { name: 'Plank', sets: 3, reps: '45s hold', rest: '30s', note: '' },
          { name: 'Mountain Climber', sets: 3, reps: '30s', rest: '30s', note: '' },
          { name: 'Pistol Squat', sets: 3, reps: '5 each', rest: '60s', note: 'استخدم كرسياً للمساعدة إذا احتجت' },
          { name: 'Hollow Body Hold', sets: 3, reps: '30s hold', rest: '30s', note: 'ظهرك ملاصق للأرض — يدان وقدمان مرفوعتان' },
        ],
        cooldown: [
          { name: "Child's Pose", duration: '45s', note: '' },
          { name: 'Full Body Stretch', duration: '2 min', note: 'تمدد عام لكل العضلات المعمول عليها' },
        ],
      },
    ],
  },
}

function getFallback(n, equipment) {
  if (equipment === 'home')       return FALLBACKS_HOME[n] || FALLBACKS_HOME[3]
  if (equipment === 'bodyweight') return FALLBACKS_BW[n]   || FALLBACKS_BW[3]
  return FALLBACKS[n] || FALLBACKS[3]
}

export async function POST(req) {
  const deny = await requireAdmin()
  if (deny) return deny

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (await isRateLimited(`ai_training:${ip}`, 20, 3600)) {
    return NextResponse.json({ error: 'تجاوزت الحد المسموح — حاول لاحقاً' }, { status: 429 })
  }

  const body = await req.json()
  const { goal, level, daysPerWeek, equipment, injuries, age, gender, split, musclePriority } = body

  const VALID_GOALS   = new Set(['bulk', 'cut', 'recomp', 'strength', 'performance', 'fitness', 'gain', 'loss', 'maintain'])
  const VALID_LEVELS  = new Set(['beginner', 'intermediate', 'advanced'])
  const VALID_EQUIP   = new Set(['gym', 'home', 'bodyweight'])
  const VALID_GENDER  = new Set(['male', 'female'])
  const VALID_SPLITS  = new Set(['auto', 'ppl', 'ul', 'fb', 'bro'])
  const VALID_MUSCLES = new Set(['', 'chest', 'back', 'shoulders', 'arms', 'legs', 'glutes', 'core'])

  const safeGoal   = VALID_GOALS.has(goal)      ? goal      : 'fitness'
  const safeLevel  = VALID_LEVELS.has(level)     ? level     : 'intermediate'
  const safeEquip  = VALID_EQUIP.has(equipment)  ? equipment : 'gym'
  const safeGender = VALID_GENDER.has(gender)    ? gender    : null
  const safeSplit  = VALID_SPLITS.has(split)     ? split     : 'auto'
  const safeMuscle = VALID_MUSCLES.has(musclePriority) ? (musclePriority || '') : ''
  const n = Math.min(Math.max(parseInt(daysPerWeek) || 3, 2), 6)
  const safeAge = age && /^\d{1,3}$/.test(String(age)) ? parseInt(age) : null

  const goalMap = {
    bulk:        'muscle mass and hypertrophy — bulking phase',
    cut:         'fat loss while preserving muscle mass — cutting/shredding phase',
    recomp:      'body recomposition — simultaneous fat loss and muscle gain',
    strength:    'maximal strength and powerlifting performance',
    performance: 'athletic performance, explosiveness, and agility',
    fitness:     'general fitness, health, and sustainable conditioning',
    gain:        'muscle hypertrophy and strength',
    loss:        'fat loss and metabolic conditioning',
    maintain:    'general fitness and maintenance',
  }
  const levelMap = { beginner: 'beginner (0-1 year)', intermediate: 'intermediate (1-3 years)', advanced: 'advanced (3+ years)' }
  const equipMap = { gym: 'full commercial gym', home: 'home gym (dumbbells, bands, pull-up bar)', bodyweight: 'bodyweight only' }
  const splitMap  = { auto: 'auto — choose optimal split', ppl: 'Push/Pull/Legs', ul: 'Upper/Lower', fb: 'Full Body', bro: 'Bro Split (one muscle group per day)' }
  const muscleMap = { chest: 'chest (pectorals)', back: 'back (lats, rhomboids, traps)', shoulders: 'shoulders (deltoids)', arms: 'arms (biceps + triceps)', legs: 'legs (quads, hamstrings, calves)', glutes: 'glutes and hip complex', core: 'core (abs, obliques, lower back)' }

  if (!process.env.ANTHROPIC_API_KEY) {
    // Pick a fallback appropriate to equipment
    const fb = getFallback(n, safeEquip)
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
      "warmup": [
        { "name": "<English exercise>", "duration": "<e.g. 5 min or 2x10>", "note": "<Arabic>" }
      ],
      "exercises": [
        { "name": "<English exercise name>", "sets": <number>, "reps": "<string>", "rest": "<string>", "note": "<Arabic tip or empty>" }
      ],
      "cooldown": [
        { "name": "<English stretch>", "duration": "<e.g. 30s hold>", "note": "<Arabic>" }
      ]
    }
  ]
}`

  const safeInjuries = (injuries ?? '').toString()
    .replace(/[<>"'`\\{}()[\];=\n\r]/g, '')
    .trim()
    .slice(0, 150)

  // Build equipment-specific exercise constraint section
  const exerciseList = getExerciseListForPrompt(safeEquip)
  const exerciseConstraint = exerciseList
    ? `\nALLOWED EXERCISES — use ONLY exercises from this list (do not invent exercises outside it):\n${exerciseList}\n`
    : ''

  // Build full system prompt with optional equipment constraint
  const SYSTEM_PROMPT = SYSTEM_PROMPT_BASE + exerciseConstraint

  const userPrompt = `Create a ${n}-day/week training program:
- Goal: ${goalMap[safeGoal]}
- Split Type: ${splitMap[safeSplit]}
${safeMuscle ? `- Muscle Priority: ${muscleMap[safeMuscle]} — add 1 extra exercise and +1 set on all exercises targeting this muscle group` : ''}
- Level: ${levelMap[safeLevel]}
- Equipment: ${equipMap[safeEquip]}
- Client: ${safeAge ? safeAge + ' years old' : 'age unspecified'}, ${safeGender === 'male' ? 'Male' : safeGender === 'female' ? 'Female' : 'unspecified gender'}
${safeInjuries ? `- Injuries/Limitations: ${safeInjuries}` : ''}

Return exactly this JSON (${n} days):
${schema}`

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    // 30-second hard timeout — falls back to static program on timeout
    const controller = new AbortController()
    const timeoutId  = setTimeout(() => {
      controller.abort()
      console.warn('[ai-training] request timed out after 30s — using fallback')
    }, 30_000)

    let response
    try {
      response = await anthropic.messages.create(
        { model: 'claude-haiku-4-5-20251001', max_tokens: 4096, system: SYSTEM_PROMPT, messages: [{ role: 'user', content: userPrompt }] },
        { signal: controller.signal },
      )
    } finally {
      clearTimeout(timeoutId)
    }

    const raw  = response.content[0].text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    const raw2 = raw.startsWith('{') ? raw : (raw.match(/\{[\s\S]*\}/) || [raw])[0]
    const parsed = JSON.parse(raw2)

    // Strict post-generation validation — replace any gym-only exercises in home/bodyweight plans
    const { plan: validatedPlan, log } = validateAndFix(parsed, safeEquip)
    if (log.length) console.warn(`[ai-training] equipment violations fixed (${safeEquip}):`, log.join(' | '))

    return NextResponse.json({ ...validatedPlan, ai: true })
  } catch (err) {
    console.error('[ai-training] fallback:', err.message)
    const fb = getFallback(n, safeEquip)
    return NextResponse.json({ ...fb, daysPerWeek: n, ai: false })
  }
}
