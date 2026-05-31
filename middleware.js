import { NextResponse } from 'next/server'

// Edge-compatible HMAC-SHA256 token verification (no Node.js crypto)
async function verifyClientToken(token) {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [data, sig] = parts
  try {
    const secret = process.env.AUTH_SECRET || 'amine-fit-client-secret-2025'
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    const b64 = sig.replace(/-/g, '+').replace(/_/g, '/').padEnd(sig.length + (4 - sig.length % 4) % 4, '=')
    const sigBuf = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
    const dataBuf = new TextEncoder().encode(data)
    const valid = await crypto.subtle.verify('HMAC', keyMaterial, sigBuf, dataBuf)
    if (!valid) return null
    const payload = JSON.parse(atob(data.replace(/-/g, '+').replace(/_/g, '/')))
    if (payload.exp <= Date.now()) return null
    return payload // { id, exp }
  } catch {
    return null
  }
}

// Check if client is suspended via Upstash REST API
async function isClientSuspended(clientId) {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token) return false
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/get/amine_fit_submissions`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return false
    const data = await res.json()
    let list = data.result
    if (list === null || list === undefined) return false
    if (typeof list === 'string') list = JSON.parse(list)
    if (typeof list === 'string') list = JSON.parse(list)
    if (!Array.isArray(list)) return false
    const client = list.find(s => s.id === clientId)
    return client?.status === 'suspended'
  } catch {
    return false // Don't block access if Redis is unreachable
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Protect coach dashboard
  if (pathname.startsWith('/dashboard') && pathname !== '/dashboard/login') {
    const token   = request.cookies.get('admin_token')?.value
    const correct = process.env.DASHBOARD_PASSWORD || 'amine2025'
    if (!token || token !== correct) {
      return NextResponse.redirect(new URL('/dashboard/login', request.url))
    }
  }

  // Protect client portal
  const clientExcluded = pathname === '/client/login' || pathname === '/client' || pathname === '/client/demo'
  if (pathname.startsWith('/client') && !clientExcluded) {
    const token   = request.cookies.get('client_token')?.value
    const payload = await verifyClientToken(token)

    if (!payload) {
      const res = NextResponse.redirect(new URL('/client/login', request.url))
      res.cookies.set('client_token', '', { maxAge: 0, path: '/' })
      return res
    }

    // Block suspended clients immediately, even with a valid token
    const suspended = await isClientSuspended(payload.id)
    if (suspended) {
      const res = NextResponse.redirect(
        new URL(`/client/login?suspended=1&msg=${encodeURIComponent('تم تعليق حسابك. تواصل مع المدرب أمين للاستفسار.')}`, request.url)
      )
      res.cookies.set('client_token', '', { maxAge: 0, path: '/' })
      return res
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/client/:path*'],
}
