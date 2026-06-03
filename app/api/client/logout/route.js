import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { deleteClientSession } from '@/lib/clientSession'
import crypto from 'crypto'

function getSecret() {
  return process.env.AUTH_SECRET || ''
}

// Verify HMAC signature without Redis (allows logout even if session was revoked)
function extractIdSafe(token) {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 2) return null
    const [data, sig] = parts
    const SECRET = getSecret()
    if (!SECRET) return null
    const expectedSig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
    const sigBuf = Buffer.from(sig, 'base64url')
    const expBuf = Buffer.from(expectedSig, 'base64url')
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString())
    return payload?.id ?? null
  } catch { return null }
}

export async function POST() {
  const token = cookies().get('client_token')?.value
  const clientId = extractIdSafe(token)
  if (clientId) await deleteClientSession(clientId).catch(() => {})

  const res = NextResponse.json({ success: true })
  res.cookies.set('client_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })
  return res
}
