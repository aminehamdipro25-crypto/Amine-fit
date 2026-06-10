import { requireAdmin } from '@/lib/adminAuth'
import { redirect } from 'next/navigation'
import { getSubmissions } from '@/lib/submissions'
import PlansClient from './PlansClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'إدارة الخطط — Amine-Fit' }

export default async function PlansPage() {
  const deny = await requireAdmin()
  if (deny) redirect('/dashboard/login')

  const all = await getSubmissions()
  const clients = all
    .filter(c => ['active', 'suspended'].includes(c.status))
    .map(c => ({
      id:              c.id,
      name:            c.name,
      email:           c.email,
      calcPlan:        c.nutritionCalcPlan
        ? { target: c.nutritionCalcPlan.target, duration: c.nutritionCalcPlan.duration, savedAt: c.nutritionCalcPlan.savedAt }
        : null,
      protocolNutrition: c.plan?.nutrition?.calories
        ? { calories: c.plan.nutrition.calories, meals: c.plan.nutrition.meals?.length ?? 0 }
        : null,
      training:        Array.isArray(c.plan?.training?.days) && c.plan.training.days.length > 0
        ? { daysPerWeek: c.plan.training.daysPerWeek, days: c.plan.training.days.length }
        : null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ar'))

  return <PlansClient clients={clients} />
}
