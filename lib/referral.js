import { getSubmissionById, updateSubmission } from '@/lib/submissions'
import { sendTelegramMessage } from '@/lib/telegram'
import { sendEmail } from '@/lib/mailer'

export const REFERRAL_REWARD_DAYS = 7

// Call once a referred client's subscription becomes active with a real end date.
// Idempotent via the referralProcessed flag — safe to call from multiple activation paths.
export async function processReferralReward(clientId) {
  try {
    const client = await getSubmissionById(clientId)
    if (!client || client.referralProcessed || !client.referredBy) return
    if (client.referredBy === clientId) {
      await updateSubmission(clientId, { referralProcessed: true })
      return
    }

    const referrer = await getSubmissionById(client.referredBy)
    await updateSubmission(clientId, { referralProcessed: true })
    if (!referrer) return

    const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'

    if (referrer.status === 'active' && referrer.subscriptionEndDate) {
      const newReferrerEnd = new Date(new Date(referrer.subscriptionEndDate).getTime() + REFERRAL_REWARD_DAYS * 86400000)
      await updateSubmission(referrer.id, {
        subscriptionEndDate: newReferrerEnd.toISOString(),
        referralCount: (referrer.referralCount || 0) + 1,
      })

      // Bonus week for the referred client too, if their own subscription is active
      if (client.status === 'active' && client.subscriptionEndDate) {
        const newOwnEnd = new Date(new Date(client.subscriptionEndDate).getTime() + REFERRAL_REWARD_DAYS * 86400000)
        await updateSubmission(client.id, { subscriptionEndDate: newOwnEnd.toISOString() })
      }

      if (referrer.email) {
        sendEmail({
          to: referrer.email,
          subject: '🎁 حصلت على أسبوع مجاني — شكراً لدعوتك صديقك!',
          text: `مرحباً ${referrer.name || ''}،\n\nصديقك ${client.name || 'صديقك'} انضم إلى Amine-Fit عبر رابط دعوتك!\nأضفنا ${REFERRAL_REWARD_DAYS} أيام مجانية لاشتراكك كمكافأة.\n\nشكراً لمساعدتنا في النمو معك 🙌\nأمين حمدي — Amine-Fit`,
          html: referralRewardEmailHtml(referrer, client, newReferrerEnd, BASE),
        }).catch(() => {})
      }

      sendTelegramMessage(
        `🎁 <b>مكافأة إحالة تلقائية!</b>\n\n` +
        `👤 المُحيل: <b>${referrer.name || '—'}</b> (${referrer.email || '—'})\n` +
        `👤 المُحال: <b>${client.name || '—'}</b> (${client.email || '—'})\n` +
        `✅ أُضيفت ${REFERRAL_REWARD_DAYS} أيام تلقائياً لاشتراك المُحيل\n\n` +
        `<a href="${BASE}/dashboard/clients">⚡ فتح لوحة التحكم</a>`
      ).catch(() => {})
    } else {
      // Referrer isn't currently active — can't auto-extend a subscription that doesn't exist.
      // Flag for the admin to honor manually once the referrer renews.
      await updateSubmission(referrer.id, { referralPendingManual: true })
      sendTelegramMessage(
        `🎁 <b>إحالة جديدة — تحتاج معالجة يدوية</b>\n\n` +
        `👤 المُحيل: <b>${referrer.name || referrer.id}</b> (${referrer.email || '—'}) — الحالة: ${referrer.status}\n` +
        `👤 المُحال: <b>${client.name || '—'}</b> (${client.email || '—'})\n` +
        `⚠️ المُحيل غير نشط حالياً — لا يمكن تمديد اشتراكه تلقائياً. فعّل مكافأة الأسبوع المجاني يدوياً عند تجديده\n\n` +
        `<a href="${BASE}/dashboard/clients">⚡ فتح لوحة التحكم</a>`
      ).catch(() => {})
    }
  } catch (err) {
    console.error('[referral] processReferralReward error', err?.message)
  }
}

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function referralRewardEmailHtml(referrer, referred, newEnd, BASE) {
  const name = esc(referrer.name) || 'عزيزي العميل'
  const friendName = esc(referred.name) || 'صديقك'
  const endStr = newEnd.toLocaleDateString('ar', { timeZone: 'Asia/Qatar', year: 'numeric', month: 'long', day: 'numeric' })
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial,sans-serif">
<div style="max-width:500px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)">
  <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:28px;text-align:center">
    <div style="font-size:44px">🎁</div>
    <h1 style="color:#fff;margin:8px 0 4px;font-size:22px">مكافأة الإحالة!</h1>
    <p style="color:rgba(255,255,255,.9);margin:0;font-size:14px">${name} — Amine-Fit</p>
  </div>
  <div style="padding:24px">
    <p style="font-size:14px;color:#374151;margin-bottom:16px;line-height:1.7">
      صديقك <strong>${friendName}</strong> انضم إلى Amine-Fit عبر رابط دعوتك الشخصي 🎉
    </p>
    <div style="background:#faf5ff;border:2px solid #a855f7;border-radius:12px;padding:20px;text-align:center;margin-bottom:20px">
      <p style="margin:0 0 6px;font-weight:bold;color:#6b21a8;font-size:13px">أضفنا لاشتراكك</p>
      <p style="margin:0;font-size:28px;font-weight:900;color:#7c3aed">${REFERRAL_REWARD_DAYS} أيام مجانية</p>
      <p style="margin:8px 0 0;font-size:12px;color:#6b21a8">اشتراكك الآن ينتهي في: ${endStr}</p>
    </div>
    <a href="${BASE}/client/dashboard" style="display:block;text-align:center;background:#7c3aed;color:#fff;padding:14px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px">
      عرض بوابتي الشخصية
    </a>
  </div>
  <div style="background:#f8fafc;padding:12px 24px;text-align:center;border-top:1px solid #e2e8f0">
    <p style="color:#9ca3af;font-size:11px;margin:0">Amine-Fit • الدوحة، قطر • +974 3065 3759</p>
  </div>
</div>
</body></html>`
}
