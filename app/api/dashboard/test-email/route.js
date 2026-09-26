import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { isRateLimited } from '@/lib/rateLimit'
import { sendEmail } from '@/lib/mailer'

export const dynamic = 'force-dynamic'

// Admin-only self-test for the CLIENT-facing email path. It calls the exact same
// sendEmail() used to deliver activation codes, so a green result guarantees a
// real client will receive their code — closing the "email silently failed and I
// had to send the link by hand" gap before onboarding anyone.
export async function POST(req) {
  const deny = await requireAdmin()
  if (deny) return deny

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (await isRateLimited(`test_email:${ip}`, 5, 300)) {
    return NextResponse.json({ ok: false, error: 'محاولات كثيرة — انتظر قليلاً' }, { status: 429 })
  }

  const hasGmail  = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)
  const hasResend = !!process.env.RESEND_API_KEY
  if (!hasGmail && !hasResend) {
    return NextResponse.json({
      ok: false,
      error: 'لا يوجد مزوّد بريد مضبوط',
      missing: ['GMAIL_USER + GMAIL_APP_PASSWORD', 'أو RESEND_API_KEY'],
      hint: 'أضِف بيانات Gmail (موصى به) أو RESEND_API_KEY في متغيرات البيئة على Vercel — بدونها لن يصل كود التفعيل للعميل.',
    }, { status: 503 })
  }

  // Destination: an address the admin can actually check. Defaults to the admin's
  // own configured inbox; a custom { to } lets them verify delivery anywhere.
  let to = process.env.NOTIFY_EMAIL || process.env.GMAIL_USER || ''
  try {
    const body = await req.json().catch(() => ({}))
    if (body?.to && typeof body.to === 'string') to = body.to.trim()
  } catch { /* no body — use default */ }

  if (!to || !/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(to)) {
    return NextResponse.json({
      ok: false,
      error: 'لا يوجد عنوان بريد صالح للإرسال إليه',
      hint: 'اضبط NOTIFY_EMAIL أو GMAIL_USER، أو أدخل بريداً للاختبار.',
    }, { status: 400 })
  }

  const now = new Date().toLocaleString('ar', { timeZone: 'Asia/Qatar' })
  try {
    const result = await sendEmail({
      to,
      subject: '✅ اختبار بريد Amine-Fit — التفعيل يعمل',
      text: `هذه رسالة تجريبية من لوحة تحكم Amine-Fit.\n\nإذا وصلتك هذه الرسالة فإن بريد كود التفعيل سيصل للعملاء بشكل صحيح.\n\n${now}`,
      html: `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial,sans-serif">
<div style="max-width:460px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
  <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:22px;text-align:center">
    <div style="font-size:40px">✅</div>
    <h1 style="color:#fff;margin:6px 0 0;font-size:20px">اختبار البريد نجح</h1>
  </div>
  <div style="padding:22px;color:#374151;font-size:14px;line-height:1.7">
    <p style="margin:0 0 12px">إذا وصلتك هذه الرسالة، فإن <b>بريد كود التفعيل سيصل لعملائك بشكل صحيح</b> — كل شيء جاهز لاستقبال عميل جديد.</p>
    <p style="margin:0;color:#9ca3af;font-size:12px">${now} • Amine-Fit</p>
  </div>
</div></body></html>`,
    })
    return NextResponse.json({ ok: true, provider: result?.provider || 'unknown', to })
  } catch (e) {
    const msg = String(e?.message || e)
    return NextResponse.json({
      ok: false,
      error: msg,
      hint: /invalid login|username and password|BadCredentials|534|535/i.test(msg)
        ? 'GMAIL_APP_PASSWORD غير صحيح — أنشئ App Password جديداً من إعدادات Google (ليس كلمة مرور الحساب العادية).'
        : /api key|unauthorized|401|403/i.test(msg)
          ? 'RESEND_API_KEY غير صحيح أو منتهي الصلاحية.'
          : 'تحقق من إعدادات البريد في متغيرات البيئة على Vercel.',
    }, { status: 500 })
  }
}
