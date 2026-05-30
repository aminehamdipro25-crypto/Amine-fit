import { Redis } from '@upstash/redis'
import fs from 'fs/promises'
import path from 'path'

const KEY = 'amine_fit_submissions'

function getRedis() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (url && token) return new Redis({ url, token })
  return null
}

// Fallback for local dev
const TMP = path.join('/tmp', 'submissions.json')
async function readTmp()       { try { return JSON.parse(await fs.readFile(TMP, 'utf-8')) } catch { return [] } }
async function writeTmp(list)  { await fs.writeFile(TMP, JSON.stringify(list, null, 2)) }

export async function getSubmissions() {
  const r = getRedis()
  if (r) { const d = await r.get(KEY); return Array.isArray(d) ? d : [] }
  return readTmp()
}

export async function saveSubmission(data) {
  const list = await getSubmissions()
  const entry = { id: `AF-${Date.now()}`, createdAt: new Date().toISOString(), status: 'new', ...data }
  list.unshift(entry)
  const r = getRedis()
  if (r) await r.set(KEY, list)
  else    await writeTmp(list)
  return entry
}

export async function updateStatus(id, status) {
  const list = await getSubmissions()
  const idx  = list.findIndex(s => s.id === id)
  if (idx === -1) return null
  list[idx].status = status
  const r = getRedis()
  if (r) await r.set(KEY, list)
  else    await writeTmp(list)
  return list[idx]
}
