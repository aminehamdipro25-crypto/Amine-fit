import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/clientAuth'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

function redisCfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}

function key(id, date) { return `food_log:${id}:${date}` }

async function redisGet(k) {
  const c = redisCfg()
  if (!c) return null
  try {
    const res = await fetch(`${c.url}/get/${encodeURIComponent(k)}`, {
      headers: { Authorization: `Bearer ${c.token}` }, cache: 'no-store',
    })
    return (await res.json()).result ?? null
  } catch { return null }
}

async function redisSet(k, value) {
  const c = redisCfg()
  if (!c) return
  await fetch(`${c.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([
      ['SET', k, JSON.stringify(value)],
      ['EXPIRE', k, String(180 * 24 * 3600)],
    ]),
    cache: 'no-store',
  })
}

function parseEntries(raw) {
  if (!raw) return []
  try { return JSON.parse(typeof raw === 'string' ? raw : JSON.stringify(raw)) || [] }
  catch { return [] }
}

async function auth() {
  const token   = cookies().get('client_token')?.value
  const payload = await verifyToken(token)
  return payload
}

export async function GET(req) {
  const payload = await auth()
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const date = new URL(req.url).searchParams.get('date')
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'تاريخ غير صالح' }, { status: 400 })
  }

  const entries = parseEntries(await redisGet(key(payload.id, date)))
  return NextResponse.json({ entries })
}

export async function POST(req) {
  const payload = await auth()
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const body = await req.json()
  const { date, meal, name, calories, protein, carbs, fat } = body

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'تاريخ غير صالح' }, { status: 400 })
  }
  if (!['breakfast','lunch','dinner','snack'].includes(meal)) {
    return NextResponse.json({ error: 'وجبة غير صالحة' }, { status: 400 })
  }
  if (!name?.trim() || !calories || isNaN(Number(calories))) {
    return NextResponse.json({ error: 'الاسم والسعرات مطلوبان' }, { status: 400 })
  }

  const k       = key(payload.id, date)
  const entries = parseEntries(await redisGet(k))

  const entry = {
    id:       crypto.randomBytes(6).toString('hex'),
    meal,
    name:     String(name).trim().slice(0, 100),
    calories: Math.round(Math.max(0, Math.min(5000, Number(calories)))),
    protein:  protein  ? Math.round(Math.max(0, Number(protein)))  : null,
    carbs:    carbs    ? Math.round(Math.max(0, Number(carbs)))    : null,
    fat:      fat      ? Math.round(Math.max(0, Number(fat)))      : null,
  }

  entries.push(entry)
  await redisSet(k, entries)
  return NextResponse.json({ ok: true, entry, entries })
}

export async function DELETE(req) {
  const payload = await auth()
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const sp   = new URL(req.url).searchParams
  const date = sp.get('date')
  const id   = sp.get('id')
  if (!date || !id) return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })

  const k       = key(payload.id, date)
  const entries = parseEntries(await redisGet(k)).filter(e => e.id !== id)
  await redisSet(k, entries)
  return NextResponse.json({ ok: true, entries })
}
