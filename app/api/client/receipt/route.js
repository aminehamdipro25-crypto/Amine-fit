import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/clientAuth'

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
      headers: { Authorization: `Bearer ${c.token}` },
      cache: 'no-store',
    })
    const data = await res.json()
    return data.result
  } catch { return null }
}

async function redisSet(key, value) {
  const c = redisCfg()
  if (!c) throw new Error('Redis not configured')
  const res = await fetch(`${c.url}/pipeline`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify([['SET', key, JSON.stringify(value)]]),
    cache:   'no-store',
  })
  if (!res.ok) throw new Error(`Redis ${res.status}`)
}

export async function GET() {
  const token = cookies().get('client_token')?.value
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const raw = await redisGet(`payment_receipt:${payload.id}`)
  if (!raw) return NextResponse.json(null)
  try {
    let v = raw
    if (typeof v === 'string') v = JSON.parse(v)
    return NextResponse.json(v)
  } catch { return NextResponse.json(null) }
}

export async function POST(req) {
  const token = cookies().get('client_token')?.value
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  let body
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 }) }

  const { data, filename, mimeType } = body
  if (!data || typeof data !== 'string' || !data.startsWith('data:image/')) {
    return NextResponse.json({ error: 'ملف غير صالح — يجب أن يكون صورة' }, { status: 400 })
  }
  if (data.length > 5_500_000) {
    return NextResponse.json({ error: 'حجم الصورة كبير جداً (الحد الأقصى 4 ميغابايت)' }, { status: 400 })
  }

  const receipt = {
    data,
    filename:   String(filename || 'receipt.jpg').slice(0, 200),
    mimeType:   String(mimeType || 'image/jpeg'),
    uploadedAt: new Date().toISOString(),
    size:       data.length,
    clientId:   payload.id,
  }

  await redisSet(`payment_receipt:${payload.id}`, receipt)
  return NextResponse.json({ success: true, uploadedAt: receipt.uploadedAt })
}
