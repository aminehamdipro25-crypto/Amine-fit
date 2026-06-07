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

function today() {
  return new Date().toISOString().slice(0, 10)
}

async function getPayload() {
  const token = cookies().get('client_token')?.value
  return verifyToken(token)
}

// GET — tasks + today's completion status
export async function GET() {
  const payload = await getPayload()
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const [rawTasks, rawDone] = await Promise.all([
    redisGet(`client_tasks:${payload.id}`),
    redisGet(`task_done:${payload.id}:${today()}`),
  ])
  const tasks = parse(rawTasks)
  const done  = parse(rawDone)
  return NextResponse.json({ tasks, done, date: today() })
}

// POST — toggle a task as done/undone for today
export async function POST(req) {
  const payload = await getPayload()
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { taskId } = await req.json()
  const raw  = await redisGet(`task_done:${payload.id}:${today()}`)
  const done = parse(raw)

  const idx = done.indexOf(taskId)
  if (idx >= 0) done.splice(idx, 1)
  else done.push(taskId)

  // Keep task completion for 7 days (604800s)
  await redisPipeline([['SET', `task_done:${payload.id}:${today()}`, JSON.stringify(done), 'EX', 604800]])
  return NextResponse.json({ success: true, done })
}
