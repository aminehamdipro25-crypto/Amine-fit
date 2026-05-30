export const exchangeGroups = {
  starches:   { nameAr:'النشويات',        icon:'🌾', carbs:15, protein:3, fat:0, calories:80,  examples:[{name:'خبز أبيض',amount:'1 شريحة (30 غ)'},{name:'أرز مطبوخ',amount:'⅓ كوب (45 غ)'},{name:'معكرونة',amount:'½ كوب (70 غ)'},{name:'بطاطس',amount:'½ حبة (90 غ)'}] },
  meats:      { nameAr:'اللحوم والبروتين',icon:'🥩', carbs:0,  protein:7, fat:3, calories:55,  examples:[{name:'دجاج بدون جلد',amount:'30 غ مطبوخ'},{name:'لحم بقري',amount:'30 غ مطبوخ'},{name:'تونة',amount:'30 غ'},{name:'بيضة',amount:'1 حبة'}] },
  dairy:      { nameAr:'الألبان',          icon:'🥛', carbs:12, protein:8, fat:0, calories:90,  examples:[{name:'حليب خالي الدسم',amount:'1 كوب (240 مل)'},{name:'زبادي خالي الدسم',amount:'1 كوب (245 غ)'}] },
  fats:       { nameAr:'الدهون',           icon:'🫒', carbs:0,  protein:0, fat:5, calories:45,  examples:[{name:'زيت زيتون',amount:'1 ملعقة صغيرة (5 مل)'},{name:'مكسرات',amount:'6 حبات (10 غ)'},{name:'أفوكادو',amount:'⅛ حبة (20 غ)'}] },
  fruits:     { nameAr:'الفواكه',          icon:'🍎', carbs:15, protein:0, fat:0, calories:60,  examples:[{name:'تفاحة',amount:'1 صغيرة (115 غ)'},{name:'موز',amount:'½ صغيرة (60 غ)'},{name:'برتقالة',amount:'1 متوسطة (130 غ)'}] },
  vegetables: { nameAr:'الخضروات',         icon:'🥦', carbs:5,  protein:2, fat:0, calories:25,  examples:[{name:'طماطم',amount:'½ كوب (90 غ)'},{name:'خيار',amount:'1 كوب (119 غ)'},{name:'خس',amount:'1½ كوب (55 غ)'}] },
}

export const activityLevels = [
  { key:'sedentary', label:'خامل (عمل مكتبي، لا رياضة)',          multiplier:1.2 },
  { key:'light',     label:'خفيف (رياضة 1-3 أيام/أسبوع)',         multiplier:1.375 },
  { key:'moderate',  label:'معتدل (رياضة 3-5 أيام/أسبوع)',        multiplier:1.55 },
  { key:'active',    label:'نشيط (رياضة 6-7 أيام/أسبوع)',         multiplier:1.725 },
  { key:'veryActive',label:'نشيط جداً (رياضة مكثفة يومياً)',       multiplier:1.9 },
]

export const goals = [
  { key:'loss',     label:'خسارة الوزن',        adjustment:-500, icon:'📉' },
  { key:'maintain', label:'الحفاظ على الوزن',   adjustment:0,    icon:'⚖️' },
  { key:'gain',     label:'بناء العضلات',        adjustment:300,  icon:'💪' },
]

export function calculateBMR({ weight, height, age, gender }) {
  const base = 10 * weight + 6.25 * height - 5 * age
  return gender === 'male' ? base + 5 : base - 161
}
export function calculateTDEE(bmr, multiplier) { return Math.round(bmr * multiplier) }
export function calculateTargetCalories(tdee, adj) { return Math.max(1200, tdee + adj) }

export function calculateExchanges(target) {
  const carbCal = target * 0.50
  const protCal = target * 0.25
  const fatCal  = target * 0.25

  const starches   = Math.round(carbCal * 0.55 / exchangeGroups.starches.calories)
  const fruits     = Math.round(carbCal * 0.20 / exchangeGroups.fruits.calories)
  const vegetables = Math.max(2, Math.round(carbCal * 0.10 / exchangeGroups.vegetables.calories))
  const dairy      = Math.round(carbCal * 0.15 / exchangeGroups.dairy.calories)
  const meats      = Math.round(protCal / exchangeGroups.meats.calories)
  const fats       = Math.round(fatCal  / exchangeGroups.fats.calories)

  const actualCalories =
    starches * 80 + meats * 55 + dairy * 90 + fats * 45 + fruits * 60 + vegetables * 25

  const totalCarbs   = starches*15 + fruits*15 + vegetables*5 + dairy*12
  const totalProtein = meats*7 + dairy*8 + starches*3 + vegetables*2
  const totalFat     = meats*3 + fats*5

  return {
    starches, meats, dairy, fats, fruits, vegetables, actualCalories,
    macros: { carbs: Math.round(totalCarbs), protein: Math.round(totalProtein), fat: Math.round(totalFat) },
  }
}

export function distributeMeals(ex) {
  return [
    { name:'الفطور',              time:'07:00 – 08:00', icon:'🌅',
      items:[{g:'starches',c:Math.round(ex.starches*.25)},{g:'meats',c:Math.round(ex.meats*.20)},{g:'dairy',c:Math.round(ex.dairy*.40)},{g:'fruits',c:Math.round(ex.fruits*.25)}].filter(i=>i.c>0) },
    { name:'وجبة صباحية خفيفة',   time:'10:30 – 11:00', icon:'🍎',
      items:[{g:'fruits',c:Math.round(ex.fruits*.25)},{g:'dairy',c:Math.round(ex.dairy*.30)}].filter(i=>i.c>0) },
    { name:'الغداء',              time:'13:00 – 14:00', icon:'🍽️',
      items:[{g:'starches',c:Math.round(ex.starches*.35)},{g:'meats',c:Math.round(ex.meats*.40)},{g:'vegetables',c:Math.round(ex.vegetables*.50)},{g:'fats',c:Math.round(ex.fats*.30)}].filter(i=>i.c>0) },
    { name:'وجبة مسائية خفيفة',   time:'16:30 – 17:00', icon:'🥤',
      items:[{g:'fruits',c:Math.round(ex.fruits*.25)},{g:'dairy',c:Math.max(0,ex.dairy-Math.round(ex.dairy*.70))}].filter(i=>i.c>0) },
    { name:'العشاء',              time:'19:30 – 20:30', icon:'🌙',
      items:[{g:'starches',c:Math.max(1,ex.starches-Math.round(ex.starches*.60))},{g:'meats',c:Math.round(ex.meats*.40)},{g:'vegetables',c:Math.round(ex.vegetables*.50)},{g:'fats',c:Math.max(0,ex.fats-Math.round(ex.fats*.50))}].filter(i=>i.c>0) },
  ]
}
