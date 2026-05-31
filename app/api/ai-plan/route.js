import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

const SYSTEM_PROMPT = `أنت مختص تغذية إكلينيكي معتمد ومتخصص في نظام التبادل الغذائي (ADA Food Exchange System). مهمتك إنشاء خطط غذائية شخصية دقيقة علمياً ومنطقية تماماً.

═══ قيم التبادل الغذائي الدقيقة ═══
• نشويات   : 80 سعرة | 15غ كارب | 3غ بروتين | 0غ دهن
• لحم/بروتين: 55 سعرة | 0غ كارب  | 7غ بروتين | 3غ دهن
• ألبان     : 90 سعرة | 12غ كارب | 8غ بروتين | 0غ دهن
• دهون      : 45 سعرة | 0غ كارب  | 0غ بروتين | 5غ دهن
• فواكه     : 60 سعرة | 15غ كارب | 0غ بروتين | 0غ دهن
• خضروات    : 25 سعرة | 5غ كارب  | 2غ بروتين | 0غ دهن

═══ معادلة هاريس بنيديكت ═══
ذكر : BMR = 66.47 + (13.75×وزن) + (5.003×طول) - (6.755×عمر)
أنثى: BMR = 655.1 + (9.563×وزن) + (1.85×طول) - (4.676×عمر)
TDEE = BMR × معامل النشاط
الهدف = TDEE + تعديل الهدف (الحد الأدنى 1200 سعرة)

═══ مبادئ التوزيع المثالي للوجبات ═══
الفطور (25-30%): نشا (توست/شوفان/خبز) + بروتين خفيف (جبن/بيض) + دهون متنوعة (زبدة+عسل+مكسرات بنودٍ منفصلة) + فاكهة
وجبة خفيفة (10-15%): فاكهة + بروتين خفيف + قد يشمل مكسرات
الغداء (35-40%): نشا رئيسي (أرز/بطاطا/كسكسي) + بروتين رئيسي (دجاج/لحم/سمك) + خضروات + زيت زيتون
العشاء (15-20%): نشا خفيف + بروتين (سمك/تونة/دجاج) + خضروات أو فاكهة

═══ قواعد صارمة ═══
1. الأطعمة الممنوعة: احذفها تماماً من كل الوجبات، وعوّض من مجموعات أخرى
2. الأطعمة المفضلة: استخدمها أولاً في الوجبات المناسبة
3. التنويع: لا تكرر نفس الطعام في وجبتين متتاليتين
4. المنطق الغذائي: الزبدة/العسل/المكسرات = فطور فقط | زيت الزيتون = غداء/عشاء فقط
5. الكميات: احسبها بدقة (وحدات × جرام/وحدة = الكمية الفعلية)
6. الجبن المطبوخ: 30غ = وحدة بروتين خفيفة، مناسبة للفطور والوجبات الخفيفة
7. أعد JSON فقط بدون أي شرح أو نص خارجه`

export async function POST(req) {
  try {
    const form = await req.json()

    const userPrompt = `═══ بيانات العميل ═══
الاسم: ${form.name || 'العميل'}
العمر: ${form.age} سنة | الجنس: ${form.gender === 'male' ? 'ذكر' : 'أنثى'}
الوزن: ${form.weight} كغ | الطول: ${form.height} سم
مستوى النشاط: ${ACTIVITY_LABELS[form.activity] || form.activity}
الهدف: ${GOAL_LABELS[form.goal] || form.goal}
الأطعمة المفضلة: ${form.preferred || 'لا يوجد'}
الأطعمة الممنوعة: ${form.avoided || 'لا يوجد'}
عدد الوجبات: ${form.meals} وجبات يومياً

═══ المطلوب ═══
1. احسب BMR، TDEE، السعرات المستهدفة
2. حدد وحدات التبادل لكل مجموعة
3. وزّع الوجبات بشكل منطقي ومتنوع
4. اذكر كل طعام بالاسم العربي والكمية بالجرام

أعد هذا JSON بالضبط (أرقام صحيحة فقط):
{
  "bmr": number,
  "tdee": number,
  "target": number,
  "ex": {
    "starches": number,
    "meats": number,
    "dairy": number,
    "fats": number,
    "fruits": number,
    "vegetables": number,
    "actualKcal": number,
    "macros": { "carbs": number, "protein": number, "fat": number },
    "pct": { "carbs": number, "protein": number, "fat": number },
    "skipped": { "milk": false, "vegetable": false, "fruit": false }
  },
  "menu": [
    {
      "name": "اسم الوجبة",
      "time": "07:30",
      "icon": "🌅",
      "kcal": number,
      "carbs": number,
      "protein": number,
      "fat": number,
      "items": [
        {
          "group": "النشويات",
          "icon": "🌾",
          "servings": number,
          "food": "اسم الطعام بالعربية",
          "amount": "90 غ (3 شرائح)"
        }
      ]
    }
  ]
}`

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const rawText = response.content[0].text.trim()
    // Strip markdown code blocks if present
    const jsonText = rawText.replace(/^```(?:json)?\n?/,'').replace(/\n?```$/,'')
    const plan = JSON.parse(jsonText)

    return NextResponse.json({ ...plan, form, date: new Date().toISOString(), ai: true })
  } catch (err) {
    console.error('AI plan error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
