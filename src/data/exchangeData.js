// Exchange system nutritional values per 1 unit
export const exchangeGroups = {
  starches: {
    nameAr: 'النشويات',
    icon: '🌾',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    iconBg: 'bg-amber-500',
    carbs: 15,
    protein: 3,
    fat: 0,
    calories: 80,
    examples: [
      { name: 'خبز أبيض', amount: '1 شريحة (30 غ)' },
      { name: 'أرز مطبوخ', amount: '⅓ كوب (45 غ)' },
      { name: 'معكرونة مطبوخة', amount: '½ كوب (70 غ)' },
      { name: 'بطاطس مسلوقة', amount: '½ حبة متوسطة (90 غ)' },
      { name: 'دقيق', amount: '3 ملاعق كبيرة (20 غ)' },
      { name: 'فلفل ناشف', amount: '½ كوب مطبوخ (90 غ)' },
    ],
  },
  meats: {
    nameAr: 'اللحوم والبروتين',
    icon: '🥩',
    color: 'bg-red-100 text-red-800 border-red-200',
    iconBg: 'bg-red-500',
    carbs: 0,
    protein: 7,
    fat: 3,
    calories: 55,
    examples: [
      { name: 'دجاج بدون جلد', amount: '30 غ (مطبوخ)' },
      { name: 'لحم بقري خالي الدهن', amount: '30 غ (مطبوخ)' },
      { name: 'تونة (عصير ماء)', amount: '30 غ' },
      { name: 'بيضة كاملة', amount: '1 بيضة متوسطة' },
      { name: 'جبن قريش', amount: '¼ كوب (55 غ)' },
      { name: 'سردين', amount: '30 غ' },
    ],
  },
  dairy: {
    nameAr: 'الألبان',
    icon: '🥛',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    iconBg: 'bg-blue-500',
    carbs: 12,
    protein: 8,
    fat: 0,
    calories: 90,
    examples: [
      { name: 'حليب خالي الدسم', amount: '1 كوب (240 مل)' },
      { name: 'زبادي خالي الدسم', amount: '1 كوب (245 غ)' },
      { name: 'حليب كامل الدسم', amount: '1 كوب (240 مل)' },
      { name: 'لبن رائب', amount: '1 كوب (245 غ)' },
    ],
  },
  fats: {
    nameAr: 'الدهون',
    icon: '🫒',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    iconBg: 'bg-yellow-500',
    carbs: 0,
    protein: 0,
    fat: 5,
    calories: 45,
    examples: [
      { name: 'زيت زيتون', amount: '1 ملعقة صغيرة (5 مل)' },
      { name: 'زبدة', amount: '1 ملعقة صغيرة (5 غ)' },
      { name: 'مايونيز', amount: '1 ملعقة صغيرة (5 غ)' },
      { name: 'مكسرات مشكلة', amount: '6 حبات (10 غ)' },
      { name: 'أفوكادو', amount: '⅛ حبة (20 غ)' },
      { name: 'جبن أبيض', amount: '1 مكعب صغير (15 غ)' },
    ],
  },
  fruits: {
    nameAr: 'الفواكه',
    icon: '🍎',
    color: 'bg-green-100 text-green-800 border-green-200',
    iconBg: 'bg-green-500',
    carbs: 15,
    protein: 0,
    fat: 0,
    calories: 60,
    examples: [
      { name: 'تفاحة', amount: '1 صغيرة (115 غ)' },
      { name: 'موز', amount: '½ حبة صغيرة (60 غ)' },
      { name: 'برتقالة', amount: '1 متوسطة (130 غ)' },
      { name: 'عنب', amount: '17 حبة (85 غ)' },
      { name: 'بطيخ', amount: '1¼ كوب مكعبات (175 غ)' },
      { name: 'مانجا', amount: '½ كوب مكعبات (83 غ)' },
    ],
  },
  vegetables: {
    nameAr: 'الخضروات',
    icon: '🥦',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    iconBg: 'bg-emerald-500',
    carbs: 5,
    protein: 2,
    fat: 0,
    calories: 25,
    examples: [
      { name: 'طماطم', amount: '½ كوب مطبوخة (90 غ)' },
      { name: 'جزر', amount: '½ كوب مطبوخ (75 غ)' },
      { name: 'خيار', amount: '1 كوب (119 غ)' },
      { name: 'خس', amount: '1½ كوب مقطع (55 غ)' },
      { name: 'فلفل أخضر', amount: '½ كوب مطبوخ (75 غ)' },
      { name: 'كوسا', amount: '½ كوب مطبوخة (90 غ)' },
    ],
  },
}

// Activity level multipliers
export const activityLevels = [
  { key: 'sedentary', label: 'خامل (عمل مكتبي، لا رياضة)', multiplier: 1.2 },
  { key: 'light', label: 'خفيف (رياضة 1-3 أيام/أسبوع)', multiplier: 1.375 },
  { key: 'moderate', label: 'معتدل (رياضة 3-5 أيام/أسبوع)', multiplier: 1.55 },
  { key: 'active', label: 'نشيط (رياضة 6-7 أيام/أسبوع)', multiplier: 1.725 },
  { key: 'veryActive', label: 'نشيط جداً (رياضة مكثفة يومياً)', multiplier: 1.9 },
]

// Goal adjustments
export const goals = [
  { key: 'loss', label: 'خسارة الوزن', adjustment: -500, icon: '📉' },
  { key: 'maintain', label: 'الحفاظ على الوزن', adjustment: 0, icon: '⚖️' },
  { key: 'gain', label: 'بناء العضلات', adjustment: 300, icon: '💪' },
]

// Calculate BMR using Mifflin-St Jeor equation
export function calculateBMR({ weight, height, age, gender }) {
  const base = 10 * weight + 6.25 * height - 5 * age
  return gender === 'male' ? base + 5 : base - 161
}

// Calculate TDEE
export function calculateTDEE(bmr, activityMultiplier) {
  return Math.round(bmr * activityMultiplier)
}

// Calculate target calories
export function calculateTargetCalories(tdee, goalAdjustment) {
  return Math.max(1200, tdee + goalAdjustment)
}

// Distribute calories into exchange units
export function calculateExchanges(targetCalories) {
  // Macro split: 50% carbs, 25% protein, 25% fat
  const carbCalories = targetCalories * 0.50
  const proteinCalories = targetCalories * 0.25
  const fatCalories = targetCalories * 0.25

  // Carbs from: starches (70%), fruits (15%), vegetables (15%), dairy (some)
  const starchCalories = carbCalories * 0.55
  const fruitCalories  = carbCalories * 0.20
  const vegCalories    = carbCalories * 0.10
  const dairyCalories  = carbCalories * 0.15

  const starches   = Math.round(starchCalories / exchangeGroups.starches.calories)
  const fruits     = Math.round(fruitCalories  / exchangeGroups.fruits.calories)
  const vegetables = Math.max(2, Math.round(vegCalories / exchangeGroups.vegetables.calories))
  const dairy      = Math.round(dairyCalories  / exchangeGroups.dairy.calories)

  const meats = Math.round(proteinCalories / exchangeGroups.meats.calories)
  const fats  = Math.round(fatCalories     / exchangeGroups.fats.calories)

  // Recalculate actual calories from these exchanges
  const actualCalories =
    starches   * exchangeGroups.starches.calories +
    meats      * exchangeGroups.meats.calories +
    dairy      * exchangeGroups.dairy.calories +
    fats       * exchangeGroups.fats.calories +
    fruits     * exchangeGroups.fruits.calories +
    vegetables * exchangeGroups.vegetables.calories

  // Actual macros
  const totalCarbs =
    starches   * exchangeGroups.starches.carbs +
    fruits     * exchangeGroups.fruits.carbs +
    vegetables * exchangeGroups.vegetables.carbs +
    dairy      * exchangeGroups.dairy.carbs

  const totalProtein =
    meats      * exchangeGroups.meats.protein +
    dairy      * exchangeGroups.dairy.protein +
    starches   * exchangeGroups.starches.protein +
    vegetables * exchangeGroups.vegetables.protein

  const totalFat =
    meats  * exchangeGroups.meats.fat +
    fats   * exchangeGroups.fats.fat

  return {
    starches,
    meats,
    dairy,
    fats,
    fruits,
    vegetables,
    actualCalories,
    macros: {
      carbs: Math.round(totalCarbs),
      protein: Math.round(totalProtein),
      fat: Math.round(totalFat),
    },
  }
}

// Distribute exchanges across meals (3 main + 2 snacks)
export function distributeMeals(exchanges) {
  const { starches, meats, dairy, fats, fruits, vegetables } = exchanges

  return [
    {
      name: 'الفطور',
      time: '07:00 – 08:00',
      icon: '🌅',
      items: [
        { group: 'starches',   count: Math.round(starches * 0.25), label: exchangeGroups.starches.nameAr },
        { group: 'meats',      count: Math.round(meats * 0.20),    label: exchangeGroups.meats.nameAr },
        { group: 'dairy',      count: Math.round(dairy * 0.40),    label: exchangeGroups.dairy.nameAr },
        { group: 'fats',       count: Math.round(fats * 0.20),     label: exchangeGroups.fats.nameAr },
        { group: 'fruits',     count: Math.round(fruits * 0.25),   label: exchangeGroups.fruits.nameAr },
      ].filter(i => i.count > 0),
    },
    {
      name: 'وجبة خفيفة صباحية',
      time: '10:30 – 11:00',
      icon: '🍎',
      items: [
        { group: 'fruits',   count: Math.round(fruits * 0.25),   label: exchangeGroups.fruits.nameAr },
        { group: 'dairy',    count: Math.round(dairy * 0.30),    label: exchangeGroups.dairy.nameAr },
      ].filter(i => i.count > 0),
    },
    {
      name: 'الغداء',
      time: '13:00 – 14:00',
      icon: '🍽️',
      items: [
        { group: 'starches',    count: Math.round(starches * 0.35),    label: exchangeGroups.starches.nameAr },
        { group: 'meats',       count: Math.round(meats * 0.40),       label: exchangeGroups.meats.nameAr },
        { group: 'vegetables',  count: Math.round(vegetables * 0.50),  label: exchangeGroups.vegetables.nameAr },
        { group: 'fats',        count: Math.round(fats * 0.30),        label: exchangeGroups.fats.nameAr },
      ].filter(i => i.count > 0),
    },
    {
      name: 'وجبة خفيفة مسائية',
      time: '16:30 – 17:00',
      icon: '🥤',
      items: [
        { group: 'fruits',   count: Math.round(fruits * 0.25),     label: exchangeGroups.fruits.nameAr },
        { group: 'dairy',    count: Math.max(0, dairy - Math.round(dairy * 0.70)), label: exchangeGroups.dairy.nameAr },
      ].filter(i => i.count > 0),
    },
    {
      name: 'العشاء',
      time: '19:30 – 20:30',
      icon: '🌙',
      items: [
        { group: 'starches',   count: Math.max(1, starches - Math.round(starches * 0.60)), label: exchangeGroups.starches.nameAr },
        { group: 'meats',      count: Math.round(meats * 0.40),     label: exchangeGroups.meats.nameAr },
        { group: 'vegetables', count: Math.round(vegetables * 0.50), label: exchangeGroups.vegetables.nameAr },
        { group: 'fats',       count: Math.max(0, fats - Math.round(fats * 0.50)), label: exchangeGroups.fats.nameAr },
      ].filter(i => i.count > 0),
    },
  ]
}
