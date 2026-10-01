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
const LOCK_PFX    = 'sub:lock:'
const LOCK_TTL_MS = 5000
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

// ── Per-record write lock ─────────────────────────────────────────────────────
// Serialises concurrent writers to the SAME client record so a read-modify-write
// cannot clobber another writer's change (e.g. the cron suspending a client while
// the client logs a workout). Short TTL + best-effort: if the lock can't be taken
// we still proceed (never worse than the previous lock-free behaviour).
async function acquireLock(cfg, id) {
  const token = crypto.randomBytes(8).toString('hex')
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const [res] = await redisPipeline(cfg, [['SET', LOCK_PFX + id, token, 'NX', 'PX', String(LOCK_TTL_MS)]])
      if (res?.result === 'OK') return token
    } catch { return null }
    await new Promise(r => setTimeout(r, 40 + Math.floor(Math.random() * 120)))
  }
  return null
}

async function releaseLock(cfg, id, token) {
  if (!token) return
  // Atomic check-and-delete so we never release a lock another writer now holds.
  const script = "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end"
  try { await redisPipeline(cfg, [['EVAL', script, '1', LOCK_PFX + id, token]]) } catch {}
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

// Update a client record. `fieldsOrFn` is either a plain patch object, OR a
// function (current) => patch. The function form runs against the FRESHLY-read
// record under the write lock, so read-modify-write (appending to an array,
// flipping read flags) is safe against concurrent writers. Return null/undefined
// from the function to make no change.
export async function updateSubmission(id, fieldsOrFn) {
  const cfg = getCfg()
  const applyPatch = (current) => (typeof fieldsOrFn === 'function' ? fieldsOrFn(current) : fieldsOrFn)

  if (!cfg) {
    const list = await readTmp()
    const idx  = list.findIndex(s => s.id === id)
    if (idx === -1) return null
    const patch = applyPatch(list[idx])
    if (patch == null) return list[idx]
    list[idx] = { ...list[idx], ...patch }
    await writeTmp(list)
    return list[idx]
  }
  try {
    await migrateIfNeeded(cfg)
    const token = await acquireLock(cfg, id)
    try {
      const current = await getSubmissionById(id)
      if (!current) return null
      const patch = applyPatch(current)
      if (patch == null) return current
      const updated = { ...current, ...patch }
      await redisPipeline(cfg, [['SET', SUB_PFX + id, JSON.stringify(updated)]])
      return updated
    } finally {
      await releaseLock(cfg, id, token)
    }
  } catch (e) {
    console.error('[updateSubmission] error:', e.message)
    return null
  }
}

export async function updateStatus(id, status) {
  return updateSubmission(id, { status })
}

// Change a client's email — email is an INDEXED key (sub:email:{email} → id), so a
// plain field update would leave the index pointing at the old address and break
// login/activation. This re-indexes atomically: claim the new email with SET NX
// (rejects if another client already owns it), then rewrite the record and drop the
// old index. Returns { ok, client } or { ok:false, error }.
export async function changeClientEmail(id, newEmailRaw) {
  const newEmail = String(newEmailRaw || '').toLowerCase().trim()
  if (!newEmail || newEmail.length > 254 ||
      !/^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/.test(newEmail)) {
    return { ok: false, error: 'invalid_email' }
  }

  const cfg = getCfg()
  if (!cfg) {
    const list = await readTmp()
    const idx  = list.findIndex(s => s.id === id)
    if (idx === -1) return { ok: false, error: 'not_found' }
    if (list.some(s => s.email?.toLowerCase().trim() === newEmail && s.id !== id)) {
      return { ok: false, error: 'email_taken' }
    }
    list[idx] = { ...list[idx], email: newEmail }
    await writeTmp(list)
    return { ok: true, client: list[idx] }
  }

  try {
    await migrateIfNeeded(cfg)
    const current = await getSubmissionById(id)
    if (!current) return { ok: false, error: 'not_found' }
    const oldEmail = current.email?.toLowerCase().trim()
    if (oldEmail === newEmail) return { ok: true, client: current } // no-op

    // Atomically claim the new email index — fails if another client owns it
    const [claim] = await redisPipeline(cfg, [['SET', EMAIL_PFX + newEmail, id, 'NX']])
    if (claim?.result === null) return { ok: false, error: 'email_taken' }

    // Rewrite the record with the new email, then drop the stale index
    const updated = { ...current, email: newEmail }
    const cmds = [['SET', SUB_PFX + id, JSON.stringify(updated)]]
    if (oldEmail) cmds.push(['DEL', EMAIL_PFX + oldEmail])
    await redisPipeline(cfg, cmds)
    return { ok: true, client: updated }
  } catch (e) {
    console.error('[changeClientEmail] error:', e.message)
    return { ok: false, error: 'server_error' }
  }
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
