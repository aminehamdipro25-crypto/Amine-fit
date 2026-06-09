import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { updateSubmission } from '@/lib/submissions'

export const dynamic = 'force-dynamic'

export async function POST(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny
  const { id } = await params
  const { plan } = await req.json()
  if (!plan || typeof plan !== 'object') {
    return NextResponse.json({ error: 'plan required' }, { status: 400 })
  }
  const updated = await updateSubmission(id, {
    nutritionCalcPlan: { ...plan, savedAt: new Date().toISOString() },
  })
  if (!updated) return NextResponse.json({ error: 'client not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
