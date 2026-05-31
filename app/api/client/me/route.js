import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/clientAuth'
import { getSubmissionById } from '@/lib/submissions'

export const dynamic = 'force-dynamic'

export async function GET() {
  const token = cookies().get('client_token')?.value
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const client = await getSubmissionById(payload.id)
  if (!client) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })
  if (client.status === 'suspended') {
    return NextResponse.json({ error: 'تم تعليق حسابك، تواصل مع المدرب' }, { status: 403 })
  }

  const { clientPassword, activationCode, ...safe } = client
  return NextResponse.json(safe)
}
