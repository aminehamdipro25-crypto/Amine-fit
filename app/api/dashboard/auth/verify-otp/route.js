import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminSession } from '@/lib/adminSession'
import { isRateLimited } from '@/lib/rateLimit'
import { sendSecurityAlert } from '@/lib/securityAlert'

export const dynamic = 'force-dynamic'

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

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (await isRateLimited(`admin_otp:${ip}`, 5, 300)) {
      return NextResponse.json({ error: 'محاولات كثيرة — أعد طلب رمز جديد' }, { status: 429 })
    }

    const { pending, otp } = await req.json()
    if (!pending || !otp) return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })

    const c = redisCfg()
    if (!c) return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })

    const results   = await redisPipeline(c, [['GETDEL', `admin_pending:${pending}`]])
    const storedOtp = results[0]?.result

    // Use constant-time comparison to prevent timing side-channel on OTP
    const storedBuf = Buffer.from(String(storedOtp || '').padEnd(6, '\0'), 'utf8')
    const inputBuf  = Buffer.from(String(otp || '').trim().padEnd(6, '\0'), 'utf8')
    const otpMatch  = storedOtp && storedBuf.length === inputBuf.length && crypto.timingSafeEqual(storedBuf, inputBuf)
    if (!otpMatch) {
      sendSecurityAlert({ type: 'admin_otp_fail', ip, detail: 'رمز 2FA غير صحيح' }).catch(() => {})
      return NextResponse.json({ error: 'رمز التحقق غير صحيح أو منتهي الصلاحية' }, { status: 401 })
    }

    const sessionToken = await createAdminSession()
    sendSecurityAlert({ type: 'admin_login', ip, detail: 'تم تسجيل الدخول عبر 2FA بنجاح ✅' }).catch(() => {})
    const res = NextResponse.json({ success: true })
    res.cookies.set('admin_token', sessionToken, {
      httpOnly: true, sameSite: 'strict', path: '/',
      maxAge: 60 * 60 * 8,
      secure: process.env.NODE_ENV === 'production',
    })
    return res
  } catch {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
