import { NextResponse } from 'next/server'
import { updateSubmission, getSubmissionById } from '@/lib/submissions'
import { requireAdmin } from '@/lib/adminAuth'
import { hashPassword } from '@/lib/password'

export async function GET(req, { params }) {
  const deny = requireAdmin()
  if (deny) return deny
  const client = await getSubmissionById(params.id)
  if (!client) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ plan: client.plan || null })
}

export async function PUT(req, { params }) {
  const deny = requireAdmin()
  if (deny) return deny
  try {
    const { plan } = await req.json()
    const updated = await updateSubmission(params.id, { plan })
    if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req, { params }) {
  const deny = requireAdmin()
  if (deny) return deny
  try {
    const { clientPassword } = await req.json()
    if (!clientPassword || clientPassword.length < 4) {
      return NextResponse.json({ error: 'كلمة المرور قصيرة جداً (4 أحرف على الأقل)' }, { status: 400 })
    }
    const hashed = hashPassword(clientPassword.trim())
    const updated = await updateSubmission(params.id, { clientPassword: hashed })
    if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
