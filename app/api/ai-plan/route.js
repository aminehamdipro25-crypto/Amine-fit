import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { isRateLimited } from '@/lib/rateLimit'
import {
  calcBMR, calcTDEE, calcTarget, calcExchanges, calcWaterGoal, generateMenu,
  getRegion, REGION_FOOD_HINTS, REGION_LABELS,
} from '@/lib/nutritionEngine'
import crypto from 'node:crypto'

export const dynamic = 'force-dynamic'

// ── Redis cache helpers ───────────────────────────────────────────────────────
function redisCfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}

async function cacheGet(key) {
  const c = redisCfg()
  if (!c) return null
  try {
    const res = await fetch(`${c.url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${c.token}` },
      cache: 'no-store',
    })
    const data = await res.json()
    if (!data.result) return null
    const raw = typeof data.result === 'string' ? data.result : JSON.stringify(data.result)
    return JSON.parse(raw)
  } catch { return null }
}

async function cacheSet(key, value, ttl = 86400) {
  const c = redisCfg()
  if (!c) return
  try {
    await fetch(`${c.url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([['SET', key, JSON.stringify(value), 'EX', String(ttl)]]),
      cache: 'no-store',
    })
  } catch { /* silent — cache miss is harmless */ }
}

function planCacheKey(form) {
  const seed = JSON.stringify({
    g: form.gender, w: form.weight, h: form.height, a: form.age,
    act: form.activity, goal: form.goal, meals: form.meals,
    c: form.country || '', pref: (form.preferred || '').slice(0, 200),
    av: (form.avoided || '').slice(0, 100), dur: form.duration || 'day',
    tw: form.targetWeight || '', bf: form.bodyFatPct || '',
    adj: form.manualAdj || '', rate: form.weeklyRate || '',
    wp: JSON.stringify(form.weeklyProtein || null),
  })
  const hash = crypto.createHash('sha1').update(seed).digest('hex').slice(0, 20)
  return `ai_plan_v5:${hash}`
}

const ACTIVITY_LABELS = {
  sedentary:  'خامل (عمل مكتبي، لا رياضة) — معامل 1.20',
  light:      'خفيف (رياضة 1-3 أيام/أسبوع) — معامل 1.375',
  moderate:   'معتدل (رياضة 3-5 أيام/أسبوع) — معامل 1.55',
  active:     'نشيط (رياضة 6-7 أيام/أسبوع) — معامل 1.725',
  veryActive: 'نشيط جداً (تدريب مكثف يومياً) — معامل 1.90',
}
const GOAL_LABELS = {
  loss:        'خسارة الوزن (-500 سعرة من TDEE)',
  maintain:    'المحافظة على الوزن (= TDEE)',
  gain:        'بناء العضلات (+300 سعرة من TDEE)',
  performance: 'تحسين الأداء الرياضي (= TDEE مع بروتين عالٍ)',
}

const SYSTEM_PROMPT = `أنت مختص تغذية إكلينيكي معتمد متخصص في نظام التبادل الغذائي (ADA Food Exchange System 2019). مهمتك إنشاء خطط غذائية شخصية دقيقة علمياً ومنطقية تماماً من المرة الأولى.

══════════════════════════════════════════════
قيم التبادل الغذائي — ADA 2019
══════════════════════════════════════════════
• نشويات           : 80 سعرة | 15غ كارب | 3غ بروتين | 1غ دهن
• لحم خالي الدهن   : 45 سعرة |  0غ كارب | 7غ بروتين | 2غ دهن  (دجاج/سمك/تونة/كبدة)
• ألبان خالية الدسم : 90 سعرة | 12غ كارب | 8غ بروتين | 0غ دهن
• دهون              : 45 سعرة |  0غ كارب | 0غ بروتين | 5غ دهن
• فواكه             : 60 سعرة | 15غ كارب | 0غ بروتين | 0غ دهن
• خضروات غير نشوية : 25 سعرة |  5غ كارب | 2غ بروتين | 0غ دهن

══════════════════════════════════════════════
الحسابات — Mifflin-St Jeor 1990
══════════════════════════════════════════════
ذكر : BMR = (10×وزن) + (6.25×طول) − (5×عمر) + 5
أنثى: BMR = (10×وزن) + (6.25×طول) − (5×عمر) − 161
TDEE = BMR × معامل النشاط
الهدف: خسارة −500 | حفاظ 0 | بناء +300 | حد أدنى: ذكر 1500 / أنثى 1200
بروتين = وزن_مستهدف × 2 غ/كغ | دهون = (سعرات × 0.25) ÷ 9 | كارب = (سعرات − بروتين×4 − دهون×9) ÷ 4

حصص معيارية: أرز مطبوخ 65غ | توست 30غ | بطاطا 90غ | شوفان جاف 20غ | كسكس مطبوخ 65غ
              دجاج/سمك مطبوخ 30غ | بيضة 50غ | تونة مصفّاة 30غ | حمص مطبوخ 45غ
              موز 60غ | تفاح 115غ | مانجو 80غ | برتقال 130غ

══════════════════════════════════════════════
الالتزام الجغرافي — حظر مطلق لا استثناء
══════════════════════════════════════════════

▌ تونس / المغرب / الجزائر / ليبيا
✅ مسموح: سردين مشوي، مرجان، تونة معلبة، دجاج، لحم غنم/بقر، كبدة دجاج، بيض، حمص، عدس، فول، كسكس، خبز طابونة، خبز عربي، أرز، بطاطا، زيتون، تمر، تفاح، برتقال، موز، حليب، جبن بلدي، زيت زيتون، هريسة
🚫 محظور تماماً — NEVER USE: سمك السلمون (salmon) هذا أشهر خطأ، سمك تراوت (trout)، سمك القاروص (sea bass)، تيلابيا فيليه، كينوا، أفوكادو، جبن شيدر، جبن كاممبير، زبدة الفول السوداني، عصير أكاي، حليب جوز الهند

▌ قطر / الإمارات / السعودية / الكويت / البحرين / عُمان
✅ مسموح: دجاج مشوي، سمك هامور، سمك نجيل، جمبري، تونة معلبة، لحم بعير، كبدة، بيض، حمص، عدس، أرز بسمتي، خبز عربي، تمر، مانجو، حليب، لبن رائب، جبن
🚫 محظور: كسكس، هريسة، خبز طابونة، كينوا، أفوكادو، سمك سلمون

▌ مصر / المشرق العربي
✅ مسموح: فول، عدس، طحينية، خبز بلدي، كشك، دجاج، سمك بلطي، بيض، أرز، بطاطا
🚫 محظور: كسكس، سمك سلمون، كينوا

▌ قاعدة عالمية: أي طعام غريب أو نادر أو غير متاح في الأسواق المحلية → ممنوع تماماً

══════════════════════════════════════════════
هيكل الوجبة — قواعد التجميع [حظر مطلق لا استثناء]
══════════════════════════════════════════════

▌ قاعدة 1: الخضروات → حقل "salad" فقط — ممنوع في "items"
❌ خطأ فادح ممنوع: { "group": "خضروات", "food": "طماطم طازجة", "amount": "200 غ" }
❌ خطأ فادح ممنوع: { "group": "خضروات", "food": "خيار مقطع", "amount": "120 غ" }
❌ خطأ فادح ممنوع: { "group": "خضروات", "food": "فلفل ألوان", "amount": "80 غ" }
✅ الصحيح الوحيد: "salad": { "has_salad": true, "vegetables": ["طماطم", "خيار", "فلفل"], "preparation": "سلطة طازجة بزيت الزيتون والليمون", "grams": 400 }
تنتمي لـ salad دون استثناء: طماطم، خيار، فلفل، خس، بصل أخضر، جزر، بروكلي، كوسة، سبانخ، قرنبيط، باذنجان، فاصوليا خضراء، كرفس، ملفوف، فجل

▌ قاعدة 2: المكسرات والدهون الصلبة → حقل "nuts" فقط — ممنوع في "items"
❌ خطأ فادح ممنوع: { "group": "دهون", "food": "لوز نيء", "amount": "8 غ" }
❌ خطأ فادح ممنوع: { "group": "دهون", "food": "فستق حلبي نيء", "amount": "72 غ" }
❌ خطأ فادح ممنوع: { "group": "دهون", "food": "جوز", "amount": "15 غ" }
✅ الصحيح الوحيد: "nuts": { "has_nuts": true, "type": "لوز + فستق حلبي", "grams": 80 }
تنتمي لـ nuts دون استثناء: لوز، كاجو، جوز، فستق حلبي، بذر كتان، بذر شيا، سمسم، زبدة الفول السوداني، بذر عباد الشمس

▌ قاعدة 3: ما يُدرج في "items" فقط
✅ نشويات: أرز، خبز، كسكس، بطاطا، شوفان، توست، معكرونة
✅ بروتين رئيسي: دجاج، سمك، تونة، لحم، كبدة، بيض، بقوليات، جبن
✅ ألبان: حليب، لبن رائب، جبن قريش
✅ دهن سائل: زيت زيتون فقط (ليس المكسرات)
✅ فاكهة: كل الفواكه
✅ تمر وعسل: ضمن مجموعة النشويات

══════════════════════════════════════════════
منهجية الحساب والتحقق الذاتي (إلزامي)
══════════════════════════════════════════════
① احسب الماكروز اليومية: بروتين، دهون، كارب
② وزِّع على الوجبات: فطور 22% | خفيفة 12% | غداء 38% | عشاء 28%
③ لكل مكون: احسب الغرامات بدقة وأضف cooking_method في حقل food
④ تحقق ذاتياً: |∑kcal − target| ≤ 5 و |∑protein − target| ≤ 2
⑤ إذا تجاوز الفارق: عدِّل أصغر وجبة وأعد الحساب حتى التطابق
⑥ سجِّل الإجماليات المُصحَّحة في total_day_macros
⑦ أخرج JSON فقط — أي نص خارج JSON يُبطل الاستجابة برمجياً

══════════════════════════════════════════════
توزيع البروتين الأسبوعي [إلزامي عند التحديد]
══════════════════════════════════════════════
• التزم بمصدر البروتين المحدد لكل يوم — لا تستبدله ولا تضف مصادر أخرى
• الهدف اليومي (سعرات + ماكروز) يبقى ثابتاً بغض النظر عن مصدر البروتين

أيام plant أو eggs_plant:
🚫 حظر مطلق بلا استثناء: ممنوع ذكر دجاج، سمك، لحم، كبدة، تونة، أي بروتين حيواني في items أو salad أو food أو أي حقل آخر

أيام البقوليات: 150غ حمص ≈ 12غ بروتين + 26غ كارب → خفِّض الأرز/الخبز بما يعادل 26غ كارب (≈ 110غ أرز مطبوخ)
أيام البيض: 1 بيضة = 5غ دهن → خفِّض الزيت/المكسرات بالمقدار نفسه
أيام الألبان: وحدة ألبان = 12غ كارب → احسبها ضمن الكارب اليومي
أيام اللحم الأحمر: احسب دهنه المرتفع وخفِّض باقي الدهون تلقائياً
أيام السمك حسب البلد: تونس/مغرب → سردين/مرجان | خليج → هامور/نجيل | مصر → بلطي | عالمي → تونة

══════════════════════════════════════════════
قواعد نهائية
══════════════════════════════════════════════
1. قائمة أطعمة مسموحة (إذا قُدِّمت) → استخدمها حصراً، لا تضف أي طعام خارجها
2. الأطعمة الممنوعة (إذا ذُكرت) → احذفها تماماً وعوِّض من مجموعات أخرى
3. لا تكرر نفس الطعام في وجبتين متتاليتين في اليوم الواحد
4. الزبدة والمكسرات في الفطور فقط | زيت الزيتون في الغداء والعشاء
5. احسب الغرامات بدقة وتحقق من الإجماليات قبل الإخراج
6. أعد JSON فقط — لا نص خارجه`

const DAY_NAMES  = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const WEEK_NAMES = ['الأسبوع الأول', 'الأسبوع الثاني', 'الأسبوع الثالث', 'الأسبوع الرابع']

const PROTEIN_LABELS = {
  mixed:       'مختلط (اختر أطعمة متنوعة ومناسبة للبلد)',
  chicken:     'دجاج مشوي أو مسلوق',
  fish:        'سمك مشوي أو مسلوق (حسب المتاح محلياً)',
  red_meat:    'لحم أحمر — احسب دهونه واخفض الدهون الأخرى',
  liver:       'كبدة (دجاج أو خروف) مشوية أو مسلوقة',
  tuna:        'تونة معلبة مصفّاة من الزيت',
  eggs:        'بيض فقط — احسب دهون البيض (5غ/بيضة) واخفض الزيت والمكسرات',
  plant:       'نباتي: بقوليات (حمص/عدس/فول/لوبيا) — احسب كربوهيدراتها واخفض النشويات الأخرى بالمقدار المكافئ',
  eggs_plant:  'بيض + بقوليات — احسب دهون البيض وكارب البقوليات، وعوِّض في النشويات والدهون',
  dairy:       'ألبان + جبن قريش/بلدي — احسب كارب الألبان ضمن الكارب اليومي',
}

// ── Post-processing: enforce structural rules regardless of model output ──────
// These run after JSON parsing to guarantee correct structure even when the model
// ignores prompt instructions about salad grouping, nut consolidation, or geography.

const VEG_KEYWORDS = ['طماطم', 'خيار', 'فلفل', 'خس', 'جزر', 'بروكلي', 'كوسة', 'كوسا', 'سبانخ', 'باذنجان', 'قرنبيط', 'فاصوليا خضراء', 'كرفس', 'ملفوف', 'فجل', 'زعتر']
const NUT_KEYWORDS  = ['لوز', 'كاجو', 'جوز', 'فستق', 'بذر كتان', 'بذر شيا', 'سمسم', 'بذر عباد']

function isVegetableItem(item) {
  const group = item.group || ''
  const food  = item.food  || ''
  if (group.includes('خضروات') || group.toLowerCase().includes('vegetable')) return true
  return VEG_KEYWORDS.some(k => food.includes(k))
}

function isNutItem(item) {
  const food = item.food || ''
  return NUT_KEYWORDS.some(k => food.includes(k))
}

function parseGrams(amount) {
  const m = String(amount || '').match(/^(\d+(?:\.\d+)?)/)
  return m ? parseFloat(m[1]) : 0
}

function fixMeal(meal) {
  if (!meal || !Array.isArray(meal.items)) return meal

  const cleanItems = []
  const vegNames   = []
  const nutParts   = []
  let   nutGrams   = 0

  for (const item of meal.items) {
    if (isVegetableItem(item)) {
      vegNames.push(item.food)
    } else if (isNutItem(item)) {
      nutParts.push(item.food)
      nutGrams += parseGrams(item.amount)
    } else {
      cleanItems.push(item)
    }
  }

  const result = { ...meal, items: cleanItems }

  // Merge extracted vegetables → salad
  if (vegNames.length > 0) {
    const prev    = meal.salad || {}
    const allVegs = [...new Set([...(prev.vegetables || []), ...vegNames])]
    result.salad  = {
      has_salad:   true,
      vegetables:  allVegs,
      preparation: prev.preparation || 'سلطة طازجة بزيت الزيتون والليمون',
      grams:       prev.grams || allVegs.length * 80,
    }
  } else if (meal.salad) {
    result.salad = meal.salad
  }

  // Merge extracted nuts → nuts object
  if (nutParts.length > 0) {
    const prev   = meal.nuts || {}
    const joined = nutParts.join(' + ')
    result.nuts  = {
      has_nuts: true,
      type:     joined,
      grams:    nutGrams || prev.grams || 30,
    }
  } else if (meal.nuts) {
    result.nuts = meal.nuts
  }

  return result
}

function postProcess(plan) {
  if (!plan) return plan
  const fixMenu = menu => Array.isArray(menu) ? menu.map(m => fixMeal(m)) : menu

  if (plan.duration === 'week' && Array.isArray(plan.days)) {
    return { ...plan, days: plan.days.map(d => ({ ...d, menu: fixMenu(d.menu) })) }
  }
  if (plan.duration === 'month' && Array.isArray(plan.weeks)) {
    return { ...plan, weeks: plan.weeks.map(w => ({ ...w, menu: fixMenu(w.menu) })) }
  }
  return plan.menu ? { ...plan, menu: fixMenu(plan.menu) } : plan
}

// ── Local fallback: uses the rule-based engine ───────────────────────────────
function localPlan(form) {
  const bmr    = calcBMR(form.gender, form.weight, form.height, form.age)
  const tdee   = calcTDEE(bmr, form.activity)
  const target = calcTarget(tdee, form.goal, form.gender, {
    manualAdj:     form.manualAdj    || null,
    weeklyRate:    form.weeklyRate   || null,
    currentWeight: form.weight,
    targetWeight:  form.targetWeight || null,
  })
  const exOpts = { age: form.age, bodyFatPct: form.bodyFatPct || null, weight: form.weight, targetWeight: form.targetWeight || null }
  const ex     = calcExchanges(target, form.goal, form.avoided, exOpts)
  const water    = calcWaterGoal(form.weight, form.activity)
  const duration = form.duration || 'day'
  const meals    = +form.meals
  const pref     = form.preferred
  const avoided  = form.avoided
  const base     = { bmr: Math.round(bmr), tdee, target, ex, water, form, date: new Date().toISOString(), ai: false }

  const wp = Array.isArray(form.weeklyProtein) ? form.weeklyProtein : null

  if (duration === 'week') {
    const days = DAY_NAMES.map((name, i) => ({
      name,
      menu: generateMenu(ex, meals, pref, avoided, i * 11, wp?.[i] || 'mixed'),
    }))
    return { ...base, days, duration: 'week' }
  }
  if (duration === 'month') {
    // For month plans, cycle through weeklyProtein if set
    const weeks = WEEK_NAMES.map((name, i) => ({
      name,
      menu: generateMenu(ex, meals, pref, avoided, i * 13, wp?.[i % 7] || 'mixed'),
    }))
    return { ...base, weeks, duration: 'month' }
  }
  // day (default)
  const menu = generateMenu(ex, meals, pref, avoided, 0, wp?.[0] || 'mixed')
  return { ...base, menu, duration: 'day' }
}

export async function POST(req) {
  const deny = await requireAdmin()
  if (deny) return deny

  // Rate-limit: max 8 AI plan generations per hour per admin session
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (await isRateLimited(`ai_plan:${ip}`, 8, 3600)) {
    return NextResponse.json({ error: 'تجاوزت الحد المسموح (8 خطط/ساعة) — حاول لاحقاً' }, { status: 429 })
  }

  const form = await req.json()

  // Validate numeric fields before passing to engine
  const weight = parseFloat(form.weight)
  const height = parseFloat(form.height)
  const age    = parseInt(form.age, 10)
  if (!weight || !height || !age || weight < 20 || weight > 400 || height < 50 || height > 280 || age < 5 || age > 120) {
    return NextResponse.json({ error: 'بيانات القياسات غير صالحة' }, { status: 400 })
  }
  form.weight = weight; form.height = height; form.age = age

  // If no API key → use local engine immediately (no error)
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(postProcess(localPlan(form)))
  }

  const duration = form.duration || 'day'

  // Month plans → always use local engine (too large for AI)
  if (duration === 'month') {
    return NextResponse.json(postProcess(localPlan(form)))
  }

  // ── Redis cache check (24h) — avoid repeat API calls for identical inputs ──
  const cacheKey    = planCacheKey(form)
  const cachedPlan  = await cacheGet(cacheKey)
  if (cachedPlan) {
    return NextResponse.json({ ...cachedPlan, cached: true, date: new Date().toISOString() })
  }

  // Build regional context for the prompt
  const region      = getRegion(form.country || '')
  const regionLabel = REGION_LABELS[region] || ''
  const regionHint  = REGION_FOOD_HINTS[region] || ''

  const safeName      = String(form.name     || '').slice(0, 100) || 'العميل'
  const safePreferred = String(form.preferred || '').slice(0, 500).trim() || 'لا يوجد'
  const safeAvoided   = String(form.avoided   || '').slice(0, 200) || 'لا يوجد'
  const hasFoodList   = safePreferred !== 'لا يوجد'
  const foodListLine  = hasFoodList
    ? `قائمة الأطعمة المسموحة (استخدم هذه الأطعمة فقط — لا تضف أي طعام خارجها): ${safePreferred}`
    : `قائمة الأطعمة: غير محددة (اختر أطعمة متنوعة مناسبة)`
  const adjNum  = form.manualAdj  ? Math.max(-1000, Math.min(1000, Math.round(+form.manualAdj)))   : null
  const rateNum = form.weeklyRate ? Math.max(-1,    Math.min(1,    +form.weeklyRate))               : null
  const adjLine = adjNum  != null ? `العجز/الفائض اليومي المحدد يدوياً: ${adjNum} سعرة/يوم\n` :
                  rateNum != null ? `معدل الوزن الأسبوعي المستهدف: ${rateNum} كغ/أسبوع → عجز/فائض: ${Math.round(rateNum * 7700 / 7)} سعرة/يوم\n` : ''

  const regionSection = region !== 'global' ? `المنطقة: ${regionLabel}
الأطعمة المحلية المفضلة: ${regionHint}
` : ''

  // SCHEMA ANNOTATIONS (these explain the rules — do not include them in JSON output):
  // items[] → نشويات + بروتين + ألبان + فاكهة + زيت زيتون فقط
  //           🚫 ممنوع في items: الخضروات (طماطم/خيار/فلفل/خس...) → تذهب لـ salad
  //           🚫 ممنوع في items: المكسرات (لوز/كاجو/فستق...) → تذهب لـ nuts
  // salad   → has_salad=true إذا وُجدت خضروات، جمِّع كلها في كائن واحد
  // nuts    → has_nuts=true إذا وُجدت مكسرات، جمِّع كلها في كائن واحد
  const menuSchema = `[
    {
      "name": "الفطور", "time": "07:30", "icon": "🌅",
      "kcal": number, "carbs": number, "protein": number, "fat": number,
      "items": [
        { "group": "النشويات", "icon": "🌾", "servings": number, "food": "توست كامل محمص", "amount": "90 غ (3 شرائح)", "cooking_method": "محمص" }
      ],
      "salad": { "has_salad": false, "vegetables": ["طماطم", "خيار"], "preparation": "سلطة طازجة بزيت الزيتون", "grams": 150 },
      "nuts": { "has_nuts": false, "type": "None", "grams": 0 }
    }
  ]`

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const floor     = form.gender === 'male' ? 1500 : 1200

    // ── WEEK PLAN — use Sonnet (higher output limit) to generate all 7 days ──
    if (duration === 'week') {
      const dayMacrosSchema = `{ "calories": number, "protein": number, "carbs": number, "fat": number }`
      const weekSchema = `{
  "bmr": number, "tdee": number, "target": number,
  "ex": { "starches": number, "meats": number, "dairy": number, "fats": number, "fruits": number, "vegetables": number, "actualKcal": number, "macros": { "carbs": number, "protein": number, "fat": number }, "pct": { "carbs": number, "protein": number, "fat": number }, "skipped": { "milk": false, "vegetable": false, "fruit": false } },
  "duration": "week",
  "days": [
    { "name": "الأحد",     "protein_source": "string", "total_day_macros": ${dayMacrosSchema}, "menu": ${menuSchema} },
    { "name": "الاثنين",   "protein_source": "string", "total_day_macros": ${dayMacrosSchema}, "menu": ${menuSchema} },
    { "name": "الثلاثاء",  "protein_source": "string", "total_day_macros": ${dayMacrosSchema}, "menu": ${menuSchema} },
    { "name": "الأربعاء",  "protein_source": "string", "total_day_macros": ${dayMacrosSchema}, "menu": ${menuSchema} },
    { "name": "الخميس",    "protein_source": "string", "total_day_macros": ${dayMacrosSchema}, "menu": ${menuSchema} },
    { "name": "الجمعة",    "protein_source": "string", "total_day_macros": ${dayMacrosSchema}, "menu": ${menuSchema} },
    { "name": "السبت",     "protein_source": "string", "total_day_macros": ${dayMacrosSchema}, "menu": ${menuSchema} }
  ]
}`

      // Build weekly protein schedule section if trainer specified protein types per day
      const hasCustomProtein = Array.isArray(form.weeklyProtein) && form.weeklyProtein.some(p => p && p !== 'mixed')
      const weeklyProteinSection = hasCustomProtein
        ? `\n═══ جدول البروتين الأسبوعي (إلزامي — التزم به يوماً بيوم) ═══\n` +
          DAY_NAMES.map((day, i) => {
            const key = form.weeklyProtein?.[i] || 'mixed'
            return `• ${day}: ${PROTEIN_LABELS[key] || PROTEIN_LABELS.mixed}`
          }).join('\n') + '\n'
        : ''

      const weekPrompt = `═══ بيانات العميل ═══
الاسم: ${safeName}
العمر: ${form.age} سنة | الجنس: ${form.gender === 'male' ? 'ذكر' : 'أنثى'}
الوزن الحالي: ${form.weight} كغ | الطول: ${form.height} سم
الوزن المستهدف: ${form.targetWeight ? form.targetWeight + ' كغ' : 'غير محدد'}
مستوى النشاط: ${ACTIVITY_LABELS[form.activity] || 'غير محدد'}
الهدف: ${GOAL_LABELS[form.goal] || 'غير محدد'}
${adjLine}${regionSection}${foodListLine}
الأطعمة الممنوعة: ${safeAvoided}
عدد الوجبات يومياً: ${form.meals}
${weeklyProteinSection}
أنشئ خطة غذائية كاملة لمدة أسبوع (7 أيام) مع التنويع بين الأيام.
استخدم الأطعمة المحلية الصحيحة للبلد المذكور.${hasCustomProtein ? '\nالتزم بجدول البروتين المحدد أعلاه وأعِد حساب الماكروز لكل يوم وفق مصدر بروتينه.' : ''}

تذكير إلزامي قبل التوليد:
🚫 الخضروات (طماطم/خيار/فلفل/خس...) → حقل salad فقط — ممنوع في items
🚫 المكسرات (لوز/كاجو/جوز/فستق...) → حقل nuts فقط — ممنوع في items
🚫 تونس/مغرب/جزائر: سمك السلمون محظور تماماً — استخدم سردين أو مرجان أو تونة
${hasCustomProtein ? '🚫 أيام plant/eggs_plant: ممنوع أي بروتين حيواني في أي حقل\n' : ''}
أعد JSON بالضبط (بدون أي نص خارجه):
${weekSchema}`

      const response = await anthropic.messages.create({
        model:      'claude-sonnet-4-6',
        max_tokens: 14000,
        thinking:   { type: 'adaptive' },
        system:     [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        messages:   [{ role: 'user', content: weekPrompt }],
      })

      const textBlock = response.content.find(b => b.type === 'text')
      const raw  = (textBlock?.text || '').trim()
        .replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      const plan = JSON.parse(raw)
      if (plan.target) plan.target = Math.max(floor, plan.target)
      const weekResult = { ...postProcess(plan), form, date: new Date().toISOString(), ai: true, duration: 'week' }
      await cacheSet(cacheKey, weekResult)
      return NextResponse.json(weekResult)
    }

    // ── DAY PLAN — use Haiku (faster / cheaper) ───────────────────────────────
    const daySchema = `{
  "bmr": number, "tdee": number, "target": number,
  "ex": { "starches": number, "meats": number, "dairy": number, "fats": number, "fruits": number, "vegetables": number, "actualKcal": number, "macros": { "carbs": number, "protein": number, "fat": number }, "pct": { "carbs": number, "protein": number, "fat": number }, "skipped": { "milk": false, "vegetable": false, "fruit": false } },
  "duration": "day",
  "total_day_macros": { "calories": number, "protein": number, "carbs": number, "fat": number },
  "menu": ${menuSchema}
}`

    const dayPrompt = `═══ بيانات العميل ═══
الاسم: ${safeName}
العمر: ${form.age} سنة | الجنس: ${form.gender === 'male' ? 'ذكر' : 'أنثى'}
الوزن الحالي: ${form.weight} كغ | الطول: ${form.height} سم
الوزن المستهدف: ${form.targetWeight ? form.targetWeight + ' كغ' : 'غير محدد'}
مستوى النشاط: ${ACTIVITY_LABELS[form.activity] || 'غير محدد'}
الهدف: ${GOAL_LABELS[form.goal] || 'غير محدد'}
${adjLine}${regionSection}${foodListLine}
الأطعمة الممنوعة: ${safeAvoided}
عدد الوجبات: ${form.meals} وجبات يومياً

تذكير إلزامي قبل التوليد:
🚫 الخضروات (طماطم/خيار/فلفل/خس...) → حقل salad فقط — ممنوع في items
🚫 المكسرات (لوز/كاجو/جوز/فستق...) → حقل nuts فقط — ممنوع في items
🚫 تونس/مغرب/جزائر: سمك السلمون محظور تماماً — استخدم سردين أو مرجان أو تونة

أنشئ خطة غذائية ليوم واحد وأعد JSON بالضبط:
${daySchema}`

    const response = await anthropic.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 5000,
      system:     [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages:   [{ role: 'user', content: dayPrompt }],
    })

    const textBlock = response.content.find(b => b.type === 'text')
    const raw  = (textBlock?.text || '').trim()
      .replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    const plan = JSON.parse(raw)
    if (plan.target) plan.target = Math.max(floor, plan.target)
    const dayResult = { ...postProcess(plan), form, date: new Date().toISOString(), ai: true, duration: plan.duration || 'day' }
    await cacheSet(cacheKey, dayResult)
    return NextResponse.json(dayResult)

  } catch (err) {
    console.error('AI plan error — falling back to local engine:', err.message)
    return NextResponse.json(postProcess(localPlan(form)))
  }
}
