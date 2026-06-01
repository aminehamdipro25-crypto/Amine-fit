import crypto from 'crypto'

function cfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}

async function redisPipeline(commands) {
  const c = cfg()
  if (!c) return null
  const res = await fetch(`${c.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
    cache: 'no-store',
  })
  return res.json()
}

async function redisGet(key) {
  const c = cfg()
  if (!c) return null
  try {
    const res = await fetch(`${c.url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${c.token}` },
      cache: 'no-store',
    })
    return (await res.json()).result
  } catch { return null }
}

async function redisDel(key) {
  const c = cfg()
  if (!c) return
  await fetch(`${c.url}/del/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${c.token}` },
    cache: 'no-store',
  })
}

const SESSION_TTL  = 30 * 24 * 60 * 60  // 30 days
const LASTSEEN_TTL = 10 * 60             // 10 minutes (auto-expires when offline)

export async function createClientSession(clientId) {
  const sessionId  = crypto.randomBytes(16).toString('hex')
  const loginTime  = new Date().toISOString()
  await redisPipeline([
    ['SET', `client_sess:${clientId}`,       sessionId, 'EX', String(SESSION_TTL)],
    ['SET', `client_login_time:${clientId}`, loginTime, 'EX', String(SESSION_TTL)],
  ])
  return sessionId
}

export async function createPreviewSession(clientId) {
  const sessionId = crypto.randomBytes(16).toString('hex')
  await redisPipeline([
    ['SET', `client_preview:${clientId}`, sessionId, 'EX', '7200'],
  ])
  return sessionId
}

export async function getClientSession(clientId) {
  return redisGet(`client_sess:${clientId}`)
}

export async function getPreviewSession(clientId) {
  return redisGet(`client_preview:${clientId}`)
}

export async function deleteClientSession(clientId) {
  await redisPipeline([
    ['DEL', `client_sess:${clientId}`],
    ['DEL', `client_lastseen:${clientId}`],
    ['DEL', `client_login_time:${clientId}`],
  ])
}

export async function updateLastSeen(clientId) {
  await redisPipeline([
    ['SET', `client_lastseen:${clientId}`, new Date().toISOString(), 'EX', String(LASTSEEN_TTL)],
  ])
}

export async function getClientOnlineInfo(clientId) {
  const c = cfg()
  if (!c) return { lastSeen: null, loginTime: null }
  try {
    const results = await redisPipeline([
      ['GET', `client_lastseen:${clientId}`],
      ['GET', `client_login_time:${clientId}`],
    ])
    return {
      lastSeen:  results?.[0]?.result ?? null,
      loginTime: results?.[1]?.result ?? null,
    }
  } catch { return { lastSeen: null, loginTime: null } }
}
