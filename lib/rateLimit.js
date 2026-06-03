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
 * Fails CLOSED on Redis error — blocks requests rather than disabling protection.
 */
export async function isRateLimited(key, maxRequests, windowSeconds) {
  const c = cfg()
  if (!c) return true  // no Redis config → block to prevent auth bypass
  try {
    const redisKey = `rl:${key}`
    // SET NX EX initialises the key with TTL atomically before INCR
    const results = await pipeline(c, [
      ['SET', redisKey, '0', 'NX', 'EX', String(windowSeconds)],
      ['INCR', redisKey],
    ])
    const count = results[1]?.result ?? 0
    return count > maxRequests
  } catch (err) {
    console.error('[rateLimit] Redis failure — blocking request:', err.message)
    return true  // fail closed: block rather than disable protection
  }
}
