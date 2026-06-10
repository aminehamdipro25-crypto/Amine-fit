// Centralised server-side error logger.
// In production: sends to Telegram (if configured) for critical errors.
// Replace the Telegram call with Sentry/Datadog when those are configured.

import { sendTelegramMessage } from '@/lib/telegram'

const isDev = process.env.NODE_ENV !== 'production'

/**
 * Log levels: 'info' | 'warn' | 'error' | 'critical'
 * 'critical' also fires a Telegram alert to the admin.
 */
export function log(level, context, message, extra = {}) {
  const ts = new Date().toISOString()
  const payload = { ts, level, context, message, ...extra }

  if (isDev || level === 'warn' || level === 'error') {
    console[level === 'info' ? 'log' : level](`[${context}]`, message, extra)
  }

  if (level === 'critical') {
    const text =
      `🚨 <b>خطأ حرج — ${context}</b>\n` +
      `<code>${message}</code>\n` +
      (extra.err ? `<code>${String(extra.err).slice(0, 300)}</code>\n` : '') +
      `<i>${ts}</i>`
    sendTelegramMessage(text).catch(() => {})
  }
}

export const logger = {
  info:     (ctx, msg, extra) => log('info',     ctx, msg, extra),
  warn:     (ctx, msg, extra) => log('warn',     ctx, msg, extra),
  error:    (ctx, msg, extra) => log('error',    ctx, msg, extra),
  critical: (ctx, msg, extra) => log('critical', ctx, msg, extra),
}
