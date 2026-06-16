import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/clientAuth'

export const dynamic = 'force-dynamic'

function redisCfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}

async function redisSet(key, value, ttl) {
  const c = redisCfg()
  if (!c) return
  const cmd = ttl
    ? [['SET', key, value, 'EX', String(ttl)]]
    : [['SET', key, value]]
  await fetch(`${c.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
    cache: 'no-store',
  }).catch(() => {})
}

async function redisDel(key) {
  const c = redisCfg()
  if (!c) return
  await fetch(`${c.url}/del/${encodeURIComponent(key)}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${c.token}` },
    cache: 'no-store',
  }).catch(() => {})
}

export async function POST(req) {
  const token   = cookies().get('client_token')?.value
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const subscription = await req.json()
  if (!subscription?.endpoint) {
    return NextResponse.json({ error: 'invalid subscription' }, { status: 400 })
  }

  // TTL = 90 days; refreshed on each subscribe call
  await redisSet(`push_sub:${payload.id}`, JSON.stringify(subscription), 90 * 86400)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req) {
  const token   = cookies().get('client_token')?.value
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  await redisDel(`push_sub:${payload.id}`)
  return NextResponse.json({ ok: true })
}
