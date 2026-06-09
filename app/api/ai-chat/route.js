import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'

const SYSTEM_PROMPT_SINGLE = `أنت مساعد تغذية للمدرب. تلقّيت القائمة الغذائية الحالية. عدّلها بناءً على طلب المدرب وأعد JSON فقط بنفس هيكل menu array + حقل 'message' يصف ما تغيّر. لا تغير BMR أو TDEE أو الوحدات الإجمالية.

هيكل الرد المطلوب:
{
  "menu": [ { "name": "...", "time": "...", "icon": "...", "kcal": number, "carbs": number, "protein": number, "fat": number, "items": [ { "group": "...", "icon": "...", "servings": number, "food": "...", "amount": "..." } ] } ],
  "message": "وصف موجز لما تغيّر في القائمة"
}

أعد JSON فقط بدون أي نص إضافي.`

const SYSTEM_PROMPT_MULTI = `أنت مساعد تغذية للمدرب. تلقّيت قائمة غذائية متعددة الأيام/الأسابيع. طبّق التعديل المطلوب بشكل متسق على جميع الأيام/الأسابيع وأعد JSON فقط بنفس هيكل allMenus array + حقل 'message' يصف ما تغيّر. لا تغير السعرات الإجمالية أو الوحدات الكلية.

هيكل الرد المطلوب:
{
  "allMenus": [
    { "name": "الأحد", "menu": [ { "name": "...", "time": "...", "icon": "...", "kcal": number, "carbs": number, "protein": number, "fat": number, "items": [ { "group": "...", "icon": "...", "servings": number, "food": "...", "amount": "..." } ] } ] },
    { "name": "الاثنين", "menu": [ ... ] }
  ],
  "message": "وصف موجز لما تغيّر في جميع الأيام"
}

أعد JSON فقط بدون أي نص إضافي. احرص على إرجاع جميع الأيام/الأسابيع المُرسَلة إليك.`

export async function POST(req) {
  const deny = await requireAdmin()
  if (deny) return deny
  const { plan, menu, allMenus, messages } = await req.json()

  const isMulti = Array.isArray(allMenus) && allMenus.length > 0

  if (!Array.isArray(messages) || messages.length > 20) {
    const fallback = isMulti ? { allMenus, message: 'حد الرسائل تجاوز الحد المسموح (20 رسالة كحد أقصى).' } : { menu, message: 'حد الرسائل تجاوز الحد المسموح (20 رسالة كحد أقصى).' }
    return NextResponse.json(fallback)
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    const msg = '⚠️ ANTHROPIC_API_KEY غير مضبوط في Vercel — أضفه في Environment Variables لتفعيل تعديل الخطة بالذكاء الاصطناعي.'
    return NextResponse.json(isMulti ? { allMenus, message: msg } : { menu, message: msg })
  }

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const contextMsg = isMulti
      ? `القوائم الغذائية (${allMenus.length} ${allMenus.length <= 7 ? 'يوم' : 'أسبوع'}):\n${JSON.stringify(allMenus, null, 2)}\n\nمعلومات إضافية:\n- السعرات المستهدفة: ${plan?.target || 'غير محدد'} سعرة\n- الوحدات الإجمالية: ${plan?.ex ? JSON.stringify(plan.ex) : 'غير محددة'}`
      : `القائمة الغذائية الحالية:\n${JSON.stringify(menu, null, 2)}\n\nمعلومات إضافية:\n- السعرات المستهدفة: ${plan?.target || 'غير محدد'} سعرة\n- الوحدات الإجمالية: ${plan?.ex ? JSON.stringify(plan.ex) : 'غير محددة'}`

    const assistantAck = isMulti
      ? `فهمت القوائم الغذائية لجميع الأيام/الأسابيع. سأطبّق أي تعديل على الجميع باتساق.`
      : `فهمت القائمة الغذائية الحالية. أنا جاهز لتعديلها بناءً على طلبك.`

    const conversation = [
      { role: 'user', content: contextMsg },
      { role: 'assistant', content: assistantAck },
      ...messages,
    ]

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: isMulti ? 8192 : 2048,
      system: isMulti ? SYSTEM_PROMPT_MULTI : SYSTEM_PROMPT_SINGLE,
      messages: conversation,
    })

    const raw = response.content[0].text.trim()
      .replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    const result = JSON.parse(raw)

    if (isMulti) {
      return NextResponse.json({
        allMenus: result.allMenus || allMenus,
        message: result.message || 'تم تعديل القائمة لجميع الأيام.',
      })
    }

    return NextResponse.json({
      menu: result.menu || menu,
      message: result.message || 'تم تعديل القائمة.',
    })
  } catch (err) {
    console.error('AI chat error:', err.message)
    const msg = `⚠️ خطأ في الاتصال بـ Claude: ${err.message}`
    return NextResponse.json(isMulti ? { allMenus, message: msg } : { menu, message: msg })
  }
}
