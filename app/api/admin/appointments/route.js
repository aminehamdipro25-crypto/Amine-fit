import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { sendEmail } from '@/lib/mailer'
import { sendPushToClient } from '@/lib/webPush'

export const dynamic = 'force-dynamic'

function redisCfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}

async function pipeline(c, cmds) {
  const res = await fetch(`${c.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds), cache: 'no-store',
  })
  return res.json()
}

function parseJSON(raw) {
  if (!raw) return null
  try { const v = typeof raw === 'string' ? JSON.parse(raw) : raw; return typeof v === 'string' ? JSON.parse(v) : v }
  catch { return null }
}

export async function GET(req) {
  const deny = await requireAdmin()
  if (deny) return deny

  const c = redisCfg()
  if (!c) return NextResponse.json({ appointments: [] })

  const status = new URL(req.url).searchParams.get('status') || ''

  const [idxRes] = await pipeline(c, [['LRANGE', 'appts_list', '0', '99']])
  const ids = idxRes?.result ?? []
  if (!ids.length) return NextResponse.json({ appointments: [] })

  const [mgetRes] = await pipeline(c, [['MGET', ...ids.map(id => `appt:${id}`)]])
  let appointments = (mgetRes?.result ?? []).map(parseJSON).filter(Boolean)
  if (status) appointments = appointments.filter(a => a.status === status)
  appointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return NextResponse.json({ appointments })
}

export async function PATCH(req) {
  const deny = await requireAdmin()
  if (deny) return deny

  const { id, status, adminNote, confirmedDate, confirmedTime } = await req.json()
  if (!id || !['confirmed','cancelled'].includes(status)) {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
  }

  const c = redisCfg()
  if (!c) return NextResponse.json({ error: 'Redis unavailable' }, { status: 503 })

  const [getRes] = await pipeline(c, [['GET', `appt:${id}`]])
  const appt     = parseJSON(getRes?.result)
  if (!appt) return NextResponse.json({ error: 'الموعد غير موجود' }, { status: 404 })

  const updated = {
    ...appt,
    status,
    adminNote:     String(adminNote || '').trim().slice(0, 300),
    confirmedDate: confirmedDate || appt.preferredDate,
    confirmedTime: confirmedTime || appt.preferredTime,
    updatedAt:     new Date().toISOString(),
  }

  await pipeline(c, [['SET', `appt:${id}`, JSON.stringify(updated), 'EX', String(365 * 24 * 3600)]])

  const typeAr = { nutrition: 'تغذية', training: 'تدريب', general: 'عامة' }[appt.type] || appt.type

  if (status === 'confirmed') {
    const msg = `✅ تم تأكيد موعد استشارتك — ${typeAr}\n📅 ${updated.confirmedDate} — ${updated.confirmedTime}${adminNote ? `\nملاحظة: ${adminNote}` : ''}`
    sendPushToClient(appt.clientId, 'تأكيد موعدك 📅', msg, '/client/appointments').catch(() => {})
    sendEmail({
      to: appt.clientEmail,
      subject: `✅ تأكيد موعد استشارتك — ${typeAr}`,
      html: `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
        <h2>تم تأكيد موعدك ✅</h2>
        <p style="font-size:16px">نوع الاستشارة: <strong>${typeAr}</strong></p>
        <p style="font-size:16px">التاريخ: <strong>${updated.confirmedDate}</strong></p>
        <p style="font-size:16px">الوقت: <strong>${updated.confirmedTime}</strong></p>
        ${adminNote ? `<p style="font-size:14px;color:#555">ملاحظة المدرب: ${adminNote}</p>` : ''}
        <hr style="margin:24px 0;border:none;border-top:1px solid #eee">
        <p style="font-size:12px;color:#999">المدرب أمين حمدي — amine-fit.com</p>
      </div>`,
      text: msg,
    }).catch(() => {})
  } else {
    const msg = `تم إلغاء طلب الموعد${adminNote ? ` — ${adminNote}` : ''}`
    sendPushToClient(appt.clientId, 'إلغاء الموعد', msg, '/client/appointments').catch(() => {})
  }

  return NextResponse.json({ ok: true, appointment: updated })
}
