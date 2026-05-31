import { NextResponse } from 'next/server'

const SYSTEM_PROMPT = `أنت مساعد تغذية للمدرب. تلقّيت القائمة الغذائية الحالية. عدّلها بناءً على طلب المدرب وأعد JSON فقط بنفس هيكل menu array + حقل 'message' يصف ما تغيّر. لا تغير BMR أو TDEE أو الوحدات الإجمالية.

هيكل الرد المطلوب:
{
  "menu": [ { "name": "...", "time": "...", "icon": "...", "kcal": number, "carbs": number, "protein": number, "fat": number, "items": [ { "group": "...", "icon": "...", "servings": number, "food": "...", "amount": "..." } ] } ],
  "message": "وصف موجز لما تغيّر في القائمة"
}

أعد JSON فقط بدون أي نص إضافي.`

export async function POST(req) {
  const { plan, menu, messages } = await req.json()

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ menu, message: 'لا يوجد اتصال بـ Claude — لم تتغير الخطة.' })
  }

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    // Build context message with current menu
    const contextMsg = `القائمة الغذائية الحالية:
${JSON.stringify(menu, null, 2)}

معلومات إضافية:
- السعرات المستهدفة: ${plan?.target || 'غير محدد'} سعرة
- الوحدات الإجمالية: ${plan?.ex ? JSON.stringify(plan.ex) : 'غير محددة'}`

    // Build conversation: inject context as first user message, then real messages
    const conversation = [
      { role: 'user', content: contextMsg },
      { role: 'assistant', content: 'فهمت القائمة الغذائية الحالية. أنا جاهز لتعديلها بناءً على طلبك.' },
      ...messages,
    ]

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: conversation,
    })

    const raw = response.content[0].text.trim()
      .replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    const result = JSON.parse(raw)

    return NextResponse.json({
      menu: result.menu || menu,
      message: result.message || 'تم تعديل القائمة.',
    })
  } catch (err) {
    console.error('AI chat error:', err.message)
    return NextResponse.json({ menu, message: 'لا يوجد اتصال بـ Claude — لم تتغير الخطة.' })
  }
}
