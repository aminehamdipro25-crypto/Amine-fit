import { NextResponse } from 'next/server'
import { getSubmissions, updateSubmission } from '@/lib/submissions'
import { deleteClientSession } from '@/lib/clientSession'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error('[cron] CRON_SECRET not set — endpoint disabled')
    return NextResponse.json({ error: 'not configured' }, { status: 503 })
  }
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const clients = await getSubmissions()
  const now = Date.now()
  let suspended = 0
  let paymentExpired = 0

  for (const client of clients) {
    // Expire active subscriptions past end date
    if (
      client.subscriptionEndDate &&
      new Date(client.subscriptionEndDate).getTime() < now &&
      client.status === 'active'
    ) {
      await updateSubmission(client.id, { status: 'suspended', suspendedAt: new Date().toISOString() })
      await deleteClientSession(client.id).catch(() => {})
      suspended++
      continue
    }

    // Expire pending clients who missed payment deadline
    if (
      client.status === 'pending' &&
      client.paymentDeadline &&
      new Date(client.paymentDeadline).getTime() < now
    ) {
      await updateSubmission(client.id, { status: 'payment_expired', paymentExpiredAt: new Date().toISOString() })
      paymentExpired++
    }
  }

  return NextResponse.json({
    ok: true,
    suspended,
    paymentExpired,
    checked: clients.length,
    ts: new Date().toISOString(),
  })
}
