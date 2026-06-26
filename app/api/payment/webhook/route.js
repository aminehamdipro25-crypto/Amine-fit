import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSubmissionByEmail, updateSubmission } from '@/lib/submissions'
import { sendTelegramMessage } from '@/lib/telegram'
import { sendEmail } from '@/lib/mailer'
import { processReferralReward } from '@/lib/referral'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const PLAN_MAP = {
  training:  { key: 'basic',    name: 'برنامج التدريب'  },
  monthly:   { key: 'standard', name: 'الباقة الشهرية' },
  '3months': { key: 'premium',  name: 'باقة 3 أشهر'   },
}

const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function genCode() {
  const bytes = crypto.randomBytes(6)
  return Array.from(bytes).map(b => CHARS[b % CHARS.length]).join('')
}

export async function POST(req) {
  const secretKey     = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: 'not configured' }, { status: 503 })
  }

  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  let event
  try {
    const stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' })
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('[webhook] signature invalid:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object
  const { plan, days, email: metaEmail, name } = session.metadata || {}
  const email = (metaEmail || session.customer_email || session.client_reference_id || '').toLowerCase()

  if (!email || !plan) {
    console.error('[webhook] missing email or plan')
    return NextResponse.json({ received: true })
  }

  const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'

  try {
    const client = await getSubmissionByEmail(email)
    if (!client) {
      sendTelegramMessage(
        `⚠️ <b>دفع Stripe ناجح — عميل غير موجود!</b>\n` +
        `📧 ${email}\n📦 ${PLAN_MAP[plan]?.name || plan}\n` +
        `💰 ${(session.amount_total / 100).toFixed(2)} USD\n` +
        `يجب التسجيل أولاً ثم الدفع`
      ).catch(() => {})
      return NextResponse.json({ received: true })
    }

    const activationCode = genCode()
    const activationHash = crypto.createHash('sha256').update(activationCode).digest('hex')
    const planInfo       = PLAN_MAP[plan] || { key: plan, name: plan }
    const durationDays   = parseInt(days || '30')
    const now            = Date.now()

    await updateSubmission(client.id, {
      status:                'active',
      subscriptionPlan:      planInfo.key,
      subscriptionPlanName:  planInfo.name,
      subscriptionStartDate: new Date(now).toISOString(),
      subscriptionEndDate:   new Date(now + durationDays * 86400000).toISOString(),
      subscriptionDays:      durationDays,
      activationCode:        activationHash,
      approvedAt:            new Date(now).toISOString(),
      stripeSessionId:       session.id,
      paymentMethod:         'stripe',
    })

    sendEmail({
      to:      client.email,
      subject: `🎉 تم تفعيل اشتراكك في Amine-Fit`,
      html:    buildActivationHtml(client.name || name || 'عزيزي العميل', activationCode, planInfo.name, durationDays, BASE),
      text:    `مرحباً ${client.name},\nتم تفعيل ${planInfo.name} لمدة ${durationDays} يوم.\nكود التفعيل: ${activationCode}\n${BASE}/client/login`,
    }).catch(err => console.error('[webhook] email error:', err.message))

    sendTelegramMessage(
      `💳 <b>دفع إلكتروني ناجح!</b>\n\n` +
      `👤 <b>${client.name}</b>\n` +
      `📧 ${email}\n` +
      `📦 ${planInfo.name} (${durationDays} يوم)\n` +
      `💰 ${(session.amount_total / 100).toFixed(2)} USD\n\n` +
      `🔑 كود التفعيل: <code>${activationCode}</code>\n` +
      `(أُرسل تلقائياً للعميل)\n\n` +
      `<a href="${BASE}/dashboard/clients">⚡ لوحة التحكم</a>`
    ).catch(() => {})

    if (client.referredBy) processReferralReward(client.id).catch(() => {})

    console.log('[webhook] activated client:', client.id, plan)
  } catch (err) {
    console.error('[webhook] activation error:', err.message)
  }

  return NextResponse.json({ received: true })
}

function buildActivationHtml(name, code, planName, days, BASE) {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial,sans-serif">
<div style="max-width:500px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)">
  <div style="background:#0a0a0a;padding:28px;text-align:center">
    <div style="font-size:44px">🎉</div>
    <h1 style="color:#fbbf24;margin:8px 0 4px;font-size:22px">تم تفعيل اشتراكك!</h1>
    <p style="color:rgba(255,255,255,.5);margin:0;font-size:13px">${name} — Amine-Fit</p>
  </div>
  <div style="padding:28px">
    <p style="font-size:14px;color:#374151;margin-bottom:16px;line-height:1.7">
      تم الدفع بنجاح وتفعيل <strong>${planName}</strong> لمدة <strong>${days} يوم</strong>. استخدم كود التفعيل أدناه لدخول بوابتك الشخصية.
    </p>
    <div style="background:#fffbeb;border:2px solid #fbbf24;border-radius:12px;padding:20px;text-align:center;margin-bottom:20px">
      <p style="margin:0 0 8px;font-weight:bold;color:#92400e;font-size:13px">كود التفعيل — استخدام واحد فقط</p>
      <p style="margin:0;font-family:monospace;font-size:36px;font-weight:900;letter-spacing:8px;color:#0a0a0a;direction:ltr">${code}</p>
    </div>
    <a href="${BASE}/client/login" style="display:block;text-align:center;background:#0a0a0a;color:#fbbf24;padding:14px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px;margin-bottom:12px">
      دخول البوابة الشخصية
    </a>
    <p style="font-size:11px;color:#9ca3af;text-align:center;margin:0">لا تشارك هذا الكود مع أحد</p>
  </div>
  <div style="background:#f8fafc;padding:12px 24px;text-align:center;border-top:1px solid #e2e8f0">
    <p style="color:#9ca3af;font-size:11px;margin:0">Amine-Fit • الدوحة، قطر • +974 3065 3759</p>
  </div>
</div>
</body></html>`
}
