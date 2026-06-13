import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getSubmissionByEmail, updateSubmission } from '@/lib/submissions'
import { isRateLimited } from '@/lib/rateLimit'
import { sendEmail } from '@/lib/mailer'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (await isRateLimited(`forgot_pw:${ip}`, 5, 3600)) {
      return NextResponse.json({ ok: true }) // silent to prevent enumeration
    }

    const { email } = await req.json().catch(() => ({}))
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ ok: true }) // silent — always respond ok
    }

    const emailLower = email.toLowerCase().trim()
    const client = await getSubmissionByEmail(emailLower)

    // Always respond ok — prevents email enumeration
    if (!client || !client.clientPassword) {
      return NextResponse.json({ ok: true })
    }

    // Generate 6-char reset code
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
    const bytes = crypto.randomBytes(6)
    const resetCode = Array.from(bytes).map(b => chars[b % chars.length]).join('')
    const resetHash = crypto.createHash('sha256').update(resetCode).digest('hex')
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min

    await updateSubmission(client.id, {
      passwordResetCode:   resetHash,
      passwordResetExpiry: resetExpiry,
    })

    const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'

    await sendEmail({
      to: emailLower,
      subject: '🔑 إعادة تعيين كلمة المرور — Amine-Fit',
      text: `كود إعادة تعيين كلمة المرور: ${resetCode}\n\nصالح لمدة 15 دقيقة فقط.\n\nإذا لم تطلب هذا، تجاهل هذا البريد.`,
      html: `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial,sans-serif">
<div style="max-width:500px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)">
  <div style="background:linear-gradient(135deg,#0a0a0a,#1a1a1a);padding:24px;text-align:center">
    <div style="font-size:44px">🔑</div>
    <h1 style="color:#fbbf24;margin:8px 0 4px;font-size:20px">إعادة تعيين كلمة المرور</h1>
    <p style="color:rgba(255,255,255,.7);margin:0;font-size:13px">Amine-Fit</p>
  </div>
  <div style="padding:24px">
    <p style="font-size:14px;color:#374151;margin-bottom:20px;line-height:1.7">
      استخدم الكود أدناه لإعادة تعيين كلمة مرورك. الكود صالح <strong>15 دقيقة فقط</strong>.
    </p>
    <div style="background:#fffbeb;border:2px solid #fbbf24;border-radius:12px;padding:20px;margin-bottom:20px;text-align:center">
      <p style="margin:0 0 8px;font-weight:bold;color:#92400e;font-size:13px">🔑 كود إعادة التعيين</p>
      <p style="margin:0;font-family:monospace;font-size:36px;font-weight:900;letter-spacing:8px;color:#d97706;direction:ltr">${resetCode}</p>
    </div>
    <p style="font-size:12px;color:#6b7280;text-align:center;margin:0">
      إذا لم تطلب إعادة تعيين كلمة مرورك، تجاهل هذا البريد.
    </p>
  </div>
  <div style="background:#f8fafc;padding:12px 24px;text-align:center;border-top:1px solid #e2e8f0">
    <p style="color:#9ca3af;font-size:11px;margin:0">Amine-Fit • الدوحة، قطر • +974 3065 3759</p>
  </div>
</div>
</body></html>`,
    }).catch(err => console.error('[forgot password email]', err.message))

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[forgot-password]', err.message)
    return NextResponse.json({ ok: true }) // always ok — prevents enumeration
  }
}
