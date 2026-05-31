import { getSubmissions } from '@/lib/submissions'
import Link from 'next/link'
import { Users } from 'lucide-react'
import SubscribersClient from './SubscribersClient'

export const dynamic = 'force-dynamic'

export default async function SubscribersPage() {
  const all = await getSubmissions()
  const subscribers = all.filter(c => c.status === 'active')
  return <SubscribersClient subscribers={subscribers} />
}
