import { NextResponse } from 'next/server'
import { isRateLimited } from '@/lib/rateLimit'
import { saveDraft, wasNotified, markNotified } from '@/lib/leadDraft'
import { getSubmissionByEmail } from '@/lib/submissions'
import { sendTelegramMessage } from '@/lib/telegram'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const STR_MAX = 200

function sanitizeStr(v, max = STR_MAX) {
  if (v === undefined || v === null) return ''
  return String(v).replace(/[\r\n]/g, ' ').trim().slice(0, max)
}

// Saves a snapshot of the in-progress registration form so the lead isn't
// fully lost if the visitor abandons before the final /api/register submit.
export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (await isRateLimited(`reg_draft_ip:${ip}`, 30, 3600)) {
      return NextResponse.json({ ok: false }, { status: 429 })
    }

    const body  = await req.json()
    const email = sanitizeStr(body.email, 254).toLowerCase()
    if (!email || !/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    // Already a finalized submission — no need to keep a draft for this email
    const existing = await getSubmissionByEmail(email)
    if (existing) return NextResponse.json({ ok: true, skip: true })

    const draft = {
      name:           sanitizeStr(body.name, 100),
      phone:          sanitizeStr(body.phone, 30),
      country:        sanitizeStr(body.country, 5),
      goal:           sanitizeStr(body.goal, 30),
      interestedPlan: sanitizeStr(body.interestedPlan, 100),
      heardFrom:      sanitizeStr(body.heardFrom, 30),
      step:           Number.isInteger(body.step) ? body.step : 0,
    }

    await saveDraft(email, draft)

    // One-time admin alert per lead, once we have at least a name to act on
    if (draft.name && !(await wasNotified(email))) {
      await markNotified(email)
      sendTelegramMessage(
        `📝 <b>عميل محتمل — استبيان غير مكتمل</b>\n\n` +
        `👤 ${draft.name}\n📧 ${email}\n📱 ${draft.phone || '—'}\n` +
        `📦 ${draft.interestedPlan || '—'}\n\n` +
        `لم يُكمل الاستبيان بعد — يمكنك التواصل معه يدوياً`
      ).catch(() => {})
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    logger.error('register-draft', 'save failed', { err: err.message })
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
}
