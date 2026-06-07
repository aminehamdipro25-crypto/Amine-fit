import { NextResponse } from 'next/server'

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

function parse(raw) {
  if (!raw) return null
  try {
    let v = raw
    if (typeof v === 'string') v = JSON.parse(v)
    if (typeof v === 'string') v = JSON.parse(v)
    return v && typeof v === 'object' ? v : null
  } catch { return null }
}

// Public GET — returns current offer config (if active)
export async function GET() {
  const raw  = await redisGet('af:offer')
  const data = parse(raw)

  // No offer or expired → return null
  if (!data || !data.endsAt) return NextResponse.json(null)
  if (new Date(data.endsAt).getTime() < Date.now()) return NextResponse.json(null)

  return NextResponse.json({
    endsAt:      data.endsAt,
    discount:    data.discount  || 50,
    label:       data.label     || 'عرض خاص',
    active:      true,
  })
}
