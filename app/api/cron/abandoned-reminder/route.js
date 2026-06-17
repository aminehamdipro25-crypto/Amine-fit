import { NextResponse } from 'next/server'
import { getSubmissions, updateSubmission } from '@/lib/submissions'
import { sendEmail } from '@/lib/mailer'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const BASE          = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'
const WA            = '+974 3065 3759'
const WA_CLEAN      = WA.replace(/\s/g, '')
const MAX_REMINDERS = 5
const BATCH_LIMIT   = 15
const COOLDOWN_MS   = 23 * 60 * 60 * 1000  // 23 hours between reminders

export async function GET(req) {
  const secret = process.env.CRON_SECRET
  if (!secret) return NextResponse.json({ error: 'not configured' }, { status: 503 })
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const clients = await getSubmissions()
  const now     = Date.now()
  let reminded  = 0
  let processed = 0

  for (const client of clients) {
    if (processed >= BATCH_LIMIT) break
    if (!client.email) continue

    // Backward-compat: treat old reminderSentAt as reminderCount=1
    const reminderCount = client.reminderCount ??
      (client.reminderSentAt ? 1 : 0)
    if (reminderCount >= MAX_REMINDERS) continue

    // Respect cooldown between drip messages
    const lastAt = client.lastReminderAt
      ? new Date(client.lastReminderAt).getTime()
      : (client.reminderSentAt ? new Date(client.reminderSentAt).getTime() : 0)
    if (lastAt && now - lastAt < COOLDOWN_MS) continue

    // Only drip to pending (hasn't paid yet) or payment_expired (paid window lapsed)
    const isPending = client.status === 'pending'
    const isExpired = client.status === 'payment_expired'
    if (!isPending && !isExpired) continue

    // For pending: only start drip when deadline is within 24 h OR has passed
    if (isPending && client.paymentDeadline) {
      const dl = new Date(client.paymentDeadline).getTime()
      if (dl - now > 24 * 60 * 60 * 1000) continue  // too early
    }

    // For expired: stop drip after 6 days (5 emails × 1/day)
    if (isExpired && client.paymentExpiredAt) {
      const expiredMs = now - new Date(client.paymentExpiredAt).getTime()
      if (expiredMs > 6 * 24 * 60 * 60 * 1000) continue
    }

    processed++
    const nextCount = reminderCount + 1
    const { subject, html, text } = buildEmail(client, nextCount)

    // Optimistic write BEFORE sending — prevents duplicate on Vercel timeout
    try {
      await updateSubmission(client.id, {
        reminderCount:  nextCount,
        lastReminderAt: new Date().toISOString(),
        reminderSentAt: client.reminderSentAt || new Date().toISOString(),
      })
    } catch (writeErr) {
      logger.error('cron-abandoned-reminder', 'redis write error', { email: client.email, err: writeErr.message })
      continue
    }

    try {
      await sendEmail({ to: client.email, subject, html, text })
      reminded++
    } catch (emailErr) {
      logger.error('cron-abandoned-reminder', 'email error', { email: client.email, err: emailErr.message })
      // Roll back counter so the email is retried tomorrow
      try {
        await updateSubmission(client.id, {
          reminderCount:  reminderCount,
          lastReminderAt: lastAt ? new Date(lastAt).toISOString() : null,
        })
      } catch (_) { /* ignore rollback error */ }
    }
  }

  return NextResponse.json({
    ok: true, reminded, processed, checked: clients.length,
    ts: new Date().toISOString(),
  })
}

// ─── Router ─────────────────────────────────────────────────────────────────

function buildEmail(client, count) {
  switch (count) {
    case 1: return day1(client)
    case 2: return day2(client)
    case 3: return day3(client)
    case 4: return day4(client)
    case 5: return day5(client)
    default: return day5(client)
  }
}

// ─── Day 1 — "الوقت ينفد" (amber urgency) ────────────────────────────────────

function day1(client) {
  const name = client.name || 'عزيزي'
  const isPending = client.status === 'pending'
  return {
    subject: isPending
      ? 'أكمل تسجيلك في Amine-Fit — الفرصة تنتهي قريباً 🕐'
      : 'لا تزال هناك فرصة — Amine-Fit ينتظرك 💪',
    text: `مرحباً ${name}، أكمل تسجيلك الآن: ${BASE}/payment — واتساب: ${WA}`,
    html: wrap(
      heroHeader('#f59e0b', '#d97706', '⏰', 'الوقت ينفد!', 'Amine-Fit — متبقٍ أقل من 24 ساعة'),
      `<p style="font-size:16px;color:#1a1a1a;margin:0 0 16px">مرحباً <strong>${esc(name)}</strong>،</p>
       <p style="font-size:14px;color:#555;line-height:1.8;margin:0 0 20px">
         لاحظنا أنك أتممت الاستبيان ولكن لم تكتمل عملية الدفع بعد.
         مكانك محجوز مؤقتاً — ولكن المهلة تنتهي قريباً.
       </p>
       <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;margin:0 0 24px">
         <p style="margin:0;font-size:14px;color:#92400e;font-weight:bold">
           اختر طريقة الدفع المناسبة وفعّل برنامجك اليوم
         </p>
       </div>
       ${ctaBtn('أكمل الدفع الآن', `${BASE}/payment`, '#f59e0b', '#d97706')}
       ${waBtn()}`,
    ),
  }
}

// ─── Day 2 — "مكانك لا يزال محجوزاً" (blue reassurance) ─────────────────────

function day2(client) {
  const name = client.name || 'عزيزي'
  return {
    subject: 'مكانك لا يزال محجوزاً في Amine-Fit 🏆',
    text: `مرحباً ${name}، مكانك لا يزال محجوزاً. انضم الآن: ${BASE}/payment — واتساب: ${WA}`,
    html: wrap(
      heroHeader('#3b82f6', '#1d4ed8', '🏆', 'مكانك لا يزال محجوزاً!', 'Amine-Fit — نؤمن بك'),
      `<p style="font-size:16px;color:#1a1a1a;margin:0 0 16px">مرحباً <strong>${esc(name)}</strong>،</p>
       <p style="font-size:14px;color:#555;line-height:1.8;margin:0 0 20px">
         احتفظنا بمكانك لأننا نؤمن أنك ستتخذ القرار الصحيح.
         إليك ما ستحصل عليه فور انضمامك:
       </p>
       <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px 20px;margin:0 0 24px">
         ${benefit('📋', 'خطة تغذية مخصصة لجسمك وهدفك تماماً')}
         ${benefit('🏋️', 'برنامج تدريبي احترافي مصمم خصيصاً لك')}
         ${benefit('📊', 'متابعة دورية وتعديل البرنامج حسب تقدمك')}
         ${benefit('📱', 'تواصل مباشر مع المدرب أمين عبر واتساب')}
       </div>
       ${ctaBtn('احجز مكانك الآن', `${BASE}/payment`, '#3b82f6', '#1d4ed8')}
       ${waBtn()}`,
    ),
  }
}

// ─── Day 3 — "هذا ما ستحققه" (green achievement) ─────────────────────────────

function day3(client) {
  const name = client.name || 'عزيزي'
  return {
    subject: 'هذا ما ستحققه مع Amine-Fit خلال 30 يوماً 🚀',
    text: `مرحباً ${name}، 30 يوماً تغير كل شيء. ابدأ الآن: ${BASE}/payment — واتساب: ${WA}`,
    html: wrap(
      heroHeader('#10b981', '#059669', '🚀', 'خلال 30 يوماً فقط...', 'Amine-Fit — النتائج تتكلم'),
      `<p style="font-size:16px;color:#1a1a1a;margin:0 0 16px">مرحباً <strong>${esc(name)}</strong>،</p>
       <p style="font-size:14px;color:#555;line-height:1.8;margin:0 0 20px">
         عملاؤنا الذين يلتزمون بالبرنامج خلال الشهر الأول يحققون نتائج ملموسة.
         إليك ما يمكنك أن تتوقعه:
       </p>
       <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;margin:0 0 24px">
         ${achievement('الأسبوع 1', 'تحسن في مستوى الطاقة والنوم بشكل ملحوظ')}
         ${achievement('الأسبوع 2', 'بداية ظهور الفرق على الجسم والمقياس')}
         ${achievement('الأسبوع 3', 'تحسن الأداء الرياضي وزيادة القوة')}
         ${achievement('الأسبوع 4', 'نتائج واضحة وثقة بالنفس متجددة')}
       </div>
       <p style="font-size:13px;color:#6b7280;margin:0 0 20px;text-align:center">
         كل يوم تأخير = يوم أبعد عن هدفك
       </p>
       ${ctaBtn('ابدأ رحلتي الآن', `${BASE}/payment`, '#10b981', '#059669')}
       ${waBtn()}`,
    ),
  }
}

// ─── Day 4 — "قصة نجاح" (purple social proof) ────────────────────────────────

function day4(client) {
  const name = client.name || 'عزيزي'
  return {
    subject: 'كيف غيّر Amine-Fit حياة عملائنا — اقرأ قصتهم ✨',
    text: `مرحباً ${name}، قصص نجاح حقيقية. انضم إليهم: ${BASE}/payment — واتساب: ${WA}`,
    html: wrap(
      heroHeader('#7c3aed', '#6d28d9', '✨', 'قصص نجاح حقيقية', 'Amine-Fit — نتائج موثّقة'),
      `<p style="font-size:16px;color:#1a1a1a;margin:0 0 16px">مرحباً <strong>${esc(name)}</strong>،</p>
       <p style="font-size:14px;color:#555;line-height:1.8;margin:0 0 20px">
         دعنا نتوقف عن الكلام ونترك النتائج تتحدث:
       </p>
       <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:20px;margin:0 0 16px">
         <p style="margin:0 0 10px;font-size:14px;color:#4c1d95;font-style:italic;line-height:1.8">
           &quot;في 3 أشهر خسرت 12 كيلو وبنيت عضلات لم أكن أتخيل رؤيتها. البرنامج واضح ومتابعة المدرب أمين استثنائية.&quot;
         </p>
         <p style="margin:0;font-size:13px;color:#6d28d9;font-weight:bold">— محمد، 28 سنة — الدوحة</p>
       </div>
       <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:20px;margin:0 0 24px">
         <p style="margin:0 0 10px;font-size:14px;color:#4c1d95;font-style:italic;line-height:1.8">
           &quot;ما توقعت أن يتغير جسمي بهالسرعة. خطة التغذية سهلة ومناسبة لظروفي. شكراً أمين!&quot;
         </p>
         <p style="margin:0;font-size:13px;color:#6d28d9;font-weight:bold">— سارة، 34 سنة — تونس</p>
       </div>
       <p style="font-size:14px;color:#555;text-align:center;margin:0 0 20px">
         أنت القادم. هل أنت مستعد؟
       </p>
       ${ctaBtn('أريد نتائج مثلهم', `${BASE}/payment`, '#7c3aed', '#6d28d9')}
       ${waBtn()}`,
    ),
  }
}

// ─── Day 5 — "48 ساعة متبقية" (orange final urgency) ─────────────────────────

function day5(client) {
  const name = client.name || 'عزيزي'
  return {
    subject: 'آخر فرصة — Amine-Fit 🔥',
    text: `مرحباً ${name}، هذه آخر رسالة. لا تفوّت الفرصة. تواصل معنا: ${WA} أو ادفع الآن: ${BASE}/payment`,
    html: wrap(
      heroHeader('#ef4444', '#dc2626', '🔥', 'آخر فرصة!', 'Amine-Fit — لن نزعجك مجدداً'),
      `<p style="font-size:16px;color:#1a1a1a;margin:0 0 16px">مرحباً <strong>${esc(name)}</strong>،</p>
       <p style="font-size:14px;color:#555;line-height:1.8;margin:0 0 20px">
         هذه آخر رسالة نرسلها إليك — وعدنا.
         لكن قبل أن نودّعك، نريدك أن تعرف شيئاً واحداً:
       </p>
       <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:20px;margin:0 0 24px;text-align:center">
         <p style="font-size:16px;color:#991b1b;font-weight:bold;margin:0 0 10px">
           قرار واحد يغير كل شيء
         </p>
         <p style="font-size:14px;color:#7f1d1d;margin:0;line-height:1.8">
           الأشخاص الذين يؤجلون دائماً يصلون إلى مكانك بعد سنة
           وهم يتمنون أنهم بدأوا اليوم.
           لا تكن منهم.
         </p>
       </div>
       <p style="font-size:14px;color:#555;text-align:center;margin:0 0 8px">
         أكمل الدفع الآن — أو تواصل معنا مباشرةً على واتساب:
       </p>
       <p style="font-size:22px;font-weight:900;color:#ef4444;text-align:center;margin:0 0 20px">${WA}</p>
       ${ctaBtn('أريد البدء الآن', `${BASE}/payment`, '#ef4444', '#dc2626')}
       <div style="text-align:center;margin:12px 0 0">
         <a href="https://wa.me/${WA_CLEAN}"
            style="display:inline-block;background:linear-gradient(135deg,#25d366,#128c7e);color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:14px">
           تواصل عبر واتساب
         </a>
       </div>`,
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

function benefit(icon, text) {
  return `<p style="margin:0 0 8px;font-size:14px;color:#1e40af">${icon} ${text}</p>`
}

function achievement(week, desc) {
  return `<div style="display:flex;align-items:flex-start;margin:0 0 10px;gap:12px">
    <span style="background:#10b981;color:#fff;border-radius:6px;padding:2px 8px;font-size:12px;font-weight:bold;white-space:nowrap">${week}</span>
    <span style="font-size:14px;color:#065f46">${desc}</span>
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
