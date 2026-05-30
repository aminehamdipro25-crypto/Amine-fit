import fs from 'fs/promises'
import path from 'path'

const KEY = 'amine_fit_submissions'

function getCfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return (url && token) ? { url: url.replace(/\/$/, ''), token } : null
}

// Upstash Redis REST API — pipeline format (most reliable)
async function redisPipeline(cfg, commands) {
  const res = await fetch(cfg.url + '/pipeline', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  })
  return res.json()
}

async function redisGet(cfg) {
  try {
    const results = await redisPipeline(cfg, [['GET', KEY]])
    const raw = results[0]?.result
    if (!raw) return []
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.error('[redis get error]', e)
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
  if (cfg) return redisGet(cfg)
  return readTmp()
}

export async function saveSubmission(data) {
  const list  = await getSubmissions()
  const entry = { id: `AF-${Date.now()}`, createdAt: new Date().toISOString(), status: 'new', ...data }
  list.unshift(entry)
  const cfg = getCfg()
  if (cfg) await redisSet(cfg, list)
  else     await writeTmp(list)
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
