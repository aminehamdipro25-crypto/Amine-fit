import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getSubmissionById, updateSubmission } from '@/lib/submissions'
import { requireAdmin } from '@/lib/adminAuth'
import { sendEmail } from '@/lib/mailer'

export async function POST(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny

  const client = await getSubmissionById(params.id)
  if (!client) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })

  // Generate 6-char activation code using CSPRNG
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  const bytes = crypto.randomBytes(6)
  let activationCode = ''
  for (let i = 0; i < 6; i++) activationCode += chars[bytes[i] % chars.length]

  // Store only the SHA-256 hash — raw code sent only in email
  const activationCodeHash = crypto.createHash('sha256').update(activationCode).digest('hex')

  await updateSubmission(params.id, {
    activationCode: activationCodeHash,
    clientPassword: null,
    status:         'active',
    approvedAt:     new Date().toISOString(),
  })

  let emailSent = false
  let emailError = null

  if (client.email) {
    try {
      await sendEmail({
        to:      client.email,
        subject: `تمت الموافقة على طلبك في Amine-Fit`,
        html:    buildEmail(client, activationCode),
        text:    `مرحباً ${client.name || ''}،\n\nتمت الموافقة على طلبك في Amine-Fit.\n\nكود التفعيل الخاص بك:\n\n${activationCode}\n\nاذهب إلى: ${process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'}/client/login\nاختر تبويب "تفعيل الحساب" وأدخل الكود.\n\nهذا الكود للاستخدام مرة واحدة فقط — لا تشاركه.\n\nأمين حمدي — Amine-Fit`,
      })
      emailSent = true
    } catch (e) {
      console.error('[approve email]', e.message)
      emailError = e.message
    }
  }

  // Return code to admin UI (admin-only endpoint, over HTTPS, for display in modal)
  return NextResponse.json({ success: true, email: client.email, activationCode, emailSent, emailError })
}

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function buildEmail(client, activationCode) {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial,sans-serif">
<div style="max-width:500px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)">

  <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:24px;text-align:center">
    <div style="font-size:44px">🏋️</div>
    <h1 style="color:#fff;margin:8px 0 4px;font-size:22px">مرحباً ${esc(client.name) || 'عزيزي العميل'}!</h1>
    <p style="color:rgba(255,255,255,.9);margin:0;font-size:14px">تمت الموافقة على طلبك في Amine-Fit</p>
  </div>

  <div style="padding:24px">
    <p style="font-size:14px;color:#374151;margin-bottom:20px;line-height:1.7">
      تم قبول طلبك من قِبل المدرب أمين. استخدم كود التفعيل أدناه لإنشاء كلمة مرورك والدخول لبوابتك الشخصية.
    </p>

    <div style="background:#fffbeb;border:2px solid #fbbf24;border-radius:12px;padding:20px;margin-bottom:20px;text-align:center">
      <p style="margin:0 0 8px;font-weight:bold;color:#92400e;font-size:14px">كود التفعيل (استخدام واحد فقط)</p>
      <p style="margin:0;font-family:monospace;font-size:36px;font-weight:900;letter-spacing:8px;color:#d97706;direction:ltr">${esc(activationCode)}</p>
    </div>

    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:14px;margin-bottom:20px">
      <p style="margin:0 0 8px;font-weight:bold;color:#166534;font-size:13px">خطوات التفعيل:</p>
      <ol style="margin:0;padding-right:20px;font-size:13px;color:#374151;line-height:2">
        <li>اذهب إلى بوابة العميل</li>
        <li>اختر تبويب "تفعيل الحساب"</li>
        <li>أدخل بريدك الإلكتروني وكود التفعيل</li>
        <li>أنشئ كلمة مرورك الخاصة</li>
      </ol>
    </div>

    <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'}/client/login"
       style="display:block;text-align:center;background:#f59e0b;color:#000;padding:14px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;margin-bottom:16px">
      تفعيل الحساب الآن
    </a>

    <p style="font-size:11px;color:#9ca3af;text-align:center;margin:0">
      هذا الكود للاستخدام مرة واحدة فقط — لا تشاركه مع أحد
    </p>
  </div>

  <div style="background:#f8fafc;padding:12px 24px;text-align:center;border-top:1px solid #e2e8f0">
    <p style="color:#9ca3af;font-size:11px;margin:0">Amine-Fit • الدوحة، قطر • +974 3065 3759</p>
  </div>
</div>
</body></html>`
}
