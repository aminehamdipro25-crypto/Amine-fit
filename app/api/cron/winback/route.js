import { NextResponse } from 'next/server'
import { getSubmissions, updateSubmission } from '@/lib/submissions'
import { sendEmail } from '@/lib/mailer'
import { sendTelegramMessage } from '@/lib/telegram'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const BASE          = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'
const WA            = '+974 3065 3759'
const WA_CLEAN      = WA.replace(/\s/g, '')
const MAX_WINBACKS  = 3
const BATCH_LIMIT   = 15
const COOLDOWN_MS   = 3 * 24 * 60 * 60 * 1000  // 3 days between win-back emails
const STOP_AFTER_MS = 30 * 24 * 60 * 60 * 1000 // stop drip 30 days after suspension

export async function GET(req) {
  const secret = process.env.CRON_SECRET
  if (!secret) return NextResponse.json({ error: 'not configured' }, { status: 503 })
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const clients  = await getSubmissions()
  const now      = Date.now()
  let sent       = 0
  let processed  = 0

  for (const client of clients) {
    if (processed >= BATCH_LIMIT) break
    if (!client.email || client.status !== 'suspended') continue

    const winbackCount = client.winbackCount || 0
    if (winbackCount >= MAX_WINBACKS) continue

    const suspendedAt = client.suspendedAt ? new Date(client.suspendedAt).getTime() : now
    if (now - suspendedAt > STOP_AFTER_MS) continue

    const lastAt = client.lastWinbackAt ? new Date(client.lastWinbackAt).getTime() : 0
    if (lastAt && now - lastAt < COOLDOWN_MS) continue

    processed++
    const nextCount = winbackCount + 1
    const { subject, html, text } = buildEmail(client, nextCount)

    // Optimistic write BEFORE sending — prevents duplicate sends on Vercel timeout retries
    try {
      await updateSubmission(client.id, {
        winbackCount:  nextCount,
        lastWinbackAt: new Date().toISOString(),
      })
    } catch (writeErr) {
      logger.error('cron-winback', 'redis write error', { email: client.email, err: writeErr.message })
      continue
    }

    try {
      await sendEmail({ to: client.email, subject, html, text })
      sent++
    } catch (emailErr) {
      logger.error('cron-winback', 'email error', { email: client.email, err: emailErr.message })
      try {
        await updateSubmission(client.id, {
          winbackCount:  winbackCount,
          lastWinbackAt: lastAt ? new Date(lastAt).toISOString() : null,
        })
      } catch (_) { /* ignore rollback error */ }
    }
  }

  if (sent > 0) {
    sendTelegramMessage(
      `🔁 <b>حملة استرجاع العملاء</b>\n\n` +
      `أُرسلت ${sent} رسالة استرجاع لعملاء معلّقين اليوم\n\n` +
      `<a href="${BASE}/dashboard/clients">⚡ فتح لوحة التحكم</a>`
    ).catch(() => {})
  }

  return NextResponse.json({
    ok: true, sent, processed, checked: clients.length,
    ts: new Date().toISOString(),
  })
}

// ─── Router ─────────────────────────────────────────────────────────────────

function buildEmail(client, count) {
  switch (count) {
    case 1: return winback1(client)
    case 2: return winback2(client)
    case 3: return winback3(client)
    default: return winback3(client)
  }
}

// ─── Step 1 — "نشتاق إليك" (warm check-in) ───────────────────────────────────

function winback1(client) {
  const name = client.name || 'عزيزي'
  return {
    subject: 'نشتاق إليك في Amine-Fit 👋',
    text: `مرحباً ${name}، لاحظنا أن اشتراكك توقف. تواصل معنا للعودة: ${WA}`,
    html: wrap(
      heroHeader('#3b82f6', '#1d4ed8', '👋', 'نشتاق إليك!', 'Amine-Fit — رحلتك لم تنتهِ بعد'),
      `<p style="font-size:16px;color:#1a1a1a;margin:0 0 16px">مرحباً <strong>${esc(name)}</strong>،</p>
       <p style="font-size:14px;color:#555;line-height:1.8;margin:0 0 20px">
         لاحظنا أن اشتراكك في Amine-Fit توقف. كل التقدّم الذي حققته لا يجب أن يضيع —
         يسعدنا أن نُكمل معك المشوار في أي وقت تكون جاهزاً.
       </p>
       <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px 20px;margin:0 0 24px">
         <p style="margin:0;font-size:14px;color:#1e40af;font-weight:bold">
           بياناتك وخطتك السابقة محفوظة — العودة أسهل مما تتخيل
         </p>
       </div>
       ${ctaBtn('أريد العودة', `https://wa.me/${WA_CLEAN}?text=${encodeURIComponent('مرحباً أمين، أريد تجديد اشتراكي في Amine-Fit')}`, '#3b82f6', '#1d4ed8')}
       ${waBtn()}`,
    ),
  }
}

// ─── Step 2 — مكافأة العودة (incentive) ──────────────────────────────────────

function winback2(client) {
  const name = client.name || 'عزيزي'
  return {
    subject: 'هدية خاصة لعودتك إلى Amine-Fit 🎁',
    text: `مرحباً ${name}، عُد الآن واحصل على أسبوع إضافي مجاناً عند التجديد. تواصل: ${WA}`,
    html: wrap(
      heroHeader('#10b981', '#059669', '🎁', 'هدية خاصة لعودتك', 'Amine-Fit — لم ننسَك'),
      `<p style="font-size:16px;color:#1a1a1a;margin:0 0 16px">مرحباً <strong>${esc(name)}</strong>،</p>
       <p style="font-size:14px;color:#555;line-height:1.8;margin:0 0 20px">
         لتشجيعك على العودة، إذا جدّدت اشتراكك خلال هذا الأسبوع نُضيف لك
         <strong>أسبوعاً إضافياً مجاناً</strong> فوق باقتك المعتادة.
       </p>
       <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;margin:0 0 24px;text-align:center">
         <p style="margin:0;font-size:15px;color:#166534;font-weight:bold">
           فقط اذكر "عرض العودة" عند التواصل معنا على واتساب
         </p>
       </div>
       ${ctaBtn('فعّل عرض العودة', `https://wa.me/${WA_CLEAN}?text=${encodeURIComponent('مرحباً أمين، أريد تفعيل عرض العودة لاشتراكي في Amine-Fit')}`, '#10b981', '#059669')}
       ${waBtn()}`,
    ),
  }
}

// ─── Step 3 — آخر رسالة (final, gentle close) ────────────────────────────────

function winback3(client) {
  const name = client.name || 'عزيزي'
  return {
    subject: 'آخر رسالة منّا — باب العودة مفتوح دائماً 💪',
    text: `مرحباً ${name}، هذه آخر رسالة. باب العودة مفتوح دائماً. تواصل: ${WA}`,
    html: wrap(
      heroHeader('#7c3aed', '#6d28d9', '💪', 'باب العودة مفتوح دائماً', 'Amine-Fit — لن نزعجك مجدداً'),
      `<p style="font-size:16px;color:#1a1a1a;margin:0 0 16px">مرحباً <strong>${esc(name)}</strong>،</p>
       <p style="font-size:14px;color:#555;line-height:1.8;margin:0 0 20px">
         هذه آخر رسالة نرسلها بخصوص اشتراكك المتوقف — وعدنا.
         لكن مهما طال الوقت، نحن هنا حين تكون جاهزاً للعودة.
       </p>
       <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:20px;margin:0 0 24px;text-align:center">
         <p style="font-size:14px;color:#4c1d95;margin:0;line-height:1.8">
           عرض الأسبوع الإضافي المجاني عند التجديد لا يزال متاحاً —
           فقط تواصل معنا في أي وقت يناسبك.
         </p>
       </div>
       ${ctaBtn('تواصل معنا', `https://wa.me/${WA_CLEAN}?text=${encodeURIComponent('مرحباً أمين، أريد العودة إلى Amine-Fit')}`, '#7c3aed', '#6d28d9')}`,
    ),
  }
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

function wrap(header, body) {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial,sans-serif">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)">
  ${header}
  <div style="padding:28px 24px">${body}</div>
  <div style="background:#f8fafc;padding:14px 24px;text-align:center;border-top:1px solid #e2e8f0">
    <p style="color:#9ca3af;font-size:11px;margin:0">Amine-Fit • الدوحة، قطر • ${WA}</p>
  </div>
</div>
</body></html>`
}

function heroHeader(colorA, colorB, emoji, title, subtitle) {
  return `<div style="background:linear-gradient(135deg,${colorA},${colorB});padding:28px 24px;text-align:center">
    <div style="font-size:40px">${emoji}</div>
    <h1 style="color:#fff;margin:10px 0 4px;font-size:20px">${title}</h1>
    <p style="color:rgba(255,255,255,.85);margin:0;font-size:13px">${subtitle}</p>
  </div>`
}

function ctaBtn(label, href, colorA, colorB) {
  return `<div style="text-align:center;margin:0 0 20px">
    <a href="${href}" style="display:inline-block;background:linear-gradient(135deg,${colorA},${colorB});color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px">
      ${label}
    </a>
  </div>`
}

function waBtn() {
  return `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px">
    <p style="margin:0;font-size:13px;color:#166534">
      لديك سؤال؟ تواصل مع المدرب أمين مباشرةً عبر واتساب:
      <strong><a href="https://wa.me/${WA_CLEAN}" style="color:#166534">${WA}</a></strong>
    </p>
  </div>`
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#x27;')
}
