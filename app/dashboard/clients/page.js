import ClientsClient from './ClientsClient'

export const dynamic = 'force-dynamic'

export default function ClientsPage({ searchParams }) {
  const error = searchParams?.error
  return <ClientsClient error={error} />
}
