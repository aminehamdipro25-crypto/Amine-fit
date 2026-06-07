import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

const DEFAULT = {
  basic:    { tnd: 50,  origTnd: 100, qar: 55,  origQar: 110 },
  standard: { tnd: 125, origTnd: 250, qar: 135, origQar: 270 },
  premium:  { tnd: 300, origTnd: 600, qar: 325, origQar: 650 },
}

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

function posNum(v, fallback) {
  const n = Number(v)
  return n > 0 ? Math.round(n * 100) / 100 : fallback
}

// GET — current pricing for admin
export async function GET() {
  const deny = await requireAdmin()
  if (deny) return deny
  const raw  = await redisGet('af:pricing')
  const data = parse(raw)
  return NextResponse.json(data ? { ...DEFAULT, ...data } : DEFAULT)
}

// POST — update pricing
export async function POST(req) {
  const deny = await requireAdmin()
  if (deny) return deny

  const body = await req.json()

  const pricing = {
    basic: {
      tnd:     posNum(body.basic?.tnd,     DEFAULT.basic.tnd),
      origTnd: posNum(body.basic?.origTnd, DEFAULT.basic.origTnd),
      qar:     posNum(body.basic?.qar,     DEFAULT.basic.qar),
      origQar: posNum(body.basic?.origQar, DEFAULT.basic.origQar),
    },
    standard: {
      tnd:     posNum(body.standard?.tnd,     DEFAULT.standard.tnd),
      origTnd: posNum(body.standard?.origTnd, DEFAULT.standard.origTnd),
      qar:     posNum(body.standard?.qar,     DEFAULT.standard.qar),
      origQar: posNum(body.standard?.origQar, DEFAULT.standard.origQar),
    },
    premium: {
      tnd:     posNum(body.premium?.tnd,     DEFAULT.premium.tnd),
      origTnd: posNum(body.premium?.origTnd, DEFAULT.premium.origTnd),
      qar:     posNum(body.premium?.qar,     DEFAULT.premium.qar),
      origQar: posNum(body.premium?.origQar, DEFAULT.premium.origQar),
    },
    updatedAt: new Date().toISOString(),
  }

  await redisPipeline([['SET', 'af:pricing', JSON.stringify(pricing)]])
  return NextResponse.json({ success: true, pricing })
}
