import { NextResponse } from 'next/server'

// Edge-compatible HMAC-SHA256 token verification (no Node.js crypto)
async function verifyClientToken(token) {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 2) return false
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
    // Decode base64url signature
    const b64 = sig.replace(/-/g, '+').replace(/_/g, '/').padEnd(sig.length + (4 - sig.length % 4) % 4, '=')
    const sigBuf = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
    const dataBuf = new TextEncoder().encode(data)
    const valid = await crypto.subtle.verify('HMAC', keyMaterial, sigBuf, dataBuf)
    if (!valid) return false
    // Check expiration
    const payload = JSON.parse(atob(data.replace(/-/g, '+').replace(/_/g, '/')))
    return payload.exp > Date.now()
  } catch {
    return false
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

  // Protect client portal — verify token signature + expiry
  if (pathname.startsWith('/client') && pathname !== '/client/login' && pathname !== '/client' && pathname !== '/client/demo') {
    const token = request.cookies.get('client_token')?.value
    const valid = await verifyClientToken(token)
    if (!valid) {
      const res = NextResponse.redirect(new URL('/client/login', request.url))
      // Clear invalid/expired token
      res.cookies.set('client_token', '', { maxAge: 0, path: '/' })
      return res
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/client/:path*'],
}
