import { logger } from '@/lib/logger'

// Shared gift-code logic so both the public /api/gift route AND the internal
// registration flow use the exact same atomic redemption — no self-HTTP round
// trip, no dependency on CRON_SECRET being configured.

const GIFT_PREFIX      = 'gift_code:'
const GIFT_LOCK_PREFIX = 'gift_lock:'
const GIFT_TTL         = 60 * 24 * 60 * 60 // 60 days in seconds

function getCfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return (url && token) ? { url: url.replace(/\/$/, ''), token } : null
}

async function redisCmd(cfg, ...args) {
  const res = await fetch(`${cfg.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([args]),
    cache: 'no-store',
  })
  const data = await res.json()
  return data[0]?.result ?? null
}

function normCode(code) {
  return String(code || '').toUpperCase().trim()
}

// Validate a gift code (read-only). Returns { valid, ... } — never throws.
export async function validateGiftCode(code) {
  const upper = normCode(code)
  if (!upper || upper.length < 4 || upper.length > 12) {
    return { valid: false, reason: 'invalid' }
  }
  const cfg = getCfg()
  if (!cfg) return { valid: false, reason: 'unavailable' }

  const raw = await redisCmd(cfg, 'GET', GIFT_PREFIX + upper)
  if (!raw) return { valid: false, reason: 'invalid' }

  let gift
  try { gift = JSON.parse(typeof raw === 'string' ? raw : JSON.stringify(raw)) } catch (err) {
    logger.error('gift', 'Corrupted gift code data', { code: upper, err: err.message })
    return { valid: false, reason: 'invalid' }
  }
  if (gift.used) return { valid: false, reason: 'invalid' }

  return {
    valid:    true,
    plan:     gift.plan,
    planName: gift.planName,
    price:    gift.price,
    duration: gift.duration || 30,
    note:     gift.note || '',
  }
}

// Atomically redeem a gift code. SET ... NX guarantees only the first of any
// concurrent callers can win, closing the GET-then-SET race. Returns
// { ok, reason? }.
export async function redeemGiftCode(code, email) {
  const upper = normCode(code)
  const emailLower = String(email || '').toLowerCase().trim()
  if (!upper || !emailLower) return { ok: false, reason: 'invalid' }

  const cfg = getCfg()
  if (!cfg) return { ok: false, reason: 'unavailable' }

  const raw = await redisCmd(cfg, 'GET', GIFT_PREFIX + upper)
  if (!raw) return { ok: false, reason: 'not_found' }

  let gift
  try { gift = JSON.parse(typeof raw === 'string' ? raw : JSON.stringify(raw)) } catch (err) {
    logger.error('gift', 'Corrupted gift code data on redeem', { code: upper, err: err.message })
    return { ok: false, reason: 'corrupted' }
  }
  if (gift.used) return { ok: false, reason: 'already_used' }

  const lockAcquired = await redisCmd(
    cfg, 'SET', GIFT_LOCK_PREFIX + upper, emailLower, 'NX', 'EX', String(GIFT_TTL),
  )
  if (!lockAcquired) return { ok: false, reason: 'already_used' }

  const updated = JSON.stringify({ ...gift, used: true, usedBy: emailLower, usedAt: new Date().toISOString() })
  await redisCmd(cfg, 'SETEX', GIFT_PREFIX + upper, GIFT_TTL, updated)

  return { ok: true }
}

// Roll back a redemption — used when account creation fails AFTER redeeming,
// so the code becomes usable again instead of being permanently burned.
export async function releaseGiftCode(code) {
  const upper = normCode(code)
  if (!upper) return
  const cfg = getCfg()
  if (!cfg) return
  try {
    const raw = await redisCmd(cfg, 'GET', GIFT_PREFIX + upper)
    if (raw) {
      let gift
      try { gift = JSON.parse(typeof raw === 'string' ? raw : JSON.stringify(raw)) } catch { gift = null }
      if (gift) {
        const reverted = JSON.stringify({ ...gift, used: false, usedBy: null, usedAt: null })
        await redisCmd(cfg, 'SETEX', GIFT_PREFIX + upper, GIFT_TTL, reverted)
      }
    }
    await redisCmd(cfg, 'DEL', GIFT_LOCK_PREFIX + upper)
  } catch (err) {
    logger.error('gift', 'Failed to release gift code after rollback', { code: upper, err: err.message })
  }
}
