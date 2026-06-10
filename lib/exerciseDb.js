// Exercise database — each entry is tagged with:
//   equipment: 'gym' | 'dumbbell' | 'band' | 'pullup' | 'bodyweight'
//   location:  'gym' | 'home' | 'both'   (both = works anywhere without a gym)
//   is_bodyweight: boolean
//
// Equipment hierarchy:
//   'gym'       → commercial gym only (barbells, cables, machines)
//   'dumbbell'  → works at home with dumbbells
//   'band'      → works at home with resistance bands
//   'pullup'    → requires a pull-up bar (door bar counts)
//   'bodyweight'→ zero equipment needed
//
// Location keys map to user's equipment input:
//   input='gym'        → allow: gym + dumbbell + band + pullup + bodyweight
//   input='home'       → allow: dumbbell + band + pullup + bodyweight  (NO gym)
//   input='bodyweight' → allow: pullup + bodyweight  (NO gym, NO dumbbells, NO bands)

const DB = [
  // ── CHEST ──────────────────────────────────────────────────────────────────
  { name: 'Barbell Bench Press',        muscle: 'صدر',    equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Incline Barbell Press',      muscle: 'صدر',    equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Cable Fly',                  muscle: 'صدر',    equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Cable Chest Fly',            muscle: 'صدر',    equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Incline Cable Fly',          muscle: 'صدر',    equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Chest Press Machine',        muscle: 'صدر',    equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Pec Deck Fly',               muscle: 'صدر',    equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Dumbbell Bench Press',       muscle: 'صدر',    equipment: 'dumbbell',  location: 'home', is_bodyweight: false },
  { name: 'Dumbbell Floor Press',       muscle: 'صدر',    equipment: 'dumbbell',  location: 'home', is_bodyweight: false },
  { name: 'Incline Dumbbell Press',     muscle: 'صدر',    equipment: 'dumbbell',  location: 'home', is_bodyweight: false },
  { name: 'Dumbbell Flat Fly',          muscle: 'صدر',    equipment: 'dumbbell',  location: 'home', is_bodyweight: false },
  { name: 'Push-Up',                    muscle: 'صدر',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Wide Push-Up',               muscle: 'صدر',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Diamond Push-Up',            muscle: 'صدر',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Decline Push-Up',            muscle: 'صدر',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Incline Push-Up',            muscle: 'صدر',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Push-Up Hold',               muscle: 'صدر',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Archer Push-Up',             muscle: 'صدر',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Close-Grip Push-Up',         muscle: 'صدر',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },

  // ── BACK ───────────────────────────────────────────────────────────────────
  { name: 'Barbell Row',                muscle: 'ظهر',    equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Barbell Bent-Over Row',      muscle: 'ظهر',    equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Deadlift',                   muscle: 'ظهر',    equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Lat Pulldown',               muscle: 'ظهر',    equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Seated Cable Row',           muscle: 'ظهر',    equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Cable Row',                  muscle: 'ظهر',    equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Face Pull',                  muscle: 'كتف',    equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Weighted Pull-Up',           muscle: 'ظهر',    equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Dumbbell Row',               muscle: 'ظهر',    equipment: 'dumbbell',  location: 'home', is_bodyweight: false },
  { name: 'One-Arm Dumbbell Row',       muscle: 'ظهر',    equipment: 'dumbbell',  location: 'home', is_bodyweight: false },
  { name: 'Dumbbell Rear Delt Fly',     muscle: 'كتف',    equipment: 'dumbbell',  location: 'home', is_bodyweight: false },
  { name: 'Resistance Band Row',        muscle: 'ظهر',    equipment: 'band',      location: 'home', is_bodyweight: false },
  { name: 'Resistance Band Face Pull',  muscle: 'كتف',    equipment: 'band',      location: 'home', is_bodyweight: false },
  { name: 'Resistance Band Pull-Apart', muscle: 'كتف',    equipment: 'band',      location: 'home', is_bodyweight: false },
  { name: 'Pull-Up',                    muscle: 'ظهر',    equipment: 'pullup',    location: 'both', is_bodyweight: false },
  { name: 'Wide-Grip Pull-Up',          muscle: 'ظهر',    equipment: 'pullup',    location: 'both', is_bodyweight: false },
  { name: 'Chin-Up',                    muscle: 'ظهر',    equipment: 'pullup',    location: 'both', is_bodyweight: false },
  { name: 'Dead Hang',                  muscle: 'ظهر',    equipment: 'pullup',    location: 'both', is_bodyweight: false },
  { name: 'Hanging Leg Raise',          muscle: 'بطن',    equipment: 'pullup',    location: 'both', is_bodyweight: false },
  { name: 'Inverted Row',               muscle: 'ظهر',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Superman Hold',              muscle: 'ظهر',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Scapula Push-Up',            muscle: 'ظهر',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },

  // ── SHOULDERS ──────────────────────────────────────────────────────────────
  { name: 'Overhead Press',             muscle: 'كتف',    equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Arnold Press',               muscle: 'كتف',    equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Lateral Raise',              muscle: 'كتف',    equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Cable Lateral Raise',        muscle: 'كتف',    equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Front Raise',                muscle: 'كتف',    equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Reverse Fly',                muscle: 'كتف',    equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Dumbbell Shoulder Press',    muscle: 'كتف',    equipment: 'dumbbell',  location: 'home', is_bodyweight: false },
  { name: 'Dumbbell Arnold Press',      muscle: 'كتف',    equipment: 'dumbbell',  location: 'home', is_bodyweight: false },
  { name: 'Dumbbell Lateral Raise',     muscle: 'كتف',    equipment: 'dumbbell',  location: 'home', is_bodyweight: false },
  { name: 'Dumbbell Front Raise',       muscle: 'كتف',    equipment: 'dumbbell',  location: 'home', is_bodyweight: false },
  { name: 'Pike Push-Up',               muscle: 'كتف',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Handstand Push-Up',          muscle: 'كتف',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },

  // ── LEGS ───────────────────────────────────────────────────────────────────
  { name: 'Barbell Back Squat',         muscle: 'أرجل',   equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Front Squat',                muscle: 'أرجل',   equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Hack Squat',                 muscle: 'أرجل',   equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Leg Press',                  muscle: 'أرجل',   equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Leg Extension',              muscle: 'أرجل',   equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Leg Curl',                   muscle: 'أرجل',   equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Romanian Deadlift',          muscle: 'أرجل',   equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Standing Calf Raise',        muscle: 'أرجل',   equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Seated Calf Raise',          muscle: 'أرجل',   equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Walking Lunge',              muscle: 'أرجل',   equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Smith Machine Squat',        muscle: 'أرجل',   equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Dumbbell Goblet Squat',      muscle: 'أرجل',   equipment: 'dumbbell',  location: 'home', is_bodyweight: false },
  { name: 'Dumbbell Romanian Deadlift', muscle: 'أرجل',   equipment: 'dumbbell',  location: 'home', is_bodyweight: false },
  { name: 'Dumbbell Bulgarian Split Squat', muscle: 'أرجل', equipment: 'dumbbell',location: 'home', is_bodyweight: false },
  { name: 'Dumbbell Reverse Lunge',     muscle: 'أرجل',   equipment: 'dumbbell',  location: 'home', is_bodyweight: false },
  { name: 'Dumbbell Hip Thrust',        muscle: 'أرجل',   equipment: 'dumbbell',  location: 'home', is_bodyweight: false },
  { name: 'Dumbbell Walking Lunge',     muscle: 'أرجل',   equipment: 'dumbbell',  location: 'home', is_bodyweight: false },
  { name: 'Resistance Band Leg Extension', muscle: 'أرجل',equipment: 'band',      location: 'home', is_bodyweight: false },
  { name: 'Resistance Band Kickback',   muscle: 'أرجل',   equipment: 'band',      location: 'home', is_bodyweight: false },
  { name: 'Bodyweight Squat',           muscle: 'أرجل',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Jump Squat',                 muscle: 'أرجل',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Reverse Lunge',              muscle: 'أرجل',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Bulgarian Split Squat',      muscle: 'أرجل',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Glute Bridge',               muscle: 'أرجل',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Single-Leg Hip Thrust',      muscle: 'أرجل',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Step-Up',                    muscle: 'أرجل',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Single-Leg Calf Raise',      muscle: 'أرجل',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Donkey Kick',                muscle: 'أرجل',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Broad Jump',                 muscle: 'أرجل',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Pistol Squat',               muscle: 'أرجل',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Standing Hip Abduction',     muscle: 'أرجل',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Glute Bridge March',         muscle: 'أرجل',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },

  // ── BICEPS ─────────────────────────────────────────────────────────────────
  { name: 'Barbell Curl',               muscle: 'ذراع',   equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Preacher Curl',              muscle: 'ذراع',   equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Concentration Curl',         muscle: 'ذراع',   equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Reverse Curl',               muscle: 'ذراع',   equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Dumbbell Curl',              muscle: 'ذراع',   equipment: 'dumbbell',  location: 'home', is_bodyweight: false },
  { name: 'Hammer Curl',                muscle: 'ذراع',   equipment: 'dumbbell',  location: 'home', is_bodyweight: false },
  { name: 'Dumbbell Concentration Curl',muscle: 'ذراع',   equipment: 'dumbbell',  location: 'home', is_bodyweight: false },

  // ── TRICEPS ────────────────────────────────────────────────────────────────
  { name: 'Tricep Pushdown',            muscle: 'ذراع',   equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Tricep Rope Pushdown',       muscle: 'ذراع',   equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Overhead Tricep Extension',  muscle: 'ذراع',   equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Skull Crusher',              muscle: 'ذراع',   equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Resistance Band Tricep Pushdown', muscle: 'ذراع', equipment: 'band',   location: 'home', is_bodyweight: false },
  { name: 'Resistance Band Overhead Tricep Extension', muscle: 'ذراع', equipment: 'band', location: 'home', is_bodyweight: false },
  { name: 'Tricep Dip',                 muscle: 'ذراع',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },

  // ── CORE ───────────────────────────────────────────────────────────────────
  { name: 'Cable Crunch',               muscle: 'بطن',    equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Ab Wheel Rollout',           muscle: 'بطن',    equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Dumbbell Russian Twist',     muscle: 'بطن',    equipment: 'dumbbell',  location: 'home', is_bodyweight: false },
  { name: 'Plank',                      muscle: 'بطن',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Side Plank',                 muscle: 'بطن',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Mountain Climber',           muscle: 'بطن',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Hollow Body Hold',           muscle: 'بطن',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Crunch',                     muscle: 'بطن',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Leg Raise',                  muscle: 'بطن',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Reverse Crunch',             muscle: 'بطن',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'V-Up',                       muscle: 'بطن',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },

  // ── CARDIO / FULL BODY ─────────────────────────────────────────────────────
  { name: 'Box Jump',                   muscle: 'كامل',   equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Medicine Ball Slam',         muscle: 'كامل',   equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Battle Ropes',               muscle: 'كامل',   equipment: 'gym',       location: 'gym',  is_bodyweight: false },
  { name: 'Burpee',                     muscle: 'كامل',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'High Knees',                 muscle: 'كارديو', equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Jumping Jacks',              muscle: 'كارديو', equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Sprint Drill',               muscle: 'كارديو', equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Jump Rope',                  muscle: 'كارديو', equipment: 'bodyweight',location: 'both', is_bodyweight: true  },

  // ── WARMUP / MOBILITY (always allowed anywhere) ────────────────────────────
  { name: 'Arm Circles',               muscle: 'كتف',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Leg Swing',                  muscle: 'أرجل',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Hip Circle',                 muscle: 'أرجل',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Cat-Cow',                    muscle: 'ظهر',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Cat-Cow Stretch',            muscle: 'ظهر',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Cat-Cow + Thoracic Rotation',muscle: 'ظهر',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Thoracic Rotation',          muscle: 'ظهر',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Knee Push-Up',               muscle: 'صدر',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Arm Circles + Band Pull-Apart', muscle: 'كتف', equipment: 'band',      location: 'home', is_bodyweight: false },
  { name: 'Band Pull-Apart + Arm Circles', muscle: 'كتف', equipment: 'band',      location: 'home', is_bodyweight: false },
  { name: 'Leg Swing + Hip Circle',     muscle: 'أرجل',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Chest Doorway Stretch',      muscle: 'صدر',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Cross-Body Shoulder Stretch',muscle: 'كتف',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: "Child's Pose",               muscle: 'ظهر',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Bicep Wall Stretch',         muscle: 'ذراع',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Standing Quad Stretch',      muscle: 'أرجل',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Seated Hamstring Stretch',   muscle: 'أرجل',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Pigeon Pose',                muscle: 'أرجل',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Kneeling Hip Flexor Stretch',muscle: 'أرجل',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Hip Flexor Stretch',         muscle: 'أرجل',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Tricep Overhead Stretch',    muscle: 'ذراع',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Chest Stretch',              muscle: 'صدر',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Shoulder Stretch',           muscle: 'كتف',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Lat Stretch',                muscle: 'ظهر',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Full Body Stretch',          muscle: 'كامل',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Light Dumbbell Press',       muscle: 'صدر',    equipment: 'dumbbell',  location: 'home', is_bodyweight: false },
  { name: 'Pike Push-Up',               muscle: 'كتف',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Scapula Push-Up',            muscle: 'ظهر',    equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Glute Bridge March',         muscle: 'أرجل',   equipment: 'bodyweight',location: 'both', is_bodyweight: true  },
  { name: 'Dead Hang',                  muscle: 'ظهر',    equipment: 'pullup',    location: 'both', is_bodyweight: false },
]

// Build allowed equipment-type set for each user input
function _allowedTypes(equipment) {
  if (equipment === 'bodyweight') return new Set(['bodyweight', 'pullup'])
  if (equipment === 'home')       return new Set(['bodyweight', 'pullup', 'dumbbell', 'band'])
  return new Set(['bodyweight', 'pullup', 'dumbbell', 'band', 'gym']) // 'gym' → all
}

// Returns array of exercises allowed for the given equipment input
export function getExercisesForEquipment(equipment) {
  const types = _allowedTypes(equipment)
  return DB.filter(e => types.has(e.equipment))
}

// Returns lowercase name set for O(1) lookup
export function getNameSet(equipment) {
  return new Set(getExercisesForEquipment(equipment).map(e => e.name.toLowerCase()))
}

// Returns compact comma-separated list for AI prompt injection
export function getExerciseListForPrompt(equipment) {
  if (equipment === 'gym') return null // no restriction needed for full gym
  return getExercisesForEquipment(equipment)
    .filter(e => e.location !== 'gym') // skip gym-only entries already excluded
    .map(e => e.name)
    .join(', ')
}

// Guess muscle group from exercise name keywords (for exercises not in DB)
function _guessMuscle(name) {
  const n = name.toLowerCase()
  if (/bench|chest|fly|pec|push.?up/.test(n))                                     return 'صدر'
  if (/lat|pull.?(up|down)|row|deadlift|back|chin|hang|inverted/.test(n))         return 'ظهر'
  if (/shoulder|press|raise|delt|face.?pull|arnold/.test(n))                      return 'كتف'
  if (/squat|lunge|leg|glute|hamstring|quad|hip|calf|deadlift|donkey|pistol/.test(n)) return 'أرجل'
  if (/curl|bicep|tricep|dip|pushdown|skull|extension/.test(n))                   return 'ذراع'
  if (/plank|crunch|core|ab |oblique|mountain|hollow|leg raise|v-up/.test(n))     return 'بطن'
  return 'كامل'
}

// Find the best substitute for a forbidden exercise
function _substitute(forbiddenName, equipment) {
  const types    = _allowedTypes(equipment)
  const muscle   = (DB.find(e => e.name.toLowerCase() === forbiddenName.toLowerCase()) || {}).muscle
                    || _guessMuscle(forbiddenName)
  const pool     = DB.filter(e => types.has(e.equipment) && e.muscle === muscle)
  if (pool.length) return pool[0].name
  // Ultimate fallback: any bodyweight exercise for that muscle
  const bw       = DB.filter(e => e.is_bodyweight && e.muscle === muscle)
  return bw.length ? bw[0].name : 'Push-Up'
}

// Post-process validator — replaces any forbidden exercises in an AI-generated plan.
// Returns the (possibly modified) plan and an array of substitution log entries.
export function validateAndFix(plan, equipment) {
  if (!plan?.days || equipment === 'gym') return { plan, log: [] }

  const allowed = getNameSet(equipment)
  const log     = []

  const fixExList = (list) => (list || []).map(ex => {
    if (!ex?.name) return ex
    if (allowed.has(ex.name.toLowerCase())) return ex
    const replacement = _substitute(ex.name, equipment)
    log.push(`${ex.name} → ${replacement}`)
    return { ...ex, name: replacement }
  })

  const fixedPlan = {
    ...plan,
    days: plan.days.map(day => ({
      ...day,
      warmup:    fixExList(day.warmup),
      exercises: fixExList(day.exercises),
      cooldown:  fixExList(day.cooldown),
    })),
  }

  return { plan: fixedPlan, log }
}
