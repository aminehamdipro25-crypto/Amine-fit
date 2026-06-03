import { NextResponse } from 'next/server'
import { isRateLimited } from '@/lib/rateLimit'

const GIFT_PREFIX = 'gift_code:'

function getCfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return (url && token) ? { url: url.replace(/\/$/, ''), token } : null
}

async function redisCmd(cfg, ...args) {
  const res = await fetch(`${cfg.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([args]),
    cache: 'no-store',
  })
  const data = await res.json()
  return data[0]?.result ?? null
}

// GET /api/gift?code=XXXXXX — validate a gift code (public)
export async function GET(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (await isRateLimited(`gift_check:${ip}`, 10, 300)) {
    return NextResponse.json({ valid: false, reason: 'too_many' })
  }

  const code = new URL(req.url).searchParams.get('code')?.toUpperCase().trim()
  if (!code || code.length < 4 || code.length > 12) {
    return NextResponse.json({ valid: false, reason: 'invalid' })
  }

  const cfg = getCfg()
  if (!cfg) return NextResponse.json({ valid: false, reason: 'unavailable' })

  const raw = await redisCmd(cfg, 'GET', GIFT_PREFIX + code)
  if (!raw) return NextResponse.json({ valid: false, reason: 'not_found' })

  let gift
  try { gift = JSON.parse(typeof raw === 'string' ? raw : JSON.stringify(raw)) } catch {
    return NextResponse.json({ valid: false, reason: 'invalid' })
  }

  if (gift.used) return NextResponse.json({ valid: false, reason: 'used' })

  return NextResponse.json({
    valid: true,
    plan: gift.plan,
    planName: gift.planName,
    price: gift.price,
    note: gift.note || '',
  })
}
