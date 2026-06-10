import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { getSubmissionById, updateSubmission } from '@/lib/submissions'

export const dynamic = 'force-dynamic'

const ALLOWED = ['nutrition', 'training', 'calcPlan']

export async function DELETE(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny
  const { id } = await params
  const { field } = await req.json()
  if (!ALLOWED.includes(field)) {
    return NextResponse.json({ error: 'حقل غير مسموح' }, { status: 400 })
  }
  const client = await getSubmissionById(id)
  if (!client) return NextResponse.json({ error: 'not found' }, { status: 404 })

  if (field === 'calcPlan') {
    await updateSubmission(id, { nutritionCalcPlan: null })
  } else {
    const plan = { ...(client.plan || {}), [field]: null }
    await updateSubmission(id, { plan })
  }
  return NextResponse.json({ ok: true })
}
