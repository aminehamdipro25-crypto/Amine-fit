import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/clientAuth'
import { updateLastSeen, getClientSession, getPreviewSession } from '@/lib/clientSession'

export const dynamic = 'force-dynamic'

export async function POST() {
  const token   = cookies().get('client_token')?.value
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ ok: false }, { status: 401 })

  // Verify session is still active in Redis (catches kicked/force-logged-out clients)
  const stored = await getClientSession(payload.id)
  if (stored !== payload.sessionId) {
    const preview = await getPreviewSession(payload.id)
    if (preview !== payload.sessionId) {
      return NextResponse.json({ ok: false }, { status: 401 })
    }
  }

  await updateLastSeen(payload.id)
  return NextResponse.json({ ok: true })
}
