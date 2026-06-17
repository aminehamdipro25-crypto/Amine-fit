import { NextResponse } from 'next/server'
import { isRateLimited } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

function getCfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return (url && token) ? { url: url.replace(/\/$/, ''), token } : null
}

async function redisCommand(cfg, command) {
  const res = await fetch(cfg.url + '/pipeline', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([command]),
    cache: 'no-store',
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Redis HTTP ${res.status}: ${txt}`)
  }
  const data = await res.json()
  if (data[0]?.error) throw new Error(`Redis cmd error: ${data[0].error}`)
  return data[0]?.result
}

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (await isRateLimited(`waitlist_ip:${ip}`, 5, 3600)) {
      return NextResponse.json({ error: 'محاولات كثيرة — حاول بعد ساعة' }, { status: 429 })
    }

    const { email } = await req.json()
    const normalized = (email || '').toLowerCase().trim()
    if (!normalized || !/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(normalized)) {
      return NextResponse.json({ error: 'بريد إلكتروني غير صالح' }, { status: 400 })
    }

    const cfg = getCfg()
    if (cfg) {
      // Use a Redis set to store unique emails
      await redisCommand(cfg, ['SADD', 'waitlist', normalized])
    } else {
      // Fallback: log to console in dev
      console.log('[waitlist] new signup (no Redis):', normalized)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('waitlist error', err)
    return NextResponse.json({ error: 'حدث خطأ — حاول مرة أخرى' }, { status: 500 })
  }
}
