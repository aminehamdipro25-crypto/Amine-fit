import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { getSubmissionById } from '@/lib/submissions'

export const dynamic = 'force-dynamic'

export async function GET(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny

  const client = await getSubmissionById(params.id)
  if (!client) return NextResponse.json({ error: 'not found' }, { status: 404 })

  return NextResponse.json(client.checkins || [])
}
