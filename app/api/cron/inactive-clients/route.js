import { NextResponse } from 'next/server'
import { getSubmissions } from '@/lib/submissions'
import { sendTelegramMessage } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

const SEVEN_DAYS    = 7  * 24 * 60 * 60 * 1000
const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000

export async function GET(req) {
  const secret = process.env.CRON_SECRET
  if (!secret) return NextResponse.json({ error: 'not configured' }, { status: 503 })
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const clients = await getSubmissions()
  const now     = Date.now()

  const alerts7d  = []
  const alerts14d = []

  for (const client of clients) {
    if (client.status !== 'active') continue

    const lastActive = client.lastActiveAt
      ? new Date(client.lastActiveAt).getTime()
      : client.approvedAt
        ? new Date(client.approvedAt).getTime()
        : null

    if (!lastActive) continue

    const elapsed = now - lastActive

    if (elapsed >= FOURTEEN_DAYS) {
      // Don't re-alert if already alerted in the last 14 days
      const alertedAt = client.inactivityAlert14dAt
        ? new Date(client.inactivityAlert14dAt).getTime()
        : 0
      if (now - alertedAt > FOURTEEN_DAYS) {
        alerts14d.push(client)
      }
    } else if (elapsed >= SEVEN_DAYS) {
      const alertedAt = client.inactivityAlert7dAt
        ? new Date(client.inactivityAlert7dAt).getTime()
        : 0
      if (now - alertedAt > SEVEN_DAYS) {
        alerts7d.push(client)
      }
    }
  }

  // Send batched Telegram alert
  if (alerts7d.length > 0 || alerts14d.length > 0) {
    const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'
    let msg = `⚠️ <b>تنبيه الغياب اليومي</b>\n\n`

    if (alerts14d.length > 0) {
      msg += `🔴 <b>غائبون +14 يوم (${alerts14d.length}):</b>\n`
      for (const c of alerts14d.slice(0, 10)) {
        const days = Math.floor((now - new Date(c.lastActiveAt || c.approvedAt).getTime()) / 86400000)
        msg += `• ${c.name} — ${days} يوم\n`
      }
      msg += '\n'
    }

    if (alerts7d.length > 0) {
      msg += `🟡 <b>غائبون +7 أيام (${alerts7d.length}):</b>\n`
      for (const c of alerts7d.slice(0, 10)) {
        const days = Math.floor((now - new Date(c.lastActiveAt || c.approvedAt).getTime()) / 86400000)
        msg += `• ${c.name} — ${days} يوم\n`
      }
      msg += '\n'
    }

    msg += `<a href="${BASE}/dashboard/clients">⚡ فتح لوحة التحكم</a>`

    await sendTelegramMessage(msg).catch(() => {})
  }

  // Mark alerted clients to suppress re-alerts
  const { updateSubmission } = await import('@/lib/submissions')
  const flagTime = new Date(now).toISOString()

  await Promise.all([
    ...alerts14d.map(c => updateSubmission(c.id, { inactivityAlert14dAt: flagTime }).catch(() => {})),
    ...alerts7d.map(c  => updateSubmission(c.id, { inactivityAlert7dAt:  flagTime }).catch(() => {})),
  ])

  return NextResponse.json({
    ok: true,
    alerted7d:  alerts7d.length,
    alerted14d: alerts14d.length,
    ts: new Date(now).toISOString(),
  })
}
