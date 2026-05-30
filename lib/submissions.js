// Uses Vercel KV (Redis) for persistent storage.
// Fallback to /tmp when KV env vars are not set (local dev).
import { createClient } from '@vercel/kv'
import fs from 'fs/promises'
import path from 'path'

const KV_KEY = 'amine_fit_submissions'

function getKV() {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  }
  return null
}

const TMP_FILE = path.join('/tmp', 'submissions.json')

async function readTmp() {
  try { return JSON.parse(await fs.readFile(TMP_FILE, 'utf-8')) } catch { return [] }
}
async function writeTmp(list) {
  await fs.writeFile(TMP_FILE, JSON.stringify(list, null, 2), 'utf-8')
}

export async function getSubmissions() {
  const kv = getKV()
  if (kv) {
    const list = await kv.get(KV_KEY)
    return Array.isArray(list) ? list : []
  }
  return readTmp()
}

export async function saveSubmission(data) {
  const list = await getSubmissions()
  const entry = {
    id: `AF-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'new',
    ...data,
  }
  list.unshift(entry)
  const kv = getKV()
  if (kv) {
    await kv.set(KV_KEY, list)
  } else {
    await writeTmp(list)
  }
  return entry
}

export async function updateStatus(id, status) {
  const list = await getSubmissions()
  const idx = list.findIndex(s => s.id === id)
  if (idx === -1) return null
  list[idx].status = status
  const kv = getKV()
  if (kv) {
    await kv.set(KV_KEY, list)
  } else {
    await writeTmp(list)
  }
  return list[idx]
}
