import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'

const SYSTEM_PROMPT_SINGLE = `أنت مساعد تغذية للمدرب. تلقّيت القائمة الغذائية الحالية. عدّلها بناءً على طلب المدرب وأعد JSON فقط بنفس هيكل menu array + حقل 'message' يصف ما تغيّر. لا تغير BMR أو TDEE أو الوحدات الإجمالية.

هيكل الرد المطلوب:
{
  "menu": [ { "name": "...", "time": "...", "icon": "...", "kcal": number, "carbs": number, "protein": number, "fat": number, "items": [ { "group": "...", "icon": "...", "servings": number, "food": "...", "amount": "..." } ] } ],
  "message": "وصف موجز لما تغيّر في القائمة"
}

أعد JSON فقط بدون أي نص إضافي.`

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

    if (isMulti) {
      // Process each day/week independently in parallel — avoids JSON truncation from huge single response
      const results = await Promise.all(
        allMenus.map(async (dayData) => {
          const contextMsg = `القائمة الغذائية ليوم/أسبوع: ${dayData.name}\n${JSON.stringify(dayData.menu, null, 2)}\n\nمعلومات إضافية:\n- السعرات المستهدفة: ${plan?.target || 'غير محدد'} سعرة`
          const conversation = [
            { role: 'user', content: contextMsg },
            { role: 'assistant', content: 'فهمت القائمة الغذائية. أنا جاهز لتعديلها بناءً على طلبك.' },
            ...messages,
          ]
          const resp = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 2048,
            system: SYSTEM_PROMPT_SINGLE,
            messages: conversation,
          })
          const raw = resp.content[0].text.trim()
            .replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
          const parsed = JSON.parse(raw)
          return { name: dayData.name, menu: parsed.menu || dayData.menu, message: parsed.message }
        })
      )

      return NextResponse.json({
        allMenus: results.map(r => ({ name: r.name, menu: r.menu })),
        message: results[0]?.message || 'تم تعديل القائمة لجميع الأيام.',
      })
    }

    // Single day
    const contextMsg = `القائمة الغذائية الحالية:\n${JSON.stringify(menu, null, 2)}\n\nمعلومات إضافية:\n- السعرات المستهدفة: ${plan?.target || 'غير محدد'} سعرة\n- الوحدات الإجمالية: ${plan?.ex ? JSON.stringify(plan.ex) : 'غير محددة'}`
    const conversation = [
      { role: 'user', content: contextMsg },
      { role: 'assistant', content: 'فهمت القائمة الغذائية الحالية. أنا جاهز لتعديلها بناءً على طلبك.' },
      ...messages,
    ]

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: SYSTEM_PROMPT_SINGLE,
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
    const msg = `⚠️ خطأ في الاتصال بـ Claude: ${err.message}`
    return NextResponse.json(isMulti ? { allMenus, message: msg } : { menu, message: msg })
  }
}
