import { NextResponse } from 'next/server'
import { getSubmissionByEmail, updateSubmission } from '@/lib/submissions'
import { isRateLimited } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

const METHOD_LABELS = {
  d17:        'تطبيق D17 (البريد التونسي)',
  post:       'مكتب البريد — إيداع نقدي',
  later_d17:  'سيدفع لاحقاً عبر D17',
  later_post: 'سيدفع لاحقاً في مكتب البريد',
}

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (await isRateLimited(`payment_confirm:${ip}`, 5, 3600)) {
    return NextResponse.json({ ok: false }, { status: 429 })
  }

  const { email, method, payLaterDate } = await req.json()
  if (!email || !method || !METHOD_LABELS[method]) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const submission = await getSubmissionByEmail(email.toLowerCase().trim())
  if (!submission) return NextResponse.json({ ok: true }) // silent — no enumeration

  // Only pending submissions can confirm payment — never overwrite an active account
  if (submission.status === 'active') return NextResponse.json({ ok: true })

  // Extend deadline if paying later (max 30 days from now)
  const MAX_LATER = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  let paymentDeadline = submission.paymentDeadline || new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
  if (method.startsWith('later_') && payLaterDate) {
    const d = new Date(payLaterDate)
    if (!isNaN(d) && d > new Date() && d <= MAX_LATER) {
      paymentDeadline = new Date(d.getTime() + 24 * 60 * 60 * 1000).toISOString()
    }
  }

  await updateSubmission(submission.id, {
    paymentMethodChosen: method,
    paymentDeadline,
    paymentConfirmedAt: new Date().toISOString(),
  })

  notifyAdmin(submission, method, payLaterDate).catch(() => {})

  return NextResponse.json({ ok: true })
}

async function notifyAdmin(sub, method, payLaterDate) {
  if (!process.env.RESEND_API_KEY || !process.env.NOTIFY_EMAIL) return
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const label  = METHOD_LABELS[method] || method
  const later  = payLaterDate ? ` — موعد الدفع: ${new Date(payLaterDate).toLocaleDateString('ar')}` : ''

  await resend.emails.send({
    from: 'Amine-Fit <onboarding@resend.dev>',
    to:   process.env.NOTIFY_EMAIL,
    subject: `💳 اختيار طريقة دفع — ${sub.name}`,
    html: `
      <div dir="rtl" style="font-family:Arial,sans-serif;max-width:480px;margin:auto;background:#0a0a0a;border-radius:16px;overflow:hidden">
        <div style="background:#fbbf24;padding:20px;text-align:center">
          <h1 style="margin:0;color:#000;font-size:20px;font-weight:900">💳 طريقة دفع مختارة</h1>
        </div>
        <div style="padding:24px">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 12px;background:#1a1a1a;color:#fbbf24;font-weight:700;border:1px solid #333;width:35%">الاسم</td><td style="padding:8px 12px;border:1px solid #333;color:#fff">${sub.name}</td></tr>
            <tr><td style="padding:8px 12px;background:#1a1a1a;color:#fbbf24;font-weight:700;border:1px solid #333">الباقة</td><td style="padding:8px 12px;border:1px solid #333;color:#fff">${sub.interestedPlan || '—'}</td></tr>
            <tr><td style="padding:8px 12px;background:#1a1a1a;color:#fbbf24;font-weight:700;border:1px solid #333">طريقة الدفع</td><td style="padding:8px 12px;border:1px solid #333;color:#22c55e;font-weight:bold">${label}${later}</td></tr>
          </table>
          <div style="margin-top:16px;text-align:center">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'}/dashboard/clients"
               style="display:inline-block;background:#fbbf24;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
              لوحة التحكم
            </a>
          </div>
        </div>
      </div>`,
  })
}
