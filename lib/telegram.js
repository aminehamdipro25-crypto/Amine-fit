/**
 * Telegram bot push notifications.
 *
 * Setup (one-time):
 *  1. Chat @BotFather on Telegram → /newbot → copy the token
 *  2. Send any message to your new bot, then:
 *     GET https://api.telegram.org/bot{TOKEN}/getUpdates
 *     Find "chat":{"id": ...} — that's your TELEGRAM_CHAT_ID
 *  3. Add to Vercel env vars:
 *     TELEGRAM_BOT_TOKEN=...
 *     TELEGRAM_CHAT_ID=...
 */
export async function sendTelegramMessage(text) {
  const token  = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return   // silently skip if not configured

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id:                  chatId,
        text,
        parse_mode:               'HTML',
        disable_web_page_preview: true,
      }),
    })
    if (!res.ok) console.error('[telegram]', res.status, await res.text())
  } catch (e) {
    console.error('[telegram]', e.message)
  }
}
