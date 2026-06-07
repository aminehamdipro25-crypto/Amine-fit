import { NextResponse } from 'next/server'
import { getSubmissions } from '@/lib/submissions'

export const dynamic = 'force-dynamic'

function redisCfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}

async function redisPipeline(commands) {
  const c = redisCfg()
  if (!c) return []
  try {
    const res = await fetch(`${c.url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(commands), cache: 'no-store',
    })
    return res.ok ? (await res.json()) : []
  } catch { return [] }
}

function parseObj(raw) {
  if (!raw) return {}
  try { let v = raw; if (typeof v === 'string') v = JSON.parse(v); if (typeof v === 'string') v = JSON.parse(v); return v && typeof v === 'object' ? v : {} } catch { return {} }
}

// Build a streak count from a training log object { date: true }
function computeStreak(log) {
  let streak = 0
  const now = new Date()
  for (let i = 0; i < 60; i++) {
    const d = new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10)
    if (log[d]) streak++
    else if (i > 0) break
  }
  return streak
}

// Public leaderboard — top 10 clients by training streak, name anonymized
export async function GET() {
  const clients = await getSubmissions()
  const active  = clients.filter(c => c.status === 'active' && c.subscriptionPlan)
  if (!active.length) return NextResponse.json([])

  // Batch-fetch training logs
  const cmds   = active.map(c => ['GET', `training_log:${c.id}`])
  const results = await redisPipeline(cmds)

  const board = active.map((c, i) => {
    const log    = parseObj(results[i]?.result)
    const streak = computeStreak(log)
    const days   = Object.keys(log).filter(d => log[d]).length
    // Anonymize: first name only, or initial if not sharing
    const displayName = c.name
      ? c.name.split(' ')[0].slice(0, 1) + '. ' + (c.name.split(' ')[1]?.[0] || '') + '.'
      : 'م.'
    return { displayName, streak, days, goal: c.goal }
  })

  // Sort by streak desc, then total days
  board.sort((a, b) => b.streak - a.streak || b.days - a.days)

  return NextResponse.json(board.slice(0, 10))
}
