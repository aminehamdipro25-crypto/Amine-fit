import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

// Archived snapshots of a client's plan, kept in a dedicated Redis list so the
// live client record stays small. Newest-first, capped at MAX_VERSIONS.
//   planhist:{id} → list of JSON snapshots { id, archivedAt, kind, plan }

const KEY = (id) => `planhist:${String(id).replace(/[^a-zA-Z0-9_-]/g, '_')}`
const MAX_VERSIONS = 20

function getCfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return (url && token) ? { url: url.replace(/\/$/, ''), token } : null
}

async function pipeline(cfg, commands) {
  const res = await fetch(cfg.url + '/pipeline', {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Redis ${res.status}`)
  const data = await res.json()
  for (const item of data) if (item?.error) throw new Error(item.error)
  return data
}

function tmpPath(id) {
  return path.join('/tmp', `planhist_${String(id).replace(/[^a-zA-Z0-9_-]/g, '_')}.json`)
}
async function readTmp(id)      { try { return JSON.parse(await fs.readFile(tmpPath(id), 'utf-8')) } catch { return [] } }
async function writeTmp(id, arr){ await fs.writeFile(tmpPath(id), JSON.stringify(arr, null, 2)) }

function parseItem(raw) {
  try {
    let v = raw
    if (typeof v === 'string') v = JSON.parse(v)
    if (typeof v === 'string') v = JSON.parse(v)
    return v && typeof v === 'object' ? v : null
  } catch { return null }
}

// Compact summary so the UI can label a version without loading the whole plan.
function summarize(plan) {
  const n = plan?.nutrition
  const t = plan?.training
  return {
    calories:    n?.calories ? Number(n.calories) : null,
    mealsCount:  Array.isArray(n?.meals) ? n.meals.length : 0,
    trainingDays: Array.isArray(t?.days) ? t.days.length : 0,
  }
}

// Return the full history, newest first.
export async function getPlanHistory(id) {
  if (!id) return []
  const cfg = getCfg()
  if (!cfg) return readTmp(id)
  try {
    const [res] = await pipeline(cfg, [['LRANGE', KEY(id), '0', '-1']])
    return (res?.result ?? []).map(parseItem).filter(Boolean)
  } catch { return [] }
}

// Archive a snapshot of `plan`. Skips empty plans and exact duplicates of the
// most recent snapshot (so rapid double-saves don't spam the history).
export async function archivePlan(id, plan, kind = 'plan') {
  if (!id || !plan || typeof plan !== 'object') return
  const hasContent = plan.nutrition || plan.training
  if (!hasContent) return

  const snapshot = {
    id:         `${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`,
    archivedAt: new Date().toISOString(),
    kind,
    plan,
    summary:    summarize(plan),
  }
  const planJson = JSON.stringify(plan)

  const cfg = getCfg()
  if (!cfg) {
    const list = await readTmp(id)
    if (list[0] && JSON.stringify(list[0].plan) === planJson) return
    list.unshift(snapshot)
    await writeTmp(id, list.slice(0, MAX_VERSIONS))
    return
  }
  try {
    const [head] = await pipeline(cfg, [['LINDEX', KEY(id), '0']])
    const prev = parseItem(head?.result)
    if (prev && JSON.stringify(prev.plan) === planJson) return // unchanged — skip
    await pipeline(cfg, [
      ['LPUSH', KEY(id), JSON.stringify(snapshot)],
      ['LTRIM', KEY(id), '0', String(MAX_VERSIONS - 1)],
    ])
  } catch { /* archiving must never block the main save */ }
}

// Fetch one archived version's full plan by its snapshot id.
export async function getPlanVersion(id, versionId) {
  const history = await getPlanHistory(id)
  return history.find(v => v.id === versionId) || null
}
