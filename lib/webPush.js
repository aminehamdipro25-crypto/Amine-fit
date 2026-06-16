import webpush from 'web-push'

const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY  || 'BHw8JC1-qFbe4i3Le9oYWj_LVbFYft2X-sYncZd9dqykHcxNkuE7njWyjMzoafvCgdcN8GpJcbnj5hCF-RPcVzU'
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || 'CT1DLvKMlcoV-wPENOrZXbttBe3Z0CaC8LPK9h64cW8'

webpush.setVapidDetails('mailto:amine.hamdi.pro25@gmail.com', VAPID_PUBLIC, VAPID_PRIVATE)

export function getPublicKey() {
  return VAPID_PUBLIC
}

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

async function redisDel(key) {
  const c = redisCfg()
  if (!c) return
  try {
    await fetch(`${c.url}/pipeline`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify([['DEL', key]]),
      cache:   'no-store',
    })
  } catch {}
}

/**
 * Send a push notification to a client.
 * Returns true on success, false if no subscription or on any error.
 * Never throws.
 */
export async function sendPushToClient(clientId, title, body, url = '/client/messages') {
  try {
    const raw = await redisGet(`push_sub:${clientId}`)
    if (!raw) return false

    const subscription = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!subscription?.endpoint) return false

    const payload = JSON.stringify({ title, body, url })

    try {
      await webpush.sendNotification(subscription, payload)
      return true
    } catch (err) {
      // 410 Gone — subscription expired or unregistered
      if (err.statusCode === 410) {
        await redisDel(`push_sub:${clientId}`)
      }
      return false
    }
  } catch {
    return false
  }
}
