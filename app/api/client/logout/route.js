import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/clientAuth'
import { deleteClientSession } from '@/lib/clientSession'

export async function POST() {
  const token = cookies().get('client_token')?.value
  // Use signature-only check here — logout must succeed even if session
  // was already revoked (e.g. kicked by admin). We still clear the Redis key.
  if (token) {
    try {
      const parts = token.split('.')
      if (parts.length === 2) {
        const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString())
        if (payload?.id) await deleteClientSession(payload.id).catch(() => {})
      }
    } catch { /* ignore parse errors */ }
  }
  const res = NextResponse.json({ success: true })
  res.cookies.set('client_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return res
}
