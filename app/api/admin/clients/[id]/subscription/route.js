import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { requireAdmin } from '@/lib/adminAuth'
import { getSubmissionById, updateSubmission } from '@/lib/submissions'
import { processReferralReward } from '@/lib/referral'

export const dynamic = 'force-dynamic'

const PLAN_DAYS = { basic: 30, standard: 30, premium: 30 }

export async function POST(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny

  const { plan, durationDays, startDate, isGift } = await req.json()

  if (!['basic', 'standard', 'premium'].includes(plan)) {
    return NextResponse.json({ error: 'باقة غير صالحة' }, { status: 400 })
  }

  const days = parseInt(durationDays) || PLAN_DAYS[plan] || 30
  if (days < 1 || days > 365) {
    return NextResponse.json({ error: 'المدة يجب أن تكون بين 1 و 365 يوم' }, { status: 400 })
  }

  const start = startDate ? new Date(startDate) : new Date()
  if (isNaN(start.getTime())) {
    return NextResponse.json({ error: 'تاريخ بداية غير صالح' }, { status: 400 })
  }
  start.setUTCHours(0, 0, 0, 0)

  const end = new Date(start.getTime() + days * 86400000)

  const client = await getSubmissionById(params.id)
  if (!client) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })

  // Auto-generate activation code if client has no password set yet
  let activationSent = false
  let activationCode = null
  const needsActivation = !client.clientPassword && !client.activationCode

  if (needsActivation && client.email) {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
    const bytes = crypto.randomBytes(6)
    activationCode = ''
    for (let i = 0; i < 6; i++) activationCode += chars[bytes[i] % chars.length]
  }

  const updateFields = {
    subscriptionPlan:      plan,
    subscriptionStartDate: start.toISOString(),
    subscriptionEndDate:   end.toISOString(),
    subscriptionDays:      days,
    status: 'active',
  }
  if (isGift !== undefined) updateFields.isGift = isGift === true ? true : null
  if (activationCode) {
    // Store hash only — raw code sent in email, never in DB
    updateFields.activationCode = crypto.createHash('sha256').update(activationCode).digest('hex')
    updateFields.clientPassword = null
    updateFields.approvedAt     = new Date().toISOString()
  }

  const updated = await updateSubmission(params.id, updateFields)

  if (activationCode && process.env.RESEND_API_KEY) {
    sendActivationEmail(client, activationCode).catch(e => console.error('[subscription activation email]', e.message))
    activationSent = true
  }

  if (client.referredBy) processReferralReward(params.id).catch(() => {})

  return NextResponse.json({
    success: true,
    activationSent,
    subscription: {
      plan:      updated.subscriptionPlan,
      startDate: updated.subscriptionStartDate,
      endDate:   updated.subscriptionEndDate,
      days:      updated.subscriptionDays,
    },
  })
}

export async function DELETE(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny

  const client = await getSubmissionById(params.id)
  if (!client) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })

  await updateSubmission(params.id, {
    subscriptionPlan:      null,
    subscriptionStartDate: null,
    subscriptionEndDate:   null,
    subscriptionDays:      null,
  })

  return NextResponse.json({ success: true })
}

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

async function sendActivationEmail(client, activationCode) {
  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from:    'AmineFit <onboarding@resend.dev>',
      to:      [client.email],
      subject: `🎉 تمت الموافقة على طلبك — Amine-Fit`,
      html:    buildEmail(client, activationCode),
    }),
  })
  if (!res.ok) console.error('[activation email resend]', await res.text())
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
      تم تفعيل اشتراكك من قِبل المدرب أمين. استخدم كود التفعيل أدناه لإنشاء كلمة مرورك والدخول لبوابتك الشخصية.
    </p>

    <div style="background:#fffbeb;border:2px solid #fbbf24;border-radius:12px;padding:20px;margin-bottom:20px;text-align:center">
      <p style="margin:0 0 8px;font-weight:bold;color:#92400e;font-size:14px">🔑 كود التفعيل (استخدام واحد فقط)</p>
      <p style="margin:0;font-family:monospace;font-size:36px;font-weight:900;letter-spacing:8px;color:#d97706;direction:ltr">${esc(activationCode)}</p>
    </div>

    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:14px;margin-bottom:20px">
      <p style="margin:0 0 8px;font-weight:bold;color:#166534;font-size:13px">📋 خطوات التفعيل:</p>
      <ol style="margin:0;padding-right:20px;font-size:13px;color:#374151;line-height:2">
        <li>اذهب إلى بوابة العميل</li>
        <li>اختر تبويب "تفعيل الحساب"</li>
        <li>أدخل بريدك الإلكتروني وكود التفعيل</li>
        <li>أنشئ كلمة مرورك الخاصة</li>
      </ol>
    </div>

    <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'}/client/login"
       style="display:block;text-align:center;background:#f59e0b;color:#000;padding:14px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;margin-bottom:16px">
      ⚡ تفعيل الحساب الآن
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
