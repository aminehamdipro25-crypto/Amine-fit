import fs from 'fs/promises'
import path from 'path'

const KEY = 'amine_fit_submissions'

function getCfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return (url && token) ? { url: url.replace(/\/$/, ''), token } : null
}

async function redisPipeline(cfg, commands) {
  const res = await fetch(cfg.url + '/pipeline', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Redis HTTP ${res.status}: ${txt}`)
  }
  const data = await res.json()
  // Surface command-level errors (HTTP 200 but Redis returned an error)
  for (const item of data) {
    if (item?.error) throw new Error(`Redis cmd error: ${item.error}`)
  }
  return data
}

async function redisGet(cfg) {
  try {
    const results = await redisPipeline(cfg, [['GET', KEY]])
    const raw = results[0]?.result
    if (!raw) return []
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.error('[redis get error]', e.message)
    return []
  }
}

async function redisSet(cfg, list) {
  await redisPipeline(cfg, [['SET', KEY, JSON.stringify(list)]])
}

// /tmp fallback for local dev
const TMP = path.join('/tmp', 'submissions.json')
async function readTmp()      { try { return JSON.parse(await fs.readFile(TMP, 'utf-8')) } catch { return [] } }
async function writeTmp(list) { await fs.writeFile(TMP, JSON.stringify(list, null, 2)) }

export async function getSubmissions() {
  const cfg = getCfg()
  console.log('[getSubmissions] storage:', cfg ? 'redis' : 'tmp')
  if (cfg) return redisGet(cfg)
  return readTmp()
}

export async function saveSubmission(data) {
  const cfg  = getCfg()
  console.log('[saveSubmission] storage:', cfg ? 'redis' : 'tmp')
  const list = await getSubmissions()
  const entry = { id: `AF-${Date.now()}`, createdAt: new Date().toISOString(), status: 'new', ...data }
  list.unshift(entry)
  if (cfg) await redisSet(cfg, list)
  else     await writeTmp(list)
  console.log('[saveSubmission] saved id:', entry.id, 'total:', list.length)
  return entry
}

export async function updateStatus(id, status) {
  const list = await getSubmissions()
  const idx  = list.findIndex(s => s.id === id)
  if (idx === -1) return null
  list[idx].status = status
  const cfg = getCfg()
  if (cfg) await redisSet(cfg, list)
  else     await writeTmp(list)
  return list[idx]
}

export async function deleteSubmission(id) {
  const list     = await getSubmissions()
  const filtered = list.filter(s => s.id !== id)
  if (filtered.length === list.length) return false
  const cfg = getCfg()
  if (cfg) await redisSet(cfg, filtered)
  else     await writeTmp(filtered)
  return true
}
