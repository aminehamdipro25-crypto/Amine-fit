import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// Single-day modification prompt
const SYSTEM_PROMPT_SINGLE = `أنت مساعد تغذية للمدرب. تلقّيت القائمة الغذائية الحالية. عدّلها بناءً على طلب المدرب وأعد JSON فقط بنفس هيكل menu array + حقل 'message' يصف ما تغيّر. لا تغير BMR أو TDEE أو الوحدات الإجمالية.

هيكل الرد المطلوب:
{
  "menu": [ { "name": "...", "time": "...", "icon": "...", "kcal": number, "carbs": number, "protein": number, "fat": number, "items": [ { "group": "...", "icon": "...", "servings": number, "food": "...", "amount": "..." } ] } ],
  "message": "وصف موجز لما تغيّر في القائمة"
}

أعد JSON فقط بدون أي نص إضافي.`

// Multi-day modification prompt — all days in ONE call
const SYSTEM_PROMPT_MULTI = `أنت مساعد تغذية للمدرب. تلقّيت قوائم غذائية لعدة أيام/أسابيع. عدّلها جميعاً بناءً على طلب المدرب في استجابة واحدة وأعد JSON فقط.

هيكل الرد المطلوب:
{
  "days": [
    {
      "name": "اسم اليوم أو الأسبوع (بدون تغيير)",
      "menu": [ { "name": "...", "time": "...", "icon": "...", "kcal": number, "carbs": number, "protein": number, "fat": number, "items": [ { "group": "...", "icon": "...", "servings": number, "food": "...", "amount": "..." } ] } ]
    }
  ],
  "message": "وصف موجز للتعديلات المُطبَّقة"
}

قواعد:
- طبّق نفس التعديل على جميع الأيام بشكل متسق
- حافظ على نفس عدد الوجبات لكل يوم
- لا تغير إجماليات السعرات الكلية بشكل كبير
- أعد JSON فقط بدون أي نص خارجه`

export async function POST(req) {
  const deny = await requireAdmin()
  if (deny) return deny
  const { plan, menu, allMenus, messages } = await req.json()

  const isMulti = Array.isArray(allMenus) && allMenus.length > 0

  if (!Array.isArray(messages) || messages.length > 20) {
    const msg = 'حد الرسائل تجاوز الحد المسموح (20 رسالة كحد أقصى).'
    return NextResponse.json(isMulti ? { allMenus, message: msg } : { menu, message: msg })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    const msg = '⚠️ ANTHROPIC_API_KEY غير مضبوط في Vercel — أضفه في Environment Variables لتفعيل تعديل الخطة.'
    return NextResponse.json(isMulti ? { allMenus, message: msg } : { menu, message: msg })
  }

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    if (isMulti) {
      // Single API call for ALL days — avoids N sequential calls that timeout on Vercel
      const contextMsg = `قوائم جميع الأيام:\n${JSON.stringify(allMenus)}\n\nالسعرات المستهدفة: ${plan?.target || 'غير محدد'} سعرة`
      const conversation = [
        { role: 'user',      content: contextMsg },
        { role: 'assistant', content: 'فهمت قوائم جميع الأيام. جاهز لتعديلها.' },
        ...messages,
      ]
      const resp = await client.messages.create({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 7000,
        system:     SYSTEM_PROMPT_MULTI,
        messages:   conversation,
      })
      const rawText = resp.content[0].text.trim()
        .replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')

      let parsed
      try { parsed = JSON.parse(rawText) }
      catch {
        // Truncated or malformed JSON — return original with a helpful message
        return NextResponse.json({
          allMenus,
          message: '⚠️ الرد كان طويلاً جداً — جرّب طلباً أبسط أو استخدم خطة يوم واحد للتعديلات التفصيلية.',
        })
      }

      const resultDays = Array.isArray(parsed.days) ? parsed.days : []
      return NextResponse.json({
        allMenus: allMenus.map((orig, i) => ({
          name: orig.name,
          menu: resultDays[i]?.menu || orig.menu,
        })),
        message: parsed.message || 'تم تعديل القائمة لجميع الأيام.',
      })
    }

    // ── Single day ──────────────────────────────────────────────────────────
    const contextMsg = `القائمة الغذائية الحالية:\n${JSON.stringify(menu, null, 2)}\n\nمعلومات إضافية:\n- السعرات المستهدفة: ${plan?.target || 'غير محدد'} سعرة\n- الوحدات الإجمالية: ${plan?.ex ? JSON.stringify(plan.ex) : 'غير محددة'}`
    const conversation = [
      { role: 'user',      content: contextMsg },
      { role: 'assistant', content: 'فهمت القائمة الغذائية الحالية. أنا جاهز لتعديلها بناءً على طلبك.' },
      ...messages,
    ]

    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system:     SYSTEM_PROMPT_SINGLE,
      messages:   conversation,
    })

    const raw    = response.content[0].text.trim()
      .replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    const result = JSON.parse(raw)

    return NextResponse.json({
      menu:    result.menu    || menu,
      message: result.message || 'تم تعديل القائمة.',
    })

  } catch (err) {
    console.error('AI chat error:', err.status, err.message)
    const isRateLimit = err.status === 429
      || err.message?.toLowerCase().includes('rate_limit')
      || err.message?.toLowerCase().includes('rate limit')
    const msg = isRateLimit
      ? '⏳ المساعد مشغول حالياً — انتظر لحظة وأعد المحاولة.'
      : '⚠️ تعذّر الاتصال بالمساعد — حاول مرة أخرى.'
    return NextResponse.json(isMulti ? { allMenus, message: msg } : { menu, message: msg })
  }
}
