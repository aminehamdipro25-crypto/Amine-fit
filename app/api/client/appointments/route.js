import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/clientAuth'
import { getSubmissionById } from '@/lib/submissions'
import { sendTelegramMessage } from '@/lib/telegram'
import { sendPushToClient } from '@/lib/webPush'
import crypto from 'crypto'

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

async function getClientAppointments(clientId) {
  const c = redisCfg()
  if (!c) return []
  const [idxRes] = await pipeline(c, [['LRANGE', `appts_client:${clientId}`, '0', '19']])
  const ids = idxRes?.result ?? []
  if (!ids.length) return []
  const [mgetRes] = await pipeline(c, [['MGET', ...ids.map(id => `appt:${id}`)]])
  return (mgetRes?.result ?? []).map(parseJSON).filter(Boolean)
}

async function auth() {
  const token   = cookies().get('client_token')?.value
  const payload = await verifyToken(token)
  return payload
}

export async function GET() {
  const payload = await auth()
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const appointments = await getClientAppointments(payload.id)
  return NextResponse.json({ appointments })
}

export async function POST(req) {
  const payload = await auth()
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const client = await getSubmissionById(payload.id)
  if (!client) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const { date, time, type, note } = await req.json()

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'تاريخ غير صالح' }, { status: 400 })
  }
  if (!time || !/^\d{2}:\d{2}$/.test(time)) {
    return NextResponse.json({ error: 'وقت غير صالح' }, { status: 400 })
  }
  if (!['nutrition','training','general'].includes(type)) {
    return NextResponse.json({ error: 'نوع غير صالح' }, { status: 400 })
  }

  // Max 2 pending appointments per client
  const existing = await getClientAppointments(payload.id)
  const pending  = existing.filter(a => a.status === 'pending')
  if (pending.length >= 2) {
    return NextResponse.json({ error: 'لديك طلبات حجز معلقة — انتظر تأكيد المدرب أولاً' }, { status: 409 })
  }

  const appt = {
    id:           crypto.randomBytes(8).toString('hex'),
    clientId:     payload.id,
    clientName:   client.name,
    clientEmail:  client.email,
    type,
    preferredDate: date,
    preferredTime: time,
    note:         String(note || '').trim().slice(0, 300),
    status:       'pending',
    adminNote:    '',
    confirmedDate: null,
    confirmedTime: null,
    createdAt:    new Date().toISOString(),
  }

  const c = redisCfg()
  if (c) {
    await pipeline(c, [
      ['SET', `appt:${appt.id}`, JSON.stringify(appt), 'EX', String(365 * 24 * 3600)],
      ['LPUSH', 'appts_list', appt.id],
      ['LPUSH', `appts_client:${payload.id}`, appt.id],
    ])
  }

  const typeAr = { nutrition: 'تغذية', training: 'تدريب', general: 'عامة' }[type]
  sendTelegramMessage(
    `📅 طلب موعد جديد\n` +
    `العميل: ${client.name}\n` +
    `النوع: استشارة ${typeAr}\n` +
    `التاريخ المفضّل: ${date} — ${time}\n` +
    (note ? `الملاحظة: ${note}` : '') +
    `\n→ /dashboard/appointments للموافقة`
  ).catch(() => {})

  return NextResponse.json({ ok: true, appointment: appt })
}
