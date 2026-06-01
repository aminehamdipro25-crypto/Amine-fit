import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminSession, deleteAdminSession } from '@/lib/adminSession'
import { isRateLimited } from '@/lib/rateLimit'
import { sendSecurityAlert } from '@/lib/securityAlert'

export async function POST(req) {
  try {
    // Rate-limit: 5 attempts per 15 min per IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (await isRateLimited(`admin_login:${ip}`, 5, 900)) {
      // Alert admin immediately on brute-force detection
      sendSecurityAlert({ type: 'admin_brute_force', ip, detail: 'تجاوز 5 محاولات خاطئة في 15 دقيقة' }).catch(() => {})
      return NextResponse.json({ error: 'محاولات كثيرة — حاول بعد 15 دقيقة' }, { status: 429 })
    }

    const { password } = await req.json()
    const correct = process.env.DASHBOARD_PASSWORD
    if (!correct) {
      console.error('[admin auth] DASHBOARD_PASSWORD env var is not set')
      return NextResponse.json({ error: 'خطأ في إعداد الخادم' }, { status: 500 })
    }

    // Timing-safe comparison — pad to equal length to avoid length oracle
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

    const sessionToken = await createAdminSession()
    // Notify admin of successful login (so they know if it wasn't them)
    sendSecurityAlert({ type: 'admin_login', ip, detail: 'تم تسجيل الدخول بنجاح' }).catch(() => {})
    const res = NextResponse.json({ success: true })
    res.cookies.set('admin_token', sessionToken, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 8,
      secure: process.env.NODE_ENV === 'production',
    })
    return res
  } catch {
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
