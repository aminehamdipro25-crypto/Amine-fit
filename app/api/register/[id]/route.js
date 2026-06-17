import { NextResponse } from 'next/server'
import { updateStatus, updateSubmission, deleteSubmission } from '@/lib/submissions'
import { requireAdmin } from '@/lib/adminAuth'
import { deleteClientSession } from '@/lib/clientSession'

export const dynamic = 'force-dynamic'

// Fields the admin is allowed to patch on a client profile
const EDITABLE_FIELDS = ['country', 'preferredFoods', 'dislikedFoods', 'weight', 'height', 'targetWeight', 'bodyFatPct']

export async function PATCH(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny
  try {
    const body = await req.json()

    // Legacy: status-only update
    if (body.status !== undefined && Object.keys(body).length === 1) {
      const allowed = ['new', 'active', 'reviewed', 'inactive', 'suspended']
      if (!allowed.includes(body.status)) return NextResponse.json({ error: 'قيمة غير صالحة' }, { status: 400 })
      const updated = await updateStatus(params.id, body.status)
      if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 })
      if (body.status === 'suspended') await deleteClientSession(params.id)
      return NextResponse.json({ success: true, entry: updated })
    }

    // Profile field updates — allowlist only
    const updates = {}
    for (const field of EDITABLE_FIELDS) {
      if (body[field] !== undefined) {
        const val = body[field]
        updates[field] = val === '' ? '' : String(val).slice(0, 300)
      }
    }
    if (!Object.keys(updates).length) return NextResponse.json({ error: 'لا توجد حقول للتحديث' }, { status: 400 })

    const updated = await updateSubmission(params.id, updates)
    if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ success: true, entry: updated })
  } catch (err) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny
  try {
    const ok = await deleteSubmission(params.id)
    if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
