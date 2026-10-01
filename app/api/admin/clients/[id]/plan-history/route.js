import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { getSubmissionById, updateSubmission } from '@/lib/submissions'
import { getPlanHistory, getPlanVersion, archivePlan } from '@/lib/planHistory'

export const dynamic = 'force-dynamic'

// GET — list archived plan versions (newest first)
export async function GET(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny
  const history = await getPlanHistory(params.id)
  return NextResponse.json({ history })
}

// POST { versionId } — restore an archived version as the client's current plan.
// The current plan is archived first, so a restore is itself reversible.
export async function POST(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny

  const { versionId } = await req.json().catch(() => ({}))
  if (!versionId) return NextResponse.json({ error: 'versionId مطلوب' }, { status: 400 })

  const version = await getPlanVersion(params.id, versionId)
  if (!version?.plan) return NextResponse.json({ error: 'النسخة غير موجودة' }, { status: 404 })

  const existing = await getSubmissionById(params.id)
  if (!existing) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })

  // Archive the current plan before replacing it, so restore is reversible.
  if (existing.plan) await archivePlan(params.id, existing.plan, existing.planUpdatedKind || 'plan').catch(() => {})

  const updated = await updateSubmission(params.id, {
    plan: version.plan,
    planUpdatedAt: new Date().toISOString(),
    planUpdatedKind: version.kind || 'both',
  })
  if (!updated) return NextResponse.json({ error: 'تعذّر الاسترجاع' }, { status: 500 })

  return NextResponse.json({ success: true })
}
