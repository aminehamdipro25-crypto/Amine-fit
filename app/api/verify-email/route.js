import { NextResponse } from 'next/server'
import { getSubmissionByEmail, updateSubmission } from '@/lib/submissions'

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function sendOTP(email, name, otp) {
  if (!process.env.RESEND_API_KEY) return true // skip if no key

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

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
          <p style="color:#fff;font-size:16px;margin-bottom:8px">مرحباً ${name || ''}،</p>
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
  const { action, email, otp, name } = await req.json()

  if (action === 'send') {
    const newOTP = generateOTP()
    const expiry = Date.now() + 10 * 60 * 1000 // 10 min

    const client = await getSubmissionByEmail(email)
    if (client) {
      await updateSubmission(client.id, { emailOTP: newOTP, emailOTPExpiry: expiry })
    } else {
      // Store temporarily — will be linked after registration
    }

    await sendOTP(email, name, newOTP)
    return NextResponse.json({ sent: true })
  }

  if (action === 'verify') {
    const client = await getSubmissionByEmail(email)
    if (!client) return NextResponse.json({ valid: false, reason: 'not_found' })

    if (client.emailOTP !== otp) return NextResponse.json({ valid: false, reason: 'wrong_otp' })
    if (Date.now() > client.emailOTPExpiry) return NextResponse.json({ valid: false, reason: 'expired' })

    await updateSubmission(client.id, { emailVerified: true, emailOTP: null, emailOTPExpiry: null })
    return NextResponse.json({ valid: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
