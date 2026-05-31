import { getSubmissions } from '@/lib/submissions'
import AnalyticsClient from './AnalyticsClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'الإحصائيات والتحليلات' }

export default async function AnalyticsPage() {
  const submissions = await getSubmissions()
  return <AnalyticsClient submissions={submissions} />
}
