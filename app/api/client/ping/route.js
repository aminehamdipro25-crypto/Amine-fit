import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/clientAuth'
import { updateLastSeen } from '@/lib/clientSession'

export const dynamic = 'force-dynamic'

function redisCfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}

async function redisGetSet(key, value, ttl) {
  const c = redisCfg()
  if (!c) return null
  try {
    const res = await fetch(`${c.url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([
        ['GET', key],
        ['SET', key, value, 'EX', String(ttl)],
      ]),
      cache: 'no-store',
    })
    const data = await res.json()
    return data?.[0]?.result ?? null
  } catch { return null }
}

export async function POST() {
  const token   = cookies().get('client_token')?.value
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ ok: false }, { status: 401 })

  await updateLastSeen(payload.id)

  // Persist lastActiveAt to submission once per day (using a daily throttle key)
  const today    = new Date().toISOString().slice(0, 10)
  const throttle = `last_active_write:${payload.id}:${today}`
  const already  = await redisGetSet(throttle, '1', 90000) // 25h TTL
  if (!already) {
    const { updateSubmission } = await import('@/lib/submissions')
    updateSubmission(payload.id, { lastActiveAt: new Date().toISOString() }).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
