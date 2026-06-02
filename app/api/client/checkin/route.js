import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/clientAuth'
import { getSubmissionById, updateSubmission } from '@/lib/submissions'

async function getPayload() {
  const token = cookies().get('client_token')?.value
  return await verifyToken(token)
}

export async function GET() {
  const payload = await getPayload()
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const client = await getSubmissionById(payload.id)
  if (!client) return NextResponse.json({ error: 'not found' }, { status: 404 })

  return NextResponse.json(client.checkins || [])
}

export async function POST(req) {
  try {
    const payload = await getPayload()
    if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const body = await req.json()
    const { energy, sleep, trainingDone, nutritionDays, note } = body

    const toInt = (v, min, max) => {
      const n = parseInt(v)
      return isNaN(n) ? min : Math.min(max, Math.max(min, n))
    }

    const entry = {
      id:            Date.now().toString(),
      date:          new Date().toISOString(),
      energy:        toInt(energy, 1, 5),
      sleep:         toInt(sleep, 0, 12),
      trainingDone:  toInt(trainingDone, 0, 7),
      nutritionDays: toInt(nutritionDays, 0, 7),
      note:          (note ?? '').toString().slice(0, 500),
    }

    const client = await getSubmissionById(payload.id)
    if (!client) return NextResponse.json({ error: 'not found' }, { status: 404 })

    const checkins = [...(client.checkins || []), entry].slice(-52) // keep 1 year
    await updateSubmission(payload.id, { checkins })
    return NextResponse.json(entry)
  } catch (err) {
    console.error('[checkin POST]', err.message)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
