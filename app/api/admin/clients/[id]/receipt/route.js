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
      headers: { Authorization: `Bearer ${c.token}` },
      cache: 'no-store',
    })
    const data = await res.json()
    return data.result
  } catch { return null }
}

export async function GET(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny

  const raw = await redisGet(`payment_receipt:${params.id}`)
  if (!raw) return NextResponse.json(null)
  try {
    let v = raw
    if (typeof v === 'string') v = JSON.parse(v)
    return NextResponse.json(v)
  } catch { return NextResponse.json(null) }
}
