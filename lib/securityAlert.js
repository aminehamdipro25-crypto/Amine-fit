import { sendTelegramMessage } from '@/lib/telegram'

export async function sendSecurityAlert({ type, ip, detail = '' }) {
  const labels = {
    admin_brute_force:  { emoji: '🚨', title: 'محاولة اختراق لوحة التحكم', color: '#dc2626' },
    admin_login:        { emoji: '✅', title: 'دخول ناجح للوحة التحكم',    color: '#16a34a' },
    client_brute_force: { emoji: '⚠️', title: 'محاولات دخول مشبوهة — بوابة العملاء', color: '#d97706' },
  }
  const { emoji, title, color } = labels[type] || { emoji: '🔔', title: type, color: '#6366f1' }
  const now = new Date().toLocaleString('ar', { timeZone: 'Asia/Qatar' })

  if (process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Amine-Fit Security <onboarding@resend.dev>',
        to: [process.env.NOTIFY_EMAIL],
        subject: `${emoji} ${title} — Amine-Fit`,
        html: `<!DOCTYPE html><html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#0f172a;font-family:Arial,sans-serif">
<div style="max-width:480px;margin:0 auto;background:#1e293b;border-radius:12px;overflow:hidden;border:1px solid ${color}40">
  <div style="background:${color};padding:20px 24px;text-align:center">
    <div style="font-size:36px">${emoji}</div>
    <h1 style="color:#fff;margin:8px 0 2px;font-size:18px;font-weight:900">${title}</h1>
    <p style="color:rgba(255,255,255,.7);margin:0;font-size:12px">Amine-Fit Security Alert — ${now}</p>
  </div>
  <div style="padding:20px 24px">
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="padding:10px 12px;background:#0f172a;color:#94a3b8;font-size:13px;font-weight:700;border:1px solid #334155;width:35%">عنوان IP</td>
        <td style="padding:10px 12px;background:#0f172a;color:#f1f5f9;font-size:13px;border:1px solid #334155;font-family:monospace">${ip}</td>
      </tr>
      ${detail ? `<tr>
        <td style="padding:10px 12px;background:#0f172a;color:#94a3b8;font-size:13px;font-weight:700;border:1px solid #334155">التفاصيل</td>
        <td style="padding:10px 12px;background:#0f172a;color:#f1f5f9;font-size:13px;border:1px solid #334155">${detail}</td>
      </tr>` : ''}
      <tr>
        <td style="padding:10px 12px;background:#0f172a;color:#94a3b8;font-size:13px;font-weight:700;border:1px solid #334155">التوقيت</td>
        <td style="padding:10px 12px;background:#0f172a;color:#f1f5f9;font-size:13px;border:1px solid #334155">${now}</td>
      </tr>
    </table>
    <div style="margin-top:16px;padding:12px;background:#dc262615;border:1px solid #dc262640;border-radius:8px">
      <p style="margin:0;color:#fca5a5;font-size:12px;text-align:center">
        إذا لم تكن أنت، تحقق من كلمة المرور وسجّل الدخول للوحة التحكم فوراً
      </p>
    </div>
  </div>
</div>
</body></html>`,
      }),
    }).catch(() => {})
    return
  }

  // Fallback to Telegram when Resend is not configured
  sendTelegramMessage(
    `${emoji} <b>${title}</b>\n\nIP: <code>${ip}</code>\n${detail ? `التفاصيل: ${detail}\n` : ''}الوقت: ${now}`
  ).catch(() => {})
}
