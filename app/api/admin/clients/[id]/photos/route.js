import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { getSubmissionById } from '@/lib/submissions'

export const dynamic = 'force-dynamic'

// GET — admin view of a client's photos
export async function GET(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny

  const client = await getSubmissionById(params.id)
  if (!client) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })

  return NextResponse.json(client.photos || [])
}
