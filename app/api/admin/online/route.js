import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { getSubmissions } from '@/lib/submissions'
import { getClientOnlineInfo } from '@/lib/clientSession'

export const dynamic = 'force-dynamic'

export async function GET() {
  const deny = await requireAdmin()
  if (deny) return deny

  const clients = await getSubmissions()

  // Only query active/reviewed clients to avoid Redis overload
  const relevant = clients.filter(c => ['active', 'reviewed', 'pending'].includes(c.status))

  const infos = await Promise.all(
    relevant.map(async c => ({
      id: c.id,
      ...(await getClientOnlineInfo(c.id)),
    }))
  )

  const online = {}
  for (const { id, lastSeen, loginTime } of infos) {
    online[id] = { lastSeen, loginTime }
  }

  return NextResponse.json({ online })
}
