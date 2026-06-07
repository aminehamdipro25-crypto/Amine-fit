import { NextResponse } from 'next/server'

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

function parse(raw) {
  if (!raw) return null
  try {
    let v = raw
    if (typeof v === 'string') v = JSON.parse(v)
    if (typeof v === 'string') v = JSON.parse(v)
    return v && typeof v === 'object' ? v : null
  } catch { return null }
}

// Public GET — returns current pricing (falls back to defaults)
export async function GET() {
  const raw  = await redisGet('af:pricing')
  const data = parse(raw)
  return NextResponse.json(data ? { ...DEFAULT, ...data } : DEFAULT)
}
