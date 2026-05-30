import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL   || 'NOT SET'
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || 'NOT SET'

  const hasRedis = url !== 'NOT SET' && token !== 'NOT SET'

  let redisTest = null
  if (hasRedis) {
    try {
      const cleanUrl = url.replace(/\/$/, '')
      const res = await fetch(cleanUrl + '/pipeline', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([['PING']]),
      })
      const data = await res.json()
      redisTest = { status: res.status, result: data }
    } catch (e) {
      redisTest = { error: e.message }
    }
  }

  return NextResponse.json({
    url_set:   url !== 'NOT SET',
    token_set: token !== 'NOT SET',
    url_prefix: url !== 'NOT SET' ? url.substring(0, 30) + '...' : 'NOT SET',
    redisTest,
  })
}
