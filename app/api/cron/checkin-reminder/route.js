import { NextResponse } from 'next/server'
import { getSubmissions } from '@/lib/submissions'
import { sendPushToClient } from '@/lib/webPush'
import { sendTelegramMessage } from '@/lib/telegram'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const SIX_DAYS_MS = 6 * 24 * 60 * 60 * 1000

export async function GET(req) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    logger.critical('cron-checkin-reminder', 'CRON_SECRET not set — endpoint disabled')
    return NextResponse.json({ error: 'not configured' }, { status: 503 })
  }

  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let clients
  try {
    clients = await getSubmissions()
  } catch (err) {
    logger.error('cron-checkin-reminder', 'getSubmissions failed', { err: err.message })
    return NextResponse.json({ error: 'failed to load clients' }, { status: 500 })
  }

  const now = Date.now()
  let sent = 0

  for (const client of clients) {
    if (client.status !== 'active') continue
    if (!client.id) continue

    // Determine when the client last submitted a check-in
    let lastCheckinMs = null

    if (Array.isArray(client.checkins) && client.checkins.length > 0) {
      // checkins are sorted oldest-first; pick the last entry
      const lastEntry = client.checkins[client.checkins.length - 1]
      if (lastEntry?.date) {
        lastCheckinMs = new Date(lastEntry.date).getTime()
      }
    }

    const needsReminder =
      lastCheckinMs === null                   // no check-in at all
      || now - lastCheckinMs > SIX_DAYS_MS    // last check-in was > 6 days ago

    if (!needsReminder) continue

    try {
      const pushed = await sendPushToClient(
        client.id,
        'تذكير: سجّل تقريرك الأسبوعي 📋',
        'لم تسجّل تقريرك منذ أكثر من أسبوع — دقيقة فقط!',
        '/client/checkins',
      )

      if (pushed) {
        sent++
        console.log(`[cron/checkin-reminder] push sent → ${client.id} (${client.name || client.email})`)
      }
    } catch (err) {
      logger.error('cron-checkin-reminder', 'push failed', { clientId: client.id, err: err.message })
    }
  }

  // Telegram summary — silent if not configured
  try {
    if (sent > 0) {
      await sendTelegramMessage(
        `📋 تذكير Check-in الأسبوعي\n` +
        `تم إرسال الإشعار لـ ${sent} عميل نشط لم يسجّل تقريره منذ أكثر من 6 أيام.\n` +
        `الوقت: ${new Date().toISOString()}`
      )
    }
  } catch {
    // Telegram errors are non-fatal
  }

  return NextResponse.json({ ok: true, sent })
}
