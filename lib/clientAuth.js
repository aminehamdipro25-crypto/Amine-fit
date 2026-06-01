import crypto from 'crypto'

function getSecret() {
  const s = process.env.AUTH_SECRET
  if (!s) throw new Error('AUTH_SECRET env var is not set')
  return s
}

// ── Redis session helpers (mirrors middleware.js) ─────────────────────────────
function redisCfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}

async function redisGet(key) {
  const c = redisCfg()
  if (!c) return null
  try {
    const res = await fetch(`${c.url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${c.token}` },
      cache: 'no-store',
    })
    return (await res.json()).result
  } catch { return null }
}

// ── Token creation ─────────────────────────────────────────────────────────────
export function createToken(clientId, sessionId) {
  const SECRET = getSecret()
  const payload = { id: clientId, sessionId, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 }
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig  = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

// ── Signature + expiry check (no Redis) ───────────────────────────────────────
function verifySignature(token) {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [data, sig] = parts
  try {
    const SECRET = getSecret()
    const expectedSig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
    if (sig !== expectedSig) return null
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString())
    if (payload.exp < Date.now()) return null
    return payload
  } catch { return null }
}

// ── Full verification: signature + expiry + Redis session revocation ──────────
// All API routes that serve client data MUST use this (async).
export async function verifyToken(token) {
  const payload = verifySignature(token)
  if (!payload) return null
  if (!payload.sessionId) return null   // reject old token format

  // Session still active?
  const storedSession = await redisGet(`client_sess:${payload.id}`)
  if (storedSession === payload.sessionId) return payload

  // Admin preview token?
  const previewSession = await redisGet(`client_preview:${payload.id}`)
  if (previewSession === payload.sessionId) return payload

  return null  // session revoked (kicked / force-logged-out)
}
