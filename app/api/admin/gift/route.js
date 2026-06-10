import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const GIFT_PREFIX = 'gift_code:'
const PLAN_INFO = {
  training: { name: 'برنامج التدريب',  price: '50',  duration: 30  },
  monthly:  { name: 'الباقة الشهرية', price: '125', duration: 30  },
  '3months':{ name: 'باقة 3 أشهر',    price: '300', duration: 90  },
}

function getCfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return (url && token) ? { url: url.replace(/\/$/, ''), token } : null
}

async function redisSetEx(cfg, key, ttlSeconds, value) {
  const res = await fetch(`${cfg.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([['SETEX', key, ttlSeconds, JSON.stringify(value)]]),
    cache: 'no-store',
  })
  return res.ok
}

// POST /api/admin/gift — generate a new gift code
export async function POST(req) {
  const deny = await requireAdmin()
  if (deny) return deny

  const { plan, note, duration: durationInput } = await req.json()
  if (!PLAN_INFO[plan]) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }
  // duration in days — admin can override, otherwise use plan default
  const duration = (Number.isInteger(Number(durationInput)) && Number(durationInput) > 0)
    ? Number(durationInput)
    : PLAN_INFO[plan].duration

  const cfg = getCfg()
  if (!cfg) return NextResponse.json({ error: 'Redis not configured' }, { status: 503 })

  // Generate readable 8-char code: letters + numbers, no ambiguous chars
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const code = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map(b => chars[b % chars.length]).join('')

  const gift = {
    plan,
    planName: PLAN_INFO[plan].name,
    price: PLAN_INFO[plan].price,
    duration,
    note: note || '',
    used: false,
    createdAt: new Date().toISOString(),
  }

  const ttl = 60 * 60 * 24 * 60 // 60 days
  await redisSetEx(cfg, GIFT_PREFIX + code, ttl, gift)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'
  return NextResponse.json({
    code,
    link: `${baseUrl}/register?gift=${code}`,
    ...gift,
  })
}
