import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const KEY = 'protocol_templates'

function redisCfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}

async function redisGet(key) {
  const c = redisCfg()
  if (!c) return null
  const res = await fetch(`${c.url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${c.token}` }, cache: 'no-store',
  })
  return (await res.json()).result ?? null
}

async function redisSet(key, value) {
  const c = redisCfg()
  if (!c) return
  await fetch(`${c.url}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
    cache: 'no-store',
  })
}

async function getTemplates() {
  const raw = await redisGet(KEY)
  if (!raw) return []
  try {
    const v = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(v) ? v : []
  } catch { return [] }
}

async function saveTemplates(list) {
  await redisSet(KEY, JSON.stringify(list))
}

export async function GET() {
  const deny = await requireAdmin()
  if (deny) return deny
  const templates = await getTemplates()
  return NextResponse.json({ templates })
}

export async function POST(req) {
  const deny = await requireAdmin()
  if (deny) return deny

  const { name, protocol } = await req.json()
  if (!name?.trim() || !protocol || typeof protocol !== 'object') {
    return NextResponse.json({ error: 'الاسم والبروتوكول مطلوبان' }, { status: 400 })
  }

  const templates = await getTemplates()
  const tpl = {
    id:        crypto.randomBytes(6).toString('hex'),
    name:      String(name).trim().slice(0, 80),
    protocol,
    createdAt: new Date().toISOString(),
  }
  templates.unshift(tpl)
  if (templates.length > 20) templates.splice(20)
  await saveTemplates(templates)

  return NextResponse.json({ ok: true, template: tpl })
}

export async function DELETE(req) {
  const deny = await requireAdmin()
  if (deny) return deny

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 })

  const templates = await getTemplates()
  const filtered  = templates.filter(t => t.id !== id)
  await saveTemplates(filtered)
  return NextResponse.json({ ok: true })
}
