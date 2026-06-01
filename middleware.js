import { NextResponse } from 'next/server'

function redisCfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}

async function redisGet(key) {
  const c = redisCfg()
  if (!c) return null
  try {
    const res = await fetch(`${c.url}/${encodeURIComponent('GET')}/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${c.token}` },
      cache: 'no-store',
    })
    return (await res.json()).result
  } catch { return null }
}

// Verify client HMAC token — returns payload or null
async function verifyClientToken(token) {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [data, sig] = parts
  try {
    const secret = process.env.AUTH_SECRET
    if (!secret) return null  // fail closed — never use a fallback
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    )
    const b64 = sig.replace(/-/g, '+').replace(/_/g, '/').padEnd(sig.length + (4 - sig.length % 4) % 4, '=')
    const sigBuf  = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
    const dataBuf = new TextEncoder().encode(data)
    if (!await crypto.subtle.verify('HMAC', key, sigBuf, dataBuf)) return null
    const payload = JSON.parse(atob(data.replace(/-/g, '+').replace(/_/g, '/')))
    if (payload.exp <= Date.now()) return null
    // Enforce single session — compare sessionId against Redis
    if (!payload.sessionId) return null  // old token format → force re-login
    const storedSession = await redisGet(`client_sess:${payload.id}`)
    if (storedSession !== payload.sessionId) return null  // another device logged in → invalidate
    return payload
  } catch { return null }
}

// Check if admin session token is valid in Redis
async function verifyAdminSession(token) {
  if (!token || token.length < 20) return false
  try {
    return await redisGet(`admin_sess:${token}`) === '1'
  } catch { return false }
}

// Check if client is suspended
async function isClientSuspended(clientId) {
  const c = redisCfg()
  if (!c) return false
  try {
    const res = await fetch(`${c.url}/get/amine_fit_submissions`, {
      headers: { Authorization: `Bearer ${c.token}` },
      cache: 'no-store',
    })
    if (!res.ok) return false
    const data = await res.json()
    let list = data.result
    if (list === null || list === undefined) return false
    if (typeof list === 'string') list = JSON.parse(list)
    if (typeof list === 'string') list = JSON.parse(list)
    if (!Array.isArray(list)) return false
    return list.find(s => s.id === clientId)?.status === 'suspended'
  } catch { return false }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // ── Admin dashboard ──────────────────────────────────────────────────────
  if (pathname.startsWith('/dashboard') && pathname !== '/dashboard/login') {
    const token = request.cookies.get('admin_token')?.value
    const valid = await verifyAdminSession(token)
    if (!valid) return NextResponse.redirect(new URL('/dashboard/login', request.url))
  }

  // ── Client portal ────────────────────────────────────────────────────────
  const clientExcluded = pathname === '/client/login'
    || pathname === '/client'
    || pathname === '/client/demo'
  if (pathname.startsWith('/client') && !clientExcluded) {
    const token   = request.cookies.get('client_token')?.value
    const payload = await verifyClientToken(token)

    if (!payload) {
      const res = NextResponse.redirect(new URL('/client/login', request.url))
      res.cookies.set('client_token', '', { maxAge: 0, path: '/' })
      return res
    }

    const suspended = await isClientSuspended(payload.id)
    if (suspended) {
      const msg = encodeURIComponent('تم تعليق حسابك. تواصل مع المدرب أمين للاستفسار.')
      const res = NextResponse.redirect(new URL(`/client/login?suspended=1&msg=${msg}`, request.url))
      res.cookies.set('client_token', '', { maxAge: 0, path: '/' })
      return res
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/client/:path*'],
}
