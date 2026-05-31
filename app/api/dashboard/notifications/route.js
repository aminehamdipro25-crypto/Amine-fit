import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSubmissions } from '@/lib/submissions'

export const dynamic = 'force-dynamic'

export async function GET() {
  const adminToken = cookies().get('admin_token')?.value
  const correct = process.env.DASHBOARD_PASSWORD || 'amine2025'
  if (!adminToken || adminToken !== correct) {
    return NextResponse.json({ notifications: [] })
  }

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
