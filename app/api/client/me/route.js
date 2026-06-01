import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/clientAuth'
import { getSubmissionById, updateSubmission } from '@/lib/submissions'
import { deleteClientSession } from '@/lib/clientSession'

export const dynamic = 'force-dynamic'

export async function GET() {
  const token = cookies().get('client_token')?.value
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const client = await getSubmissionById(payload.id)
  if (!client) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })

  // Auto-suspend on subscription expiry
  if (
    client.subscriptionEndDate &&
    new Date(client.subscriptionEndDate).getTime() < Date.now() &&
    client.status === 'active'
  ) {
    await updateSubmission(payload.id, { status: 'suspended' })
    await deleteClientSession(payload.id).catch(() => {})
    return NextResponse.json({ error: 'انتهت مدة اشتراكك. تواصل مع المدرب للتجديد.' }, { status: 403 })
  }

  if (client.status === 'suspended') {
    return NextResponse.json({ error: 'تم تعليق حسابك، تواصل مع المدرب' }, { status: 403 })
  }

  const { clientPassword, activationCode, emailOTP, emailOTPExpiry, ...safe } = client
  return NextResponse.json(safe)
}
