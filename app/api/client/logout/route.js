import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/clientAuth'
import { deleteClientSession } from '@/lib/clientSession'

export async function POST() {
  const token = cookies().get('client_token')?.value
  const payload = verifyToken(token)
  if (payload?.id) {
    await deleteClientSession(payload.id).catch(() => {})
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
