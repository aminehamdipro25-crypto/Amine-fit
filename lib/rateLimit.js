function cfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}

async function pipeline(c, commands) {
  const res = await fetch(`${c.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
    cache: 'no-store',
  })
  return res.json()
}

/**
 * Returns true if the key has exceeded maxRequests within windowSeconds.
 * Safe to call even if Redis is unavailable (returns false = allow).
 */
export async function isRateLimited(key, maxRequests, windowSeconds) {
  const c = cfg()
  if (!c) return false
  try {
    const redisKey = `rl:${key}`
    const results  = await pipeline(c, [
      ['INCR', redisKey],
      ['EXPIRE', redisKey, String(windowSeconds)],
    ])
    const count = results[0]?.result ?? 0
    return count > maxRequests
  } catch { return false }
}
