import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { getSubmissionById, updateSubmission } from '@/lib/submissions'
import { sendEmail } from '@/lib/mailer'

export const dynamic = 'force-dynamic'

export async function GET(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny

  const client = await getSubmissionById(params.id)
  if (!client) return NextResponse.json({ error: 'not found' }, { status: 404 })

  // Mark client messages as read by admin
  const messages = client.messages || []
  const hasUnread = messages.some(m => m.from === 'client' && !m.read)
  if (hasUnread) {
    const updated = messages.map(m =>
      m.from === 'client' && !m.read ? { ...m, read: true } : m
    )
    await updateSubmission(params.id, { messages: updated }).catch(() => {})
    return NextResponse.json(updated)
  }

  return NextResponse.json(messages)
}

export async function POST(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny

  try {
    const { text } = await req.json()
    const clean = String(text || '').trim().slice(0, 1000)
    if (!clean) return NextResponse.json({ error: 'الرسالة فارغة' }, { status: 400 })

    const client = await getSubmissionById(params.id)
    if (!client) return NextResponse.json({ error: 'not found' }, { status: 404 })

    const entry = {
      id:   Date.now().toString(),
      from: 'admin',
      text: clean,
      date: new Date().toISOString(),
      read: false,
    }
    const messages = [...(client.messages || []), entry].slice(-100)
    await updateSubmission(params.id, { messages })

    // Notify client by email
    if (client.email) {
      const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'
      sendEmail({
        to:      client.email,
        subject: '💬 رسالة جديدة من مدربك أمين',
        html: `
<!DOCTYPE html><html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial,sans-serif">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
  <div style="background:#0a0a0a;padding:20px 24px;text-align:center">
    <p style="color:#fbbf24;font-size:28px;margin:0">💬</p>
    <h1 style="color:#fff;margin:8px 0 4px;font-size:18px">رسالة من مدربك</h1>
    <p style="color:rgba(255,255,255,.5);margin:0;font-size:13px">أمين حمدي — AmineFit</p>
  </div>
  <div style="padding:24px">
    <p style="font-size:15px;color:#1e293b;line-height:1.7;background:#f8fafc;border-right:4px solid #fbbf24;padding:16px 20px;border-radius:8px;margin:0 0 20px">
      ${clean.replace(/\n/g, '<br>')}
    </p>
    <a href="${BASE}/client/messages" style="display:block;text-align:center;background:#0a0a0a;color:#fbbf24;padding:13px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:14px">
      رد على مدربك ←
    </a>
  </div>
  <div style="background:#f8fafc;padding:10px 24px;text-align:center;border-top:1px solid #e2e8f0">
    <p style="color:#9ca3af;font-size:11px;margin:0">Amine-Fit • الدوحة، قطر • +974 3065 3759</p>
  </div>
</div>
</body></html>`,
      }).catch(() => {})
    }

    return NextResponse.json(entry)
  } catch (err) {
    console.error('[admin/messages POST]', err.message)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
