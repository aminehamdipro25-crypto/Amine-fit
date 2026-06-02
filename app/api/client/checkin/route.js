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
    const { energy, sleep, trainingDone, nutritionDays, note, weight, stress, pain } = body

    const toInt = (v, min, max) => {
      const n = parseInt(v)
      return isNaN(n) ? min : Math.min(max, Math.max(min, n))
    }
    const toFloat = (v, fallback = null) => {
      const n = parseFloat(v)
      return isNaN(n) ? fallback : Math.min(400, Math.max(20, n))
    }

    const entry = {
      id:            Date.now().toString(),
      date:          new Date().toISOString(),
      energy:        toInt(energy, 1, 5),
      sleep:         toInt(sleep, 0, 12),
      trainingDone:  toInt(trainingDone, 0, 7),
      nutritionDays: toInt(nutritionDays, 0, 7),
      stress:        toInt(stress, 1, 5),
      weight:        toFloat(weight),
      pain:          (pain ?? '').toString().slice(0, 300),
      note:          (note ?? '').toString().slice(0, 500),
    }

    const client = await getSubmissionById(payload.id)
    if (!client) return NextResponse.json({ error: 'not found' }, { status: 404 })

    const checkins = [...(client.checkins || []), entry].slice(-52)
    await updateSubmission(payload.id, { checkins })

    // Notify admin by email (fire-and-forget)
    if (process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL) {
      sendCheckinNotification(client, entry).catch(e =>
        console.error('[checkin email]', e.message)
      )
    }

    return NextResponse.json(entry)
  } catch (err) {
    console.error('[checkin POST]', err.message)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

const ENERGY_LABELS = ['', '😩 سيء', '😔 ضعيف', '😐 متوسط', '😊 جيد', '😁 ممتاز']
const STRESS_LABELS = ['', '😌 هادئ', '🙂 عادي', '😐 متوسط', '😟 مرتفع', '😤 شديد']

async function sendCheckinNotification(client, entry) {
  const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'
  const date = new Date(entry.date).toLocaleDateString('ar', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Qatar'
  })

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'AmineFit <onboarding@resend.dev>',
      to:   [process.env.NOTIFY_EMAIL],
      subject: `📋 تقرير أسبوعي — ${client.name}`,
      html: buildCheckinEmail(client, entry, date, BASE),
    }),
  })
}

function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function buildCheckinEmail(client, e, date, base) {
  const trainingPct = Math.round((e.trainingDone / 7) * 100)
  const nutritionPct = Math.round((e.nutritionDays / 7) * 100)
  const sleepOk = e.sleep >= 7
  const stressHigh = (e.stress || 3) >= 4

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial,sans-serif">
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">

  <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:22px 24px;text-align:center">
    <div style="font-size:40px">📋</div>
    <h1 style="color:#fff;margin:8px 0 4px;font-size:20px">تقرير أسبوعي جديد</h1>
    <p style="color:rgba(255,255,255,.8);margin:0;font-size:13px">${esc(client.name)} — ${esc(date)}</p>
  </div>

  <div style="padding:22px 24px">

    <table style="width:100%;border-collapse:collapse;margin-bottom:14px">
      <tr>
        <td style="padding:10px;background:#faf5ff;border-radius:10px;width:31%;vertical-align:top">
          <p style="margin:0 0 3px;font-size:10px;font-weight:bold;color:#7c3aed;text-transform:uppercase">الطاقة</p>
          <p style="margin:0;font-size:24px;font-weight:900;color:#1e1b4b">${e.energy}/5</p>
          <p style="margin:3px 0 0;font-size:12px;color:#6d28d9">${ENERGY_LABELS[e.energy] || ''}</p>
        </td>
        <td style="width:3%"></td>
        <td style="padding:10px;background:#eff6ff;border-radius:10px;width:31%;vertical-align:top">
          <p style="margin:0 0 3px;font-size:10px;font-weight:bold;color:#1d4ed8;text-transform:uppercase">النوم</p>
          <p style="margin:0;font-size:24px;font-weight:900;color:#1e3a8a">${e.sleep}ساعة</p>
          <p style="margin:3px 0 0;font-size:12px;color:${sleepOk ? '#059669' : '#dc2626'}">${sleepOk ? '✅ ممتاز' : '⚠️ يحتاج تحسين'}</p>
        </td>
        <td style="width:3%"></td>
        <td style="padding:10px;background:${stressHigh ? '#fff7ed' : '#f0fdf4'};border-radius:10px;width:31%;vertical-align:top;border:${stressHigh ? '1px solid #fed7aa' : 'none'}">
          <p style="margin:0 0 3px;font-size:10px;font-weight:bold;color:${stressHigh ? '#c2410c' : '#15803d'};text-transform:uppercase">التوتر</p>
          <p style="margin:0;font-size:24px;font-weight:900;color:${stressHigh ? '#7c2d12' : '#14532d'}">${e.stress || 3}/5</p>
          <p style="margin:3px 0 0;font-size:12px;color:${stressHigh ? '#ea580c' : '#16a34a'}">${STRESS_LABELS[e.stress || 3] || ''}</p>
        </td>
      </tr>
    </table>

    ${e.weight ? `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:10px 14px;margin-bottom:14px;display:flex;align-items:center;gap:10px">
      <span style="font-size:22px">⚖️</span>
      <div>
        <p style="margin:0 0 2px;font-size:10px;font-weight:bold;color:#15803d;text-transform:uppercase">الوزن هذا الأسبوع</p>
        <p style="margin:0;font-size:20px;font-weight:900;color:#14532d">${esc(String(e.weight))} كغ</p>
      </div>
    </div>` : ''}

    <div style="margin-bottom:12px">
      <p style="margin:0 0 5px;font-size:12px;font-weight:bold;color:#374151">🏋️ التدريب — ${e.trainingDone} أيام من 7</p>
      <div style="background:#e5e7eb;border-radius:99px;height:10px;overflow:hidden">
        <div style="background:${trainingPct >= 60 ? '#10b981' : '#f59e0b'};height:100%;width:${trainingPct}%;border-radius:99px"></div>
      </div>
    </div>

    <div style="margin-bottom:16px">
      <p style="margin:0 0 5px;font-size:12px;font-weight:bold;color:#374151">🥗 الالتزام بالتغذية — ${e.nutritionDays} أيام من 7</p>
      <div style="background:#e5e7eb;border-radius:99px;height:10px;overflow:hidden">
        <div style="background:${nutritionPct >= 70 ? '#10b981' : '#f59e0b'};height:100%;width:${nutritionPct}%;border-radius:99px"></div>
      </div>
    </div>

    ${e.pain ? `
    <div style="background:#fff7ed;border-right:4px solid #f97316;padding:12px 14px;border-radius:8px;margin-bottom:16px">
      <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#c2410c">⚠️ ألم أو إصابة مُبلَّغ عنها</p>
      <p style="margin:0;font-size:13px;color:#374151;line-height:1.6">${esc(e.pain)}</p>
    </div>` : ''}

    ${e.note ? `
    <div style="background:#f8f9fa;border-right:3px solid #7c3aed;padding:12px 14px;border-radius:8px;margin-bottom:16px">
      <p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#7c3aed">ملاحظة العميل</p>
      <p style="margin:0;font-size:13px;color:#374151;line-height:1.6">"${esc(e.note)}"</p>
    </div>` : ''}

    <a href="${base}/dashboard/clients"
       style="display:block;text-align:center;background:#0a0a0a;color:#fbbf24;padding:13px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:14px">
      عرض ملف العميل في لوحة التحكم ←
    </a>
  </div>

  <div style="background:#f8fafc;padding:10px 24px;text-align:center;border-top:1px solid #e2e8f0">
    <p style="color:#9ca3af;font-size:11px;margin:0">Amine-Fit • الدوحة، قطر • +974 3065 3759</p>
  </div>
</div>
</body></html>`
}
