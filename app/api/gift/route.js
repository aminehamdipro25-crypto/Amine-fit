import { NextResponse } from 'next/server'
import { isRateLimited } from '@/lib/rateLimit'

const GIFT_PREFIX = 'gift_code:'
const GIFT_TTL    = 60 * 24 * 60 * 60 // 60 days in seconds

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

// GET /api/gift?code=XXXXXX — validate a gift code (public, read-only)
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

// POST /api/gift/redeem — mark a gift code as used after successful registration
// Called internally from the register flow with { code, email }
export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (await isRateLimited(`gift_redeem:${ip}`, 5, 3600)) {
    return NextResponse.json({ ok: false }, { status: 429 })
  }

  const { code, email } = await req.json().catch(() => ({}))
  if (!code || !email) return NextResponse.json({ ok: false }, { status: 400 })

  const upperCode = String(code).toUpperCase().trim()
  const cfg = getCfg()
  if (!cfg) return NextResponse.json({ ok: false }, { status: 503 })

  const raw = await redisCmd(cfg, 'GET', GIFT_PREFIX + upperCode)
  if (!raw) return NextResponse.json({ ok: false, reason: 'not_found' })

  let gift
  try { gift = JSON.parse(typeof raw === 'string' ? raw : JSON.stringify(raw)) } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  if (gift.used) return NextResponse.json({ ok: false, reason: 'already_used' })

  // Mark as used — preserve TTL by re-setting with SETEX
  const updated = JSON.stringify({ ...gift, used: true, usedBy: email.toLowerCase().trim(), usedAt: new Date().toISOString() })
  await redisCmd(cfg, 'SETEX', GIFT_PREFIX + upperCode, GIFT_TTL, updated)

  return NextResponse.json({ ok: true })
}
