import { getSubmissionById } from '@/lib/submissions'
import { notFound } from 'next/navigation'
import PlanBuilder from './PlanBuilder'

export default async function ClientPlanPage({ params }) {
  const client = await getSubmissionById(params.id)
  if (!client) notFound()
  return <PlanBuilder client={client} />
}
