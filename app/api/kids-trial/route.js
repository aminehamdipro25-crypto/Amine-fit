import { NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/lib/telegram'
import { sendEmail } from '@/lib/mailer'
import { isRateLimited } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

function redisCfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}
async function redisGet(key) {
  const c = redisCfg(); if (!c) return null
  try {
    const res = await fetch(`${c.url}/get/${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${c.token}` }, cache: 'no-store' })
    return (await res.json()).result
  } catch { return null }
}
async function redisPipeline(commands) {
  const c = redisCfg(); if (!c) return null
  try {
    const res = await fetch(`${c.url}/pipeline`, {
      method: 'POST', headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(commands), cache: 'no-store',
    })
    return res.ok ? res.json() : null
  } catch { return null }
}

const clean = (v, max = 100) => String(v ?? '').replace(/[<>]/g, '').trim().slice(0, max)
// Normalize a phone to digits (for dedupe) — keeps last 12 digits
const phoneKey = p => String(p || '').replace(/\D/g, '').slice(-12)

export async function POST(req) {
  // Basic abuse protection
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (await isRateLimited(`kids_trial:${ip}`, 5, 3600)) {
    return NextResponse.json({ error: 'محاولات كثيرة — حاول لاحقاً' }, { status: 429 })
  }

  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 }) }

  const parentName = clean(body.parentName, 100)
  const phone      = clean(body.phone, 30)
  const childName  = clean(body.childName, 100)
  const childAge   = clean(body.childAge, 10)
  const goal       = clean(body.goal, 400)
  const code       = clean(body.code, 40)

  if (!parentName || !phone || !childName) {
    return NextResponse.json({ error: 'يرجى تعبئة اسم الولي، الهاتف، واسم الطفل' }, { status: 400 })
  }

  // Invitation code gate — only in-person session clients (who received the code
  // from the coach) can claim the free month. Code comes from Redis (settable by
  // the coach) with an env fallback. If none is configured, the offer is closed.
  const validCode = (await redisGet('kids_trial_code')) || process.env.KIDS_TRIAL_CODE || ''
  const norm = s => String(s || '').trim().toLowerCase()
  if (!norm(validCode)) {
    return NextResponse.json({ error: 'التسجيل مغلق حالياً — تواصل مع المدرب مباشرة.' }, { status: 403 })
  }
  if (norm(code) !== norm(validCode)) {
    return NextResponse.json({ error: 'bad_code', message: 'كود الدعوة غير صحيح — هذه التجربة حصريّة لعملاء الجلسات الحضوريّة. تواصل مع المدرب للحصول على الكود.' }, { status: 403 })
  }
  const pk = phoneKey(phone)
  if (pk.length < 6) return NextResponse.json({ error: 'رقم الهاتف غير صالح' }, { status: 400 })

  // Prevent repeated claims from the same phone
  const dedupeKey = `kids_trial_phone:${pk}`
  if (await redisGet(dedupeKey)) {
    return NextResponse.json({ error: 'duplicate', message: 'سبق تسجيل هذا الرقم للتجربة المجانية — سيتواصل معك المدرب أمين قريباً.' }, { status: 409 })
  }

  const id = `kt_${Date.now()}_${pk.slice(-4)}`
  const entry = { id, parentName, phone, childName, childAge, goal, ip, createdAt: new Date().toISOString(), contacted: false }

  await redisPipeline([
    ['RPUSH', 'kids_trials', JSON.stringify(entry)],
    ['SET', dedupeKey, '1', 'EX', String(60 * 60 * 24 * 365)],  // 1 year
  ])

  // Notify the coach (Telegram + email) — best effort
  const tg =
    `🎁 <b>طلب تجربة مجانية — برنامج الأطفال</b>\n\n` +
    `👤 الولي: <b>${parentName}</b>\n` +
    `📱 الهاتف: <b>${phone}</b>\n` +
    `🧒 الطفل: <b>${childName}</b>${childAge ? ` — ${childAge} سنة` : ''}\n` +
    (goal ? `📝 الحالة/الهدف: ${goal}\n` : '') +
    `\n⏰ ${new Date().toLocaleString('ar', { timeZone: 'Asia/Qatar' })}`
  sendTelegramMessage(tg).catch(() => {})

  const to = process.env.NOTIFY_EMAIL || process.env.GMAIL_USER
  if (to) {
    sendEmail({
      to,
      subject: `🎁 تجربة مجانية للأطفال — ${parentName} (${childName})`,
      text: `طلب تجربة مجانية لبرنامج الأطفال.\n\nالولي: ${parentName}\nالهاتف: ${phone}\nالطفل: ${childName}${childAge ? ` — ${childAge} سنة` : ''}\nالحالة/الهدف: ${goal || '—'}`,
      html: `<div style="font-family:sans-serif;direction:rtl;text-align:right">
        <h2 style="color:#0d9488">🎁 طلب تجربة مجانية — برنامج الأطفال</h2>
        <ul>
          <li>👤 الولي: <b>${parentName}</b></li>
          <li>📱 الهاتف: <b>${phone}</b></li>
          <li>🧒 الطفل: <b>${childName}</b>${childAge ? ` — ${childAge} سنة` : ''}</li>
          <li>📝 الحالة/الهدف: ${goal || '—'}</li>
        </ul>
        <a href="https://wa.me/${pk}" style="display:inline-block;background:#25D366;color:#fff;padding:10px 18px;border-radius:10px;text-decoration:none;font-weight:bold">تواصل عبر واتساب</a>
      </div>`,
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
