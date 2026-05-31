import { getSubmissions } from '@/lib/submissions'
import ClientsClient from './ClientsClient'

export const dynamic = 'force-dynamic'

export default async function ClientsPage({ searchParams }) {
  const submissions = await getSubmissions()
  const error = searchParams?.error
  return <ClientsClient submissions={submissions} error={error} />
}
