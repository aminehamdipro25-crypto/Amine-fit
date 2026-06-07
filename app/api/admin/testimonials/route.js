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
      headers: { Authorization: `Bearer ${c.token}` }, cache: 'no-store',
    })
    return (await res.json()).result
  } catch { return null }
}

async function redisPipeline(commands) {
  const c = redisCfg()
  if (!c) throw new Error('Redis not configured')
  const res = await fetch(`${c.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands), cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Redis ${res.status}`)
  return res.json()
}

function parse(raw) {
  if (!raw) return []
  try {
    let v = raw
    if (typeof v === 'string') v = JSON.parse(v)
    if (typeof v === 'string') v = JSON.parse(v)
    return Array.isArray(v) ? v : []
  } catch { return [] }
}

// GET — all testimonials (admin view)
export async function GET() {
  const deny = await requireAdmin()
  if (deny) return deny
  const raw = await redisGet('af:testimonials')
  const all = parse(raw).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
  return NextResponse.json(all)
}

// PATCH — approve or reject a testimonial
export async function PATCH(req) {
  const deny = await requireAdmin()
  if (deny) return deny

  const { id, approved } = await req.json()
  if (!id) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 })

  const raw = await redisGet('af:testimonials')
  const all = parse(raw)
  const idx = all.findIndex(t => t.id === id)
  if (idx < 0) return NextResponse.json({ error: 'غير موجود' }, { status: 404 })

  all[idx] = {
    ...all[idx],
    approved:   !!approved,
    approvedAt: approved ? new Date().toISOString() : null,
  }
  await redisPipeline([['SET', 'af:testimonials', JSON.stringify(all)]])
  return NextResponse.json({ success: true })
}

// DELETE — remove a testimonial
export async function DELETE(req) {
  const deny = await requireAdmin()
  if (deny) return deny
  const { id } = await req.json()
  const raw = await redisGet('af:testimonials')
  const all = parse(raw).filter(t => t.id !== id)
  await redisPipeline([['SET', 'af:testimonials', JSON.stringify(all)]])
  return NextResponse.json({ success: true })
}
