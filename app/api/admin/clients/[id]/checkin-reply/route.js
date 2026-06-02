import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { getSubmissionById, updateSubmission } from '@/lib/submissions'

export async function POST(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny

  const { checkinId, reply } = await req.json()
  if (!checkinId || !reply?.trim()) {
    return NextResponse.json({ error: 'checkinId and reply required' }, { status: 400 })
  }

  const client = await getSubmissionById(params.id)
  if (!client) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const existing = (client.checkins || []).find(c => c.id === checkinId)
  if (!existing) return NextResponse.json({ error: 'check-in not found' }, { status: 404 })

  const updatedEntry = { ...existing, coachReply: reply.trim().slice(0, 500), repliedAt: new Date().toISOString() }
  const checkins = (client.checkins || []).map(c => c.id === checkinId ? updatedEntry : c)
  await updateSubmission(params.id, { checkins })

  // Notify client by email
  if (process.env.RESEND_API_KEY && client.email) {
    sendReplyEmail(client, updatedEntry).catch(e =>
      console.error('[checkin-reply email]', e.message)
    )
  }

  return NextResponse.json({ ok: true })
}

function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

async function sendReplyEmail(client, checkin) {
  const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from:    'AmineFit <onboarding@resend.dev>',
      to:      [client.email],
      subject: '💬 ردّ المدرب أمين على تقريرك الأسبوعي',
      html: `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial,sans-serif">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
  <div style="background:linear-gradient(135deg,#0a0a0a,#1a1a1a);padding:22px 24px;text-align:center">
    <div style="font-size:40px">💬</div>
    <h1 style="color:#fbbf24;margin:8px 0 4px;font-size:20px">ردّ المدرب أمين</h1>
    <p style="color:rgba(255,255,255,.6);margin:0;font-size:13px">على تقريرك الأسبوعي</p>
  </div>
  <div style="padding:24px">
    <p style="font-size:14px;color:#374151;margin-bottom:16px">
      أهلاً <strong>${esc(client.name)}</strong>، لديك رسالة من مدربك:
    </p>
    <div style="background:#fffbeb;border-right:4px solid #fbbf24;border-radius:10px;padding:16px 18px;margin-bottom:20px">
      <p style="margin:0;font-size:15px;color:#1f2937;line-height:1.7">${esc(checkin.coachReply)}</p>
      <p style="margin:8px 0 0;font-size:11px;color:#9ca3af;text-align:left">— المدرب أمين حمدي</p>
    </div>
    <a href="${BASE}/client/dashboard"
       style="display:block;text-align:center;background:#fbbf24;color:#000;padding:13px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:14px">
      عرض بوابتك الشخصية ←
    </a>
  </div>
  <div style="background:#f8fafc;padding:10px 24px;text-align:center;border-top:1px solid #e2e8f0">
    <p style="color:#9ca3af;font-size:11px;margin:0">Amine-Fit • الدوحة، قطر • +974 3065 3759</p>
  </div>
</div>
</body></html>`,
    }),
  })
}
