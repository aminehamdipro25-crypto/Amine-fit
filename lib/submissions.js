// Upstash Redis via direct REST API (no SDK) — works in all Next.js runtimes
import fs from 'fs/promises'
import path from 'path'

const KEY = 'amine_fit_submissions'

function getConfig() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return (url && token) ? { url, token } : null
}

async function redisGet(cfg) {
  const res = await fetch(`${cfg.url}/get/${KEY}`, {
    headers: { Authorization: `Bearer ${cfg.token}` },
    cache: 'no-store',
  })
  const json = await res.json()
  if (!json.result) return []
  const parsed = typeof json.result === 'string' ? JSON.parse(json.result) : json.result
  return Array.isArray(parsed) ? parsed : []
}

async function redisSet(cfg, list) {
  await fetch(`${cfg.url}/set/${KEY}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(JSON.stringify(list)),
    cache: 'no-store',
  })
}

// /tmp fallback for local dev
const TMP = path.join('/tmp', 'submissions.json')
async function readTmp()      { try { return JSON.parse(await fs.readFile(TMP, 'utf-8')) } catch { return [] } }
async function writeTmp(list) { await fs.writeFile(TMP, JSON.stringify(list, null, 2)) }

export async function getSubmissions() {
  const cfg = getConfig()
  if (cfg) return redisGet(cfg)
  return readTmp()
}

export async function saveSubmission(data) {
  const list  = await getSubmissions()
  const entry = { id: `AF-${Date.now()}`, createdAt: new Date().toISOString(), status: 'new', ...data }
  list.unshift(entry)
  const cfg = getConfig()
  if (cfg) await redisSet(cfg, list)
  else     await writeTmp(list)
  return entry
}

export async function updateStatus(id, status) {
  const list = await getSubmissions()
  const idx  = list.findIndex(s => s.id === id)
  if (idx === -1) return null
  list[idx].status = status
  const cfg = getConfig()
  if (cfg) await redisSet(cfg, list)
  else     await writeTmp(list)
  return list[idx]
}
