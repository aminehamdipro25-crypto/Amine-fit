import { getSubmissions } from '@/lib/submissions'
import CheckinsBoard from './CheckinsBoard'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'تقارير المتابعة الأسبوعية' }

export default async function CheckinsPage() {
  let allClients = []
  try { allClients = await getSubmissions() } catch {}

  // Flatten all check-ins from all clients, attaching client info to each
  const flatCheckins = []
  for (const client of allClients) {
    if (!Array.isArray(client.checkins) || client.checkins.length === 0) continue
    for (const ci of client.checkins) {
      flatCheckins.push({
        ...ci,
        clientId:    client.id,
        clientName:  client.name || 'عميل',
        clientEmail: client.email || '',
      })
    }
  }

  // Sort newest first
  flatCheckins.sort((a, b) => new Date(b.date) - new Date(a.date))

  return <CheckinsBoard checkins={flatCheckins} />
}
