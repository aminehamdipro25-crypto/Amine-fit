import { isRateLimited } from '@/lib/rateLimit'

// ── Meta WhatsApp Cloud API — بوت رد تلقائي ─────────────────────────────────
// الإعداد في Vercel (Environment Variables):
//   WHATSAPP_TOKEN        ← Access Token من Meta Developer Console
//   WHATSAPP_PHONE_ID     ← Phone Number ID (ليس رقم الهاتف نفسه)
//   WHATSAPP_VERIFY_TOKEN ← كلمة سر عشوائية تختارها أنت
//
// الإعداد في Meta (مرة واحدة):
//   1. developers.facebook.com → Create App → WhatsApp
//   2. أضف Phone Number → احصل على Phone Number ID
//   3. Webhooks → Callback URL: https://amine-fit.com/api/webhook/whatsapp
//   4. Verify Token: نفس قيمة WHATSAPP_VERIFY_TOKEN
//   5. Subscribe to: messages

const SYSTEM = `أنت مساعد ذكي لموقع Amine-Fit. اسمك "مساعد أمين".

قواعد الرد الإلزامية:
- الرد بالعربية دائماً، بلهجة عربية بسيطة ومريحة
- لا تستخدم نجوم أو markdown أو أي تنسيق خاص — نص عادي فقط
- رد في 2-3 جمل قصيرة كحد أقصى، لا إسهاب
- لا تذكر الذكاء الاصطناعي أو Claude أبداً
- إذا لم تعرف الإجابة، قل "تواصل مع أمين مباشرة"

معلومات المدرب:
أمين حمدي، مدرب شخصي ومدرب تغذية معتمد، خبرة أكثر من 10 سنوات، من تونس، يعمل من الدوحة قطر.

الباقات والأسعار:
برنامج التدريب: 50 دينار تونسي في الشهر. يشمل برنامج تدريب مخصص وشرح كامل للتمارين ودعم على واتساب.
الباقة الشهرية: 125 دينار تونسي في الشهر. تشمل تدريب وتغذية ومتابعة أسبوعية. الأكثر طلباً.
باقة 3 أشهر: 300 دينار تونسي لـ3 أشهر. كل شيء مع ضمان النتيجة. الأوفر قيمة.
يوجد خصم 50% الآن لفترة محدودة فقط.

كيف تشترك:
أولاً تسجل الاستبيان على الموقع مجاناً على amine-fit.com/register ثم المدرب يراجع ملفك خلال 24 ساعة. بعدها تتلقى كود تفعيل على إيميلك.

الدفع:
عبر تطبيق D17 أو الإيداع المباشر في مكتب البريد التونسي. بعد الدفع ترسل إثبات على واتساب وتفعّل حسابك خلال ساعة.`

// ── Redis helper — deduplicate Meta webhook retries ──────────────────────────
function redisCfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return (url && token) ? { url: url.replace(/\/$/, ''), token } : null
}

async function isDuplicate(msgId) {
  const c = redisCfg()
  if (!c) return false
  try {
    const res = await fetch(c.url + '/pipeline', {
      method:  'POST',
      headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify([['SET', `wa_msg:${msgId}`, '1', 'NX', 'EX', '300']]),
      cache:   'no-store',
    })
    const data = await res.json()
    return data[0]?.result === null  // null → key existed → duplicate
  } catch { return false }
}

// ── Send reply via Meta Graph API ────────────────────────────────────────────
async function sendReply(to, text) {
  const phoneId = process.env.WHATSAPP_PHONE_ID
  const token   = process.env.WHATSAPP_TOKEN
  if (!phoneId || !token) return

  await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text, preview_url: false },
    }),
  })
}

// ── Generate Claude reply ────────────────────────────────────────────────────
async function getReply(userText) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return 'مرحباً! للاشتراك في برامج التدريب والتغذية مع أمين، سجّل الاستبيان مجاناً على amine-fit.com وسيتواصل معك المدرب خلال 24 ساعة 🏋️'
  }
  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client   = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system:     SYSTEM,
      messages:   [{ role: 'user', content: userText }],
    })
    return response.content[0].text.trim()
  } catch {
    return 'مرحباً! سجّل على amine-fit.com لتبدأ رحلتك مع المدرب أمين. الباقة الشهرية 125 د.ت تشمل تدريب + تغذية + متابعة أسبوعية.'
  }
}

// ── GET: Meta webhook verification ──────────────────────────────────────────
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const mode      = searchParams.get('hub.mode')
  const token     = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }
  return new Response('Forbidden', { status: 403 })
}

// ── POST: Receive and auto-reply ─────────────────────────────────────────────
export async function POST(req) {
  let body
  try { body = await req.json() } catch { return new Response('OK', { status: 200 }) }

  // Extract first incoming text message from webhook payload
  const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
  if (!message || message.type !== 'text') return new Response('OK', { status: 200 })

  const from = message.from        // sender's WhatsApp number
  const text = message.text?.body?.trim()
  if (!text || !from) return new Response('OK', { status: 200 })
  if (text.length > 1000) return new Response('OK', { status: 200 })

  // Deduplicate: Meta can send same event multiple times
  if (await isDuplicate(message.id)) return new Response('OK', { status: 200 })

  // Rate limit: 10 messages / hour per number (prevents spam loops)
  if (await isRateLimited(`wa_num:${from}`, 10, 3600)) return new Response('OK', { status: 200 })

  // Generate and send reply (synchronous — Haiku responds in ~2s, within Meta's 15s window)
  try {
    const reply = await getReply(text)
    await sendReply(from, reply)
  } catch { /* silent: never let errors propagate to Meta */ }

  return new Response('OK', { status: 200 })
}
