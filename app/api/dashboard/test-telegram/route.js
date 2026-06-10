import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { sendTelegramMessage } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  const deny = await requireAdmin()
  if (deny) return deny

  const token  = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    return NextResponse.json({
      ok: false,
      error: 'متغيرات البيئة غير مضبوطة',
      missing: [...(!token ? ['TELEGRAM_BOT_TOKEN'] : []), ...(!chatId ? ['TELEGRAM_CHAT_ID'] : [])],
    }, { status: 503 })
  }

  try {
    await sendTelegramMessage(
      `✅ <b>اختبار الإشعارات</b>\n\nهذه رسالة تجريبية من Amine-Fit — الإشعارات تعمل بشكل صحيح.\n\n🕐 ${new Date().toLocaleString('ar-TN', { timeZone: 'Africa/Tunis' })}`
    )
    return NextResponse.json({ ok: true, message: 'تم إرسال الرسالة بنجاح' })
  } catch (e) {
    // Return the actual Telegram error so the admin can diagnose the problem
    return NextResponse.json({
      ok: false,
      error: e.message,
      hint: e.message.includes('chat not found')
        ? 'TELEGRAM_CHAT_ID غير صحيح — أرسل رسالة للبوت أولاً ثم احصل على chat_id عبر getUpdates'
        : e.message.includes('Unauthorized')
          ? 'TELEGRAM_BOT_TOKEN غير صحيح أو منتهي الصلاحية'
          : 'تحقق من متغيرات البيئة في Vercel',
    }, { status: 500 })
  }
}
