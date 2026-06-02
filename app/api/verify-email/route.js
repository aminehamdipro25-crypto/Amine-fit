import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getSubmissionByEmail, updateSubmission } from '@/lib/submissions'
import { isRateLimited } from '@/lib/rateLimit'

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/

function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString()
}

// Store only the SHA-256 hash — raw OTP never persisted to DB
function hashOTP(otp) {
  return crypto.createHash('sha256').update(String(otp)).digest('hex')
}

async function sendOTP(email, name, otp) {
  if (!process.env.RESEND_API_KEY) return true

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const safeName = String(name || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

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

    // Validate email format strictly before using it in any key or query
    if (!email || typeof email !== 'string' || email.length > 320 || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'بريد غير صالح' }, { status: 400 })
    }
    const emailLower = email.toLowerCase().trim()

    if (action === 'send') {
      if (await isRateLimited(`otp_send_email:${emailLower}`, 3, 3600)) {
        return NextResponse.json({ sent: true }) // Silent — avoid email enumeration
      }
      if (await isRateLimited(`otp_send_ip:${ip}`, 10, 3600)) {
        return NextResponse.json({ sent: true })
      }

      const newOTP = generateOTP()
      const expiry = Date.now() + 10 * 60 * 1000
      const otpHash = hashOTP(newOTP) // Only hash goes to DB

      const client = await getSubmissionByEmail(emailLower)
      if (client) {
        await updateSubmission(client.id, {
          emailOTPHash:   otpHash,
          emailOTPExpiry: expiry,
          emailOTP:       null, // clear legacy plain-text field
        })
        await sendOTP(emailLower, name, newOTP) // Plain OTP only goes in email
      }
      return NextResponse.json({ sent: true })
    }

    if (action === 'verify') {
      if (await isRateLimited(`otp_verify:${emailLower}`, 5, 900)) {
        return NextResponse.json({ valid: false, reason: 'too_many' })
      }

      const client = await getSubmissionByEmail(emailLower)
      if (!client || (!client.emailOTPHash && !client.emailOTP)) {
        return NextResponse.json({ valid: false, reason: 'invalid' })
      }

      const submittedRaw = otp?.toString().trim() ?? ''
      let codeValid = false

      if (client.emailOTPHash) {
        // Hash-based comparison (constant-time)
        const submittedHash = hashOTP(submittedRaw)
        const storedBuf     = Buffer.from(client.emailOTPHash, 'hex')
        const submittedBuf  = Buffer.from(submittedHash, 'hex')
        codeValid = storedBuf.length === submittedBuf.length &&
          crypto.timingSafeEqual(storedBuf, submittedBuf)
      } else {
        // Legacy plain-text OTP — constant-time compare during migration window
        const storedBuf    = Buffer.from(String(client.emailOTP))
        const submittedBuf = Buffer.from(submittedRaw)
        codeValid = storedBuf.length === submittedBuf.length &&
          crypto.timingSafeEqual(storedBuf, submittedBuf)
      }

      if (!codeValid) {
        return NextResponse.json({ valid: false, reason: 'invalid' })
      }
      if (Date.now() > (client.emailOTPExpiry ?? 0)) {
        return NextResponse.json({ valid: false, reason: 'expired' })
      }

      await updateSubmission(client.id, {
        emailVerified:  true,
        emailOTP:       null,
        emailOTPHash:   null,
        emailOTPExpiry: null,
      })
      return NextResponse.json({ valid: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('[verify-email]', err.message)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
