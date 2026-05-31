import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/clientAuth'
import { getSubmissionById, updateSubmission } from '@/lib/submissions'

async function getClient(req) {
  const token = cookies().get('client_token')?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload) return null
  return payload
}

export async function GET(req) {
  const payload = await getClient(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = await getSubmissionById(payload.clientId)
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(client.progress || [])
}

export async function POST(req) {
  const payload = await getClient(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { weight, waist, chest, hips, arm, thigh, note } = body

  const client = await getSubmissionById(payload.clientId)
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const entry = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    weight: weight ? +weight : null,
    waist: waist ? +waist : null,
    chest: chest ? +chest : null,
    hips: hips ? +hips : null,
    arm: arm ? +arm : null,
    thigh: thigh ? +thigh : null,
    note: note || '',
  }

  const progress = [...(client.progress || []), entry]
  await updateSubmission(payload.clientId, { progress })

  return NextResponse.json(entry)
}

export async function DELETE(req) {
  const payload = await getClient(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  const client = await getSubmissionById(payload.clientId)
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const progress = (client.progress || []).filter(e => e.id !== id)
  await updateSubmission(payload.clientId, { progress })

  return NextResponse.json({ ok: true })
}
