import { NextResponse } from 'next/server'
import { getSubmissions, updateSubmission } from '@/lib/submissions'
import { deleteClientSession } from '@/lib/clientSession'
import { sendEmail } from '@/lib/mailer'
import { sendTelegramMessage } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'

function renewalEmailHtml(name, daysLeft, planLabel) {
  const urgency   = daysLeft <= 1
  const headerBg  = urgency ? '#dc2626' : '#d97706'
  const headerMsg = urgency ? '⚠️ اشتراكك ينتهي غداً!' : '⏰ اشتراكك على وشك الانتهاء'
  const daysText  = daysLeft <= 1 ? 'غداً' : `خلال ${daysLeft} أيام`

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;direction:rtl">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px">
  <tr><td align="center">
    <table width="100%" style="max-width:520px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
      <tr><td style="background:${headerBg};padding:28px 32px;text-align:center">
        <p style="color:#fff;font-size:28px;margin:0 0 8px">${urgency ? '🚨' : '⏰'}</p>
        <p style="color:#fff;font-size:18px;font-weight:800;margin:0">${headerMsg}</p>
      </td></tr>
      <tr><td style="padding:32px">
        <p style="font-size:16px;color:#1e293b;font-weight:700;margin:0 0 16px">أهلاً ${name}،</p>
        <p style="font-size:14px;color:#64748b;line-height:1.7;margin:0 0 20px">
          نريد إعلامك أن اشتراكك في باقة <strong style="color:#0f172a">${planLabel}</strong> سينتهي <strong style="color:${headerBg}">${daysText}</strong>.
        </p>
        <p style="font-size:14px;color:#64748b;line-height:1.7;margin:0 0 24px">
          لا تقطع رحلتك الآن — جدّد اشتراكك للاستمرار في الحصول على متابعة مدربك ودعمه اليومي.
        </p>
        <div style="text-align:center;margin:24px 0">
          <a href="https://wa.me/97430653759?text=أريد%20تجديد%20اشتراكي%20في%20Amine-Fit"
             style="display:inline-block;background:#0a0a0a;color:#fbbf24;font-size:14px;font-weight:800;padding:14px 32px;border-radius:12px;text-decoration:none">
            تواصل لتجديد الاشتراك
          </a>
        </div>
        <p style="font-size:13px;color:#94a3b8;text-align:center;margin:0">يمكنك أيضاً التواصل عبر <a href="${BASE}/client/messages" style="color:#fbbf24">الرسائل</a> في منصتك</p>
      </td></tr>
      <tr><td style="background:#f8fafc;padding:20px 32px;text-align:center">
        <p style="font-size:12px;color:#94a3b8;margin:0">Amine-Fit | الدوحة، قطر | <a href="https://wa.me/97430653759" style="color:#fbbf24">+974 3065 3759</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`
}

const PLAN_LABELS = {
  basic: 'برنامج التدريب', standard: 'الباقة الشهرية', premium: 'باقة 3 أشهر',
  training: 'برنامج التدريب', monthly: 'الباقة الشهرية', '3months': 'باقة 3 أشهر',
}

export async function GET(req) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error('[cron] CRON_SECRET not set — endpoint disabled')
    return NextResponse.json({ error: 'not configured' }, { status: 503 })
  }
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const clients = await getSubmissions()
  const now = Date.now()
  let suspended = 0
  let paymentExpired = 0
  let reminders7d = 0
  let reminders1d = 0

  for (const client of clients) {
    const endMs = client.subscriptionEndDate
      ? new Date(client.subscriptionEndDate).getTime()
      : null

    // Expire active subscriptions past end date
    if (endMs && endMs < now && client.status === 'active') {
      await updateSubmission(client.id, {
        status: 'suspended',
        suspendedAt: new Date().toISOString(),
      })
      await deleteClientSession(client.id).catch(() => {})
      suspended++
      continue
    }

    // Send renewal reminders for active (non-gift) clients
    if (
      client.status === 'active' &&
      endMs &&
      endMs > now &&
      client.email &&
      !client.giftCode &&
      !client.isGift
    ) {
      const msLeft   = endMs - now
      const daysLeft = msLeft / 86400000

      // 7-day reminder (between 6.5 and 7.5 days)
      if (daysLeft >= 6.5 && daysLeft < 7.5 && !client.reminderSent7d) {
        const planLabel = PLAN_LABELS[client.subscriptionPlan] || client.subscriptionPlan || 'اشتراكك'
        try {
          await sendEmail({
            to: client.email,
            subject: `⏰ اشتراكك ينتهي خلال 7 أيام — ${planLabel}`,
            html: renewalEmailHtml(client.name?.split(' ')[0] || 'عزيزي العميل', 7, planLabel),
            text: `أهلاً ${client.name}، اشتراكك في ${planLabel} ينتهي خلال 7 أيام. تواصل مع المدرب أمين لتجديده.`,
          })
          await sendTelegramMessage(
            `⏰ تذكير تجديد (7 أيام)\nالعميل: ${client.name}\nالباقة: ${planLabel}\nالإيميل: ${client.email}`
          ).catch(() => {})
          await updateSubmission(client.id, { reminderSent7d: true })
          reminders7d++
        } catch (e) {
          console.error('[cron reminder 7d]', client.email, e.message)
        }
      }

      // 1-day reminder (between 0.5 and 1.5 days)
      if (daysLeft >= 0.5 && daysLeft < 1.5 && !client.reminderSent1d) {
        const planLabel = PLAN_LABELS[client.subscriptionPlan] || client.subscriptionPlan || 'اشتراكك'
        try {
          await sendEmail({
            to: client.email,
            subject: `🚨 اشتراكك ينتهي غداً — ${planLabel}`,
            html: renewalEmailHtml(client.name?.split(' ')[0] || 'عزيزي العميل', 1, planLabel),
            text: `أهلاً ${client.name}، اشتراكك في ${planLabel} ينتهي غداً! تواصل مع المدرب أمين لتجديده فوراً.`,
          })
          await sendTelegramMessage(
            `🚨 تذكير تجديد (يوم واحد)\nالعميل: ${client.name}\nالباقة: ${planLabel}\nالإيميل: ${client.email}`
          ).catch(() => {})
          await updateSubmission(client.id, { reminderSent1d: true })
          reminders1d++
        } catch (e) {
          console.error('[cron reminder 1d]', client.email, e.message)
        }
      }

      // Reset reminder flags when subscription renews (end date > 3 days away, flags exist)
      if (daysLeft > 3 && (client.reminderSent7d || client.reminderSent1d)) {
        const reset = {}
        if (client.reminderSent7d) reset.reminderSent7d = null
        if (client.reminderSent1d) reset.reminderSent1d = null
        await updateSubmission(client.id, reset)
      }
    }

    // Expire pending clients who missed payment deadline
    if (
      client.status === 'pending' &&
      client.paymentDeadline &&
      new Date(client.paymentDeadline).getTime() < now
    ) {
      await updateSubmission(client.id, {
        status: 'payment_expired',
        paymentExpiredAt: new Date().toISOString(),
      })
      paymentExpired++
    }
  }

  return NextResponse.json({
    ok: true,
    suspended,
    paymentExpired,
    reminders7d,
    reminders1d,
    checked: clients.length,
    ts: new Date().toISOString(),
  })
}
