import { getSubmissions } from '@/lib/submissions'
import ClientsClient from './ClientsClient'

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
  const submissions = await getSubmissions()
  return <ClientsClient submissions={submissions} />
}
