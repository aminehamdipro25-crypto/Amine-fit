import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/clientAuth'
import { getSubmissionById } from '@/lib/submissions'

export const dynamic = 'force-dynamic'

function redisCfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}

async function redisGet(key) {
  const c = redisCfg()
  if (!c) return null
  try {
    const res = await fetch(`${c.url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${c.token}` }, cache: 'no-store',
    })
    return (await res.json()).result
  } catch { return null }
}

async function redisPipeline(commands) {
  const c = redisCfg()
  if (!c) throw new Error('Redis not configured')
  const res = await fetch(`${c.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands), cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Redis ${res.status}`)
  return res.json()
}

function parse(raw) {
  if (!raw) return []
  try {
    let v = raw
    if (typeof v === 'string') v = JSON.parse(v)
    if (typeof v === 'string') v = JSON.parse(v)
    return Array.isArray(v) ? v : []
  } catch { return [] }
}

async function getPayload() {
  const token = cookies().get('client_token')?.value
  return verifyToken(token)
}

// GET — client fetches their own testimonial
export async function GET() {
  const payload = await getPayload()
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const raw = await redisGet('af:testimonials')
  const all = parse(raw)
  const mine = all.find(t => t.clientId === payload.id) || null
  return NextResponse.json(mine)
}

// POST — client submits a testimonial
export async function POST(req) {
  const payload = await getPayload()
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { text, rating, result, shareName } = await req.json()
  if (!text?.trim() || text.trim().length < 20) {
    return NextResponse.json({ error: 'النص قصير جداً (20 حرف على الأقل)' }, { status: 400 })
  }
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'تقييم غير صالح' }, { status: 400 })
  }

  const client = await getSubmissionById(payload.id)

  const raw = await redisGet('af:testimonials')
  const all = parse(raw)

  // One testimonial per client — update if exists
  const existing = all.findIndex(t => t.clientId === payload.id)
  const entry = {
    id:          existing >= 0 ? all[existing].id : `t_${Date.now()}_${payload.id.slice(-4)}`,
    clientId:    payload.id,
    name:        shareName ? (client?.name || 'عميل') : (client?.name?.[0] + '.'),
    fullRole:    client?.goal ? { loss: 'برنامج خسارة وزن', gain: 'برنامج بناء عضلات', maintain: 'برنامج الحفاظ على الوزن', performance: 'برنامج أداء رياضي' }[client.goal] || 'عميل Amine-Fit' : 'عميل Amine-Fit',
    result:      String(result || '').trim().slice(0, 100),
    text:        text.trim().slice(0, 500),
    rating:      Math.min(5, Math.max(1, rating)),
    shareName:   !!shareName,
    submittedAt: new Date().toISOString(),
    approved:    false,
    approvedAt:  null,
  }

  if (existing >= 0) all[existing] = entry
  else all.push(entry)

  await redisPipeline([['SET', 'af:testimonials', JSON.stringify(all)]])
  return NextResponse.json({ success: true })
}
