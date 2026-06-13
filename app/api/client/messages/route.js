import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/clientAuth'
import { getSubmissionById, updateSubmission } from '@/lib/submissions'
import { isRateLimited } from '@/lib/rateLimit'
import { sendTelegramMessage } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

async function getPayload() {
  const token = cookies().get('client_token')?.value
  return await verifyToken(token)
}

export async function GET() {
  const payload = await getPayload()
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const client = await getSubmissionById(payload.id)
  if (!client) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const messages = client.messages || []

  // Mark admin messages as read
  const hasUnread = messages.some(m => m.from === 'admin' && !m.read)
  if (hasUnread) {
    const updated = messages.map(m =>
      m.from === 'admin' && !m.read ? { ...m, read: true } : m
    )
    await updateSubmission(payload.id, { messages: updated }).catch(() => {})
    return NextResponse.json(updated)
  }

  return NextResponse.json(messages)
}

export async function POST(req) {
  try {
    const payload = await getPayload()
    if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    if (await isRateLimited(`client_msg:${payload.id}`, 10, 3600)) {
      return NextResponse.json({ error: 'تجاوزت الحد (10 رسائل/ساعة)' }, { status: 429 })
    }

    const { text } = await req.json()
    const clean = String(text || '').trim().slice(0, 500)
    if (!clean) return NextResponse.json({ error: 'الرسالة فارغة' }, { status: 400 })

    const client = await getSubmissionById(payload.id)
    if (!client) return NextResponse.json({ error: 'not found' }, { status: 404 })

    const entry = {
      id:   Date.now().toString(),
      from: 'client',
      text: clean,
      date: new Date().toISOString(),
      read: false,
    }
    const messages = [...(client.messages || []), entry].slice(-100)
    await updateSubmission(payload.id, { messages })

    // Notify coach via Telegram
    const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'
    sendTelegramMessage(
      `💬 رسالة جديدة من العميل\n👤 ${client.name}\n📧 ${client.email}\n\n"${clean}"\n\n${BASE}/dashboard/clients`
    ).catch(() => {})

    return NextResponse.json(entry)
  } catch (err) {
    console.error('[client/messages POST]', err.message)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
