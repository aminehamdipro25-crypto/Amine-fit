import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import {
  calcBMR, calcTDEE, calcTarget, calcExchanges, generateMenu,
} from '@/lib/nutritionEngine'

const ACTIVITY_LABELS = {
  sedentary:  'خامل (عمل مكتبي، لا رياضة) — معامل 1.20',
  light:      'خفيف (رياضة 1-3 أيام/أسبوع) — معامل 1.375',
  moderate:   'معتدل (رياضة 3-5 أيام/أسبوع) — معامل 1.55',
  active:     'نشيط (رياضة 6-7 أيام/أسبوع) — معامل 1.725',
  veryActive: 'نشيط جداً (تدريب مكثف يومياً) — معامل 1.90',
}
const GOAL_LABELS = {
  loss:     'خسارة الوزن (-500 سعرة من TDEE)',
  maintain: 'المحافظة على الوزن (= TDEE)',
  gain:     'بناء العضلات (+300 سعرة من TDEE)',
}

const SYSTEM_PROMPT = `أنت مختص تغذية إكلينيكي معتمد ومتخصص في نظام التبادل الغذائي (ADA Food Exchange System 2019). مهمتك إنشاء خطط غذائية شخصية دقيقة علمياً ومنطقية تماماً.

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
الهدف = TDEE + تعديل الهدف
الحد الأدنى: 1500 سعرة للذكور / 1200 سعرة للإناث

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

═══ قواعد صارمة ═══
1. الأطعمة الممنوعة: احذفها تماماً وعوّض من مجموعات أخرى
2. الأطعمة المفضلة: استخدمها أولاً في الوجبات المناسبة
3. التنويع: لا تكرر نفس الطعام في وجبتين متتاليتين
4. المنطق: الزبدة/المكسرات = فطور فقط | زيت الزيتون = غداء/عشاء | العسل = ضمن النشويات
5. الكميات: احسبها بدقة (عدد الوحدات × غرام/وحدة)
6. أعد JSON فقط بدون أي نص إضافي`

const DAY_NAMES  = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const WEEK_NAMES = ['الأسبوع الأول', 'الأسبوع الثاني', 'الأسبوع الثالث', 'الأسبوع الرابع']

// ── Local fallback: uses the rule-based engine ───────────────────────────────
function localPlan(form) {
  const bmr      = calcBMR(form.gender, form.weight, form.height, form.age)
  const tdee     = calcTDEE(bmr, form.activity)
  const target   = calcTarget(tdee, form.goal, form.gender)
  const ex       = calcExchanges(target, form.goal, form.avoided)
  const duration = form.duration || 'day'
  const meals    = +form.meals
  const pref     = form.preferred
  const avoided  = form.avoided
  const base     = { bmr: Math.round(bmr), tdee, target, ex, form, date: new Date().toISOString(), ai: false }

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

  const form = await req.json()

  // If no API key → use local engine immediately (no error)
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(localPlan(form))
  }

  const duration = form.duration || 'day'

  // Week/month plans exceed haiku's 8192-token output limit → use local engine
  if (duration === 'week' || duration === 'month') {
    return NextResponse.json(localPlan(form))
  }

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const menuSchema = `[
    {
      "name": "الفطور", "time": "07:30", "icon": "🌅",
      "kcal": number, "carbs": number, "protein": number, "fat": number,
      "items": [
        { "group": "النشويات", "icon": "🌾", "servings": number, "food": "توست كامل", "amount": "90 غ (3 شرائح)" }
      ]
    }
  ]`

    const schemaStr = `{
  "bmr": number, "tdee": number, "target": number,
  "ex": { "starches": number, "meats": number, "dairy": number, "fats": number, "fruits": number, "vegetables": number, "actualKcal": number, "macros": { "carbs": number, "protein": number, "fat": number }, "pct": { "carbs": number, "protein": number, "fat": number }, "skipped": { "milk": false, "vegetable": false, "fruit": false } },
  "duration": "day",
  "menu": ${menuSchema}
}`

    const userPrompt = `═══ بيانات العميل ═══
الاسم: ${form.name || 'العميل'}
العمر: ${form.age} سنة | الجنس: ${form.gender === 'male' ? 'ذكر' : 'أنثى'}
الوزن الحالي: ${form.weight} كغ | الطول: ${form.height} سم
الوزن المستهدف: ${form.targetWeight ? form.targetWeight + ' كغ' : 'غير محدد'}
مستوى النشاط: ${ACTIVITY_LABELS[form.activity] || form.activity}
الهدف: ${GOAL_LABELS[form.goal] || form.goal}
الأطعمة المفضلة: ${form.preferred || 'لا يوجد'}
الأطعمة الممنوعة: ${form.avoided || 'لا يوجد'}
عدد الوجبات: ${form.meals} وجبات يومياً

أنشئ خطة غذائية ليوم واحد وأعد JSON بالضبط:
${schemaStr}`

    const maxTokens = 4096

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const raw = response.content[0].text.trim()
      .replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    const plan = JSON.parse(raw)
    return NextResponse.json({ ...plan, form, date: new Date().toISOString(), ai: true, duration: plan.duration || duration })

  } catch (err) {
    console.error('AI plan error — falling back to local engine:', err.message)
    return NextResponse.json({ ...localPlan(form) })
  }
}
