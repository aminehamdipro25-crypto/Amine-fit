import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/clientAuth'

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

function parseObj(raw) {
  if (!raw) return {}
  try { let v = raw; if (typeof v === 'string') v = JSON.parse(v); if (typeof v === 'string') v = JSON.parse(v); return v && typeof v === 'object' && !Array.isArray(v) ? v : {} } catch { return {} }
}

async function getPayload() {
  const token = cookies().get('client_token')?.value
  return verifyToken(token)
}

// GET — return training log (last 60 days of dates → boolean)
export async function GET() {
  const payload = await getPayload()
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const raw = await redisGet(`training_log:${payload.id}`)
  return NextResponse.json(parseObj(raw))
}

// POST — toggle training day
export async function POST(req) {
  const payload = await getPayload()
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { date } = await req.json()
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'تاريخ غير صالح' }, { status: 400 })
  }
  // Only allow marking within the last 7 days (no future dates)
  const daysDiff = (Date.now() - new Date(date).getTime()) / 86400000
  if (daysDiff > 7 || daysDiff < 0) {
    return NextResponse.json({ error: 'يمكن التسجيل فقط لآخر 7 أيام' }, { status: 400 })
  }

  const raw = await redisGet(`training_log:${payload.id}`)
  const log = parseObj(raw)

  // Toggle
  if (log[date]) delete log[date]
  else log[date] = true

  // Prune entries older than 90 days to keep storage small
  const cutoff = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10)
  for (const d of Object.keys(log)) { if (d < cutoff) delete log[d] }

  await redisPipeline([['SET', `training_log:${payload.id}`, JSON.stringify(log)]])
  return NextResponse.json({ success: true, log })
}
