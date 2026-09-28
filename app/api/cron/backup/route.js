import { NextResponse } from 'next/server'
import { getSubmissions } from '@/lib/submissions'
import { sendEmail } from '@/lib/mailer'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function redisCfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}
async function redisGet(key) {
  const c = redisCfg()
  if (!c) return null
  try {
    const res = await fetch(`${c.url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${c.token}` }, cache: 'no-store',
    })
    const data = await res.json()
    if (data.result == null) return null
    let v = data.result
    try { if (typeof v === 'string') v = JSON.parse(v); if (typeof v === 'string') v = JSON.parse(v) } catch {}
    return v
  } catch { return null }
}

// Daily full-data backup emailed to the coach. Protects all client data, which
// otherwise lives only in Redis. Runs via Vercel Cron (GET + Bearer CRON_SECRET).
export async function GET(req) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error('[cron/backup] CRON_SECRET not set — endpoint disabled')
    return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  }
  const auth = req.headers.get('authorization')
  // Vercel Cron sends the Authorization header; also allow ?key= for manual runs
  const url = new URL(req.url)
  if (auth !== `Bearer ${secret}` && url.searchParams.get('key') !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const [submissions, testimonials, pricing, offer] = await Promise.all([
      getSubmissions(),
      redisGet('af:testimonials'),
      redisGet('pricing_config'),
      redisGet('active_offer'),
    ])

    const backup = {
      generatedAt: new Date().toISOString(),
      counts: {
        clients:      Array.isArray(submissions) ? submissions.length : 0,
        testimonials: Array.isArray(testimonials) ? testimonials.length : 0,
      },
      submissions:  submissions || [],
      testimonials: testimonials || [],
      pricing:      pricing || null,
      activeOffer:  offer || null,
    }

    const json  = JSON.stringify(backup, null, 2)
    const stamp = new Date().toISOString().slice(0, 10)
    const to    = process.env.NOTIFY_EMAIL || process.env.GMAIL_USER
    const sizeKB = Math.round(json.length / 1024)

    if (!to) return NextResponse.json({ error: 'no_recipient' }, { status: 500 })

    await sendEmail({
      to,
      subject: `🗄️ نسخة احتياطية Amine-Fit — ${stamp} (${backup.counts.clients} عميل)`,
      text: `نسخة احتياطية كاملة لبيانات Amine-Fit بتاريخ ${stamp}.\n\nالعملاء: ${backup.counts.clients}\nالتقييمات: ${backup.counts.testimonials}\nحجم الملف: ${sizeKB} كيلوبايت\n\nالملف المرفق يحتوي كل البيانات (JSON). احتفظ به في مكان آمن.`,
      html: `<div style="font-family:sans-serif;direction:rtl;text-align:right">
        <h2 style="color:#c9973b">🗄️ نسخة احتياطية Amine-Fit</h2>
        <p>نسخة كاملة لبيانات منصتك بتاريخ <b>${stamp}</b>.</p>
        <ul>
          <li>👥 العملاء: <b>${backup.counts.clients}</b></li>
          <li>⭐ التقييمات: <b>${backup.counts.testimonials}</b></li>
          <li>📦 حجم الملف: <b>${sizeKB} كيلوبايت</b></li>
        </ul>
        <p>الملف المرفق (JSON) يحتوي كل بياناتك — احتفظ به في مكان آمن.</p>
        <p style="color:#999;font-size:12px">هذه رسالة تلقائية يومية من نظام النسخ الاحتياطي.</p>
      </div>`,
      attachments: [{ filename: `amine-fit-backup-${stamp}.json`, content: json }],
    })

    console.log(`[cron/backup] sent backup (${backup.counts.clients} clients, ${sizeKB}KB) to ${to}`)
    return NextResponse.json({ ok: true, clients: backup.counts.clients, testimonials: backup.counts.testimonials, sizeKB })
  } catch (err) {
    console.error('[cron/backup] error:', err?.message)
    return NextResponse.json({ error: 'backup_failed', detail: String(err?.message || '').slice(0, 200) }, { status: 500 })
  }
}
