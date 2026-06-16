import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/clientAuth'
import { getSubmissionById, updateSubmission } from '@/lib/submissions'
import { sendTelegramMessage } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

export async function GET() {
  const token   = cookies().get('client_token')?.value
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const client = await getSubmissionById(payload.id)
  if (!client) return NextResponse.json({ error: 'not found' }, { status: 404 })

  return NextResponse.json({ feedback: client.planFeedback || null })
}

export async function POST(req) {
  const token   = cookies().get('client_token')?.value
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const client = await getSubmissionById(payload.id)
  if (!client) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const { type, rating, note } = await req.json()
  if (!type || !['training', 'nutrition'].includes(type)) {
    return NextResponse.json({ error: 'نوع غير صالح' }, { status: 400 })
  }
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'التقييم بين 1 و 5' }, { status: 400 })
  }

  const feedback = {
    ...(client.planFeedback || {}),
    [type]: {
      rating:  Math.round(rating),
      note:    String(note || '').trim().slice(0, 300),
      ratedAt: new Date().toISOString(),
    },
  }

  await updateSubmission(payload.id, { planFeedback: feedback })

  const stars = '⭐'.repeat(Math.round(rating))
  const typeName = type === 'training' ? 'البرنامج التدريبي' : 'الخطة الغذائية'
  sendTelegramMessage(
    `${stars} تقييم جديد — ${typeName}\n` +
    `العميل: ${client.name}\n` +
    `التقييم: ${rating}/5\n` +
    (note ? `الملاحظة: ${note}` : '')
  ).catch(() => {})

  return NextResponse.json({ ok: true, feedback })
}
