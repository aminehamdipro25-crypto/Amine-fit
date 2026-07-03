import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminSession, deleteAdminSession } from '@/lib/adminSession'
import { isRateLimited } from '@/lib/rateLimit'
import { sendSecurityAlert } from '@/lib/securityAlert'
import { sendTelegramMessage } from '@/lib/telegram'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// ── Redis helpers for pending 2FA ─────────────────────────────────────────────
function redisCfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}

async function redisPipeline(c, cmds) {
  const res = await fetch(`${c.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds),
    cache: 'no-store',
  })
  return res.json()
}

function hasTelegram() {
  return !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)
}

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (await isRateLimited(`admin_login:${ip}`, 5, 900)) {
      // Deduplicate alerts: only fire one email per IP per 15-minute window
      const c = redisCfg()
      if (c) {
        const alertResults = await redisPipeline(c, [['SET', `admin_brute_alerted:${ip}`, '1', 'NX', 'EX', '900']])
        if (alertResults[0]?.result === 'OK') {
          sendSecurityAlert({ type: 'admin_brute_force', ip, detail: 'تجاوز 5 محاولات خاطئة في 15 دقيقة' }).catch(() => {})
        }
      }
      return NextResponse.json({ error: 'محاولات كثيرة — حاول بعد 15 دقيقة' }, { status: 429 })
    }

    const { password } = await req.json()
    const correct = process.env.DASHBOARD_PASSWORD
    if (!correct) {
      logger.critical('admin-auth', 'DASHBOARD_PASSWORD env var is not set')
      return NextResponse.json({ error: 'خطأ في إعداد الخادم' }, { status: 500 })
    }

    let match = false
    try {
      const pw  = Buffer.from(password || '')
      const ref = Buffer.from(correct)
      const len = Math.max(pw.length, ref.length)
      const a   = Buffer.concat([pw,  Buffer.alloc(len - pw.length)])
      const b   = Buffer.concat([ref, Buffer.alloc(len - ref.length)])
      match = crypto.timingSafeEqual(a, b) && pw.length === ref.length
    } catch { match = false }

    if (!match) {
      return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 })
    }

    // ── 2FA via Telegram (only when Telegram is configured) ──────────────────
    if (hasTelegram()) {
      const c = redisCfg()
      if (c) {
        const otp          = String(crypto.randomInt(100000, 1000000))
        const pendingToken = crypto.randomBytes(24).toString('base64url')
        await redisPipeline(c, [
          ['SET', `admin_pending:${pendingToken}`, otp, 'EX', '300'],
        ])
        await sendTelegramMessage(`🔐 رمز تحقق لوحة التحكم\n\n*${otp}*\n\nصالح 5 دقائق — لا تشاركه مع أحد`, { parse_mode: 'Markdown' }).catch(() => {})
        sendSecurityAlert({ type: 'admin_login', ip, detail: '✔ كلمة المرور صحيحة — في انتظار رمز 2FA' }).catch(() => {})
        return NextResponse.json({ step: '2fa', pending: pendingToken })
      }
    }

    // ── No 2FA — create session directly ─────────────────────────────────────
    const sessionToken = await createAdminSession()
    sendSecurityAlert({ type: 'admin_login', ip, detail: 'تم تسجيل الدخول بنجاح' }).catch(() => {})
    const res = NextResponse.json({ success: true })
    res.cookies.set('admin_token', sessionToken, {
      httpOnly: true, sameSite: 'strict', path: '/',
      maxAge: 60 * 60 * 8,
      secure: process.env.NODE_ENV === 'production',
    })
    return res
  } catch (err) {
    logger.error('admin-auth', 'Unhandled error', { err: err.message })
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function GET(req) {
  const { isAdmin } = await import('@/lib/adminAuth')
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ admin: false }, { status: 401 })
  return NextResponse.json({ admin: true })
}

export async function DELETE(req) {
  const { requireAdmin } = await import('@/lib/adminAuth')
  const deny = await requireAdmin()
  if (deny) return deny
  const token = req.cookies?.get?.('admin_token')?.value
  if (token) await deleteAdminSession(token)
  const res = NextResponse.json({ success: true })
  res.cookies.delete('admin_token')
  return res
}
