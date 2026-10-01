import { NextResponse } from 'next/server'
import { updateSubmission, getSubmissionById } from '@/lib/submissions'
import { requireAdmin } from '@/lib/adminAuth'
import { hashPassword } from '@/lib/password'
import { isRateLimited } from '@/lib/rateLimit'
import { archivePlan } from '@/lib/planHistory'

export const dynamic = 'force-dynamic'

export async function GET(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny
  const client = await getSubmissionById(params.id)
  if (!client) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ plan: client.plan || null })
}

export async function PUT(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny
  try {
    const { plan } = await req.json()
    // Merge into the existing plan so saving one part (e.g. training from the
    // planner) never wipes another part (e.g. an already-saved nutrition plan).
    const existing = await getSubmissionById(params.id)
    if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 })
    // Snapshot the plan that is about to be replaced so the coach keeps a history
    // of previous versions (best-effort — never blocks the save).
    if (existing.plan) await archivePlan(params.id, existing.plan, existing.planUpdatedKind || 'plan').catch(() => {})
    const mergedPlan = { ...(existing.plan || {}), ...(plan || {}) }
    // Stamp the update so the client's portal can show a "your plan was updated"
    // notification — no more telling them manually.
    const keys = Object.keys(plan || {})
    const kind = keys.includes('training') && keys.includes('nutrition')
      ? 'both' : keys.includes('training') ? 'training' : keys.includes('nutrition') ? 'nutrition' : 'plan'
    const updated = await updateSubmission(params.id, {
      plan: mergedPlan,
      planUpdatedAt: new Date().toISOString(),
      planUpdatedKind: kind,
    })
    if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function PATCH(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny

  // Rate-limit admin password changes: max 10 per hour
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (await isRateLimited(`admin_pw_set:${ip}`, 10, 3600)) {
    return NextResponse.json({ error: 'محاولات كثيرة — حاول لاحقاً' }, { status: 429 })
  }

  try {
    const { clientPassword } = await req.json()
    if (!clientPassword || typeof clientPassword !== 'string' || clientPassword.length < 8) {
      return NextResponse.json({ error: 'كلمة المرور قصيرة جداً (8 أحرف على الأقل)' }, { status: 400 })
    }
    if (clientPassword.length > 200) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }
    const hashed = hashPassword(clientPassword.trim())
    const updated = await updateSubmission(params.id, { clientPassword: hashed })
    if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
