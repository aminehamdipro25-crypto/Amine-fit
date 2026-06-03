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

  // Subscriptions expiring within 7 days
  const now = Date.now()
  const expiringSoon = clients.filter(c => {
    if (!c.subscriptionEndDate) return false
    const msLeft = new Date(c.subscriptionEndDate).getTime() - now
    return msLeft > 0 && msLeft <= 7 * 24 * 60 * 60 * 1000
  })
  for (const c of expiringSoon.slice(0, 5)) {
    const daysLeft = Math.ceil((new Date(c.subscriptionEndDate).getTime() - now) / 86400000)
    notifications.push({
      type: 'expiring',
      title: `اشتراك ${c.name} ينتهي قريباً`,
      body: `متبقي ${daysLeft} ${daysLeft === 1 ? 'يوم' : 'أيام'} — تواصل معه للتجديد`,
      href: `/dashboard/clients/${c.id}`,
      read: false,
    })
  }

  // Subscriptions already expired (within last 3 days)
  const recentlyExpired = clients.filter(c => {
    if (!c.subscriptionEndDate) return false
    const msAgo = now - new Date(c.subscriptionEndDate).getTime()
    return msAgo > 0 && msAgo <= 3 * 24 * 60 * 60 * 1000
  })
  for (const c of recentlyExpired.slice(0, 3)) {
    notifications.push({
      type: 'expired',
      title: `انتهى اشتراك ${c.name}`,
      body: 'انتهى اشتراكه — يحتاج تجديداً',
      href: `/dashboard/clients/${c.id}`,
      read: false,
    })
  }

  return NextResponse.json({ notifications, count: notifications.length })
}
