import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSubmissionById, updateSubmission } from '@/lib/submissions'
import { hashPassword } from '@/lib/password'

export async function POST(req, { params }) {
  const adminToken = cookies().get('admin_token')?.value
  const correct    = process.env.DASHBOARD_PASSWORD || 'amine2025'
  if (!adminToken || adminToken !== correct) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const client = await getSubmissionById(params.id)
  if (!client) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })

  // Generate random 8-char password (easy to read, no ambiguous chars)
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let pass = ''
  for (let i = 0; i < 8; i++) pass += chars[Math.floor(Math.random() * chars.length)]

  await updateSubmission(params.id, {
    clientPassword: hashPassword(pass),
    status:         'active',
    approvedAt:     new Date().toISOString(),
  })

  if (process.env.RESEND_API_KEY && client.email) {
    sendWelcomeEmail(client, pass).catch(e => console.error('[approve email]', e.message))
  }

  return NextResponse.json({ success: true, email: client.email })
}

async function sendWelcomeEmail(client, password) {
  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from:    'AmineFit <onboarding@resend.dev>',
      to:      [client.email],
      subject: `🎉 تمت الموافقة على طلبك — Amine-Fit`,
      html:    buildEmail(client, password),
    }),
  })
  if (!res.ok) console.error('[approve email resend]', await res.text())
}

function buildEmail(client, password) {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial,sans-serif">
<div style="max-width:500px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)">

  <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:24px;text-align:center">
    <div style="font-size:44px">🏋️</div>
    <h1 style="color:#fff;margin:8px 0 4px;font-size:22px">مرحباً ${client.name || 'عزيزي العميل'}!</h1>
    <p style="color:rgba(255,255,255,.9);margin:0;font-size:14px">تمت الموافقة على طلبك في Amine-Fit</p>
  </div>

  <div style="padding:24px">
    <p style="font-size:14px;color:#374151;margin-bottom:20px;line-height:1.7">
      تم قبول طلبك من قِبل المدرب أمين. يمكنك الآن الدخول لبوابتك الشخصية لمتابعة برنامجك اليومي.
    </p>

    <div style="background:#fffbeb;border:1px solid #fbbf24;border-radius:10px;padding:16px;margin-bottom:20px">
      <p style="margin:0 0 10px;font-weight:bold;color:#92400e;font-size:14px">🔑 بيانات الدخول</p>
      <table style="width:100%;font-size:13px;border-collapse:collapse">
        <tr>
          <td style="padding:6px 0;color:#6b7280;width:40%">البريد الإلكتروني:</td>
          <td style="font-weight:bold;direction:ltr;text-align:right">${client.email}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#6b7280">كلمة المرور:</td>
          <td style="font-weight:bold;font-family:monospace;font-size:18px;letter-spacing:3px;color:#d97706">${password}</td>
        </tr>
      </table>
    </div>

    <a href="https://amine-fit.vercel.app/client/login"
       style="display:block;text-align:center;background:#f59e0b;color:#000;padding:14px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;margin-bottom:16px">
      ⚡ دخول البوابة الشخصية
    </a>

    <p style="font-size:11px;color:#9ca3af;text-align:center;margin:0">
      احتفظ بكلمة المرور هذه في مكان آمن
    </p>
  </div>

  <div style="background:#f8fafc;padding:12px 24px;text-align:center;border-top:1px solid #e2e8f0">
    <p style="color:#9ca3af;font-size:11px;margin:0">AmineFit • الدوحة، قطر • +974 3065 3759</p>
  </div>
</div>
</body></html>`
}
