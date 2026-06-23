/**
 * Progressive lead capture — saves partial /register form data to Redis
 * as the user moves through the multi-step wizard, so a lead isn't lost
 * entirely if they abandon before the final submit.
 */
const TTL_SECONDS = 14 * 24 * 60 * 60 // 14 days
const DRAFT_PFX     = 'reg_draft:'
const NOTIFIED_PFX  = 'reg_draft_notified:'

function getCfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return (url && token) ? { url: url.replace(/\/$/, ''), token } : null
}

async function redisCommand(cfg, command) {
  const res = await fetch(cfg.url + '/pipeline', {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([command]),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Redis HTTP ${res.status}: ${await res.text()}`)
  const data = await res.json()
  if (data[0]?.error) throw new Error(`Redis cmd error: ${data[0].error}`)
  return data[0]?.result
}

export async function saveDraft(email, data) {
  const cfg = getCfg()
  if (!cfg) return false
  const payload = { ...data, email, updatedAt: new Date().toISOString() }
  await redisCommand(cfg, ['SET', DRAFT_PFX + email, JSON.stringify(payload), 'EX', String(TTL_SECONDS)])
  return true
}

export async function deleteDraft(email) {
  const cfg = getCfg()
  if (!cfg || !email) return
  await redisCommand(cfg, ['DEL', DRAFT_PFX + email]).catch(() => {})
}

export async function wasNotified(email) {
  const cfg = getCfg()
  if (!cfg) return false
  const raw = await redisCommand(cfg, ['GET', NOTIFIED_PFX + email])
  return !!raw
}

export async function markNotified(email) {
  const cfg = getCfg()
  if (!cfg) return
  await redisCommand(cfg, ['SET', NOTIFIED_PFX + email, '1', 'EX', String(TTL_SECONDS)]).catch(() => {})
}
