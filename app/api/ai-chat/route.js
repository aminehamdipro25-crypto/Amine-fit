import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

const MACRO_RULES = `
قواعد صارمة (لا استثناء):
- احتفظ بقيم kcal/carbs/protein/fat لكل وجبة كما هي بالضبط — لا تحسبها من جديد أبداً
- عند استبدال طعام: غيّر حقلي food وamount فقط، مع الحفاظ على نفس عدد الحصص (servings) ونفس المجموعة الغذائية (group)
- لا تضف وجبات ولا تحذف وجبات — حافظ على نفس العدد
- أعد JSON مضغوطاً فقط (بدون أي نص إضافي أو مسافات أو أسطر زائدة)`

const SYSTEM_PROMPT_SINGLE = `أنت مساعد تغذية للمدرب. تلقّيت القائمة الغذائية الحالية. عدّلها بناءً على طلب المدرب وأعد JSON فقط بنفس هيكل menu array + حقل 'message' يصف ما تغيّر.
${MACRO_RULES}

هيكل الرد:
{"menu":[{"name":"...","time":"...","icon":"...","kcal":0,"carbs":0,"protein":0,"fat":0,"items":[{"group":"...","icon":"...","servings":0,"food":"...","amount":"..."}]}],"message":"..."}`

// For chunks of ≤3 days per call
const SYSTEM_PROMPT_CHUNK = `أنت مساعد تغذية للمدرب. تلقّيت قوائم غذائية لعدة أيام. عدّلها جميعاً بناءً على طلب المدرب وأعد JSON فقط.
${MACRO_RULES}
طبّق نفس التعديل على جميع الأيام.

هيكل الرد:
{"days":[{"name":"اسم اليوم بدون تغيير","menu":[{"name":"...","time":"...","icon":"...","kcal":0,"carbs":0,"protein":0,"fat":0,"items":[{"group":"...","icon":"...","servings":0,"food":"...","amount":"..."}]}]}],"message":"وصف موجز"}`

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
    const msg = '⚠️ ANTHROPIC_API_KEY غير مضبوط في Vercel — أضفه في Environment Variables.'
    return NextResponse.json(isMulti ? { allMenus, message: msg } : { menu, message: msg })
  }

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    if (isMulti) {
      // CHUNK=1: process each day separately to avoid JSON truncation.
      // With CHUNK=3 and max_tokens=2500, a 3-day output (~2300 tokens) was
      // cut off before closing brackets → silent parse failure → original menus returned.
      // CHUNK=1 keeps output well under 3000 tokens per call (1 day ≈ 800-1200 tokens).
      const CHUNK = 1
      const chunks = []
      for (let i = 0; i < allMenus.length; i += CHUNK) {
        chunks.push(allMenus.slice(i, i + CHUNK))
      }

      const latestUserMsg = messages.filter(m => m.role === 'user').at(-1)?.content || ''

      const chunkResults = await Promise.all(
        chunks.map(async (chunk) => {
          const conv = [
            {
              role: 'user',
              content: `القائمة:\n${JSON.stringify(chunk)}\nالسعرات المستهدفة: ${plan?.target || 'غير محدد'}\n\nطلب التعديل: ${latestUserMsg}`,
            },
          ]
          const resp = await client.messages.create({
            model:      'claude-haiku-4-5-20251001',
            max_tokens: 3000,
            system:     SYSTEM_PROMPT_CHUNK,
            messages:   conv,
          })
          const rawText = resp.content[0].text.trim()
            .replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
          const raw = rawText.startsWith('{') ? rawText : (rawText.match(/\{[\s\S]*\}/) || [rawText])[0]
          try {
            const p = JSON.parse(raw)
            if (Array.isArray(p.days) && p.days.length > 0) {
              return { days: p.days, message: p.message || '', ok: true }
            }
            return { days: chunk, message: '', ok: false }
          } catch {
            console.warn('[ai-chat] parse failed for chunk:', rawText?.slice(0, 200))
            return { days: chunk, message: '', ok: false }
          }
        })
      )

      const mergedDays = chunkResults.flatMap(r => r.days)
      const anyOk      = chunkResults.some(r => r.ok)
      const allOk      = chunkResults.every(r => r.ok)
      const successMsg = anyOk
        ? (chunkResults.find(r => r.message)?.message || 'تم تعديل القائمة بنجاح.')
        : '⚠️ لم يتمكن المساعد من تعديل القائمة — حاول مرة أخرى.'
      const finalMsg   = !allOk && anyOk
        ? (chunkResults.find(r => r.message)?.message || 'تم تعديل بعض الأيام — أعد المحاولة إذا لاحظت يوماً لم يتغير.')
        : successMsg

      return NextResponse.json({
        allMenus: allMenus.map((orig, i) => ({
          name: orig.name,
          menu: mergedDays[i]?.menu || orig.menu,
        })),
        message: finalMsg,
        changed: anyOk,
      })
    }

    // ── Single day ──────────────────────────────────────────────────────────
    // Send only the latest user request — full history risks the model
    // mimicking prior text responses instead of returning JSON
    const latestSingleMsg = messages.filter(m => m.role === 'user').at(-1)?.content || ''
    const conv = [
      {
        role: 'user',
        content: `القائمة الحالية:\n${JSON.stringify(menu)}\nالسعرات المستهدفة: ${plan?.target || '—'}\n\nطلب التعديل: ${latestSingleMsg}`,
      },
    ]

    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      system:     SYSTEM_PROMPT_SINGLE,
      messages:   conv,
    })

    const rawText = response.content[0].text.trim()
      .replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    const raw    = rawText.startsWith('{') ? rawText : (rawText.match(/\{[\s\S]*\}/) || [rawText])[0]
    const result = JSON.parse(raw)

    return NextResponse.json({
      menu:    result.menu    || menu,
      message: result.message || 'تم تعديل القائمة.',
      changed: !!(result.menu),
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
