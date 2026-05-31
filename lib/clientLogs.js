import fs from 'fs/promises'
import path from 'path'

const KEY = (id) => `amine_fit_logs_${id}`

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

function tmpPath(clientId) { return path.join('/tmp', `logs_${clientId}.json`) }
async function readTmp(clientId)       { try { return JSON.parse(await fs.readFile(tmpPath(clientId), 'utf-8')) } catch { return [] } }
async function writeTmp(clientId, arr) { await fs.writeFile(tmpPath(clientId), JSON.stringify(arr, null, 2)) }

async function readLogs(clientId) {
  const cfg = getCfg()
  if (!cfg) return readTmp(clientId)
  const results = await pipeline(cfg, [['GET', KEY(clientId)]])
  let raw = results[0]?.result
  if (raw === null || raw === undefined || raw === '') return []
  if (typeof raw === 'string') raw = JSON.parse(raw)
  if (typeof raw === 'string') raw = JSON.parse(raw)
  return Array.isArray(raw) ? raw : []
}

async function writeLogs(clientId, logs) {
  const cfg = getCfg()
  if (cfg) { await pipeline(cfg, [['SET', KEY(clientId), JSON.stringify(logs)]]) }
  else      { await writeTmp(clientId, logs) }
}

export async function getClientLogs(clientId) {
  return readLogs(clientId)
}

export async function upsertDayLog(clientId, date, fields) {
  const logs = await readLogs(clientId)
  const idx  = logs.findIndex(l => l.date === date)
  const blank = { date, water: 0, waterGoal: 8, notes: '', mood: '', weight: '' }
  if (idx === -1) {
    logs.push({ ...blank, ...fields })
  } else {
    logs[idx] = { ...logs[idx], ...fields }
  }
  await writeLogs(clientId, logs)
  return logs.find(l => l.date === date)
}

export async function getDayLog(clientId, date) {
  const logs = await readLogs(clientId)
  return logs.find(l => l.date === date) || { date, water: 0, waterGoal: 8, notes: '', mood: '', weight: '' }
}
