import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

function redisCfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}
async function redisGet(key) {
  const c = redisCfg(); if (!c) return null
  try {
    const res = await fetch(`${c.url}/get/${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${c.token}` }, cache: 'no-store' })
    return (await res.json()).result
  } catch { return null }
}
async function redisSet(key, val) {
  const c = redisCfg(); if (!c) throw new Error('redis')
  const res = await fetch(`${c.url}/pipeline`, {
    method: 'POST', headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([val === null ? ['DEL', key] : ['SET', key, val]]), cache: 'no-store',
  })
  if (!res.ok) throw new Error(`redis ${res.status}`)
}

// GET — current invitation code (admin only)
export async function GET() {
  const deny = await requireAdmin(); if (deny) return deny
  const code = (await redisGet('kids_trial_code')) || process.env.KIDS_TRIAL_CODE || ''
  return NextResponse.json({ code })
}

// POST — set/change the code (empty string closes the offer)
export async function POST(req) {
  const deny = await requireAdmin(); if (deny) return deny
  const { code } = await req.json().catch(() => ({}))
  const clean = String(code ?? '').replace(/[<>]/g, '').trim().slice(0, 40)
  try {
    await redisSet('kids_trial_code', clean || null)
    return NextResponse.json({ ok: true, code: clean })
  } catch {
    return NextResponse.json({ error: 'تعذّر الحفظ' }, { status: 500 })
  }
}
