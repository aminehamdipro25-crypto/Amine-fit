import { NextResponse } from 'next/server'
import { getSubmissions, updateSubmission } from '@/lib/submissions'
import { sendEmail } from '@/lib/mailer'

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'
const WA   = '+974 3065 3759'

export async function GET(req) {
  const secret = process.env.CRON_SECRET
  if (!secret) return NextResponse.json({ error: 'not configured' }, { status: 503 })
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const clients = await getSubmissions()
  const now = Date.now()
  let reminded = 0

  for (const client of clients) {
    if (!client.email || client.reminderSentAt) continue

    const shouldRemind =
      // Deadline approaching within 24h but not yet expired
      (client.status === 'pending' &&
        client.paymentDeadline &&
        new Date(client.paymentDeadline).getTime() - now < 24 * 60 * 60 * 1000 &&
        new Date(client.paymentDeadline).getTime() > now) ||
      // Payment expired less than 5 days ago
      (client.status === 'payment_expired' &&
        client.paymentExpiredAt &&
        now - new Date(client.paymentExpiredAt).getTime() < 5 * 24 * 60 * 60 * 1000)

    if (!shouldRemind) continue

    const isPending = client.status === 'pending'
    try {
      await sendEmail({
        to:      client.email,
        subject: isPending
          ? `أكمل تسجيلك في Amine-Fit — الفرصة تنتهي قريباً`
          : `لا تفوّت فرصتك مع Amine-Fit`,
        html: isPending ? buildPendingEmail(client) : buildExpiredEmail(client),
        text: isPending
          ? `مرحباً ${client.name || ''}، وصلنا طلبك ولكن لم تكتمل الدفع بعد. أكمل الآن: ${BASE}/payment — تواصل معنا على واتساب: ${WA}`
          : `مرحباً ${client.name || ''}، انتهت مهلة تسجيلك ولكن لا يزال بإمكانك الانضمام. تواصل معنا على واتساب: ${WA}`,
      })
      await updateSubmission(client.id, { reminderSentAt: new Date().toISOString() })
      reminded++
    } catch (err) {
      console.error('[abandoned-reminder] email error', client.email, err.message)
    }
  }

  return NextResponse.json({ ok: true, reminded, checked: clients.length, ts: new Date().toISOString() })
}

function buildPendingEmail(client) {
  const name = client.name || 'عزيزي'
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial,sans-serif">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)">

  <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:28px 24px;text-align:center">
    <div style="font-size:40px">⏰</div>
    <h1 style="color:#fff;margin:10px 0 4px;font-size:20px">الوقت ينفد!</h1>
    <p style="color:rgba(255,255,255,.85);margin:0;font-size:13px">Amine-Fit — متبقٍ أقل من 24 ساعة</p>
  </div>

  <div style="padding:28px 24px">
    <p style="font-size:16px;color:#1a1a1a;margin:0 0 16px">مرحباً <strong>${esc(name)}</strong>،</p>
    <p style="font-size:14px;color:#555;line-height:1.8;margin:0 0 20px">
      لاحظنا أنك أتممت الاستبيان ولكن لم تكتمل عملية الدفع بعد.
      مكانك محجوز مؤقتاً — ولكن المهلة تنتهي قريباً.
    </p>
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;margin:0 0 24px">
      <p style="margin:0;font-size:14px;color:#92400e;font-weight:bold">
        لتفعيل برنامجك اليوم: اختر طريقة الدفع المناسبة لك
      </p>
    </div>
    <div style="text-align:center;margin:0 0 24px">
      <a href="${BASE}/payment" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px">
        أكمل الدفع الآن
      </a>
    </div>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px">
      <p style="margin:0;font-size:13px;color:#166534">
        لديك سؤال؟ تواصل مع المدرب أمين مباشرةً عبر واتساب:
        <strong><a href="https://wa.me/${WA.replace(/\s/g,'')}" style="color:#166534">${WA}</a></strong>
      </p>
    </div>
  </div>

  <div style="background:#f8fafc;padding:14px 24px;text-align:center;border-top:1px solid #e2e8f0">
    <p style="color:#9ca3af;font-size:11px;margin:0">Amine-Fit • الدوحة، قطر • ${WA}</p>
  </div>
</div>
</body></html>`
}

function buildExpiredEmail(client) {
  const name = client.name || 'عزيزي'
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial,sans-serif">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)">

  <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 24px;text-align:center">
    <div style="font-size:40px">🏋️</div>
    <h1 style="color:#fff;margin:10px 0 4px;font-size:20px">لا تزال هناك فرصة!</h1>
    <p style="color:rgba(255,255,255,.85);margin:0;font-size:13px">Amine-Fit — انضم إلى الفريق</p>
  </div>

  <div style="padding:28px 24px">
    <p style="font-size:16px;color:#1a1a1a;margin:0 0 16px">مرحباً <strong>${esc(name)}</strong>،</p>
    <p style="font-size:14px;color:#555;line-height:1.8;margin:0 0 20px">
      فاتتك مهلة التسجيل السابقة، لكن المدرب أمين لا يزال يقبل أعضاءً جدداً
      ويريد مساعدتك على تحقيق هدفك.
    </p>
    <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:16px 20px;margin:0 0 24px">
      <p style="margin:0;font-size:14px;color:#4c1d95;font-weight:bold">
        تواصل معنا الآن على واتساب وسنرتب لك المتابعة مباشرةً:
      </p>
      <p style="margin:8px 0 0;font-size:20px;font-weight:900;color:#6d28d9;text-align:center">
        ${WA}
      </p>
    </div>
    <div style="text-align:center;margin:0 0 20px">
      <a href="https://wa.me/${WA.replace(/\s/g,'')}"
         style="display:inline-block;background:linear-gradient(135deg,#25d366,#128c7e);color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px">
        تواصل عبر واتساب
      </a>
    </div>
  </div>

  <div style="background:#f8fafc;padding:14px 24px;text-align:center;border-top:1px solid #e2e8f0">
    <p style="color:#9ca3af;font-size:11px;margin:0">Amine-Fit • الدوحة، قطر • ${WA}</p>
  </div>
</div>
</body></html>`
}

function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}
