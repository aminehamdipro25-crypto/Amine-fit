import { NextResponse } from 'next/server'
import { updateSubmission, getSubmissionById } from '@/lib/submissions'

export async function GET(req, { params }) {
  const client = await getSubmissionById(params.id)
  if (!client) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ plan: client.plan || null })
}

export async function PUT(req, { params }) {
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
  try {
    const { clientPassword } = await req.json()
    const updated = await updateSubmission(params.id, { clientPassword })
    if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
