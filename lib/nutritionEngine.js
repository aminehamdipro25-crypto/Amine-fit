// ─── Complete Nutrition Engine — Food Exchange System ───────────────────────
// Harris-Benedict BMR + ADA Exchange System (exact values per client prompt)

export const ACTIVITY_FACTORS = [
  { key: 'sedentary',   label: 'خامل — عمل مكتبي، لا رياضة',          pa: 1.20  },
  { key: 'light',       label: 'خفيف — رياضة 1–3 أيام/أسبوع',          pa: 1.375 },
  { key: 'moderate',    label: 'معتدل — رياضة 3–5 أيام/أسبوع',          pa: 1.55  },
  { key: 'active',      label: 'نشيط — رياضة 6–7 أيام/أسبوع',           pa: 1.725 },
  { key: 'veryActive',  label: 'نشيط جداً — تدريب مكثف يومياً',          pa: 1.90  },
]

export const GOALS = [
  { key: 'loss',     label: 'خسارة الوزن',      labelEn: 'Fat Loss',        icon: '📉', adj: -500, macros: { carbs: 0.40, protein: 0.35, fat: 0.25 } },
  { key: 'maintain', label: 'الحفاظ على الوزن', labelEn: 'Maintenance',     icon: '⚖️', adj: 0,    macros: { carbs: 0.50, protein: 0.25, fat: 0.25 } },
  { key: 'gain',     label: 'بناء العضلات',      labelEn: 'Muscle Gain',     icon: '💪', adj: 300,  macros: { carbs: 0.50, protein: 0.30, fat: 0.20 } },
]

// ── Exchange System Values (per 1 serving) — exact as specified ──────────────
export const EX = {
  starch:    { nameAr: 'النشويات',           nameEn: 'Starches',          icon: '🌾', carbs: 15, protein: 3, fat: 0, kcal: 80  },
  meat:      { nameAr: 'اللحوم والبروتين',   nameEn: 'Low-Fat Meat',      icon: '🥩', carbs: 0,  protein: 7, fat: 3, kcal: 55  },
  milk:      { nameAr: 'منتجات الألبان',     nameEn: 'Skimmed Milk',      icon: '🥛', carbs: 12, protein: 8, fat: 0, kcal: 90  },
  fat:       { nameAr: 'الدهون',             nameEn: 'Fats',              icon: '🫒', carbs: 0,  protein: 0, fat: 5, kcal: 45  },
  fruit:     { nameAr: 'الفواكه',            nameEn: 'Fruits',            icon: '🍎', carbs: 15, protein: 0, fat: 0, kcal: 60  },
  vegetable: { nameAr: 'الخضروات',           nameEn: 'Vegetables',        icon: '🥦', carbs: 5,  protein: 2, fat: 0, kcal: 25  },
}

// ── Food Database — grams per 1 serving ─────────────────────────────────────
export const FOODS = {
  starch: [
    { nameAr: 'أرز أبيض مطبوخ',          grams: 45,  suffix: 'غ مطبوخ',           keywords: ['rice','أرز'] },
    { nameAr: 'كسكسي مطبوخ',              grams: 45,  suffix: 'غ مطبوخ',           keywords: ['كسكس','couscous'] },
    { nameAr: 'بطاطا مسلوقة',              grams: 90,  suffix: 'غ',                 keywords: ['batata','بطاطا','potato'] },
    { nameAr: 'بطاطا حلوة مسلوقة',        grams: 80,  suffix: 'غ',                 keywords: ['sweet potato','بطاطا حلوة'] },
    { nameAr: 'معكرونة مطبوخة',           grams: 70,  suffix: 'غ مطبوخة',          keywords: ['pasta','معكرونة'] },
    { nameAr: 'خبز عربي',                 grams: 30,  suffix: 'غ (نصف رغيف)',      keywords: ['bread','خبز'] },
    { nameAr: 'شوفان (جافة)',              grams: 20,  suffix: 'غ',                 keywords: ['oat','شوفان'] },
    { nameAr: 'خبز توست',                  grams: 30,  suffix: 'غ (شريحة)',         keywords: ['toast'] },
  ],
  meat: [
    { nameAr: 'صدر دجاج مطبوخ',          grams: 30,  suffix: 'غ مطبوخ',           keywords: ['chicken','دجاج'] },
    { nameAr: 'تونة في الماء',             grams: 30,  suffix: 'غ مصفّى',           keywords: ['tuna','تونة'] },
    { nameAr: 'بيضة كاملة',               grams: 50,  suffix: 'غ (بيضة واحدة)',    keywords: ['egg','بيض'] },
    { nameAr: 'لحم بقري قليل الدهن',      grams: 30,  suffix: 'غ مطبوخ',           keywords: ['beef','لحم'] },
    { nameAr: 'سمك أبيض مشوي',            grams: 30,  suffix: 'غ مطبوخ',           keywords: ['fish','سمك'] },
    { nameAr: 'جمبري مسلوق',              grams: 30,  suffix: 'غ',                 keywords: ['shrimp','جمبري'] },
  ],
  vegetable: [
    { nameAr: 'طماطم طازجة',              grams: 100, suffix: 'غ',                 keywords: ['tomato','طماطم'] },
    { nameAr: 'خيار',                      grams: 120, suffix: 'غ',                 keywords: ['cucumber','خيار'] },
    { nameAr: 'فلفل ألوان',                grams: 80,  suffix: 'غ',                 keywords: ['pepper','فلفل'] },
    { nameAr: 'كوسة مطبوخة',               grams: 100, suffix: 'غ',                 keywords: ['zucchini','كوسة'] },
    { nameAr: 'جزر',                       grams: 80,  suffix: 'غ',                 keywords: ['carrot','جزر'] },
    { nameAr: 'خس وجرجير',                 grams: 55,  suffix: 'غ',                 keywords: ['lettuce','خس'] },
    { nameAr: 'فطر مطبوخ',                 grams: 80,  suffix: 'غ',                 keywords: ['mushroom','فطر'] },
  ],
  fruit: [
    { nameAr: 'تفاحة',                     grams: 115, suffix: 'غ (صغيرة)',         keywords: ['apple','تفاح'] },
    { nameAr: 'برتقالة',                   grams: 130, suffix: 'غ (متوسطة)',        keywords: ['orange','برتقال'] },
    { nameAr: 'موز (نصف متوسط)',           grams: 60,  suffix: 'غ',                 keywords: ['banana','موز'] },
    { nameAr: 'بطيخ',                      grams: 280, suffix: 'غ',                 keywords: ['watermelon','بطيخ'] },
    { nameAr: 'خوخ / دراق',               grams: 115, suffix: 'غ (حبة)',           keywords: ['peach','خوخ'] },
    { nameAr: 'عنب',                        grams: 80,  suffix: 'غ (~15 حبة)',       keywords: ['grape','عنب'] },
    { nameAr: 'كيوي',                       grams: 115, suffix: 'غ (حبة)',           keywords: ['kiwi','كيوي'] },
  ],
  milk: [
    { nameAr: 'حليب خالي الدسم',           grams: 240, suffix: 'مل',               keywords: ['milk','حليب'] },
    { nameAr: 'زبادي خالي الدسم',          grams: 245, suffix: 'غ (كوب)',           keywords: ['yogurt','زبادي'] },
    { nameAr: 'لبن رايب خالي الدسم',       grams: 240, suffix: 'مل',               keywords: ['laban','لبن'] },
  ],
  fat: [
    { nameAr: 'زيت زيتون',                 grams: 5,   suffix: 'مل (ملعقة صغيرة)', keywords: ['olive','زيتون'] },
    { nameAr: 'زيت نباتي',                 grams: 5,   suffix: 'مل',               keywords: ['oil','زيت'] },
    { nameAr: 'مكسرات (لوز / جوز)',        grams: 10,  suffix: 'غ',                 keywords: ['nut','مكسرات','لوز'] },
    { nameAr: 'أفوكادو',                    grams: 20,  suffix: 'غ',                 keywords: ['avocado','أفوكادو'] },
  ],
}

function keywords(str) {
  return str.toLowerCase().split(/[\s,،\/]+/).filter(Boolean)
}

// Keywords that map to a whole food group being avoided
const GROUP_ALIASES = {
  milk:      ['حليب', 'ألبان', 'لبن', 'زبادي', 'dairy', 'milk'],
  vegetable: ['خضر', 'خضروات', 'خضراوات', 'vegetable', 'vegetables'],
  fruit:     ['فواكه', 'فاكهة', 'تمر', 'fruit', 'fruits'],
  starch:    ['نشويات', 'نشا', 'خبز', 'starch', 'starches'],
  meat:      ['لحوم', 'بروتين', 'meat', 'meats'],
  fat:       ['دهون', 'دهن', 'fat', 'fats'],
}

// Returns true if the entire food group should be excluded
function isGroupAvoided(groupKey, avoided) {
  if (!avoided?.trim()) return false
  const avKws = keywords(avoided)
  return (GROUP_ALIASES[groupKey] || []).some(alias =>
    avKws.some(av => alias.includes(av) || av.includes(alias))
  )
}

// Remove individual food items matching avoided keywords (item-level)
function filterAvoided(list, avoided = '') {
  if (!avoided.trim()) return list
  const avKws = keywords(avoided)
  return list.filter(food =>
    !food.keywords.some(k => avKws.some(av => k.includes(av) || av.includes(k)))
  )
}

// Sort food list to prioritize preferred keywords
function sortByPreference(list, preferred = '') {
  if (!preferred.trim()) return list
  const kws = keywords(preferred)
  return [...list].sort((a, b) => {
    const aMatch = a.keywords.some(k => kws.some(kw => k.includes(kw) || kw.includes(k))) ? -1 : 0
    const bMatch = b.keywords.some(k => kws.some(kw => k.includes(kw) || kw.includes(k))) ? -1 : 0
    return aMatch - bMatch
  })
}

// ── Core Calculations ────────────────────────────────────────────────────────

// Harris-Benedict Equation (standard version)
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
  const goal   = GOALS.find(g => g.key === goalKey) || GOALS[1]
  const { carbs: cR, protein: pR, fat: fR } = goal.macros

  const carbCal = target * cR
  const protCal = target * pR
  const fatCal  = target * fR

  // Detect which whole groups are avoided
  const skipMilk  = isGroupAvoided('milk',      avoided)
  const skipVeg   = isGroupAvoided('vegetable',  avoided)
  const skipFruit = isGroupAvoided('fruit',      avoided)

  // Carb split: redistribute avoided group calories into starches
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
    starches * EX.starch.kcal + meats * EX.meat.kcal + dairy * EX.milk.kcal +
    fats * EX.fat.kcal + fruits * EX.fruit.kcal + vegetables * EX.vegetable.kcal

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

// ── Meal Menu Generator ──────────────────────────────────────────────────────
const TEMPLATES = {
  3: [
    { name: 'الفطور',   time: '07:30', icon: '🌅', pct: { starch:0.35, meat:0.20, milk:0.75, fruit:0.50, veg:0,    fat:0.25 } },
    { name: 'الغداء',   time: '13:00', icon: '🍽️', pct: { starch:0.40, meat:0.45, milk:0.25, fruit:0.25, veg:0.60, fat:0.50 } },
    { name: 'العشاء',   time: '19:30', icon: '🌙', pct: { starch:0.25, meat:0.35, milk:0,    fruit:0.25, veg:0.40, fat:0.25 } },
  ],
  4: [
    { name: 'الفطور',              time: '07:30', icon: '🌅', pct: { starch:0.30, meat:0.20, milk:0.50, fruit:0.40, veg:0,    fat:0 } },
    { name: 'الغداء',              time: '13:00', icon: '🍽️', pct: { starch:0.40, meat:0.45, milk:0.25, fruit:0.25, veg:0.60, fat:0.60 } },
    { name: 'وجبة خفيفة مسائية',  time: '16:30', icon: '🥤', pct: { starch:0,    meat:0,    milk:0.25, fruit:0.35, veg:0,    fat:0 } },
    { name: 'العشاء',              time: '20:00', icon: '🌙', pct: { starch:0.30, meat:0.35, milk:0,    fruit:0,    veg:0.40, fat:0.40 } },
  ],
  5: [
    { name: 'الفطور',              time: '07:30', icon: '🌅', pct: { starch:0.25, meat:0.20, milk:0.50, fruit:0.35, veg:0,    fat:0 } },
    { name: 'وجبة خفيفة صباحية',  time: '10:30', icon: '🍎', pct: { starch:0,    meat:0,    milk:0.25, fruit:0.35, veg:0,    fat:0 } },
    { name: 'الغداء',              time: '13:00', icon: '🍽️', pct: { starch:0.40, meat:0.45, milk:0,    fruit:0,    veg:0.50, fat:0.50 } },
    { name: 'وجبة خفيفة مسائية',  time: '16:30', icon: '🥤', pct: { starch:0,    meat:0,    milk:0.25, fruit:0.30, veg:0,    fat:0 } },
    { name: 'العشاء',              time: '20:00', icon: '🌙', pct: { starch:0.35, meat:0.35, milk:0,    fruit:0,    veg:0.50, fat:0.50 } },
  ],
}

export function generateMenu(ex, mealCount = 5, preferred = '', avoided = '') {
  const count  = [3, 4, 5].includes(mealCount) ? mealCount : 5
  const tpls   = TEMPLATES[count]

  // Item-level filter: if all items filtered out, keep original (fallback)
  // Note: group-level skipping is already handled via ex.dairy=0, ex.vegetables=0 etc.
  const itemFilter = (list, groupKey) => {
    if (isGroupAvoided(groupKey, avoided)) return []  // whole group avoided
    const filtered = filterAvoided(list, avoided)
    return filtered.length > 0 ? filtered : list
  }

  const sorted = {
    starch:    sortByPreference(itemFilter(FOODS.starch,    'starch'),    preferred),
    meat:      sortByPreference(itemFilter(FOODS.meat,      'meat'),      preferred),
    milk:      itemFilter(FOODS.milk,      'milk'),
    fruit:     itemFilter(FOODS.fruit,     'fruit'),
    vegetable: itemFilter(FOODS.vegetable, 'vegetable'),
    fat:       itemFilter(FOODS.fat,       'fat'),
  }
  const idx = { starch: 0, meat: 0, milk: 0, fruit: 0, vegetable: 0, fat: 0 }

  return tpls.map(t => {
    const sC = Math.round(ex.starches    * t.pct.starch)
    const mC = Math.round(ex.meats       * t.pct.meat)
    const dC = Math.round(ex.dairy       * t.pct.milk)
    const fC = Math.round(ex.fruits      * t.pct.fruit)
    const vC = Math.round(ex.vegetables  * t.pct.veg)
    const fR = Math.round(ex.fats        * t.pct.fat)

    const mealKcal   = sC*80 + mC*55 + dC*90 + fC*60 + vC*25 + fR*45
    const mealCarbs  = sC*15 + fC*15 + vC*5  + dC*12
    const mealProt   = mC*7  + dC*8  + sC*3  + vC*2
    const mealFat    = mC*3  + fR*5

    const items = []
    const push  = (cat, key, count, group, icon) => {
      if (count <= 0) return
      const food = sorted[key][idx[key] % sorted[key].length]
      const totalG = food.grams * count
      items.push({ group, icon, servings: count, food: food.nameAr, amount: `${totalG} ${food.suffix}` })
      idx[key]++
    }

    push(sorted.starch,    'starch',    sC, 'النشويات',  '🌾')
    push(sorted.meat,      'meat',      mC, 'البروتين',  '🥩')
    push(sorted.milk,      'milk',      dC, 'الألبان',   '🥛')
    push(sorted.fruit,     'fruit',     fC, 'الفواكه',   '🍎')
    if (vC > 0) {
      // Two different vegetables
      const v1 = sorted.vegetable[idx.vegetable % sorted.vegetable.length]
      const v2 = sorted.vegetable[(idx.vegetable + 1) % sorted.vegetable.length]
      const half = Math.ceil(vC / 2)
      items.push({ group: 'الخضروات', icon: '🥦', servings: half,     food: v1.nameAr, amount: `${v1.grams * half} ${v1.suffix}` })
      if (vC > 1)
        items.push({ group: 'الخضروات', icon: '🥦', servings: vC-half, food: v2.nameAr, amount: `${v2.grams * (vC-half)} ${v2.suffix}` })
      idx.vegetable++
    }
    push(sorted.fat,       'fat',       fR, 'الدهون',    '🫒')

    return { ...t, items, kcal: mealKcal, carbs: mealCarbs, protein: mealProt, fat: mealFat }
  })
}

export function getGoal(key)     { return GOALS.find(g => g.key === key) || GOALS[1] }
export function getActivity(key) { return ACTIVITY_FACTORS.find(a => a.key === key) || ACTIVITY_FACTORS[2] }
