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
  if (!raw) return []
  try {
    let v = raw
    if (typeof v === 'string') v = JSON.parse(v)
    if (typeof v === 'string') v = JSON.parse(v)
    return Array.isArray(v) ? v : []
  } catch { return [] }
}

// Public endpoint — returns only approved testimonials (no email/clientId)
export async function GET() {
  const raw = await redisGet('af:testimonials')
  const all = parse(raw)
  const approved = all
    .filter(t => t.approved)
    .sort((a, b) => new Date(b.approvedAt) - new Date(a.approvedAt))
    .map(({ clientId: _cid, email: _e, ...safe }) => safe)  // strip private fields
  return NextResponse.json(approved)
}
