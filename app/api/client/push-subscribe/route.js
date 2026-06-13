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
  const args = ['SET', key, value, 'EX', String(ttl)]
  await fetch(`${c.url}/pipeline`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify([args]),
    cache:   'no-store',
  })
}

async function redisDel(key) {
  const c = redisCfg()
  if (!c) return
  await fetch(`${c.url}/pipeline`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify([['DEL', key]]),
    cache:   'no-store',
  })
}

export async function POST(req) {
  const token = cookies().get('client_token')?.value
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  try {
    const { subscription } = await req.json()

    // Validate subscription shape
    if (
      !subscription ||
      typeof subscription.endpoint !== 'string' ||
      subscription.endpoint.length > 500 ||
      !subscription.keys?.p256dh ||
      !subscription.keys?.auth
    ) {
      return NextResponse.json({ error: 'بيانات الاشتراك غير صالحة' }, { status: 400 })
    }

    const TTL = 7776000 // 90 days
    await redisSet(`push_sub:${payload.id}`, JSON.stringify(subscription), TTL)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[push-subscribe POST]', err.message)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function DELETE() {
  const token = cookies().get('client_token')?.value
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  try {
    await redisDel(`push_sub:${payload.id}`)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[push-subscribe DELETE]', err.message)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
