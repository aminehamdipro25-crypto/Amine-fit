import { NextResponse } from 'next/server'
import { saveSubmission } from '@/lib/submissions'
import { isRateLimited } from '@/lib/rateLimit'

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (await isRateLimited(`contact_ip:${ip}`, 5, 3600)) {
      return NextResponse.json({ error: 'محاولات كثيرة — حاول بعد ساعة' }, { status: 429 })
    }

    const body = await request.json()
    const { name, phone, email, goal, pkg, message } = body

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: 'الاسم ورقم الهاتف مطلوبان' }, { status: 400 })
    }

    // Field length limits
    if (name.trim().length > 100 || phone.trim().length > 30) {
      return NextResponse.json({ error: 'بيانات طويلة جداً' }, { status: 400 })
    }
    if (email && email.length > 254) {
      return NextResponse.json({ error: 'بريد إلكتروني طويل جداً' }, { status: 400 })
    }
    if (message && message.length > 2000) {
      return NextResponse.json({ error: 'الرسالة طويلة جداً (2000 حرف كحد أقصى)' }, { status: 400 })
    }

    // Save to Redis so it appears in the dashboard
    const entry = await saveSubmission({
      name:    name.trim(),
      phone:   phone.trim(),
      email:   email?.trim() || '',
      goal:    goal   || '',
      notes:   [pkg ? `الباقة المهتم بها: ${pkg}` : '', message || ''].filter(Boolean).join('\n'),
      source:  'contact',  // distinguishes from full questionnaire
      status:  'new',
    })

    console.log('[contact] saved lead:', entry.id, name)
    notifyNewLead(entry).catch(err => console.error('[contact email error]', err.message))

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact] error:', err.message)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

async function notifyNewLead(entry) {
  const adminEmail = process.env.NOTIFY_EMAIL || 'amine.hamdi.pro25@gmail.com'
  if (!process.env.RESEND_API_KEY) return
  const date = new Date(entry.createdAt || Date.now()).toLocaleString('ar', { timeZone: 'Asia/Qatar' })
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Amine-Fit <onboarding@resend.dev>',
      to: [adminEmail],
      subject: `💬 رسالة تواصل جديدة — ${entry.name} | Amine-Fit`,
      html: `<!DOCTYPE html><html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial,sans-serif">
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)">
  <div style="background:linear-gradient(135deg,#d97706,#f59e0b);padding:24px;text-align:center">
    <div style="font-size:28px">💬</div>
    <h1 style="color:#000;margin:6px 0 2px;font-size:18px;font-weight:900">رسالة تواصل جديدة</h1>
    <p style="color:rgba(0,0,0,.6);margin:0;font-size:12px">Amine-Fit — ${date}</p>
  </div>
  <div style="padding:20px">
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:10px 12px;background:#fef3c7;font-weight:700;border:1px solid #fde68a;width:35%;color:#92400e">الاسم</td><td style="padding:10px 12px;border:1px solid #e5e7eb;font-weight:600">${entry.name || '—'}</td></tr>
      <tr><td style="padding:10px 12px;background:#fef3c7;font-weight:700;border:1px solid #fde68a;color:#92400e">الهاتف</td><td style="padding:10px 12px;border:1px solid #e5e7eb">${entry.phone || '—'}</td></tr>
      <tr><td style="padding:10px 12px;background:#fef3c7;font-weight:700;border:1px solid #fde68a;color:#92400e">الإيميل</td><td style="padding:10px 12px;border:1px solid #e5e7eb">${entry.email || '—'}</td></tr>
      <tr><td style="padding:10px 12px;background:#fef3c7;font-weight:700;border:1px solid #fde68a;color:#92400e">الهدف</td><td style="padding:10px 12px;border:1px solid #e5e7eb">${entry.goal || '—'}</td></tr>
      <tr><td style="padding:10px 12px;background:#fef3c7;font-weight:700;border:1px solid #fde68a;color:#92400e">الرسالة</td><td style="padding:10px 12px;border:1px solid #e5e7eb;white-space:pre-line">${entry.notes || '—'}</td></tr>
    </table>
    <div style="margin-top:16px;text-align:center">
      <a href="https://wa.me/97430653759?text=${encodeURIComponent('مرحباً ' + (entry.name || '') + '، شكراً على تواصلك مع Amine-Fit!')}"
         style="display:inline-block;background:#25d366;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:13px;margin-left:8px">
        💬 رد عبر واتساب
      </a>
      <a href="https://amine-fit.vercel.app/dashboard/clients"
         style="display:inline-block;background:#d97706;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:13px">
        لوحة التحكم
      </a>
    </div>
  </div>
</div>
</body></html>`,
    }),
  })
}
