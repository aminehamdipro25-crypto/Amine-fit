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
      `✅ <b>اختبار الإشعارات</b>\n\nهذه رسالة تجريبية من Amine-Fit — الإشعارات تعمل بشكل صحيح.`
    )
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
