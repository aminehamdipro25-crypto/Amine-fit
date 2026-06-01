import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/clientAuth'
import { getSubmissionById, updateSubmission } from '@/lib/submissions'

function getPayload() {
  const token = cookies().get('client_token')?.value
  return verifyToken(token)
}

export async function GET() {
  const payload = getPayload()
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const client = await getSubmissionById(payload.id)
  if (!client) return NextResponse.json({ error: 'not found' }, { status: 404 })

  return NextResponse.json(client.progress || [])
}

export async function POST(req) {
  try {
    const payload = getPayload()
    if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const { weight, waist, chest, hips, arm, thigh, note } = await req.json()

    const toNum = v => (v !== undefined && v !== '' && !isNaN(+v)) ? +v : null

    const client = await getSubmissionById(payload.id)
    if (!client) return NextResponse.json({ error: 'not found' }, { status: 404 })

    const entry = {
      id:     Date.now().toString(),
      date:   new Date().toISOString(),
      weight: toNum(weight),
      waist:  toNum(waist),
      chest:  toNum(chest),
      hips:   toNum(hips),
      arm:    toNum(arm),
      thigh:  toNum(thigh),
      note:   note?.toString().slice(0, 500) || '',
    }

    const progress = [...(client.progress || []), entry]
    await updateSubmission(payload.id, { progress })
    return NextResponse.json(entry)
  } catch (err) {
    console.error('[progress POST]', err.message)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const payload = getPayload()
    if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const client = await getSubmissionById(payload.id)
    if (!client) return NextResponse.json({ error: 'not found' }, { status: 404 })

    const progress = (client.progress || []).filter(e => e.id !== id)
    await updateSubmission(payload.id, { progress })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[progress DELETE]', err.message)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
