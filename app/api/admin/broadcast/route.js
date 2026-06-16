import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { getSubmissions } from '@/lib/submissions'
import { sendPushToClient } from '@/lib/webPush'
import { sendEmail } from '@/lib/mailer'
import { sendTelegramMessage } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  const deny = await requireAdmin()
  if (deny) return deny

  const body = await req.json()
  const { message, title = 'رسالة من المدرب أمين', audience = 'active', plan, withEmail = false } = body

  if (!message?.trim()) return NextResponse.json({ error: 'الرسالة مطلوبة' }, { status: 400 })

  const all = await getSubmissions()
  let targets = all.filter(c => c.status === 'active')

  if (audience === 'all') {
    targets = all.filter(c => ['active', 'pending', 'reviewed'].includes(c.status))
  } else if (audience === 'plan' && plan) {
    targets = targets.filter(c => c.subscriptionPlan === plan)
  }

  let pushSent = 0, pushFailed = 0, emailSent = 0

  for (const client of targets) {
    const pushed = await sendPushToClient(client.id, title, message.slice(0, 100), '/client/dashboard')
    if (pushed) pushSent++
    else pushFailed++

    if (withEmail && client.email) {
      try {
        await sendEmail({
          to: client.email,
          subject: title,
          html: `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
            <h2 style="color:#0a0a0a">${title}</h2>
            <p style="font-size:16px;line-height:1.7;color:#333">${message.replace(/\n/g, '<br>')}</p>
            <hr style="margin:24px 0;border:none;border-top:1px solid #eee">
            <p style="font-size:12px;color:#999">المدرب أمين حمدي — amine-fit.com</p>
          </div>`,
          text: message,
        })
        emailSent++
      } catch {}
    }
  }

  await sendTelegramMessage(
    `📢 إذاعة جماعية\nالجمهور: ${audience}${plan ? ` (${plan})` : ''}\n` +
    `الإجمالي: ${targets.length} عميل\n` +
    `Push: ${pushSent} ✅ / ${pushFailed} ❌\n` +
    (withEmail ? `إيميل: ${emailSent} ✅\n` : '') +
    `\nالرسالة: ${message.slice(0, 200)}`
  ).catch(() => {})

  return NextResponse.json({ ok: true, total: targets.length, pushSent, pushFailed, emailSent })
}
