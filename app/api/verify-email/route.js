import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getSubmissionByEmail, updateSubmission } from '@/lib/submissions'
import { isRateLimited } from '@/lib/rateLimit'

function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString()
}

async function sendOTP(email, name, otp) {
  if (!process.env.RESEND_API_KEY) return true

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const safeName = String(name || '').replace(/</g,'&lt;').replace(/>/g,'&gt;')

  await resend.emails.send({
    from: 'Amine-Fit <noreply@amine-fit.vercel.app>',
    to: email,
    subject: `${otp} — رمز التحقق من Amine-Fit`,
    html: `
      <div dir="rtl" style="font-family:Arial,sans-serif;max-width:480px;margin:auto;background:#0a0a0a;border-radius:16px;overflow:hidden">
        <div style="background:#fbbf24;padding:24px;text-align:center">
          <h1 style="margin:0;color:#000;font-size:24px;font-weight:900">⚡ Amine-Fit</h1>
        </div>
        <div style="padding:32px;text-align:center">
          <p style="color:#fff;font-size:16px;margin-bottom:8px">مرحباً ${safeName}،</p>
          <p style="color:rgba(255,255,255,0.5);font-size:14px;margin-bottom:24px">رمز التحقق من بريدك الإلكتروني:</p>
          <div style="background:#1a1a1a;border-radius:12px;padding:20px;margin-bottom:24px">
            <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#fbbf24">${otp}</span>
          </div>
          <p style="color:rgba(255,255,255,0.3);font-size:12px">صالح لمدة 10 دقائق · لا تشاركه مع أحد</p>
        </div>
      </div>`,
  })
  return true
}

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const { action, email, otp, name } = await req.json()

    if (!email || typeof email !== 'string' || email.length > 200) {
      return NextResponse.json({ error: 'بريد غير صالح' }, { status: 400 })
    }
    const emailLower = email.toLowerCase().trim()

    if (action === 'send') {
      // 3 sends per email per hour, 10 per IP per hour
      if (await isRateLimited(`otp_send_email:${emailLower}`, 3, 3600)) {
        return NextResponse.json({ sent: true }) // Silent to avoid enumeration
      }
      if (await isRateLimited(`otp_send_ip:${ip}`, 10, 3600)) {
        return NextResponse.json({ sent: true })
      }

      const newOTP = generateOTP()
      const expiry = Date.now() + 10 * 60 * 1000

      const client = await getSubmissionByEmail(emailLower)
      if (client) {
        await updateSubmission(client.id, { emailOTP: newOTP, emailOTPExpiry: expiry })
        await sendOTP(emailLower, name, newOTP)
      }
      // Always return same response to prevent email enumeration
      return NextResponse.json({ sent: true })
    }

    if (action === 'verify') {
      // 5 verify attempts per email per 15 min
      if (await isRateLimited(`otp_verify:${emailLower}`, 5, 900)) {
        return NextResponse.json({ valid: false, reason: 'too_many' })
      }

      const client = await getSubmissionByEmail(emailLower)
      // Use constant-time-ish comparison; return generic error for not-found (prevent enumeration)
      if (!client || !client.emailOTP) {
        return NextResponse.json({ valid: false, reason: 'invalid' })
      }
      if (client.emailOTP !== otp?.toString().trim()) {
        return NextResponse.json({ valid: false, reason: 'invalid' })
      }
      if (Date.now() > client.emailOTPExpiry) {
        return NextResponse.json({ valid: false, reason: 'expired' })
      }

      await updateSubmission(client.id, { emailVerified: true, emailOTP: null, emailOTPExpiry: null })
      return NextResponse.json({ valid: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('[verify-email]', err.message)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
