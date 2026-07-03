import crypto from 'crypto'

function cfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}

async function redisCmd(c, ...parts) {
  const res = await fetch(`${c.url}/${parts.map(encodeURIComponent).join('/')}`, {
    headers: { Authorization: `Bearer ${c.token}` },
    cache: 'no-store',
  })
  return (await res.json()).result
}

const SESSION_TTL = 8 * 60 * 60 // 8 hours — matches cookie maxAge to prevent orphaned tokens

export async function createAdminSession() {
  const token = crypto.randomBytes(32).toString('base64url')
  const c = cfg()
  if (c) await redisCmd(c, 'SET', `admin_sess:${token}`, '1', 'EX', String(SESSION_TTL))
  return token
}

export async function verifyAdminSession(token) {
  if (!token || token.length < 20) return false
  const c = cfg()
  if (!c) return false
  try {
    return await redisCmd(c, 'GET', `admin_sess:${token}`) === '1'
  } catch { return false }
}

export async function deleteAdminSession(token) {
  if (!token) return
  const c = cfg()
  if (c) try { await redisCmd(c, 'DEL', `admin_sess:${token}`) } catch {}
}
