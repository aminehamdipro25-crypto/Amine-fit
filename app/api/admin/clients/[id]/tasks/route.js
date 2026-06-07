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
  try { let v = raw; if (typeof v === 'string') v = JSON.parse(v); if (typeof v === 'string') v = JSON.parse(v); return Array.isArray(v) ? v : [] } catch { return [] }
}

// GET — list tasks for a client
export async function GET(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny
  const raw = await redisGet(`client_tasks:${params.id}`)
  return NextResponse.json(parse(raw))
}

// POST — add a task for a client
export async function POST(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny
  const { text, emoji } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'النص مطلوب' }, { status: 400 })

  const raw = await redisGet(`client_tasks:${params.id}`)
  const tasks = parse(raw)
  if (tasks.length >= 10) return NextResponse.json({ error: 'الحد الأقصى 10 مهام' }, { status: 400 })

  const task = {
    id:        `task_${Date.now()}`,
    text:      text.trim().slice(0, 200),
    emoji:     emoji || '✅',
    createdAt: new Date().toISOString(),
  }
  tasks.push(task)
  await redisPipeline([['SET', `client_tasks:${params.id}`, JSON.stringify(tasks)]])
  return NextResponse.json({ success: true, task })
}

// DELETE — remove a task
export async function DELETE(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny
  const { id } = await req.json()
  const raw   = await redisGet(`client_tasks:${params.id}`)
  const tasks = parse(raw).filter(t => t.id !== id)
  await redisPipeline([['SET', `client_tasks:${params.id}`, JSON.stringify(tasks)]])
  return NextResponse.json({ success: true })
}
