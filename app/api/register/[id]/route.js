import { NextResponse } from 'next/server'
import { updateStatus, deleteSubmission } from '@/lib/submissions'

export async function PATCH(req, { params }) {
  try {
    const { status } = await req.json()
    const updated = await updateStatus(params.id, status)
    if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ success: true, entry: updated })
  } catch (err) {
    console.error('[patch status]', err.message)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const ok = await deleteSubmission(params.id)
    if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[delete submission]', err.message)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
