import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { getSubmissionById, updateSubmission } from '@/lib/submissions'

export const dynamic = 'force-dynamic'

export async function GET(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny
  const client = await getSubmissionById(params.id)
  if (!client) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ protocol: client.labProtocol || null })
}

export async function POST(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny

  const client = await getSubmissionById(params.id)
  if (!client) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const { protocol } = await req.json()
  if (!protocol || typeof protocol !== 'object') {
    return NextResponse.json({ error: 'بروتوكول غير صالح' }, { status: 400 })
  }

  const safe = {
    methodKey:       String(protocol.methodKey || '').slice(0, 50),
    methodName:      String(protocol.methodName || '').slice(0, 100),
    emoji:           String(protocol.emoji || '🔬').slice(0, 10),
    tagline:         String(protocol.tagline || '').slice(0, 200),
    whyYou:          String(protocol.whyYou || '').slice(0, 1000),
    science:         String(protocol.science || '').slice(0, 500),
    weeklyStructure: Array.isArray(protocol.weeklyStructure) ? protocol.weeklyStructure.slice(0, 7) : [],
    keyPrinciples:   Array.isArray(protocol.keyPrinciples) ? protocol.keyPrinciples.slice(0, 6) : [],
    weeklyStats:     protocol.weeklyStats || {},
    weekNotes:       String(protocol.weekNotes || '').slice(0, 500),
    recoveryTips:    Array.isArray(protocol.recoveryTips) ? protocol.recoveryTips.slice(0, 5) : [],
    active:          true,
    generatedAt:     new Date().toISOString(),
  }

  await updateSubmission(params.id, { labProtocol: safe })
  return NextResponse.json({ success: true, protocol: safe })
}

export async function PATCH(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny

  const client = await getSubmissionById(params.id)
  if (!client) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const body = await req.json()
  const current = client.labProtocol || {}

  // Allow toggling active state or partial field updates
  const updated = { ...current }
  if (body.active !== undefined)    updated.active    = !!body.active
  if (body.whyYou !== undefined)    updated.whyYou    = String(body.whyYou).slice(0, 1000)
  if (body.weekNotes !== undefined) updated.weekNotes = String(body.weekNotes).slice(0, 500)
  if (body.tagline !== undefined)   updated.tagline   = String(body.tagline).slice(0, 200)
  updated.updatedAt = new Date().toISOString()

  await updateSubmission(params.id, { labProtocol: updated })
  return NextResponse.json({ success: true, protocol: updated })
}

export async function DELETE(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny
  await updateSubmission(params.id, { labProtocol: null })
  return NextResponse.json({ success: true })
}
