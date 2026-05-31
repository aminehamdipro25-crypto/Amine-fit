import { NextResponse } from 'next/server'
import { updateStatus, deleteSubmission } from '@/lib/submissions'
import { requireAdmin } from '@/lib/adminAuth'

export async function PATCH(req, { params }) {
  const deny = requireAdmin()
  if (deny) return deny
  try {
    const { status } = await req.json()
    const allowed = ['new', 'active', 'reviewed', 'inactive', 'suspended']
    if (!allowed.includes(status)) return NextResponse.json({ error: 'قيمة غير صالحة' }, { status: 400 })
    const updated = await updateStatus(params.id, status)
    if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ success: true, entry: updated })
  } catch (err) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const deny = requireAdmin()
  if (deny) return deny
  try {
    const ok = await deleteSubmission(params.id)
    if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
