import { getSubmissionById } from '@/lib/submissions'
import { redirect } from 'next/navigation'
import PlanBuilder from './PlanBuilder'

export const dynamic = 'force-dynamic'

export default async function ClientPlanPage({ params }) {
  const client = await getSubmissionById(params.id)
  if (!client) redirect('/dashboard/clients?error=not_found')
  return <PlanBuilder client={client} />
}
