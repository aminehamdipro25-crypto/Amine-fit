import { NextResponse } from 'next/server'
import { saveSubmission } from '@/lib/submissions'

export async function POST(req) {
  try {
    const body = await req.json()

    const required = ['email', 'name', 'gender', 'age', 'height', 'weight',
      'workActivity', 'goal', 'targetWeight', 'dailyMeals',
      'waterIntake', 'activityLevel', 'sleepHours']

    const missing = required.filter(k => !body[k]?.toString().trim())
    if (missing.length) {
      return NextResponse.json(
        { error: 'يرجى ملء جميع الحقول الإلزامية', missing },
        { status: 400 }
      )
    }

    const entry = await saveSubmission(body)

    // Send email notification (fire-and-forget, won't block response)
    sendEmailNotification(entry).catch(err =>
      console.error('[email notification]', err)
    )

    return NextResponse.json({ success: true, id: entry.id })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

async function sendEmailNotification(entry) {
  // Requires NOTIFY_EMAIL env var set in Vercel dashboard
  // Uses a simple fetch to a no-auth email relay, or logs to console as fallback
  const adminEmail = process.env.NOTIFY_EMAIL || 'amine.hamdi.pro25@gmail.com'

  // Try Resend if RESEND_API_KEY is configured
  if (process.env.RESEND_API_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Amine-Fit <noreply@resend.dev>',
        to: [adminEmail],
        subject: `🏋️ استبيان جديد — ${entry.name}`,
        html: buildEmailHtml(entry),
      }),
    })
    return
  }

  // Fallback: log to console (visible in Vercel logs)
  console.log('[NEW SUBMISSION]', JSON.stringify(entry, null, 2))
}

function buildEmailHtml(e) {
  return `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#4f46e5">🏋️ استبيان جديد — Amine-Fit</h2>
      <table style="width:100%;border-collapse:collapse">
        ${row('الاسم', e.name)}
        ${row('البريد', e.email)}
        ${row('الهاتف', e.phone || '—')}
        ${row('العمر', e.age)}
        ${row('الوزن', e.weight + ' كغ')}
        ${row('الطول', e.height + ' سم')}
        ${row('الهدف', e.goal)}
        ${row('مستوى النشاط', e.activityLevel)}
        ${row('تاريخ الإرسال', new Date(e.createdAt).toLocaleString('ar-QA'))}
      </table>
      <p style="color:#64748b;font-size:12px">لعرض الاستبيان كاملاً: amine-fit.vercel.app/dashboard/clients</p>
    </div>
  `
}

function row(label, value) {
  return `
    <tr>
      <td style="padding:8px;background:#f8fafc;font-weight:bold;border:1px solid #e2e8f0">${label}</td>
      <td style="padding:8px;border:1px solid #e2e8f0">${value ?? '—'}</td>
    </tr>
  `
}

export async function GET() {
  try {
    const { getSubmissions } = await import('@/lib/submissions')
    const list = await getSubmissions()
    return NextResponse.json(list)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
