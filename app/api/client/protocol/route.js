import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/clientAuth'
import { getSubmissionById } from '@/lib/submissions'

export const dynamic = 'force-dynamic'

export async function GET() {
  const token   = cookies().get('client_token')?.value
  const payload = await verifyToken(token)
  if (!payload?.id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const client = await getSubmissionById(payload.id)
  if (!client) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const protocol = client.labProtocol || null
  // Only expose if active
  if (!protocol || !protocol.active) {
    return NextResponse.json({ protocol: null })
  }

  return NextResponse.json({ protocol })
}
