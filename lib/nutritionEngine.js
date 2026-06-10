// ─── Nutrition Engine v5 — ADA Exchange System 2019 / Mifflin-St Jeor ────────
// Mifflin-St Jeor (1990) BMR — most accurate for modern populations (ADA/AND recommended)
// ADA Food Exchange Lists 2019 (Academy of Nutrition and Dietetics / Choose Your Foods)
// v5: per-food USDA macro coefficients + Atwater (C×4 + P×4 + F×9) for accurate kcal
//     raw vs cooked state flags, legumes group, dense-food accuracy (nuts/oils/PB)
// v4: FFM-based protein, age-adjusted macros, water goals, fiber, calorie normalization

export const ACTIVITY_FACTORS = [
  { key: 'sedentary',  label: 'خامل — عمل مكتبي، لا رياضة',        pa: 1.20  },
  { key: 'light',      label: 'خفيف — رياضة 1–3 أيام/أسبوع',        pa: 1.375 },
  { key: 'moderate',   label: 'معتدل — رياضة 3–5 أيام/أسبوع',       pa: 1.55  },
  { key: 'active',     label: 'نشيط — رياضة 6–7 أيام/أسبوع',        pa: 1.725 },
  { key: 'veryActive', label: 'نشيط جداً — تدريب مكثف يومياً',       pa: 1.90  },
]

export const GOALS = [
  { key: 'loss',     label: 'خسارة الوزن',      icon: '📉', adj: -500, proteinFactor: 2.0, macros: { carbs: 0.40, protein: 0.35, fat: 0.25 } },
  { key: 'maintain', label: 'الحفاظ على الوزن', icon: '⚖️', adj: 0,    proteinFactor: 1.8, macros: { carbs: 0.45, protein: 0.30, fat: 0.25 } },
  { key: 'gain',     label: 'بناء العضلات',      icon: '💪', adj: 300,  proteinFactor: 2.2, macros: { carbs: 0.45, protein: 0.35, fat: 0.20 } },
]

// ── ADA Exchange Reference Values (used for daily planning / exchange counting) ─
// Actual meal macros use per-food USDA coefficients in generateMenu()
export const EX = {
  starch:    { nameAr: 'النشويات',          icon: '🌾', carbs: 15, protein: 3,  fat: 1,  kcal: 80  },
  legume:    { nameAr: 'البقوليات',         icon: '🫘', carbs: 15, protein: 7,  fat: 0,  kcal: 100 },
  meat:      { nameAr: 'اللحوم والبروتين', icon: '🥩', carbs: 0,  protein: 7,  fat: 2,  kcal: 45  },
  milk:      { nameAr: 'منتجات الألبان',   icon: '🥛', carbs: 12, protein: 8,  fat: 0,  kcal: 90  },
  fat:       { nameAr: 'الدهون',            icon: '🫒', carbs: 0,  protein: 0,  fat: 5,  kcal: 45  },
  fruit:     { nameAr: 'الفواكه',           icon: '🍎', carbs: 15, protein: 0,  fat: 0,  kcal: 60  },
  vegetable: { nameAr: 'الخضروات',          icon: '🥦', carbs: 5,  protein: 2,  fat: 0,  kcal: 25  },
}

// ── Food Database ────────────────────────────────────────────────────────────
// Each item: grams = serving size for 1 ADA exchange
//   carbsPer100g / proteinPer100g / fatPer100g = USDA values for that food/state
//   state = preparation method (for display only)
//   isLegume = true → displayed as البقوليات instead of النشويات
// meal: B=breakfast  S=snack  L=lunch  D=dinner
export const FOODS = {
  starch: [
    { nameAr: 'توست كامل',          grams: 30,  suffix: 'غ (شريحة)',           state: 'مخبوز',
      keywords: ['توست','toast'],             meal: 'BSD',
      carbsPer100g: 43,   proteinPer100g: 9,    fatPer100g: 4   },
    { nameAr: 'أرز أبيض مطبوخ',    grams: 65,  suffix: 'غ مطبوخ',             state: 'مطبوخ',
      keywords: ['rice','أرز'],               meal: 'LD',
      carbsPer100g: 28,   proteinPer100g: 2.7,  fatPer100g: 0.3 },
    { nameAr: 'بطاطا مسلوقة',       grams: 90,  suffix: 'غ',                   state: 'مسلوقة',
      keywords: ['بطاطا','potato'],            meal: 'LD',
      carbsPer100g: 17,   proteinPer100g: 2,    fatPer100g: 0.1 },
    { nameAr: 'كسكسي مطبوخ',        grams: 65,  suffix: 'غ مطبوخ',             state: 'مطبوخ',
      keywords: ['كسكس','couscous'],           meal: 'L',
      carbsPer100g: 23,   proteinPer100g: 3.8,  fatPer100g: 0.2 },
    { nameAr: 'معكرونة مطبوخة',     grams: 70,  suffix: 'غ مطبوخة',           state: 'مطبوخة',
      keywords: ['pasta','معكرونة'],           meal: 'LD',
      carbsPer100g: 25,   proteinPer100g: 5,    fatPer100g: 0.9 },
    { nameAr: 'بطاطا حلوة مسلوقة', grams: 75,  suffix: 'غ',                   state: 'مسلوقة',
      keywords: ['بطاطا حلوة'],               meal: 'LD',
      carbsPer100g: 20,   proteinPer100g: 1.6,  fatPer100g: 0.1 },
    { nameAr: 'خبز عربي',           grams: 30,  suffix: 'غ (نصف رغيف)',        state: 'مخبوز',
      keywords: ['خبز','bread'],               meal: 'BSD',
      carbsPer100g: 55,   proteinPer100g: 9,    fatPer100g: 1.5 },
    { nameAr: 'شوفان جافة',         grams: 20,  suffix: 'غ (¼ كوب)',           state: 'جاف',
      keywords: ['شوفان','oat'],               meal: 'B',
      carbsPer100g: 67,   proteinPer100g: 13,   fatPer100g: 7   },
    { nameAr: 'عسل طبيعي',          grams: 20,  suffix: 'غ (4 ملاعق صغيرة)',
      keywords: ['عسل','honey'],               meal: 'B',
      carbsPer100g: 82,   proteinPer100g: 0.3,  fatPer100g: 0   },
    { nameAr: 'تمر جاف',            grams: 15,  suffix: 'غ (2–3 حبات)',        state: 'مجفف',
      keywords: ['تمر','dates','date'],        meal: 'B',
      carbsPer100g: 74,   proteinPer100g: 1.8,  fatPer100g: 0.2 },
    // Legumes — ADA starch-equivalent but higher protein (100 kcal | 15g C | 7g P per ½ cup cooked)
    { nameAr: 'عدس مطبوخ',          grams: 100, suffix: 'غ (½ كوب)',           state: 'مطبوخ',
      keywords: ['عدس','lentil'],              meal: 'LD',  isLegume: true,
      carbsPer100g: 20,   proteinPer100g: 9,    fatPer100g: 0.4 },
    { nameAr: 'حمص مطبوخ',          grams: 82,  suffix: 'غ (½ كوب)',           state: 'مطبوخ',
      keywords: ['حمص','chickpea'],            meal: 'LD',  isLegume: true,
      carbsPer100g: 27,   proteinPer100g: 9,    fatPer100g: 2.6 },
    { nameAr: 'فول مدمس',           grams: 110, suffix: 'غ (½ كوب)',           state: 'مطبوخ',
      keywords: ['فول','fava','bean'],         meal: 'BLD', isLegume: true,
      carbsPer100g: 14,   proteinPer100g: 7.6,  fatPer100g: 0.4 },
    { nameAr: 'بازلاء خضراء',       grams: 110, suffix: 'غ',                   state: 'طازجة',
      keywords: ['بازلاء','peas'],             meal: 'LD',  isLegume: true,
      carbsPer100g: 14,   proteinPer100g: 5,    fatPer100g: 0.4 },
  ],

  meat: [
    // Very lean (~35 kcal / 30g): chicken, white fish, tuna, shrimp
    { nameAr: 'صدر دجاج مشوي',     grams: 30,  suffix: 'غ مطبوخ',             state: 'مطبوخ',
      keywords: ['chicken','دجاج'],            meal: 'LD',
      carbsPer100g: 0,    proteinPer100g: 31,   fatPer100g: 3.6 },
    { nameAr: 'سمك أبيض مشوي',     grams: 30,  suffix: 'غ مطبوخ',             state: 'مطبوخ',
      keywords: ['fish','سمك','سمك أبيض'],    meal: 'LD',
      carbsPer100g: 0,    proteinPer100g: 25,   fatPer100g: 2.5 },
    // Lean (~45 kcal / 30g): salmon, beef, liver — higher fat than very lean
    { nameAr: 'سمك سلمون مشوي',    grams: 30,  suffix: 'غ مطبوخ',             state: 'مطبوخ',
      keywords: ['سلمون','salmon'],            meal: 'LD',
      carbsPer100g: 0,    proteinPer100g: 25,   fatPer100g: 12  },
    { nameAr: 'تونة في الماء',      grams: 30,  suffix: 'غ مصفّى',             state: 'معلّب',
      keywords: ['تونة','tuna'],               meal: 'LDS',
      carbsPer100g: 0,    proteinPer100g: 26,   fatPer100g: 1   },
    { nameAr: 'لحم بقري مشوي',     grams: 30,  suffix: 'غ مطبوخ',             state: 'مطبوخ',
      keywords: ['beef','لحم بقري','لحم'],    meal: 'L',
      carbsPer100g: 0,    proteinPer100g: 27,   fatPer100g: 8   },
    { nameAr: 'كبدة بقري مشوية',   grams: 30,  suffix: 'غ مطبوخة',            state: 'مطبوخة',
      keywords: ['كبدة','liver'],              meal: 'L',
      carbsPer100g: 4,    proteinPer100g: 29,   fatPer100g: 5   },
    { nameAr: 'سردين في الماء',     grams: 30,  suffix: 'غ',                   state: 'معلّب',
      keywords: ['سردين','sardine'],           meal: 'LDS',
      carbsPer100g: 0,    proteinPer100g: 25,   fatPer100g: 11  },
    { nameAr: 'جمبري مسلوق',       grams: 30,  suffix: 'غ',                   state: 'مسلوق',
      keywords: ['جمبري','shrimp'],            meal: 'LD',
      carbsPer100g: 0,    proteinPer100g: 24,   fatPer100g: 0.9 },
    // Medium-fat (~75 kcal / 30g): eggs, cheese
    { nameAr: 'بيضة مسلوقة',       grams: 50,  suffix: 'غ (بيضة كاملة)',      state: 'مسلوقة',
      keywords: ['egg','بيض','بيضة'],          meal: 'BSD',
      carbsPer100g: 1.1,  proteinPer100g: 13,   fatPer100g: 10  },
    { nameAr: 'جبن مطبوخة',        grams: 30,  suffix: 'غ (قطعة)',            state: 'معالَج',
      keywords: ['جبن','cheese','fromage','جبن مطبوخ'], meal: 'BSD',
      carbsPer100g: 2.2,  proteinPer100g: 17,   fatPer100g: 22  },
  ],

  fat: [
    { nameAr: 'زبدة طبيعية',         grams: 5,  suffix: 'غ (1 ملعقة صغيرة)',
      keywords: ['زبدة','butter'],             meal: 'B',
      carbsPer100g: 0.1,  proteinPer100g: 0.8,  fatPer100g: 81  },
    { nameAr: 'لوز نيء',             grams: 8,  suffix: 'غ (~6 حبات)',         state: 'نيء',
      keywords: ['لوز','almond'],              meal: 'BS',
      carbsPer100g: 22,   proteinPer100g: 21,   fatPer100g: 49  },
    { nameAr: 'فستق حلبي نيء',       grams: 12, suffix: 'غ (~16 حبة)',         state: 'نيء',
      keywords: ['فستق','pistachio'],          meal: 'BS',
      carbsPer100g: 28,   proteinPer100g: 20,   fatPer100g: 45  },
    { nameAr: 'كاجو نيء',            grams: 10, suffix: 'غ (~6 حبات)',         state: 'نيء',
      keywords: ['كاجو','cashew'],             meal: 'BS',
      carbsPer100g: 30,   proteinPer100g: 18,   fatPer100g: 44  },
    { nameAr: 'جوز',                  grams: 8,  suffix: 'غ (4 نصفات)',         state: 'نيء',
      keywords: ['جوز','walnut'],              meal: 'BS',
      carbsPer100g: 14,   proteinPer100g: 15,   fatPer100g: 65  },
    { nameAr: 'زيت زيتون',           grams: 5,  suffix: 'مل (1 ملعقة صغيرة)',
      keywords: ['زيتون','olive','زيت'],       meal: 'LD',
      carbsPer100g: 0,    proteinPer100g: 0,    fatPer100g: 100 },
    { nameAr: 'زيت نباتي',           grams: 5,  suffix: 'مل (1 ملعقة صغيرة)',
      keywords: ['زيت نباتي'],                 meal: 'LD',
      carbsPer100g: 0,    proteinPer100g: 0,    fatPer100g: 100 },
    { nameAr: 'أفوكادو',             grams: 30, suffix: 'غ (2 ملاعق كبيرة)',
      keywords: ['أفوكادو','avocado'],          meal: 'LD',
      carbsPer100g: 9,    proteinPer100g: 2,    fatPer100g: 15  },
    { nameAr: 'زبدة الفول السوداني', grams: 8,  suffix: 'غ (½ ملعقة كبيرة)',
      keywords: ['زبدة فول','peanut butter','فول سوداني'], meal: 'BS',
      carbsPer100g: 20,   proteinPer100g: 25,   fatPer100g: 50  },
  ],

  fruit: [
    { nameAr: 'موز',         grams: 60,  suffix: 'غ (نصف موزة متوسطة)',
      keywords: ['banana','موز'],              meal: 'BSD',
      carbsPer100g: 23,   proteinPer100g: 1.1,  fatPer100g: 0.3 },
    { nameAr: 'تفاحة',       grams: 115, suffix: 'غ (صغيرة)',
      keywords: ['apple','تفاح'],              meal: 'BSD',
      carbsPer100g: 13,   proteinPer100g: 0.3,  fatPer100g: 0.2 },
    { nameAr: 'برتقالة',     grams: 130, suffix: 'غ (متوسطة)',
      keywords: ['orange','برتقال'],           meal: 'BSD',
      carbsPer100g: 12,   proteinPer100g: 0.9,  fatPer100g: 0.1 },
    { nameAr: 'فراولة',      grams: 150, suffix: 'غ (~8 حبات)',
      keywords: ['strawberry','فراولة'],       meal: 'BSD',
      carbsPer100g: 8,    proteinPer100g: 0.7,  fatPer100g: 0.3 },
    { nameAr: 'مانجو',       grams: 80,  suffix: 'غ (½ كوب مكعبات)',
      keywords: ['mango','مانجو'],              meal: 'BSD',
      carbsPer100g: 15,   proteinPer100g: 0.8,  fatPer100g: 0.4 },
    { nameAr: 'جوافة',       grams: 115, suffix: 'غ',
      keywords: ['guava','جوافة'],              meal: 'BSD',
      carbsPer100g: 14,   proteinPer100g: 2.6,  fatPer100g: 1   },
    { nameAr: 'كيوي',        grams: 115, suffix: 'غ (حبة)',
      keywords: ['kiwi','كيوي'],               meal: 'BSD',
      carbsPer100g: 15,   proteinPer100g: 1.1,  fatPer100g: 0.5 },
    { nameAr: 'خوخ / دراق', grams: 115, suffix: 'غ (حبة)',
      keywords: ['peach','خوخ'],               meal: 'BSD',
      carbsPer100g: 10,   proteinPer100g: 0.9,  fatPer100g: 0.3 },
    { nameAr: 'إجاصة',       grams: 115, suffix: 'غ (حبة)',
      keywords: ['pear','إجاص'],               meal: 'BSD',
      carbsPer100g: 15,   proteinPer100g: 0.4,  fatPer100g: 0.1 },
    { nameAr: 'عنب',         grams: 80,  suffix: 'غ (~15 حبة)',
      keywords: ['grape','عنب'],               meal: 'BSD',
      carbsPer100g: 18,   proteinPer100g: 0.7,  fatPer100g: 0.2 },
    { nameAr: 'بطيخ',        grams: 280, suffix: 'غ',
      keywords: ['watermelon','بطيخ'],          meal: 'BSD',
      carbsPer100g: 8,    proteinPer100g: 0.6,  fatPer100g: 0.2 },
    { nameAr: 'رمان',        grams: 105, suffix: 'غ (½ رمانة)',
      keywords: ['pomegranate','رمان'],         meal: 'BSD',
      carbsPer100g: 19,   proteinPer100g: 1.7,  fatPer100g: 1.2 },
  ],

  milk: [
    { nameAr: 'حليب خالي الدسم',  grams: 240, suffix: 'مل',
      keywords: ['milk','حليب'],               meal: 'BSD',
      carbsPer100g: 5,    proteinPer100g: 3.4,  fatPer100g: 0.1 },
    { nameAr: 'زبادي خالي الدسم', grams: 245, suffix: 'غ (كوب)',
      keywords: ['yogurt','زبادي'],            meal: 'BSD',
      carbsPer100g: 6,    proteinPer100g: 5.7,  fatPer100g: 0.4 },
    { nameAr: 'لبن رايب',         grams: 240, suffix: 'مل',
      keywords: ['laban','لبن'],               meal: 'BSD',
      carbsPer100g: 5,    proteinPer100g: 3.4,  fatPer100g: 1   },
  ],

  vegetable: [
    { nameAr: 'طماطم طازجة',  grams: 100, suffix: 'غ',
      keywords: ['tomato','طماطم'],            meal: 'LD',
      carbsPer100g: 3.9,  proteinPer100g: 0.9,  fatPer100g: 0.2 },
    { nameAr: 'خيار',         grams: 120, suffix: 'غ',
      keywords: ['cucumber','خيار'],           meal: 'LD',
      carbsPer100g: 3.6,  proteinPer100g: 0.7,  fatPer100g: 0.1 },
    { nameAr: 'فلفل ألوان',   grams: 80,  suffix: 'غ',
      keywords: ['pepper','فلفل'],             meal: 'LD',
      carbsPer100g: 6,    proteinPer100g: 1,    fatPer100g: 0.3 },
    { nameAr: 'كوسة مطبوخة',  grams: 100, suffix: 'غ',                   state: 'مطبوخة',
      keywords: ['zucchini','كوسة'],           meal: 'LD',
      carbsPer100g: 3.5,  proteinPer100g: 1.2,  fatPer100g: 0.4 },
    { nameAr: 'جزر',          grams: 80,  suffix: 'غ',
      keywords: ['carrot','جزر'],              meal: 'LD',
      carbsPer100g: 10,   proteinPer100g: 0.9,  fatPer100g: 0.2 },
    { nameAr: 'خس وجرجير',    grams: 55,  suffix: 'غ',
      keywords: ['lettuce','خس'],              meal: 'LD',
      carbsPer100g: 2.2,  proteinPer100g: 2,    fatPer100g: 0.3 },
    { nameAr: 'فطر مطبوخ',    grams: 80,  suffix: 'غ',                   state: 'مطبوخ',
      keywords: ['mushroom','فطر'],            meal: 'LD',
      carbsPer100g: 3.3,  proteinPer100g: 3.6,  fatPer100g: 0.5 },
    { nameAr: 'سبانخ مطبوخة', grams: 90,  suffix: 'غ',                   state: 'مطبوخة',
      keywords: ['spinach','سبانخ'],           meal: 'LD',
      carbsPer100g: 3.8,  proteinPer100g: 3,    fatPer100g: 0.3 },
    { nameAr: 'بروكلي مطبوخ', grams: 80,  suffix: 'غ',                   state: 'مطبوخ',
      keywords: ['broccoli','بروكلي'],         meal: 'LD',
      carbsPer100g: 7,    proteinPer100g: 2.4,  fatPer100g: 0.4 },
    { nameAr: 'ملفوف',        grams: 75,  suffix: 'غ',
      keywords: ['cabbage','ملفوف','كرنب'],    meal: 'LD',
      carbsPer100g: 5.8,  proteinPer100g: 1.3,  fatPer100g: 0.1 },
  ],
}

// ── Keyword helpers ──────────────────────────────────────────────────────────
function splitKws(str) {
  return (str || '').toLowerCase().split(/[\s,،\/+]+/).filter(Boolean)
}

const GROUP_ALIASES = {
  milk:      ['حليب','ألبان','لبن','زبادي','dairy','milk'],
  vegetable: ['خضر','خضروات','خضراوات','vegetable','vegetables'],
  fruit:     ['فواكه','فاكهة','fruit','fruits'],
  starch:    ['نشويات','نشا','خبز','starch','starches'],
  meat:      ['لحوم','بروتين','meat','meats'],
  fat:       ['دهون','دهن','fat','fats'],
}

function isGroupAvoided(groupKey, avoided) {
  if (!avoided?.trim()) return false
  const avKws = splitKws(avoided)
  return (GROUP_ALIASES[groupKey] || []).some(alias =>
    avKws.some(av => alias.includes(av) || av.includes(alias))
  )
}

function foodMatchesKws(food, kws) {
  return food.keywords.some(k => kws.some(kw => k.includes(kw) || kw.includes(k)))
}

function isPreferred(food, preferred) { return preferred && foodMatchesKws(food, splitKws(preferred)) }

// ── Core Calculations ────────────────────────────────────────────────────────
// Male  : BMR = (10 × kg) + (6.25 × cm) − (5 × age) + 5
// Female: BMR = (10 × kg) + (6.25 × cm) − (5 × age) − 161
export function calcBMR(gender, weight, height, age) {
  const W = +weight, H = +height, A = +age
  const base = (10 * W) + (6.25 * H) - (5 * A)
  return gender === 'male' ? base + 5 : base - 161
}

export function calcTDEE(bmr, activityKey) {
  const af = ACTIVITY_FACTORS.find(a => a.key === activityKey)
  if (!af) console.warn(`[calcTDEE] unknown activityKey: "${activityKey}" — defaulting to moderate (1.55)`)
  return Math.round(bmr * (af || ACTIVITY_FACTORS[2]).pa)
}

// Gender-aware minimum floor: 1500 kcal men / 1200 kcal women (Academy of Nutrition and Dietetics)
// opts: { manualAdj?, weeklyRate?, currentWeight?, targetWeight? }
// Priority: manualAdj > weeklyRate > weight-comparison > goal
export function calcTarget(tdee, goalKey, gender = 'male', opts = {}) {
  const { manualAdj = null, weeklyRate = null, currentWeight = null, targetWeight = null } = opts
  const floor = gender === 'male' ? 1500 : 1200

  const mAdj  = (manualAdj  != null && manualAdj  !== '' && !isNaN(+manualAdj))  ? +manualAdj  : null
  const wRate = (weeklyRate  != null && weeklyRate  !== '' && !isNaN(+weeklyRate)) ? +weeklyRate : null
  const cw    = (currentWeight != null && currentWeight !== '' && !isNaN(+currentWeight) && +currentWeight > 0) ? +currentWeight : null
  const tw    = (targetWeight  != null && targetWeight  !== '' && !isNaN(+targetWeight)  && +targetWeight  > 0) ? +targetWeight  : null

  let adj
  if (mAdj !== null) {
    // Manual daily adjustment, clamped to safe ±1000
    adj = Math.max(-1000, Math.min(1000, Math.round(mAdj)))
  } else if (wRate !== null) {
    // Weekly weight rate → daily adj: 7700 kcal ≈ 1 kg / 7 days, clamped to ±1 kg/week
    const clampedRate = Math.max(-1, Math.min(1, wRate))
    adj = Math.max(-1000, Math.min(1000, Math.round(clampedRate * 7700 / 7)))
  } else if (cw !== null && tw !== null) {
    // Smart auto: weight comparison
    if      (cw > tw) adj = -500
    else if (cw < tw) adj = +300
    else              adj = (GOALS.find(g => g.key === goalKey) || GOALS[1]).adj
  } else {
    if (!GOALS.find(g => g.key === goalKey))
      console.warn(`[calcTarget] unknown goalKey: "${goalKey}" — defaulting to maintain`)
    adj = (GOALS.find(g => g.key === goalKey) || GOALS[1]).adj
  }

  return Math.max(floor, tdee + adj)
}

// Returns lean body mass in kg. Falls back to total weight if bodyFatPct is null/undefined.
export function calcFFM(weight, bodyFatPct) {
  if (bodyFatPct == null) return +weight
  return +weight * (1 - +bodyFatPct / 100)
}

// Protein factors: loss=2.0, maintain=1.8, gain=2.2 g/kg FFM
// Anti-sarcopenia: +0.2 for age > 55. Cap: 3.0 g/kg FFM.
export function calcProteinTarget(weight, bodyFatPct, goalKey, age = 30) {
  const goal = GOALS.find(g => g.key === goalKey) || GOALS[1]
  let factor = goal.proteinFactor
  if (+age > 55) factor += 0.2
  const ffm = calcFFM(weight, bodyFatPct)
  return Math.min(factor * ffm, 3.0 * ffm)
}

// Base: weight × 35 ml. Activity bonus added. Clamped to [2000, 5000] ml.
export function calcWaterGoal(weight, activityKey) {
  const bonusMap = { sedentary: 0, light: 300, moderate: 500, active: 700, veryActive: 900 }
  const bonus = bonusMap[activityKey] ?? 0
  const ml = Math.min(5000, Math.max(2000, Math.round(+weight * 35 + bonus)))
  return { ml, liters: +(ml / 1000).toFixed(1), glasses: Math.round(ml / 250) }
}

// Starches ≈ 1.5g avg, vegetables ≈ 2.5g, fruits ≈ 2g
export function calcFiberEstimate(ex) {
  const { starches = 0, vegetables = 0, fruits = 0 } = ex
  return Math.round(starches * 1.5 + vegetables * 2.5 + fruits * 2)
}

// opts = { age=30, bodyFatPct=null, weight=null, targetWeight=null }
export function calcExchanges(target, goalKey, avoided = '', opts = {}) {
  const { age = 30, bodyFatPct = null, weight = null, targetWeight = null } = opts
  const goal = GOALS.find(g => g.key === goalKey) || GOALS[1]
  const tw = targetWeight != null ? +targetWeight : null

  let carbCal, protCal, fatCal, cR, pR, fR

  if (tw != null) {
    // Deterministic: protein = targetWeight × 2g, fat = 25% calories, carbs = exact residual
    protCal = tw * 2 * 4
    fatCal  = target * 0.25
    carbCal = target - protCal - fatCal
    // ADA minimum 130g carbs (520 kcal)
    if (carbCal < 520) {
      const deficit = 520 - carbCal
      if (fatCal >= deficit) { fatCal -= deficit } else { protCal -= (deficit - fatCal); fatCal = 0 }
      carbCal = 520
    }
    cR = carbCal / target
    pR = protCal / target
    fR = fatCal  / target
  } else {
    // Fallback: ratio-based from goal macros
    cR = goal.macros.carbs
    pR = goal.macros.protein
    fR = goal.macros.fat
    if (+age > 55) {
      const shift = Math.min(0.08, cR - 0.30)
      cR -= shift; pR += shift
    } else if (+age > 35) {
      const shift = Math.min(0.04, cR - 0.30)
      cR -= shift; pR += shift
    }
    carbCal = target * cR
    protCal = target * pR
    fatCal  = target * fR
    if (bodyFatPct != null && weight != null) {
      const ffmProtG   = calcProteinTarget(weight, bodyFatPct, goalKey, age)
      const newProtCal = ffmProtG * 4
      if (newProtCal !== protCal) {
        const diff       = newProtCal - protCal
        const nonProtCal = carbCal + fatCal
        const carbShare  = nonProtCal > 0 ? carbCal / nonProtCal : 0.6
        const fatShare   = nonProtCal > 0 ? fatCal  / nonProtCal : 0.4
        carbCal = carbCal - diff * carbShare
        fatCal  = fatCal  - diff * fatShare
        protCal = newProtCal
        if (carbCal < 0) { fatCal += carbCal; carbCal = 0 }
        if (fatCal  < 0) { carbCal += fatCal; fatCal  = 0 }
        if (carbCal < 0) { carbCal = 0 }
      }
    }
    // ADA minimum 130g carbs (520 kcal)
    if (carbCal < 520 && target >= 520) {
      const deficit = 520 - carbCal
      if (fatCal >= deficit) { fatCal -= deficit } else { protCal -= deficit - fatCal; fatCal = 0 }
      carbCal = 520
    }
    cR = carbCal / target
    pR = protCal / target
    fR = fatCal  / target
  }

  const skipMilk  = isGroupAvoided('milk',      avoided)
  const skipVeg   = isGroupAvoided('vegetable',  avoided)
  const skipFruit = isGroupAvoided('fruit',      avoided)

  let starchPct = 0.55
  if (skipMilk)  starchPct += 0.15
  if (skipVeg)   starchPct += 0.10
  if (skipFruit) starchPct += 0.20
  starchPct = Math.min(starchPct, 0.95)

  let starches     = Math.max(3, Math.round(carbCal * starchPct    / EX.starch.kcal))
  const fruits     = skipFruit ? 0 : Math.max(2, Math.round(carbCal * 0.20 / EX.fruit.kcal))
  const vegetables = skipVeg   ? 0 : Math.max(2, Math.round(carbCal * 0.10 / EX.vegetable.kcal))
  const dairy      = skipMilk  ? 0 : Math.max(1, Math.round(carbCal * 0.15 / EX.milk.kcal))
  const meats      = Math.max(3, Math.round(protCal / EX.meat.kcal))
  const fats       = Math.max(2, Math.round(fatCal  / EX.fat.kcal))

  // Calorie normalization — adjust starches to close gap
  let actualKcal =
    starches * EX.starch.kcal + meats * EX.meat.kcal + dairy * EX.milk.kcal +
    fats * EX.fat.kcal + fruits * EX.fruit.kcal + vegetables * EX.vegetable.kcal

  if (actualKcal > target + 80) {
    const reduce = Math.ceil((actualKcal - target) / EX.starch.kcal)
    starches = Math.max(3, starches - reduce)
  } else if (actualKcal < target - 80) {
    const add = Math.ceil((target - actualKcal) / EX.starch.kcal)
    starches = starches + add
  }

  actualKcal =
    starches * EX.starch.kcal + meats * EX.meat.kcal + dairy * EX.milk.kcal +
    fats * EX.fat.kcal + fruits * EX.fruit.kcal + vegetables * EX.vegetable.kcal

  const carbsG   = starches * 15 + fruits * 15 + vegetables * 5  + dairy * 12
  const proteinG = meats * 7     + dairy  * 8   + starches * 3   + vegetables * 2
  const fatG     = meats * 2     + fats   * 5   + starches * 1

  const fiberG = Math.round(starches * 2 + vegetables * 2.5 + fruits * 2)

  return {
    starches, meats, dairy, fats, fruits, vegetables,
    actualKcal,
    macros: { carbs: Math.round(carbsG), protein: Math.round(proteinG), fat: Math.round(fatG) },
    pct:    { carbs: Math.round(cR*100), protein: Math.round(pR*100),   fat: Math.round(fR*100) },
    raw:    { carbCal: Math.round(carbCal), protCal: Math.round(protCal), fatCal: Math.round(fatCal) },
    skipped: { milk: skipMilk, vegetable: skipVeg, fruit: skipFruit },
    fiber:   { g: fiberG, recommended: +age > 50 ? 30 : 25 },
    proteinTarget: tw != null ? Math.round(tw * 2) : (bodyFatPct != null ? Math.round(calcProteinTarget(weight, bodyFatPct, goalKey, age)) : null),
  }
}

// ── Meal Templates ───────────────────────────────────────────────────────────
const TEMPLATES = {
  3: [
    { name: 'الفطور',  time: '07:30', icon: '🌅', code: 'B', pct: { starch:.25, meat:.20, milk:.60, fruit:.40, veg:0,    fat:.50 } },
    { name: 'الغداء',  time: '13:00', icon: '🍽️', code: 'L', pct: { starch:.50, meat:.55, milk:.25, fruit:.35, veg:.60,  fat:.35 } },
    { name: 'العشاء',  time: '20:00', icon: '🌙', code: 'D', pct: { starch:.25, meat:.25, milk:.15, fruit:.25, veg:.40,  fat:.15 } },
  ],
  4: [
    { name: 'الفطور',             time: '07:30', icon: '🌅', code: 'B', pct: { starch:.25, meat:.20, milk:.50, fruit:.30, veg:0,    fat:.50 } },
    { name: 'الغداء',             time: '13:00', icon: '🍽️', code: 'L', pct: { starch:.45, meat:.50, milk:.25, fruit:.30, veg:.60,  fat:.35 } },
    { name: 'وجبة خفيفة مسائية', time: '16:30', icon: '🍎', code: 'S', pct: { starch:.10, meat:.10, milk:.25, fruit:.20, veg:0,    fat:.15 } },
    { name: 'العشاء',             time: '20:00', icon: '🌙', code: 'D', pct: { starch:.20, meat:.20, milk:.00, fruit:.20, veg:.40,  fat:.00 } },
  ],
  5: [
    { name: 'الفطور',             time: '07:30', icon: '🌅', code: 'B', pct: { starch:.25, meat:.15, milk:.50, fruit:.25, veg:0,    fat:.50 } },
    { name: 'وجبة خفيفة صباحية', time: '10:30', icon: '🍎', code: 'S', pct: { starch:.05, meat:.05, milk:.25, fruit:.25, veg:0,    fat:.10 } },
    { name: 'الغداء',             time: '13:00', icon: '🍽️', code: 'L', pct: { starch:.40, meat:.50, milk:.00, fruit:.20, veg:.60,  fat:.30 } },
    { name: 'وجبة خفيفة مسائية', time: '16:30', icon: '🥤', code: 'S', pct: { starch:.05, meat:.05, milk:.25, fruit:.15, veg:0,    fat:.10 } },
    { name: 'العشاء',             time: '20:00', icon: '🌙', code: 'D', pct: { starch:.25, meat:.25, milk:.00, fruit:.15, veg:.40,  fat:.00 } },
  ],
}

// ── Smart Menu Generator ─────────────────────────────────────────────────────
// Meal macros use ADA exchange reference values (not USDA per-food) so meal kcal sum = actualKcal.
export function generateMenu(ex, mealCount = 5, preferred = '', avoided = '', dayOffset = 0) {
  const count = [3, 4, 5].includes(+mealCount) ? +mealCount : 5
  const tpls  = TEMPLATES[count]
  const avoidKws = splitKws(avoided)

  // Build filtered food pools per group
  const pool = {}
  for (const [grp, list] of Object.entries(FOODS)) {
    if (isGroupAvoided(grp, avoided)) {
      pool[grp] = []
    } else {
      const filtered = list.filter(f =>
        !f.keywords.some(k => avoidKws.some(av => k.includes(av) || av.includes(k)))
      )
      pool[grp] = filtered.length ? filtered : list
    }
  }

  const rot = { starch: dayOffset, meat: dayOffset, milk: dayOffset, fruit: dayOffset, vegetable: dayOffset, fat: dayOffset }

  return tpls.map(tpl => {
    const sC = Math.max(0, Math.round(ex.starches   * tpl.pct.starch))
    const mC = Math.max(0, Math.round(ex.meats      * tpl.pct.meat))
    const dC = Math.max(0, Math.round(ex.dairy      * tpl.pct.milk))
    const fC = Math.max(0, Math.round(ex.fruits     * tpl.pct.fruit))
    const vC = Math.max(0, Math.round(ex.vegetables * tpl.pct.veg))
    const fR = Math.max(0, Math.round(ex.fats       * tpl.pct.fat))

    const items = []
    const mealCode = tpl.code

    // Aggregate macros using ADA exchange reference values — ensures meal sum = actualKcal
    let totalKcal = 0, totalCarbs = 0, totalProtein = 0, totalFat = 0

    function pushItem(group, icon, servings, food, exRef) {
      const g = food.grams * servings
      totalKcal    += exRef.kcal    * servings
      totalCarbs   += exRef.carbs   * servings
      totalProtein += exRef.protein * servings
      totalFat     += exRef.fat     * servings
      items.push({ group, icon, servings, food: food.nameAr, amount: `${g} ${food.suffix}` })
    }

    // ── STARCH ──────────────────────────────────────────────────────────────
    if (sC > 0 && pool.starch.length) {
      const sorted = ['B','S'].includes(mealCode)
        ? [...pool.starch].sort((a, b) => {
            const sc = (b.meal||'').includes('B') - (a.meal||'').includes('B')
            return sc !== 0 ? sc : (isPreferred(b, preferred) ? 1 : 0) - (isPreferred(a, preferred) ? 1 : 0)
          })
        : [...pool.starch].sort((a, b) => {
            const sc = (b.meal||'').includes('L') - (a.meal||'').includes('L')
            return sc !== 0 ? sc : (isPreferred(b, preferred) ? 1 : 0) - (isPreferred(a, preferred) ? 1 : 0)
          })
      const food  = sorted[rot.starch % sorted.length]
      const grpEx = food.isLegume ? EX.legume : EX.starch
      pushItem(grpEx.nameAr, grpEx.icon, sC, food, grpEx)
      rot.starch++
    }

    // ── MEAT / PROTEIN ───────────────────────────────────────────────────────
    if (mC > 0 && pool.meat.length) {
      const ctxPool = ['B','S'].includes(mealCode)
        ? pool.meat.filter(f => (f.meal || '').includes('B'))
        : pool.meat.filter(f => (f.meal || '').includes(mealCode) || (f.meal || '').includes('L'))
      const meatPool = ctxPool.length ? ctxPool : pool.meat
      const sorted   = [...meatPool].sort((a, b) =>
        (isPreferred(b, preferred) ? 1 : 0) - (isPreferred(a, preferred) ? 1 : 0)
      )
      pushItem(EX.meat.nameAr, EX.meat.icon, mC, sorted[rot.meat % sorted.length], EX.meat)
      rot.meat++
    }

    // ── DAIRY ────────────────────────────────────────────────────────────────
    if (dC > 0 && pool.milk.length) {
      pushItem(EX.milk.nameAr, EX.milk.icon, dC, pool.milk[rot.milk % pool.milk.length], EX.milk)
      rot.milk++
    }

    // ── FRUIT ────────────────────────────────────────────────────────────────
    if (fC > 0 && pool.fruit.length) {
      pushItem(EX.fruit.nameAr, EX.fruit.icon, fC, pool.fruit[rot.fruit % pool.fruit.length], EX.fruit)
      rot.fruit++
    }

    // ── FATS — smart split for breakfast/snack ────────────────────────────────
    if (fR > 0 && pool.fat.length) {
      if (['B','S'].includes(mealCode)) {
        const bFats = [...pool.fat].sort((a, b) => {
          const sc = (b.meal||'').includes('B') - (a.meal||'').includes('B')
          return sc !== 0 ? sc : (isPreferred(b, preferred) ? 1 : 0) - (isPreferred(a, preferred) ? 1 : 0)
        })
        const maxItems    = Math.min(fR, 3)
        const usedFatNames = new Set()
        let remaining = fR, placed = 0
        for (const fat of bFats) {
          if (placed >= maxItems || remaining <= 0) break
          if (usedFatNames.has(fat.nameAr)) continue
          usedFatNames.add(fat.nameAr)
          const srv = placed === maxItems - 1 ? remaining : 1
          pushItem(EX.fat.nameAr, EX.fat.icon, srv, fat, EX.fat)
          remaining -= srv
          placed++
        }
      } else {
        const lFats  = pool.fat.filter(f => (f.meal||'').includes('L') || (f.meal||'').includes('D'))
        const fallbk = lFats.length ? lFats : pool.fat
        const sorted = [...fallbk].sort((a, b) =>
          (isPreferred(b, preferred) ? 1 : 0) - (isPreferred(a, preferred) ? 1 : 0)
        )
        pushItem(EX.fat.nameAr, EX.fat.icon, fR, sorted[rot.fat % sorted.length], EX.fat)
        rot.fat++
      }
    }

    // ── VEGETABLES — two different types ────────────────────────────────────
    if (vC > 0 && pool.vegetable.length) {
      const half = Math.ceil(vC / 2)
      const v1   = pool.vegetable[rot.vegetable % pool.vegetable.length]
      pushItem(EX.vegetable.nameAr, EX.vegetable.icon, half, v1, EX.vegetable)
      if (vC > 1 && pool.vegetable.length > 1) {
        const v2 = pool.vegetable[(rot.vegetable + 1) % pool.vegetable.length]
        pushItem(EX.vegetable.nameAr, EX.vegetable.icon, vC - half, v2, EX.vegetable)
      }
      rot.vegetable++
    }

    return {
      ...tpl,
      items,
      kcal:    Math.round(totalKcal),
      carbs:   Math.round(totalCarbs),
      protein: Math.round(totalProtein),
      fat:     Math.round(totalFat),
    }
  })
}

export function getGoal(key)     { return GOALS.find(g => g.key === key) || GOALS[1] }
export function getActivity(key) { return ACTIVITY_FACTORS.find(a => a.key === key) || ACTIVITY_FACTORS[2] }

// ── Regional food adaptation ──────────────────────────────────────────────────
export function getRegion(country) {
  const c = (country || '').toUpperCase()
  if (['TN','MA','DZ','LY'].includes(c))       return 'maghreb'
  if (['QA','AE','SA','KW','BH','OM'].includes(c)) return 'gulf'
  if (['SY','LB','JO','PS'].includes(c))       return 'levant'
  if (c === 'EG')                              return 'egypt'
  if (['IQ','YE','SD','MR'].includes(c))       return 'arab_other'
  return 'global'
}

// Appended to the "preferred foods" field to bias food selection toward local staples
export const REGION_FOOD_HINTS = {
  maghreb:    'كسكسي، مسمن، تونة، زيتون، هريسة، فول مدمس، عدس',
  gulf:       'أرز بسمتي، تمر، سمك هامور، خبز عربي، مشاوي',
  levant:     'فول مدمس، حمص، لبنة، زيتون، خبز عربي، سبانخ',
  egypt:      'فول مدمس، أرز أبيض، ملوخية، خبز بلدي، عدس',
  arab_other: 'أرز، دجاج، تمر، زيتون، خبز عربي',
  global:     '',
}

export const REGION_LABELS = {
  maghreb:    'المغرب العربي (تونس / المغرب / الجزائر / ليبيا)',
  gulf:       'الخليج العربي (قطر / الإمارات / السعودية / الكويت / البحرين / عُمان)',
  levant:     'بلاد الشام (سوريا / لبنان / الأردن / فلسطين)',
  egypt:      'مصر',
  arab_other: 'العالم العربي',
  global:     '',
}
