import { NextResponse } from 'next/server'
import { updateStatus } from '@/lib/submissions'

export async function PATCH(req, { params }) {
  try {
    const { status } = await req.json()
    const updated = await updateStatus(params.id, status)
    if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ success: true, entry: updated })
  } catch {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
