import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/clientAuth'
import { getSubmissionById } from '@/lib/submissions'

export const dynamic = 'force-dynamic'

export async function GET() {
  const token   = cookies().get('client_token')?.value
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const client = await getSubmissionById(payload.id)
  if (!client) return NextResponse.json({ error: 'لم يُعثر على البيانات' }, { status: 404 })

  const { clientPassword, activationCode, emailOTP, emailOTPExpiry, ...safe } = client

  const filename = `amine-fit-${safe.name?.replace(/\s+/g, '-') || safe.id}-${new Date().toISOString().slice(0, 10)}.json`

  return new NextResponse(JSON.stringify(safe, null, 2), {
    status: 200,
    headers: {
      'Content-Type':        'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
