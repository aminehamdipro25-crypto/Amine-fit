import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { isRateLimited } from '@/lib/rateLimit'
import {
  calcBMR, calcTDEE, calcTarget, calcExchanges, calcWaterGoal, generateMenu,
  getRegion, REGION_FOOD_HINTS, REGION_LABELS,
} from '@/lib/nutritionEngine'

export const dynamic = 'force-dynamic'

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

const SYSTEM_PROMPT = `أنت مختص تغذية إكلينيكي معتمد ومتخصص في نظام التبادل الغذائي (ADA Food Exchange System 2019). مهمتك إنشاء خطط غذائية شخصية دقيقة علمياً ومنطقية تماماً من المرة الأولى دون الحاجة لأي تعديل لاحق.

═══ قيم التبادل الغذائي — ADA 2019 (Choose Your Foods) ═══
• نشويات         : 80 سعرة | 15غ كارب | 3غ بروتين | 1غ دهن
• لحم خالي الدهن : 45 سعرة |  0غ كارب | 7غ بروتين | 2غ دهن  (دجاج/سمك/تونة/كبدة)
• ألبان خالية الدسم: 90 سعرة | 12غ كارب | 8غ بروتين | 0غ دهن
• دهون           : 45 سعرة |  0غ كارب | 0غ بروتين | 5غ دهن
• فواكه          : 60 سعرة | 15غ كارب | 0غ بروتين | 0غ دهن
• خضروات غير نشوية: 25 سعرة | 5غ كارب | 2غ بروتين | 0غ دهن

═══ معادلة Mifflin-St Jeor (1990) — الأدق علمياً ═══
ذكر : BMR = (10×وزن كغ) + (6.25×طول سم) - (5×عمر) + 5
أنثى: BMR = (10×وزن كغ) + (6.25×طول سم) - (5×عمر) - 161
TDEE = BMR × معامل النشاط
الهدف = TDEE + تعديل الهدف (خسارة: −500 | حفاظ: 0 | بناء عضلات: +300)
الحد الأدنى: 1500 سعرة للذكور / 1200 سعرة للإناث

═══ توزيع الماكرو (إلزامي) ═══
البروتين = الوزن المستهدف × 2 غ/كغ (إذا توفر الوزن المستهدف)
الدهون = (السعرات المستهدفة × 0.25) ÷ 9 غ
الكارب = (السعرات المستهدفة − بروتين×4 − دهون×9) ÷ 4 غ

═══ حصص الأطعمة المعيارية (ADA) ═══
نشويات : أرز مطبوخ 65غ | توست 30غ | بطاطا 90غ | شوفان جاف 20غ | كسكس مطبوخ 65غ
بروتين : دجاج/سمك مطبوخ 30غ | بيضة 50غ (1 حبة) | تونة مصفّاة 30غ
دهون   : زبدة 5غ (1 ملعقة صغيرة) | لوز 8غ (~6 حبات) | كاجو 10غ | زيت زيتون 5مل | أفوكادو 30غ
العسل والتمر: تُدرج ضمن النشويات (ليست دهوناً)
فواكه  : موز 60غ (نصف حبة) | تفاح 115غ | مانجو 80غ | فراولة 150غ

═══ مبادئ التوزيع المثالي للوجبات ═══
الفطور (20-25%): توست/خبز + بروتين خفيف (جبن/بيضة) + دهون متنوعة منفصلة (زبدة + مكسرات) + فاكهة + ألبان
وجبة خفيفة (10-15%): فاكهة + بروتين خفيف أو مكسرات
الغداء (35-40%): نشا رئيسي + بروتين رئيسي (دجاج/لحم/سمك) + خضروات + زيت زيتون
العشاء (25-30%): نشا خفيف + بروتين (سمك/تونة/دجاج) + خضروات

═══ الالتزام الجغرافي والثقافي (إلزامي) ═══
• اقرأ المنطقة/البلد من بيانات العميل واختر أطعمة شائعة ومتاحة في ذلك البلد تحديداً
• تونس/المغرب/الجزائر: كسكس، مرق، هريسة، خبز، زيتون، تمر، أسماك محلية (سردين/مرجان) — تجنب الكينوا والأفوكادو والمنتجات الغربية النادرة
• قطر/الإمارات/الخليج: أرز بسمتي، كباب، دجاج مشوي، تمر، لبن رائب، خبز عربي — تجنب الكسكس والهريسة
• مصر/المشرق: فول، عدس، طحينية، خبز بلدي، كشك — تجنب الكسكس
• عالمي (غير محدد): أطعمة شائعة ومتعارف عليها عالمياً
• مهما كان البلد: تجنب اقتراح أطعمة غريبة أو نادرة أو غير متاحة في الأسواق المحلية

═══ قواعد هيكلة الوجبة (إلزامي) ═══
• لا عشوائية: كل مكون في الوجبة له موضعه المنطقي — لا خلط عشوائي بين الأصناف
• الخضروات: جمِّع جميع حصص الخضروات في الوجبة الواحدة كعنصر سلطة وحيد — سواء كانت طازجة (خس+طماطم+خيار) أو مشوية أو مطبوخة على البخار (بروكلي/كوسا/جزر) — حدِّد طريقة التحضير في حقل food وفق طبيعة الخضار
• المكسرات والدهون الصلبة (لوز/كاجو/جوز/أفوكادو): عنصر مستقل لا يُدمج أبداً مع السلطة أو الطبق الرئيسي — يُقدَّم منفصلاً أو كسناك جانبي
• البروتين: طبق مستقل مع تحديد طريقة الطهي في حقل food (مشوي/مسلوق/مطبوخ على البخار)
• الفاكهة: عنصر مستقل لا تُخلط مع السلطة أو الطبق الرئيسي
• الزيت (زيت زيتون): يُذكر ضمن تتبيلة السلطة أو الطبق الذي يُستخدم فيه، ليس عنصراً منفصلاً

═══ الدقة الحسابية للماكروز (إلزامي) ═══
• احسب الوزن بالغرام لكل مكون بدقة متناهية لضمان تحقيق الماكروز المستهدفة تماماً
• مجموع سعرات الوجبات = السعرات المستهدفة اليومية بفارق لا يتجاوز ±5 سعرة
• مجموع البروتين عبر الوجبات = البروتين المستهدف بفارق لا يتجاوز ±2 غ
• مجموع الكارب والدهون بنفس دقة البروتين
• حقل amount: اذكر الوزن بالغرام أولاً ثم الوحدة المنزلية المكافئة — مثال: "90 غ (3 شرائح توست)" أو "65 غ (5 ملاعق كسكس مطبوخ)"

═══ منهجية التفكير الحسابي والتحقق الذاتي (إلزامي) ═══
قبل كتابة JSON نهائي لكل يوم، نفِّذ هذه الخطوات الحسابية بدقة رياضية:
① حساب الماكروز اليومية:
  بروتين(غ) = وزن_مستهدف×2 (أو وزن_حالي×1.8 إن لم يُحدَّد)
  دهون(غ) = سعرات_كلية × 0.25 ÷ 9
  كارب(غ) = (سعرات_كلية − بروتين×4 − دهون×9) ÷ 4
② توزيع السعرات على الوجبات بالنسب: فطور 22% | وجبة خفيفة 12% | غداء 38% | عشاء 28%
③ لكل وجبة: احسب حصص التبادل ثم الغرامات الدقيقة لكل مكون
④ حدِّد cooking_method لكل عنصر بروتيني ونشوي وضمِّنه في حقل food
⑤ التحقق الذاتي قبل الإخراج: اجمع (kcal, protein, carbs, fat) لجميع وجبات اليوم
  • إذا |∑kcal − target| > 5 → عدِّل أصغر وجبة قبل الإخراج
  • إذا |∑protein − target_protein| > 2 → عدِّل كمية البروتين الرئيسي
  • إذا |∑carbs − target_carbs| > 3 → عدِّل حصص النشويات
⑥ سجِّل الإجماليات المُصحَّحة في حقل total_day_macros
⑦ أخرج JSON النهائي المصحَّح فقط — أي نص خارج JSON يُبطل الاستجابة برمجياً

═══ توزيع البروتين الأسبوعي (إذا حُدِّد) ═══
• التزم بمصدر البروتين المحدد لكل يوم تحديداً — لا تستبدله ولا تضف مصادر أخرى
• الهدف اليومي (سعرات + ماكروز) يبقى ثابتاً دائماً بغض النظر عن مصدر البروتين
• أيام البقوليات (حمص/عدس/فول/لوبيا/فاصوليا):
  ‑ البقوليات تحتوي بروتين + كربوهيدرات معاً → احسب كارب البقوليات ضمن الكارب اليومي وخفِّض حصص النشويات الأخرى (أرز/خبز/كسكس) بالمقدار المكافئ تماماً
  ‑ مرجع: 150غ حمص مطبوخ ≈ 12غ بروتين + 26غ كارب → خفِّض الأرز بما يكافئ 26غ كارب (≈ 1.7 وحدة نشويات = ~110غ أرز مطبوخ)
• أيام البيض:
  ‑ بيضة واحدة (50غ) = 6غ بروتين + 5غ دهن → احسب الدهون المصاحبة ضمن دهون اليوم وخفِّض الزيت أو المكسرات بالمقدار المكافئ
• أيام الألبان + الجبن:
  ‑ وحدة ألبان = 12غ كارب + 8غ بروتين → احسب كارب الألبان ضمن الكارب اليومي
  ‑ جبن قريش 100غ ≈ 11غ بروتين + 4غ كارب + 1غ دهن
• أيام الكبدة: تعامَل مثل الدجاج (لحم خالٍ من الدهن) — كبدة دجاج أو خروف محضَّرة مشوية أو مسلوقة
• أيام اللحم الأحمر: احسب محتوى الدهن المرتفع للحم (لحم مفروم/ستيك) وخفِّض الدهون الأخرى تلقائياً

═══ قواعد صارمة ═══
1. الأطعمة الممنوعة: احذفها تماماً وعوّض من مجموعات أخرى
2. قائمة الأطعمة المسموحة: إذا قُدِّمت قائمة → استخدمها حصراً ولا تضف أي طعام خارجها | إذا لم تُقدَّم → اختر أطعمة متنوعة مناسبة ثقافياً
3. التنويع: لا تكرر نفس الطعام في وجبتين متتاليتين
4. المنطق: الزبدة/المكسرات = فطور فقط | زيت الزيتون = غداء/عشاء | العسل = ضمن النشويات
5. الكميات: احسبها بدقة (عدد الوحدات × غرام/وحدة) مع التحقق من الإجماليات
6. أعد JSON فقط بدون أي نص إضافي`

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

  if (duration === 'week') {
    const days = DAY_NAMES.map((name, i) => ({ name, menu: generateMenu(ex, meals, pref, avoided, i) }))
    return { ...base, days, duration: 'week' }
  }
  if (duration === 'month') {
    const weeks = WEEK_NAMES.map((name, i) => ({ name, menu: generateMenu(ex, meals, pref, avoided, i * 3) }))
    return { ...base, weeks, duration: 'month' }
  }
  // day (default)
  const menu = generateMenu(ex, meals, pref, avoided, 0)
  return { ...base, menu, duration: 'day' }
}

export async function POST(req) {
  const deny = await requireAdmin()
  if (deny) return deny

  // Rate-limit: max 30 AI plan generations per hour per admin session
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (await isRateLimited(`ai_plan:${ip}`, 30, 3600)) {
    return NextResponse.json({ error: 'تجاوزت الحد المسموح — حاول لاحقاً' }, { status: 429 })
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
    return NextResponse.json(localPlan(form))
  }

  const duration = form.duration || 'day'

  // Month plans → always use local engine (too large for AI)
  if (duration === 'month') {
    return NextResponse.json(localPlan(form))
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

  const menuSchema = `[
    {
      "name": "الفطور", "time": "07:30", "icon": "🌅",
      "kcal": number, "carbs": number, "protein": number, "fat": number,
      "items": [
        { "group": "النشويات", "icon": "🌾", "servings": number, "food": "توست كامل محمص", "amount": "90 غ (3 شرائح)", "cooking_method": "محمص" }
      ],
      "salad": { "has_salad": false, "vegetables": ["طماطم", "خيار"], "preparation": "سلطة طازجة", "grams": 150 },
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
استخدم الأطعمة المحلية إذا أمكن.${hasCustomProtein ? '\nالتزم بجدول البروتين المحدد أعلاه وأعِد حساب الماكروز لكل يوم وفق مصدر بروتينه.' : ''}
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
      return NextResponse.json({ ...plan, form, date: new Date().toISOString(), ai: true, duration: 'week' })
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
    return NextResponse.json({ ...plan, form, date: new Date().toISOString(), ai: true, duration: plan.duration || 'day' })

  } catch (err) {
    console.error('AI plan error — falling back to local engine:', err.message)
    return NextResponse.json({ ...localPlan(form) })
  }
}
