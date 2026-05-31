// ─── Nutrition Engine v2 — Smart Tunisian Meal Patterns ─────────────────────
// Harris-Benedict BMR + ADA Exchange System + meal-context food selection

export const ACTIVITY_FACTORS = [
  { key: 'sedentary',  label: 'خامل — عمل مكتبي، لا رياضة',        pa: 1.20  },
  { key: 'light',      label: 'خفيف — رياضة 1–3 أيام/أسبوع',        pa: 1.375 },
  { key: 'moderate',   label: 'معتدل — رياضة 3–5 أيام/أسبوع',       pa: 1.55  },
  { key: 'active',     label: 'نشيط — رياضة 6–7 أيام/أسبوع',        pa: 1.725 },
  { key: 'veryActive', label: 'نشيط جداً — تدريب مكثف يومياً',       pa: 1.90  },
]

export const GOALS = [
  { key: 'loss',    label: 'خسارة الوزن',      icon: '📉', adj: -500, macros: { carbs: 0.40, protein: 0.35, fat: 0.25 } },
  { key: 'maintain',label: 'الحفاظ على الوزن', icon: '⚖️', adj: 0,    macros: { carbs: 0.50, protein: 0.25, fat: 0.25 } },
  { key: 'gain',    label: 'بناء العضلات',      icon: '💪', adj: 300,  macros: { carbs: 0.50, protein: 0.30, fat: 0.20 } },
]

// Exchange values per 1 serving
export const EX = {
  starch:    { nameAr: 'النشويات',          icon: '🌾', carbs: 15, protein: 3,  fat: 0, kcal: 80  },
  meat:      { nameAr: 'اللحوم والبروتين', icon: '🥩', carbs: 0,  protein: 7,  fat: 3, kcal: 55  },
  milk:      { nameAr: 'منتجات الألبان',   icon: '🥛', carbs: 12, protein: 8,  fat: 0, kcal: 90  },
  fat:       { nameAr: 'الدهون',            icon: '🫒', carbs: 0,  protein: 0,  fat: 5, kcal: 45  },
  fruit:     { nameAr: 'الفواكه',           icon: '🍎', carbs: 15, protein: 0,  fat: 0, kcal: 60  },
  vegetable: { nameAr: 'الخضروات',          icon: '🥦', carbs: 5,  protein: 2,  fat: 0, kcal: 25  },
}

// ── Expanded Food Database with Meal Context ─────────────────────────────────
// meal: B=breakfast  S=snack  L=lunch  D=dinner
export const FOODS = {
  starch: [
    { nameAr: 'توست كامل',          grams: 30,  suffix: 'غ (شريحة)',        keywords: ['توست','toast'],            meal: 'BSD' },
    { nameAr: 'أرز أبيض مطبوخ',    grams: 45,  suffix: 'غ مطبوخ',          keywords: ['rice','أرز'],              meal: 'LD'  },
    { nameAr: 'بطاطا مسلوقة',       grams: 90,  suffix: 'غ',                keywords: ['بطاطا','potato'],           meal: 'LD'  },
    { nameAr: 'كسكسي مطبوخ',        grams: 45,  suffix: 'غ مطبوخ',          keywords: ['كسكس','couscous'],          meal: 'L'   },
    { nameAr: 'معكرونة مطبوخة',     grams: 70,  suffix: 'غ مطبوخة',         keywords: ['pasta','معكرونة'],          meal: 'LD'  },
    { nameAr: 'بطاطا حلوة مسلوقة', grams: 80,  suffix: 'غ',                keywords: ['بطاطا حلوة'],              meal: 'LD'  },
    { nameAr: 'خبز عربي',           grams: 30,  suffix: 'غ (نصف رغيف)',     keywords: ['خبز','bread'],              meal: 'BSD' },
    { nameAr: 'شوفان جافة',         grams: 20,  suffix: 'غ',                keywords: ['شوفان','oat'],              meal: 'B'   },
  ],
  meat: [
    { nameAr: 'صدر دجاج مشوي',     grams: 30,  suffix: 'غ مطبوخ',           keywords: ['chicken','دجاج'],          meal: 'LD'  },
    { nameAr: 'سمك أبيض مشوي',     grams: 30,  suffix: 'غ مطبوخ',           keywords: ['fish','سمك','سمك أبيض'],   meal: 'LD'  },
    { nameAr: 'سمك سلمون مشوي',    grams: 30,  suffix: 'غ مطبوخ',           keywords: ['سلمون','salmon'],           meal: 'LD'  },
    { nameAr: 'تونة في الماء',      grams: 30,  suffix: 'غ مصفّى',           keywords: ['تونة','tuna'],             meal: 'LDS' },
    { nameAr: 'لحم بقري مشوي',     grams: 30,  suffix: 'غ مطبوخ',           keywords: ['beef','لحم بقري','لحم'],   meal: 'L'   },
    { nameAr: 'كبدة بقري مشوية',   grams: 30,  suffix: 'غ مطبوخة',          keywords: ['كبدة','liver'],             meal: 'L'   },
    { nameAr: 'سردين في الماء',     grams: 30,  suffix: 'غ',                 keywords: ['سردين','sardine'],          meal: 'LDS' },
    { nameAr: 'جمبري مسلوق',       grams: 30,  suffix: 'غ',                 keywords: ['جمبري','shrimp'],           meal: 'LD'  },
    { nameAr: 'بيضة مسلوقة',       grams: 50,  suffix: 'غ (بيضة)',          keywords: ['egg','بيض','بيضة'],         meal: 'BSD' },
    { nameAr: 'جبن مطبوخة',        grams: 30,  suffix: 'غ (قطعة)',          keywords: ['جبن','cheese','fromage','جبن مطبوخ'], meal: 'BSD' },
  ],
  fat: [
    { nameAr: 'زبدة طبيعية',       grams: 10,  suffix: 'غ',                 keywords: ['زبدة','butter'],           meal: 'B'   },
    { nameAr: 'عسل طبيعي',         grams: 15,  suffix: 'غ',                 keywords: ['عسل','honey'],             meal: 'B'   },
    { nameAr: 'لوز نيء',           grams: 15,  suffix: 'غ',                 keywords: ['لوز','almond'],            meal: 'BS'  },
    { nameAr: 'فستق حلبي نيء',     grams: 15,  suffix: 'غ',                 keywords: ['فستق','pistachio'],         meal: 'BS'  },
    { nameAr: 'كاجو نيء',          grams: 15,  suffix: 'غ',                 keywords: ['كاجو','cashew'],            meal: 'BS'  },
    { nameAr: 'جوز',               grams: 10,  suffix: 'غ',                 keywords: ['جوز','walnut'],             meal: 'BS'  },
    { nameAr: 'زيت زيتون',         grams: 5,   suffix: 'مل',                keywords: ['زيتون','olive','زيت'],     meal: 'L'   },
    { nameAr: 'زيت نباتي',         grams: 5,   suffix: 'مل',                keywords: ['زيت نباتي'],               meal: 'L'   },
    { nameAr: 'أفوكادو',           grams: 20,  suffix: 'غ',                 keywords: ['أفوكادو','avocado'],        meal: 'L'   },
  ],
  fruit: [
    { nameAr: 'موز',               grams: 90,  suffix: 'غ (متوسطة)',         keywords: ['banana','موز'],             meal: 'BSD' },
    { nameAr: 'تفاحة',             grams: 115, suffix: 'غ (صغيرة)',          keywords: ['apple','تفاح'],             meal: 'BSD' },
    { nameAr: 'برتقالة',           grams: 130, suffix: 'غ (متوسطة)',         keywords: ['orange','برتقال'],          meal: 'BSD' },
    { nameAr: 'فراولة',            grams: 150, suffix: 'غ',                 keywords: ['strawberry','فراولة'],      meal: 'BSD' },
    { nameAr: 'مانجو',             grams: 100, suffix: 'غ',                 keywords: ['mango','مانجو'],             meal: 'BSD' },
    { nameAr: 'جوافة',             grams: 120, suffix: 'غ',                 keywords: ['guava','جوافة'],             meal: 'BSD' },
    { nameAr: 'كيوي',              grams: 115, suffix: 'غ (حبة)',           keywords: ['kiwi','كيوي'],              meal: 'BSD' },
    { nameAr: 'خوخ / دراق',       grams: 115, suffix: 'غ (حبة)',           keywords: ['peach','خوخ'],              meal: 'BSD' },
    { nameAr: 'إجاصة',             grams: 115, suffix: 'غ (حبة)',           keywords: ['pear','إجاص'],              meal: 'BSD' },
    { nameAr: 'عنب',               grams: 80,  suffix: 'غ (~15 حبة)',       keywords: ['grape','عنب'],              meal: 'BSD' },
    { nameAr: 'بطيخ',              grams: 280, suffix: 'غ',                 keywords: ['watermelon','بطيخ'],        meal: 'BSD' },
  ],
  milk: [
    { nameAr: 'حليب خالي الدسم',  grams: 240, suffix: 'مل',                keywords: ['milk','حليب'],              meal: 'BSD' },
    { nameAr: 'زبادي خالي الدسم', grams: 245, suffix: 'غ (كوب)',            keywords: ['yogurt','زبادي'],           meal: 'BSD' },
    { nameAr: 'لبن رايب',         grams: 240, suffix: 'مل',                keywords: ['laban','لبن'],              meal: 'BSD' },
  ],
  vegetable: [
    { nameAr: 'طماطم طازجة',      grams: 100, suffix: 'غ',                  keywords: ['tomato','طماطم'],           meal: 'LD'  },
    { nameAr: 'خيار',             grams: 120, suffix: 'غ',                  keywords: ['cucumber','خيار'],          meal: 'LD'  },
    { nameAr: 'فلفل ألوان',       grams: 80,  suffix: 'غ',                  keywords: ['pepper','فلفل'],            meal: 'LD'  },
    { nameAr: 'كوسة مطبوخة',      grams: 100, suffix: 'غ',                  keywords: ['zucchini','كوسة'],          meal: 'LD'  },
    { nameAr: 'جزر',              grams: 80,  suffix: 'غ',                  keywords: ['carrot','جزر'],             meal: 'LD'  },
    { nameAr: 'خس وجرجير',        grams: 55,  suffix: 'غ',                  keywords: ['lettuce','خس'],             meal: 'LD'  },
    { nameAr: 'فطر مطبوخ',        grams: 80,  suffix: 'غ',                  keywords: ['mushroom','فطر'],           meal: 'LD'  },
    { nameAr: 'سبانخ مطبوخة',     grams: 90,  suffix: 'غ',                  keywords: ['spinach','سبانخ'],          meal: 'LD'  },
    { nameAr: 'إجاصة خضراء',      grams: 100, suffix: 'غ',                  keywords: ['zucchini','إجاصة'],         meal: 'LD'  },
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
function isAvoided(food, avoided)    { return avoided   && foodMatchesKws(food, splitKws(avoided))   }

// Pick best food from a list: preferred first, then by meal context, never avoided
function pickFood(list, preferred, avoided, mealCode, usedNames = new Set()) {
  const avoidKws = splitKws(avoided)
  const available = list.filter(f =>
    !usedNames.has(f.nameAr) &&
    !f.keywords.some(k => avoidKws.some(av => k.includes(av) || av.includes(k)))
  )
  if (!available.length) return list[0] // absolute fallback

  // Priority order: preferred + meal match > preferred > meal match > any
  const score = f => {
    const pref = isPreferred(f, preferred) ? 2 : 0
    const ctx  = (f.meal || '').includes(mealCode) ? 1 : 0
    return pref + ctx
  }
  return available.sort((a, b) => score(b) - score(a))[0]
}

// ── Core Calculations ────────────────────────────────────────────────────────
export function calcBMR(gender, weight, height, age) {
  const W = +weight, H = +height, A = +age
  if (gender === 'male') return 66.47 + (13.75 * W) + (5.003 * H) - (6.755 * A)
  return 655.1 + (9.563 * W) + (1.850 * H) - (4.676 * A)
}

export function calcTDEE(bmr, activityKey) {
  const af = ACTIVITY_FACTORS.find(a => a.key === activityKey) || ACTIVITY_FACTORS[2]
  return Math.round(bmr * af.pa)
}

export function calcTarget(tdee, goalKey) {
  const goal = GOALS.find(g => g.key === goalKey) || GOALS[1]
  return Math.max(1200, tdee + goal.adj)
}

export function calcExchanges(target, goalKey, avoided = '') {
  const goal = GOALS.find(g => g.key === goalKey) || GOALS[1]
  const { carbs: cR, protein: pR, fat: fR } = goal.macros

  const carbCal = target * cR
  const protCal = target * pR
  const fatCal  = target * fR

  const skipMilk  = isGroupAvoided('milk',      avoided)
  const skipVeg   = isGroupAvoided('vegetable',  avoided)
  const skipFruit = isGroupAvoided('fruit',      avoided)

  let starchPct = 0.55
  if (skipMilk)  starchPct += 0.15
  if (skipVeg)   starchPct += 0.10
  if (skipFruit) starchPct += 0.20

  const starches   = Math.max(3, Math.round(carbCal * starchPct / EX.starch.kcal))
  const fruits     = skipFruit ? 0 : Math.max(2, Math.round(carbCal * 0.20 / EX.fruit.kcal))
  const vegetables = skipVeg   ? 0 : Math.max(2, Math.round(carbCal * 0.10 / EX.vegetable.kcal))
  const dairy      = skipMilk  ? 0 : Math.max(1, Math.round(carbCal * 0.15 / EX.milk.kcal))
  const meats      = Math.max(3, Math.round(protCal / EX.meat.kcal))
  const fats       = Math.max(2, Math.round(fatCal  / EX.fat.kcal))

  const actualKcal =
    starches*EX.starch.kcal + meats*EX.meat.kcal + dairy*EX.milk.kcal +
    fats*EX.fat.kcal + fruits*EX.fruit.kcal + vegetables*EX.vegetable.kcal

  const carbsG   = starches*15 + fruits*15 + vegetables*5  + dairy*12
  const proteinG = meats*7     + dairy*8   + starches*3    + vegetables*2
  const fatG     = meats*3     + fats*5

  return {
    starches, meats, dairy, fats, fruits, vegetables,
    actualKcal,
    macros: { carbs: Math.round(carbsG), protein: Math.round(proteinG), fat: Math.round(fatG) },
    pct:    { carbs: Math.round(cR*100), protein: Math.round(pR*100),   fat: Math.round(fR*100) },
    raw:    { carbCal: Math.round(carbCal), protCal: Math.round(protCal), fatCal: Math.round(fatCal) },
    skipped: { milk: skipMilk, vegetable: skipVeg, fruit: skipFruit },
  }
}

// ── Meal Templates ───────────────────────────────────────────────────────────
const TEMPLATES = {
  3: [
    { name: 'الفطور',  time: '07:30', icon: '🌅', code: 'B', pct: { starch:.30, meat:.20, milk:.60, fruit:.40, veg:0,    fat:.50 } },
    { name: 'الغداء',  time: '13:00', icon: '🍽️', code: 'L', pct: { starch:.45, meat:.50, milk:.25, fruit:.35, veg:.60,  fat:.35 } },
    { name: 'العشاء',  time: '20:00', icon: '🌙', code: 'D', pct: { starch:.25, meat:.30, milk:.15, fruit:.25, veg:.40,  fat:.15 } },
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
export function generateMenu(ex, mealCount = 5, preferred = '', avoided = '') {
  const count = [3, 4, 5].includes(+mealCount) ? +mealCount : 5
  const tpls  = TEMPLATES[count]
  const avoidKws = splitKws(avoided)

  // Pre-filter each food group removing avoided items (item-level)
  const pool = {}
  for (const [grp, list] of Object.entries(FOODS)) {
    if (isGroupAvoided(
      grp === 'milk' ? 'milk' : grp === 'vegetable' ? 'vegetable' :
      grp === 'fruit' ? 'fruit' : grp === 'starch' ? 'starch' :
      grp === 'meat' ? 'meat' : 'fat', avoided)) {
      pool[grp] = []
    } else {
      const filtered = list.filter(f => !f.keywords.some(k => avoidKws.some(av => k.includes(av) || av.includes(k))))
      pool[grp] = filtered.length ? filtered : list
    }
  }

  // Rotation counters per group (different food each meal)
  const rot = { starch: 0, meat: 0, milk: 0, fruit: 0, vegetable: 0, fat: 0 }

  return tpls.map(tpl => {
    const sC = Math.max(0, Math.round(ex.starches    * tpl.pct.starch))
    const mC = Math.max(0, Math.round(ex.meats       * tpl.pct.meat))
    const dC = Math.max(0, Math.round(ex.dairy       * tpl.pct.milk))
    const fC = Math.max(0, Math.round(ex.fruits      * tpl.pct.fruit))
    const vC = Math.max(0, Math.round(ex.vegetables  * tpl.pct.veg))
    const fR = Math.max(0, Math.round(ex.fats        * tpl.pct.fat))

    const mealKcal  = sC*80 + mC*55 + dC*90 + fC*60 + vC*25 + fR*45
    const mealCarbs = sC*15 + fC*15 + vC*5  + dC*12
    const mealProt  = mC*7  + dC*8  + sC*3  + vC*2
    const mealFat   = mC*3  + fR*5

    const items = []
    const mealCode = tpl.code // B S L D

    // ── STARCH ──────────────────────────────────────────────────────────────
    if (sC > 0 && pool.starch.length) {
      // Breakfast/Snack → prefer toast; Lunch/Dinner → prefer rice/potato
      const preferred_meal = ['B','S'].includes(mealCode)
        ? [...pool.starch].sort((a,b) => {
            const aB = (a.meal||'').includes('B') ? 1 : 0
            const bB = (b.meal||'').includes('B') ? 1 : 0
            const aPref = isPreferred(a, preferred) ? 2 : 0
            const bPref = isPreferred(b, preferred) ? 2 : 0
            return (bB+bPref) - (aB+aPref)
          })
        : [...pool.starch].sort((a,b) => {
            const aL = (a.meal||'').includes('L') ? 1 : 0
            const bL = (b.meal||'').includes('L') ? 1 : 0
            const aPref = isPreferred(a, preferred) ? 2 : 0
            const bPref = isPreferred(b, preferred) ? 2 : 0
            return (bL+bPref) - (aL+aPref)
          })
      const food = preferred_meal[rot.starch % preferred_meal.length]
      items.push({ group: EX.starch.nameAr, icon: EX.starch.icon, servings: sC, food: food.nameAr, amount: `${food.grams * sC} ${food.suffix}` })
      rot.starch++
    }

    // ── MEAT / PROTEIN ───────────────────────────────────────────────────────
    if (mC > 0 && pool.meat.length) {
      // Breakfast/Snack → prefer cheese, egg; Lunch/Dinner → prefer actual meat/fish
      const sortedMeat = ['B','S'].includes(mealCode)
        ? [...pool.meat].sort((a,b) => {
            const aB = (a.meal||'').includes('B') ? 1 : 0
            const bB = (b.meal||'').includes('B') ? 1 : 0
            const aPref = isPreferred(a, preferred) ? 2 : 0
            const bPref = isPreferred(b, preferred) ? 2 : 0
            return (bB+bPref) - (aB+aPref)
          })
        : [...pool.meat].sort((a,b) => {
            const aL = (a.meal||'').includes('L') ? 1 : 0
            const bL = (b.meal||'').includes('L') ? 1 : 0
            const aPref = isPreferred(a, preferred) ? 2 : 0
            const bPref = isPreferred(b, preferred) ? 2 : 0
            return (bL+bPref) - (aL+aPref)
          })
      const food = sortedMeat[rot.meat % sortedMeat.length]
      items.push({ group: EX.meat.nameAr, icon: EX.meat.icon, servings: mC, food: food.nameAr, amount: `${food.grams * mC} ${food.suffix}` })
      rot.meat++
    }

    // ── DAIRY ────────────────────────────────────────────────────────────────
    if (dC > 0 && pool.milk.length) {
      const food = pool.milk[rot.milk % pool.milk.length]
      items.push({ group: EX.milk.nameAr, icon: EX.milk.icon, servings: dC, food: food.nameAr, amount: `${food.grams * dC} ${food.suffix}` })
      rot.milk++
    }

    // ── FRUIT ────────────────────────────────────────────────────────────────
    if (fC > 0 && pool.fruit.length) {
      const food = pool.fruit[rot.fruit % pool.fruit.length]
      items.push({ group: EX.fruit.nameAr, icon: EX.fruit.icon, servings: fC, food: food.nameAr, amount: `${food.grams * fC} ${food.suffix}` })
      rot.fruit++
    }

    // ── FATS — smart split for breakfast ────────────────────────────────────
    if (fR > 0 && pool.fat.length) {
      if (['B','S'].includes(mealCode)) {
        // Breakfast: spread across different items (butter + honey + nuts) — cap at 3
        const bFats = [...pool.fat].sort((a,b) => {
          const aB = (a.meal||'').includes('B') ? 1 : 0
          const bB = (b.meal||'').includes('B') ? 1 : 0
          const aPref = isPreferred(a, preferred) ? 2 : 0
          const bPref = isPreferred(b, preferred) ? 2 : 0
          return (bB+bPref) - (aB+aPref)
        })
        const maxItems = Math.min(fR, 3) // max 3 different fat items for breakfast
        const usedFatNames = new Set()
        let remaining = fR
        let placed = 0
        for (const fat of bFats) {
          if (placed >= maxItems || remaining <= 0) break
          if (usedFatNames.has(fat.nameAr)) continue
          usedFatNames.add(fat.nameAr)
          const srv = placed === maxItems - 1 ? remaining : 1
          items.push({ group: EX.fat.nameAr, icon: EX.fat.icon, servings: srv, food: fat.nameAr, amount: `${fat.grams * srv} ${fat.suffix}` })
          remaining -= srv
          placed++
        }
      } else {
        // Lunch/Dinner: enforce meal context — breakfast-only fats (زبدة/عسل) should not appear here
        const lFats = [...pool.fat]
          .filter(f => (f.meal||'').includes('L') || (f.meal||'').includes('D'))
        const fallback = lFats.length ? lFats : pool.fat
        const sorted = [...fallback].sort((a,b) => {
          const aPref = isPreferred(a, preferred) ? 1 : 0
          const bPref = isPreferred(b, preferred) ? 1 : 0
          return bPref - aPref
        })
        const food = sorted[rot.fat % sorted.length]
        items.push({ group: EX.fat.nameAr, icon: EX.fat.icon, servings: fR, food: food.nameAr, amount: `${food.grams * fR} ${food.suffix}` })
        rot.fat++
      }
    }

    // ── VEGETABLES — two different types ────────────────────────────────────
    if (vC > 0 && pool.vegetable.length) {
      const half = Math.ceil(vC / 2)
      const v1 = pool.vegetable[rot.vegetable % pool.vegetable.length]
      items.push({ group: EX.vegetable.nameAr, icon: EX.vegetable.icon, servings: half, food: v1.nameAr, amount: `${v1.grams * half} ${v1.suffix}` })
      if (vC > 1 && pool.vegetable.length > 1) {
        const v2 = pool.vegetable[(rot.vegetable + 1) % pool.vegetable.length]
        items.push({ group: EX.vegetable.nameAr, icon: EX.vegetable.icon, servings: vC - half, food: v2.nameAr, amount: `${v2.grams * (vC-half)} ${v2.suffix}` })
      }
      rot.vegetable++
    }

    return { ...tpl, items, kcal: mealKcal, carbs: mealCarbs, protein: mealProt, fat: mealFat }
  })
}

export function getGoal(key)     { return GOALS.find(g => g.key === key) || GOALS[1] }
export function getActivity(key) { return ACTIVITY_FACTORS.find(a => a.key === key) || ACTIVITY_FACTORS[2] }
