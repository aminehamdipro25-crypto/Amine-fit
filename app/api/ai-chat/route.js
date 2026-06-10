import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT_SINGLE = `أنت مساعد تغذية للمدرب. تلقّيت القائمة الغذائية الحالية. عدّلها بناءً على طلب المدرب وأعد JSON فقط بنفس هيكل menu array + حقل 'message' يصف ما تغيّر. لا تغير BMR أو TDEE أو الوحدات الإجمالية.

هيكل الرد:
{"menu":[{"name":"...","time":"...","icon":"...","kcal":0,"carbs":0,"protein":0,"fat":0,"items":[{"group":"...","icon":"...","servings":0,"food":"...","amount":"..."}]}],"message":"..."}

أعد JSON مضغوطاً فقط (بدون مسافات أو أسطر زائدة).`

// For chunks of ≤3 days per call
const SYSTEM_PROMPT_CHUNK = `أنت مساعد تغذية للمدرب. تلقّيت قوائم غذائية لعدة أيام. عدّلها جميعاً بناءً على طلب المدرب وأعد JSON فقط.

هيكل الرد:
{"days":[{"name":"اسم اليوم بدون تغيير","menu":[{"name":"...","time":"...","icon":"...","kcal":0,"carbs":0,"protein":0,"fat":0,"items":[{"group":"...","icon":"...","servings":0,"food":"...","amount":"..."}]}]}],"message":"وصف موجز"}

قواعد: طبّق نفس التعديل على جميع الأيام. حافظ على عدد الوجبات. أعد JSON مضغوطاً فقط (بدون مسافات أو أسطر زائدة).`

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
      // Split days into chunks of 3 → process chunks in parallel
      // Max 3 concurrent calls (safe for rate limits) × small output per call (reliable JSON)
      const CHUNK = 3
      const chunks = []
      for (let i = 0; i < allMenus.length; i += CHUNK) {
        chunks.push(allMenus.slice(i, i + CHUNK))
      }

      const chunkResults = await Promise.all(
        chunks.map(async (chunk) => {
          const ctxMsg = `القوائم:\n${JSON.stringify(chunk)}\nالسعرات المستهدفة: ${plan?.target || 'غير محدد'}`
          const conv = [
            { role: 'user',      content: ctxMsg },
            { role: 'assistant', content: 'جاهز لتعديل هذه الأيام.' },
            ...messages,
          ]
          const resp = await client.messages.create({
            model:      'claude-haiku-4-5-20251001',
            max_tokens: 2500,
            system:     SYSTEM_PROMPT_CHUNK,
            messages:   conv,
          })
          const raw = resp.content[0].text.trim()
            .replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
          try {
            const p = JSON.parse(raw)
            return {
              days:    Array.isArray(p.days) ? p.days : chunk,
              message: p.message || '',
            }
          } catch {
            return { days: chunk, message: '' } // keep originals on parse failure
          }
        })
      )

      const mergedDays = chunkResults.flatMap(r => r.days)
      const successMsg = chunkResults.find(r => r.message)?.message
        || 'تم تعديل القائمة لجميع الأيام.'

      return NextResponse.json({
        allMenus: allMenus.map((orig, i) => ({
          name: orig.name,
          menu: mergedDays[i]?.menu || orig.menu,
        })),
        message: successMsg,
      })
    }

    // ── Single day ──────────────────────────────────────────────────────────
    const ctxMsg = `القائمة الحالية:\n${JSON.stringify(menu)}\nالسعرات: ${plan?.target || '—'} — الوحدات: ${plan?.ex ? JSON.stringify(plan.ex) : '—'}`
    const conv = [
      { role: 'user',      content: ctxMsg },
      { role: 'assistant', content: 'فهمت القائمة. جاهز لتعديلها.' },
      ...messages,
    ]

    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system:     SYSTEM_PROMPT_SINGLE,
      messages:   conv,
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
