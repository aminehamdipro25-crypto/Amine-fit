import { getSubmissions } from '@/lib/submissions'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  let submissions = []
  try { submissions = await getSubmissions() } catch {}
  return <DashboardClient submissions={submissions} />
}
