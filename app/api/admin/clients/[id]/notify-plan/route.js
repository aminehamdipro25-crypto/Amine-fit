import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { getSubmissionById, updateSubmission } from '@/lib/submissions'
import { sendEmail } from '@/lib/mailer'
import { sendPushToClient } from '@/lib/webPush'
import { isRateLimited } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

// Coach-pressed button: notify the client (push + email) that their plan was
// updated. Kept manual so the coach can build the plan without spamming the
// client with a notification on every save.
export async function POST(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny

  // Guard against accidental double-clicks / mass sends: max 10 notifications
  // per client per hour.
  if (await isRateLimited(`notify_plan:${params.id}`, 10, 3600)) {
    return NextResponse.json(
      { error: 'أرسلت إشعارات كثيرة لهذا العميل مؤخراً — انتظر قليلاً' },
      { status: 429 },
    )
  }

  const client = await getSubmissionById(params.id)
  if (!client) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })
  if (!client.email) {
    return NextResponse.json({ error: 'لا يوجد بريد إلكتروني لهذا العميل' }, { status: 400 })
  }

  const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'

  // What was updated? Use the stamp from the last plan save, default to both.
  const kind = client.planUpdatedKind || 'plan'
  const map = {
    training: { word: 'خطتك التدريبية', path: '/client/plan/training' },
    nutrition: { word: 'خطتك الغذائية', path: '/client/plan/nutrition' },
    both: { word: 'خطتك التدريبية والغذائية', path: '/client/dashboard' },
    plan: { word: 'خطتك', path: '/client/dashboard' },
  }
  const { word, path } = map[kind] || map.plan
  const link = `${BASE}${path}`
  const firstName = (client.name || '').trim().split(/\s+/)[0] || ''

  // Push notification (best-effort)
  await sendPushToClient(
    params.id,
    '🔔 تحديث في خطتك',
    `حدّث مدربك ${word} — افتح بوابتك للاطلاع عليها`,
    path,
  ).catch(() => {})

  // Email
  try {
    await sendEmail({
      to: client.email,
      subject: '🔔 تم تحديث خطتك — AmineFit',
      html: `
<!DOCTYPE html><html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial,sans-serif">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
  <div style="background:#0a0a0a;padding:22px 24px;text-align:center">
    <p style="color:#fbbf24;font-size:30px;margin:0">🔔</p>
    <h1 style="color:#fff;margin:8px 0 4px;font-size:19px">تم تحديث خطتك</h1>
    <p style="color:rgba(255,255,255,.5);margin:0;font-size:13px">أمين حمدي — AmineFit</p>
  </div>
  <div style="padding:26px 24px">
    <p style="font-size:15px;color:#1e293b;line-height:1.8;margin:0 0 18px">
      ${firstName ? `مرحباً ${firstName}،` : 'مرحباً،'}<br>
      حدّث مدربك <strong>${word}</strong>. افتح بوابتك الآن للاطلاع على التحديث والبدء في تطبيقه.
    </p>
    <a href="${link}" style="display:block;text-align:center;background:#0a0a0a;color:#fbbf24;padding:14px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px">
      عرض خطتي ←
    </a>
    <p style="font-size:12px;color:#94a3b8;line-height:1.7;margin:18px 0 0;text-align:center">
      سجّل دخولك عبر <span dir="ltr">amine-fit.com/client/login</span> ببريدك وكلمة المرور.
    </p>
  </div>
  <div style="background:#f8fafc;padding:10px 24px;text-align:center;border-top:1px solid #e2e8f0">
    <p style="color:#9ca3af;font-size:11px;margin:0">Amine-Fit • الدوحة، قطر • +974 3065 3759</p>
  </div>
</div>
</body></html>`,
      text: `${firstName ? `مرحباً ${firstName}،` : 'مرحباً،'} حدّث مدربك ${word}. افتح بوابتك: ${link}`,
    })
  } catch (err) {
    console.error('[notify-plan] email failed:', err?.message)
    return NextResponse.json({ error: 'تعذّر إرسال البريد — حاول مجدداً' }, { status: 502 })
  }

  await updateSubmission(params.id, { planEmailNotifiedAt: new Date().toISOString() }).catch(() => {})

  return NextResponse.json({ success: true })
}
