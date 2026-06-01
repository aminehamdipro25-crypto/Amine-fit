import { NextResponse } from 'next/server'
import { getSubmissions } from '@/lib/submissions'
import { requireAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const deny = await requireAdmin()
  if (deny) return deny

  const clients = await getSubmissions()
  const notifications = []

  // New unreviewed clients
  const newClients = clients.filter(c => c.status === 'new')
  for (const c of newClients.slice(0, 5)) {
    notifications.push({
      type: 'new_client',
      title: `عميل جديد: ${c.name}`,
      body: `سجّل بتاريخ ${new Date(c.createdAt).toLocaleDateString('ar-DZ')}`,
      href: '/dashboard/clients',
      read: false,
    })
  }

  // Active clients without a plan
  const noPlan = clients.filter(c =>
    c.status === 'active' &&
    !c.plan?.nutrition?.calories &&
    !c.plan?.training?.daysPerWeek
  )
  for (const c of noPlan.slice(0, 5)) {
    notifications.push({
      type: 'no_plan',
      title: `${c.name} بدون خطة بعد`,
      body: 'العميل نشط ولكن لم تُبنَ له خطة بعد',
      href: `/dashboard/clients/${c.id}/plan`,
      read: false,
    })
  }

  return NextResponse.json({ notifications, count: notifications.length })
}
