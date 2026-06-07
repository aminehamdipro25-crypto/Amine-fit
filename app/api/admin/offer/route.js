import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'

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
  if (!raw) return null
  try {
    let v = raw
    if (typeof v === 'string') v = JSON.parse(v)
    if (typeof v === 'string') v = JSON.parse(v)
    return v && typeof v === 'object' ? v : null
  } catch { return null }
}

// GET — admin: get current offer config
export async function GET() {
  const deny = await requireAdmin()
  if (deny) return deny
  const raw  = await redisGet('af:offer')
  return NextResponse.json(parse(raw) || {})
}

// POST — admin: set new offer config
export async function POST(req) {
  const deny = await requireAdmin()
  if (deny) return deny

  const { endsAt, discount, label, active } = await req.json()

  if (active === false) {
    // Turn off offer
    await redisPipeline([['DEL', 'af:offer']])
    return NextResponse.json({ success: true, active: false })
  }

  if (!endsAt) return NextResponse.json({ error: 'تاريخ الانتهاء مطلوب' }, { status: 400 })
  if (new Date(endsAt).getTime() <= Date.now()) {
    return NextResponse.json({ error: 'التاريخ يجب أن يكون في المستقبل' }, { status: 400 })
  }

  const offer = {
    endsAt,
    discount: Math.min(90, Math.max(1, Number(discount) || 50)),
    label:    (label || 'عرض خاص').trim().slice(0, 60),
    updatedAt: new Date().toISOString(),
  }

  await redisPipeline([['SET', 'af:offer', JSON.stringify(offer)]])
  return NextResponse.json({ success: true, offer })
}
