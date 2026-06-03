import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

// ── Key scheme (per-record storage — eliminates race conditions) ──────────────
// sub:{id}             → JSON of individual submission          (SET/GET, atomic)
// subs:index           → ordered list of IDs, newest first     (LPUSH/LRANGE)
// sub:email:{email}    → submission ID for O(1) email lookup   (SET NX/GET)
// amine_fit_submissions → LEGACY single-blob (auto-migrated on first access)

const LEGACY_KEY  = 'amine_fit_submissions'
const IDX_KEY     = 'subs:index'
const SUB_PFX     = 'sub:'
const EMAIL_PFX   = 'sub:email:'
const TMP         = path.join('/tmp', 'submissions.json')

function getCfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return (url && token) ? { url: url.replace(/\/$/, ''), token } : null
}

async function redisPipeline(cfg, commands) {
  const res = await fetch(cfg.url + '/pipeline', {
    method:  'POST',
    headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(commands),
    cache:   'no-store',
  })
  if (!res.ok) throw new Error(`Redis HTTP ${res.status}: ${await res.text()}`)
  const data = await res.json()
  for (const item of data) {
    if (item?.error) throw new Error(`Redis error: ${item.error}`)
  }
  return data
}

function parseEntry(raw) {
  if (!raw) return null
  try {
    let v = raw
    if (typeof v === 'string') v = JSON.parse(v)
    if (typeof v === 'string') v = JSON.parse(v)
    return v && typeof v === 'object' ? v : null
  } catch { return null }
}

// ── One-time lazy migration from legacy single-blob format ────────────────────
// Idempotent: checks LEGACY_KEY existence before doing any work.
// Module-level flag avoids redundant EXISTS checks within a single warm instance.
let _migrated = false

async function migrateIfNeeded(cfg) {
  if (_migrated) return

  const [existsResult] = await redisPipeline(cfg, [['EXISTS', LEGACY_KEY]])
  if (!existsResult?.result) { _migrated = true; return }

  const [rawResult] = await redisPipeline(cfg, [['GET', LEGACY_KEY]])
  const oldList = parseEntry(rawResult?.result)
  const entries = Array.isArray(oldList) ? oldList.filter(e => e?.id) : []

  if (entries.length) {
    // Write individual records + email index in batches to avoid request size limits
    const setCmds = []
    for (const e of entries) {
      setCmds.push(['SET', SUB_PFX + e.id, JSON.stringify(e)])
      if (e.email) setCmds.push(['SET', EMAIL_PFX + e.email.toLowerCase(), e.id])
    }
    for (let i = 0; i < setCmds.length; i += 50) {
      await redisPipeline(cfg, setCmds.slice(i, i + 50))
    }

    // Build index — entries[0] is newest; RPUSH appends in order → newest-first list
    const ids = entries.map(e => e.id)
    for (let i = 0; i < ids.length; i += 50) {
      await redisPipeline(cfg, [['RPUSH', IDX_KEY, ...ids.slice(i, i + 50)]])
    }
    console.log('[submissions] migrated', entries.length, 'records to per-key storage')
  }

  await redisPipeline(cfg, [['DEL', LEGACY_KEY]])
  _migrated = true
}

// ── /tmp fallback (local dev only) ───────────────────────────────────────────
async function readTmp()      { try { return JSON.parse(await fs.readFile(TMP, 'utf-8')) } catch { return [] } }
async function writeTmp(list) { await fs.writeFile(TMP, JSON.stringify(list, null, 2)) }

// ── Public API ────────────────────────────────────────────────────────────────

export async function getSubmissions() {
  const cfg = getCfg()
  if (!cfg) return readTmp()
  try {
    await migrateIfNeeded(cfg)
    const [idxResult] = await redisPipeline(cfg, [['LRANGE', IDX_KEY, '0', '-1']])
    const ids = idxResult?.result ?? []
    if (!ids.length) return []
    // Single round-trip: fetch all records at once
    const [mgetResult] = await redisPipeline(cfg, [['MGET', ...ids.map(id => SUB_PFX + id)]])
    const raws = mgetResult?.result ?? []
    return raws.map(parseEntry).filter(Boolean)
  } catch (e) {
    console.error('[getSubmissions] error:', e.message)
    return []
  }
}

export async function saveSubmission(data) {
  const cfg = getCfg()
  // Collision-free ID: timestamp base36 + 6 random hex chars
  const id    = `AF-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
  const entry = { id, createdAt: new Date().toISOString(), status: 'new', ...data }

  if (!cfg) {
    const list = await readTmp()
    list.unshift(entry)
    await writeTmp(list)
    return entry
  }

  await migrateIfNeeded(cfg)

  const email = data.email?.toLowerCase().trim()
  const cmds  = [
    ['SET', SUB_PFX + id, JSON.stringify(entry)],
    ['LPUSH', IDX_KEY, id],
  ]
  // SET NX on email key: atomic uniqueness guard
  if (email) cmds.push(['SET', EMAIL_PFX + email, id, 'NX'])

  const results = await redisPipeline(cfg, cmds)

  // If email SET NX returned null, another registration used this email first
  if (email) {
    const emailSetResult = results[2]?.result
    if (emailSetResult === null) {
      // Rollback: remove the submission we just wrote
      await redisPipeline(cfg, [
        ['DEL',  SUB_PFX + id],
        ['LREM', IDX_KEY, '0', id],
      ]).catch(() => {})
      const err = new Error('EMAIL_EXISTS')
      err.code  = 'EMAIL_EXISTS'
      throw err
    }
  }

  console.log('[saveSubmission] saved:', id)
  return entry
}

export async function getSubmissionById(id) {
  if (!id) return null
  const cfg = getCfg()
  if (!cfg) { return (await readTmp()).find(s => s.id === id) || null }
  try {
    await migrateIfNeeded(cfg)
    const [result] = await redisPipeline(cfg, [['GET', SUB_PFX + id]])
    return parseEntry(result?.result)
  } catch { return null }
}

export async function getSubmissionByEmail(email) {
  if (!email) return null
  const cfg    = getCfg()
  const normal = email.toLowerCase().trim()
  if (!cfg) { return (await readTmp()).find(s => s.email?.toLowerCase() === normal) || null }
  try {
    await migrateIfNeeded(cfg)
    const [idResult] = await redisPipeline(cfg, [['GET', EMAIL_PFX + normal]])
    const id = idResult?.result
    if (!id) return null
    return getSubmissionById(id)
  } catch { return null }
}

export async function updateSubmission(id, fields) {
  const cfg = getCfg()
  if (!cfg) {
    const list = await readTmp()
    const idx  = list.findIndex(s => s.id === id)
    if (idx === -1) return null
    list[idx] = { ...list[idx], ...fields }
    await writeTmp(list)
    return list[idx]
  }
  try {
    await migrateIfNeeded(cfg)
    const current = await getSubmissionById(id)
    if (!current) return null
    const updated = { ...current, ...fields }
    await redisPipeline(cfg, [['SET', SUB_PFX + id, JSON.stringify(updated)]])
    return updated
  } catch (e) {
    console.error('[updateSubmission] error:', e.message)
    return null
  }
}

export async function updateStatus(id, status) {
  return updateSubmission(id, { status })
}

export async function deleteSubmission(id) {
  const cfg = getCfg()
  if (!cfg) {
    const list = await readTmp()
    const filtered = list.filter(s => s.id !== id)
    if (filtered.length === list.length) return false
    await writeTmp(filtered)
    return true
  }
  try {
    await migrateIfNeeded(cfg)
    const entry = await getSubmissionById(id)
    if (!entry) return false
    const cmds = [
      ['LREM', IDX_KEY, '0', id],
      ['DEL',  SUB_PFX + id],
    ]
    if (entry.email) cmds.push(['DEL', EMAIL_PFX + entry.email.toLowerCase()])
    await redisPipeline(cfg, cmds)
    return true
  } catch { return false }
}
