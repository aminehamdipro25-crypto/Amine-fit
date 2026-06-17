import { NextResponse } from 'next/server'
import { getSubmissions } from '@/lib/submissions'
import { sendEmail } from '@/lib/mailer'
import { getClientLogs } from '@/lib/clientLogs'
import { Redis } from '@upstash/redis'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'
const BATCH_LIMIT = 40 // bound per-run sends so the function can't exceed Vercel's duration limit

function getRedis() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

async function redisGet(redis, key) {
  if (!redis) return null
  try {
    const raw = await redis.get(key)
    if (!raw) return null
    return JSON.parse(typeof raw === 'string' ? raw : JSON.stringify(raw))
  } catch { return null }
}

function weeklyEmailHtml(client, stats) {
  const { trainDays, waterAvg, checkin, weightChange } = stats
  const firstName = client.name?.split(' ')[0] || 'عزيزي العميل'

  const goalEmoji = { loss: '📉', gain: '💪', maintain: '⚖️', performance: '🏃' }
  const emoji = goalEmoji[client.goal] || '🏃'

  const trainColor  = trainDays >= 4 ? '#10b981' : trainDays >= 2 ? '#f59e0b' : '#ef4444'
  const waterColor  = waterAvg >= 6  ? '#3b82f6' : waterAvg >= 4  ? '#f59e0b' : '#ef4444'

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;direction:rtl">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px">
  <tr><td align="center">
    <table width="100%" style="max-width:540px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">

      <!-- Header -->
      <tr><td style="background:#0a0a0a;padding:28px 32px;text-align:center">
        <p style="color:#fbbf24;font-size:13px;font-weight:800;margin:0 0 6px;text-transform:uppercase;letter-spacing:2px">Amine-Fit</p>
        <p style="color:#fff;font-size:20px;font-weight:800;margin:0">📊 تقريرك الأسبوعي</p>
        <p style="color:#fff6;font-size:12px;margin:8px 0 0">أهلاً ${firstName} — إليك ملخص أسبوعك</p>
      </td></tr>

      <!-- Stats -->
      <tr><td style="padding:28px 32px 0">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="48%" style="background:#f8fafc;border-radius:16px;padding:20px;text-align:center;vertical-align:top">
              <p style="font-size:32px;margin:0 0 6px">🏋️</p>
              <p style="font-size:28px;font-weight:800;color:${trainColor};margin:0">${trainDays}</p>
              <p style="font-size:12px;color:#64748b;font-weight:600;margin:4px 0 0">أيام تدريب</p>
            </td>
            <td width="4%"></td>
            <td width="48%" style="background:#f8fafc;border-radius:16px;padding:20px;text-align:center;vertical-align:top">
              <p style="font-size:32px;margin:0 0 6px">💧</p>
              <p style="font-size:28px;font-weight:800;color:${waterColor};margin:0">${waterAvg}</p>
              <p style="font-size:12px;color:#64748b;font-weight:600;margin:4px 0 0">متوسط الأكواب يومياً</p>
            </td>
          </tr>
        </table>
      </td></tr>

      ${checkin ? `
      <!-- Weekly check-in summary -->
      <tr><td style="padding:20px 32px 0">
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;padding:20px">
          <p style="font-size:13px;font-weight:800;color:#166534;margin:0 0 12px">📋 آخر تقرير أسبوعي</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              ${checkin.energy ? `<td style="text-align:center;padding:6px"><p style="font-size:18px;margin:0">😊</p><p style="font-size:11px;color:#64748b;margin:4px 0 0">الطاقة ${checkin.energy}/5</p></td>` : ''}
              ${checkin.sleep  ? `<td style="text-align:center;padding:6px"><p style="font-size:18px;margin:0">😴</p><p style="font-size:11px;color:#64748b;margin:4px 0 0">${checkin.sleep} ساعات نوم</p></td>` : ''}
              ${checkin.stress ? `<td style="text-align:center;padding:6px"><p style="font-size:18px;margin:0">🧘</p><p style="font-size:11px;color:#64748b;margin:4px 0 0">توتر ${checkin.stress}/5</p></td>` : ''}
              ${checkin.nutritionDays ? `<td style="text-align:center;padding:6px"><p style="font-size:18px;margin:0">🥗</p><p style="font-size:11px;color:#64748b;margin:4px 0 0">تغذية ${checkin.nutritionDays}/7</p></td>` : ''}
            </tr>
          </table>
          ${checkin.weight ? `<p style="font-size:12px;color:#166534;font-weight:700;margin:12px 0 0;text-align:center">الوزن المُبلَّغ: ${checkin.weight} كغ${weightChange ? ` (${weightChange > 0 ? '+' : ''}${weightChange} كغ هذا الأسبوع)` : ''}</p>` : ''}
        </div>
      </td></tr>` : ''}

      <!-- Motivation -->
      <tr><td style="padding:24px 32px">
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:16px;padding:20px;text-align:center">
          <p style="font-size:24px;margin:0 0 8px">${emoji}</p>
          <p style="font-size:14px;font-weight:800;color:#92400e;margin:0 0 6px">
            ${trainDays >= 4
              ? 'أداء ممتاز هذا الأسبوع! واصل!'
              : trainDays >= 2
              ? 'بداية جيدة — يمكنك المزيد الأسبوع القادم'
              : 'لا بأس، الأسبوع القادم فرصة جديدة'}
          </p>
          <p style="font-size:12px;color:#b45309;margin:0">المثابرة هي مفتاح النتائج الحقيقية</p>
        </div>
      </td></tr>

      <!-- CTA -->
      <tr><td style="padding:0 32px 32px;text-align:center">
        <a href="${BASE}/client/dashboard"
           style="display:inline-block;background:#0a0a0a;color:#fbbf24;font-size:14px;font-weight:800;padding:14px 32px;border-radius:12px;text-decoration:none;margin-bottom:12px">
          عرض لوحة التحكم
        </a>
        <p style="font-size:11px;color:#94a3b8;margin:0">
          سجّل تقريرك الأسبوعي للمدرب أمين لمتابعة تقدمك
        </p>
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #f1f5f9">
        <p style="font-size:11px;color:#94a3b8;margin:0">Amine-Fit | الدوحة، قطر | <a href="https://wa.me/97430653759" style="color:#fbbf24">+974 3065 3759</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`
}

export async function GET(req) {
  const secret = process.env.CRON_SECRET
  if (!secret) return NextResponse.json({ error: 'not configured' }, { status: 503 })
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${secret}`) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const redis   = getRedis()
  const clients = await getSubmissions()
  const now     = new Date()

  // Only send on Sundays (day 0) — allow override via ?force=1 for testing
  const url    = new URL(req.url)
  const forced = url.searchParams.get('force') === '1'
  if (!forced && now.getDay() !== 0) {
    return NextResponse.json({ ok: true, skipped: 'not Sunday', day: now.getDay() })
  }

  const weekAgo = new Date(now.getTime() - 7 * 86400000)
  const weekKey = now.toISOString().slice(0, 10) // YYYY-MM-DD

  let sent = 0
  let skipped = 0
  let processed = 0

  for (const client of clients) {
    if (processed >= BATCH_LIMIT) break
    if (client.status !== 'active' || !client.email) { skipped++; continue }

    // Deduplicate — only send once per week per client
    const sentKey = `weekly_report_sent:${client.id}:${weekKey}`
    if (redis) {
      const already = await redis.get(sentKey).catch(() => null)
      if (already) { skipped++; continue }
    }

    // Gather training log for the past 7 days
    let trainDays = 0
    if (redis) {
      const log = await redisGet(redis, `training_log:${client.id}`)
      if (log && typeof log === 'object') {
        for (let i = 0; i < 7; i++) {
          const d = new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10)
          if (log[d]) trainDays++
        }
      }
    }

    // Gather water from logs — uses the same key as lib/clientLogs.js
    let waterAvg = 0
    try {
      const logs = await getClientLogs(client.id)
      if (Array.isArray(logs)) {
        const weekLogs = logs.filter(l => l.date && new Date(l.date) >= weekAgo)
        if (weekLogs.length > 0) {
          const totalWater = weekLogs.reduce((s, l) => s + (l.water || 0), 0)
          waterAvg = Math.round(totalWater / weekLogs.length)
        }
      }
    } catch {}

    // Last check-in from this week — stored inside the submission record
    let checkin = null
    let weightChange = null
    const checkins = client.checkins
    if (Array.isArray(checkins) && checkins.length) {
      const recent = checkins.filter(c => c.date && new Date(c.date) >= weekAgo)
      if (recent.length) {
        checkin = recent.at(-1)
        const prev = checkins.filter(c => c.date && new Date(c.date) < weekAgo && c.weight).at(-1)
        if (prev?.weight && checkin.weight) {
          weightChange = +(checkin.weight - prev.weight).toFixed(1)
        }
      }
    }

    const stats = { trainDays, waterAvg, checkin, weightChange }

    try {
      await sendEmail({
        to:      client.email,
        subject: `📊 تقريرك الأسبوعي — ${now.toLocaleDateString('ar', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
        html:    weeklyEmailHtml(client, stats),
        text:    `أهلاً ${client.name}، هذا ملخص أسبوعك مع Amine-Fit: ${trainDays} أيام تدريب، متوسط ${waterAvg} أكواب ماء يومياً. واصل التقدم!`,
      })
      // Mark as sent for this week (TTL 8 days)
      if (redis) await redis.set(sentKey, '1', { ex: 8 * 86400 }).catch(() => {})
      sent++
      processed++
    } catch (e) {
      logger.error('cron-weekly-report', 'send error', { email: client.email, err: e.message })
    }
  }

  return NextResponse.json({ ok: true, sent, skipped, total: clients.length, ts: now.toISOString() })
}
