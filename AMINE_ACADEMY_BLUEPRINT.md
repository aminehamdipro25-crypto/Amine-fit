# AMINE ACADEMY — Blueprint من تجربة Amine-Fit

> وثيقة مرجعية شاملة: كل قرار تقني، كل نمط برمجي، كل درس تعلمناه في بناء Amine-Fit.
> الهدف: تبدأ AMINE ACADEMY من حيث انتهينا — لا تبدأ من الصفر.

---

## فهرس المحتويات

1. [Stack التقني المُجرَّب](#1-stack-التقني-المُجرَّب)
2. [هيكل المشروع](#2-هيكل-المشروع)
3. [متغيرات البيئة المطلوبة](#3-متغيرات-البيئة-المطلوبة)
4. [نظام المصادقة — Authentication](#4-نظام-المصادقة--authentication)
5. [قاعدة البيانات — Upstash Redis](#5-قاعدة-البيانات--upstash-redis)
6. [البريد الإلكتروني — Email System](#6-البريد-الإلكتروني--email-system)
7. [Rate Limiting — الحماية من الإغراق](#7-rate-limiting--الحماية-من-الإغراق)
8. [نظام Cron Jobs — المهام المجدولة](#8-نظام-cron-jobs--المهام-المجدولة)
9. [Middleware — حراسة المسارات](#9-middleware--حراسة-المسارات)
10. [كلود AI — نمط الاستخدام](#10-كلود-ai--نمط-الاستخدام)
11. [واجهة المستخدم — UI Patterns](#11-واجهة-المستخدم--ui-patterns)
12. [الـ SEO والـ Metadata](#12-الـ-seo-والـ-metadata)
13. [PDF والطباعة](#13-pdf-والطباعة)
14. [Analytics — Google Analytics 4](#14-analytics--google-analytics-4)
15. [الأمان — Security](#15-الأمان--security)
16. [إدارة الحالة — State Management](#16-إدارة-الحالة--state-management)
17. [أنماط مكررة يجب نسخها مباشرة](#17-أنماط-مكررة-يجب-نسخها-مباشرة)
18. [أخطاء وقعنا فيها — لا تكررها](#18-أخطاء-وقعنا-فيها--لا-تكررها)
19. [ما يختلف في AMINE ACADEMY](#19-ما-يختلف-في-amine-academy)
20. [قائمة التحقق قبل الإطلاق](#20-قائمة-التحقق-قبل-الإطلاق)

---

## 1. Stack التقني المُجرَّب

```
Next.js 14 (App Router)     ← الإطار الأساسي
Tailwind CSS                ← التصميم
Upstash Redis               ← قاعدة البيانات (بدون خادم)
Nodemailer (Gmail SMTP)     ← البريد الأساسي
Resend                      ← البريد الاحتياطي
@anthropic-ai/sdk           ← الذكاء الاصطناعي (claude-haiku-4-5)
Lucide React                ← الأيقونات
Recharts                    ← الرسوم البيانية
Cairo Font (Google Fonts)   ← الخط العربي
Vercel                      ← النشر (deployment)
```

### لماذا هذا الـ Stack؟
- **Next.js App Router**: API routes + صفحات في نفس المشروع — لا حاجة لخادم منفصل
- **Upstash Redis**: مجاني للبدء، بدون اتصال TCP دائم، يعمل في Vercel Edge
- **Gmail SMTP**: موثوق، مجاني، لا يحتاج نطاق خاص في البداية
- **بدون Prisma/SQL**: Redis يكفي لبيانات المنصات الصغيرة والمتوسطة

---

## 2. هيكل المشروع

```
/app
  /layout.js                   ← Root layout (font, metadata, GA, JSON-LD)
  /page.js                     ← الصفحة الرئيسية
  /globals.css                 ← Tailwind + global styles
  /not-found.js                ← صفحة 404 مخصصة
  /robots.js                   ← robots.txt
  /sitemap.js                  ← sitemap.xml
  /icon.js                     ← Favicon
  /error.js                    ← Error boundary

  /api
    /chat/route.js             ← Chatbot (Claude)
    /contact/route.js          ← نموذج التواصل
    /cron
      /abandoned-reminder      ← مهمة مجدولة: تذكير العملاء
      /check-subscriptions     ← مهمة مجدولة: فحص الاشتراكات
    /dashboard
      /auth/route.js           ← تسجيل دخول المشرف
    /client
      /auth/route.js           ← تسجيل دخول العميل
      /me/route.js             ← بيانات العميل الحالي
      /ping/route.js           ← Heartbeat (online status)

  /dashboard                   ← بوابة المشرف (محمية)
    /login/page.js
    /(admin)/layout.js         ← Sidebar + Header layout
    /(admin)/page.js           ← لوحة التحكم الرئيسية
    /(admin)/clients/          ← إدارة العملاء
    /(admin)/analytics/        ← الإحصائيات

  /client                      ← بوابة العميل (محمية)
    /login/page.js
    /layout.js                 ← Navigation + Heartbeat
    /dashboard/page.js
    /plan/nutrition/page.js
    /plan/training/page.js
    /journal/page.js
    /progress/page.js

  /register/page.js            ← نموذج التسجيل
  /payment/page.js             ← صفحة الدفع
  /legal/
    /terms/page.js
    /privacy/page.js
    /cancellation/page.js
  /blog/
    /page.js
    /[slug]/page.js

/components
  /landing/                    ← 20+ مكون للصفحة الرئيسية
  /dashboard/                  ← Sidebar + Header

/lib
  /submissions.js              ← CRUD قاعدة البيانات
  /clientAuth.js               ← HMAC token
  /adminAuth.js                ← Admin session check
  /clientSession.js            ← Session management
  /adminSession.js             ← Admin session management
  /mailer.js                   ← إرسال البريد
  /rateLimit.js                ← Rate limiting
  /password.js                 ← تشفير كلمات المرور
  /gtag.js                     ← Google Analytics
  /securityAlert.js            ← تنبيهات الأمان

/middleware.js                 ← حراسة المسارات
/tailwind.config.js
/next.config.mjs               ← Security headers
```

---

## 3. متغيرات البيئة المطلوبة

```bash
# قاعدة البيانات (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
# بديل (Vercel KV)
KV_REST_API_URL=...
KV_REST_API_TOKEN=...

# المصادقة
AUTH_SECRET=random-64-char-string   # openssl rand -hex 32

# البريد الإلكتروني
GMAIL_USER=amine.hamdi.pro25@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx   # App Password من Google
RESEND_API_KEY=re_xxxxx                   # احتياطي

# الذكاء الاصطناعي (اختياري — يوجد fallback)
ANTHROPIC_API_KEY=sk-ant-xxx

# Cron Jobs
CRON_SECRET=random-secret-string

# SEO
NEXT_PUBLIC_BASE_URL=https://amine-academy.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# إشعارات المشرف
NOTIFY_EMAIL=amine.hamdi.pro25@gmail.com

# التحقق من Google
GOOGLE_SITE_VERIFICATION=xxx
```

---

## 4. نظام المصادقة — Authentication

### نظرة عامة
نظامان منفصلان تماماً: مشرف + عملاء.

### المشرف (كلمة مرور فقط، بدون بريد)
```js
// lib/adminSession.js
export async function createAdminSession() {
  const token = crypto.randomBytes(32).toString('hex')
  await redis.set(`admin_sess:${token}`, '1', { ex: 30 * 24 * 3600 })
  return token
}
export async function verifyAdminSession(token) {
  return await redis.get(`admin_sess:${token}`) === '1'
}
// Cookie: admin_token (httpOnly, secure, sameSite: lax)
```

### العميل (بريد + كلمة مرور)
```js
// lib/clientAuth.js — HMAC-SHA256 Token
export function createToken(clientId, sessionId) {
  const SECRET = process.env.AUTH_SECRET
  const payload = { id: clientId, sessionId, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 }
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig  = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

// التحقق الكامل (signature + Redis session revocation)
export async function verifyToken(token) {
  const payload = verifySignature(token)
  if (!payload) return null
  const storedSession = await redisGet(`client_sess:${payload.id}`)
  if (storedSession === payload.sessionId) return payload
  // فحص Admin Preview
  const previewSession = await redisGet(`client_preview:${payload.id}`)
  if (previewSession === payload.sessionId) return payload
  return null
}
// Cookie: client_token (httpOnly, secure, sameSite: lax, 30 days)
```

### تشفير كلمات المرور
```js
// lib/password.js — OWASP 2024 scrypt
const SCRYPT_PARAMS = { N: 65536, r: 8, p: 1 }  // لا تغير هذه القيم
const KEY_LEN = 64
const SALT_BYTES = 32

export function hashPassword(plain) {
  const salt = crypto.randomBytes(SALT_BYTES).toString('hex')
  const hash = crypto.scryptSync(plain, salt, KEY_LEN, SCRYPT_PARAMS).toString('hex')
  return `scrypt2$${salt}$${hash}`
}

export function verifyPassword(plain, stored) {
  if (!stored.startsWith('scrypt2$')) return false
  const [, salt, hash] = stored.split('$')
  const testHash = crypto.scryptSync(plain, salt, KEY_LEN, SCRYPT_PARAMS).toString('hex')
  const a = Buffer.from(testHash, 'hex')
  const b = Buffer.from(hash, 'hex')
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)  // ← مقارنة آمنة زمنياً
}
```

### كود التفعيل (6 أرقام)
```js
// توليد كود تفعيل عشوائي
const code = Math.floor(100000 + Math.random() * 900000).toString()
// تخزين في Redis لمدة 24 ساعة
await redis.set(`activation:${email}`, code, { ex: 86400 })
```

---

## 5. قاعدة البيانات — Upstash Redis

### مبدأ مهم جداً: Double JSON.parse
```js
// Upstash يعيد بيانات مُشفَّرة مرتين في بعض الحالات
function parseEntry(raw) {
  if (!raw) return null
  try {
    let v = raw
    if (typeof v === 'string') v = JSON.parse(v)  // أول parse
    if (typeof v === 'string') v = JSON.parse(v)  // ثاني parse (مهم!)
    return v && typeof v === 'object' ? v : null
  } catch { return null }
}
```

### مخطط المفاتيح (Key Scheme) — مثال من Amine-Fit
```
# بيانات الكيان الرئيسي
sub:{id}             → JSON كامل للـ submission
subs:index           → قائمة IDs مرتبة (LPUSH/LRANGE)
sub:email:{email}    → ID من البريد الإلكتروني (O(1) lookup)

# الجلسات
client_sess:{id}     → sessionId
admin_sess:{token}   → '1'
client_preview:{id}  → preview sessionId

# Rate Limiting
rl:{key}             → عداد الطلبات (TTL = window)

# Heartbeat
client_last:{id}     → timestamp (TTL = 10 min)
```

### الاتصال بـ Redis (بدون SDK — HTTP مباشر)
```js
// lib/submissions.js — النمط المُثبَّت
function getCfg() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return (url && token) ? { url: url.replace(/\/$/, ''), token } : null
}

async function redisPipeline(cfg, commands) {
  const res = await fetch(cfg.url + '/pipeline', {
    method:  'POST',
    headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(commands),
    cache:   'no-store',  // ← مهم: لا cache في Vercel Edge
  })
  if (!res.ok) throw new Error(`Redis HTTP ${res.status}`)
  return res.json()
}

// استخدام Pipeline للعمليات المتعددة (أسرع بكثير)
const results = await redisPipeline(cfg, [
  ['SET', `sub:${id}`, JSON.stringify(data)],
  ['LPUSH', 'subs:index', id],
  ['SET', `sub:email:${email}`, id, 'NX'],  // NX = فقط إذا لم يوجد
])
```

### توليد ID فريد
```js
// نمط Amine-Fit: قابل للقراءة + ضمان عدم التكرار
const id = `AF-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`
// مثال: AF-lq3x7f2-a8c3d1
// للأكاديمية: AA-lq3x7f2-a8c3d1
```

---

## 6. البريد الإلكتروني — Email System

### lib/mailer.js — Primary + Fallback
```js
import nodemailer from 'nodemailer'

let _transport = null   // ← مُشارَك بين الطلبات (avoid TCP overhead)

function getGmailTransport() {
  if (!_transport) {
    _transport = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    })
  }
  return _transport
}

export async function sendEmail({ to, subject, html, text }) {
  // Primary: Gmail
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    await getGmailTransport().sendMail({
      from: `"Amine Academy" <${process.env.GMAIL_USER}>`,
      to, subject, html, text,
    })
    return { provider: 'gmail' }
  }
  // Fallback: Resend
  if (process.env.RESEND_API_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'Amine Academy <onboarding@resend.dev>', to: [to], subject, html }),
    })
    return { provider: 'resend' }
  }
  throw new Error('No email provider configured')
}
```

### قالب HTML للبريد (نمط Amine-Fit)
```js
// مكونات مشتركة قابلة لإعادة الاستخدام
function wrap(color, content) {
  return `
  <!DOCTYPE html><html dir="rtl" lang="ar">
  <head><meta charset="utf-8">
  <style>
    * { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; box-sizing: border-box; }
    body { margin: 0; padding: 20px; background: #f8fafc; direction: rtl; }
  </style></head>
  <body>
    <div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;
                overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
      <div style="background:${color};padding:32px 24px;text-align:center">
        <h1 style="color:white;margin:0;font-size:22px;font-weight:800">Amine Academy</h1>
      </div>
      <div style="padding:32px 24px">${content}</div>
      <div style="background:#f8fafc;padding:16px 24px;text-align:center">
        <p style="color:#94a3b8;font-size:12px;margin:0">
          Amine Academy — أكاديمية أمين لأطفال طيف التوحد
        </p>
      </div>
    </div>
  </body></html>`
}

// زر CTA
function ctaBtn(href, label, color = '#6366f1') {
  return `<a href="${href}" style="display:inline-block;padding:14px 32px;background:${color};
    color:white;border-radius:12px;font-weight:800;font-size:16px;text-decoration:none;
    margin:16px 0">${label}</a>`
}

// زر واتساب
function waBtn(phone, text) {
  const msg = encodeURIComponent(text)
  return `<a href="https://wa.me/${phone}?text=${msg}"
    style="display:inline-block;padding:14px 32px;background:#25d366;color:white;
    border-radius:12px;font-weight:800;font-size:16px;text-decoration:none">
    💬 تواصل عبر واتساب</a>`
}
```

### 5-Day Drip Email Sequence (نمط Amine-Fit)
```
يوم 1: الترحيب + CTA الدفع (برتقالي/عنبري)
يوم 2: "مكانك محجوز" + قائمة الفوائد (أزرق)
يوم 3: "هذا ما ستحققه" + خارطة طريق (أخضر)
يوم 4: شهادات العملاء / الدليل الاجتماعي (بنفسجي)
يوم 5: "آخر رسالة" + واتساب كـ CTA رئيسي (أحمر)

المبدأ التقني:
- اكتب في Redis قبل إرسال البريد (يمنع duplicates عند timeout)
- إذا فشل الإرسال: rollback Redis
- COOLDOWN_MS = 23 ساعة بين كل رسالة
- MAX_REMINDERS = 5 رسائل كحد أقصى
```

---

## 7. Rate Limiting — الحماية من الإغراق

```js
// lib/rateLimit.js — يعمل بدون أي مكتبة
export async function isRateLimited(key, maxRequests, windowSeconds) {
  const c = cfg()
  if (!c) return true   // ← fail closed: إذا Redis غير متاح → احجب

  const redisKey = `rl:${key}`
  const results = await pipeline(c, [
    ['SET', redisKey, '0', 'NX', 'EX', String(windowSeconds)],  // أنشئ إذا لم يوجد
    ['INCR', redisKey],                                           // زد العداد
  ])
  const count = results[1]?.result ?? 0
  return count > maxRequests
}

// استخدام في API routes
const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

// تسجيل الدخول: 10 محاولات / ساعة
if (await isRateLimited(`auth_ip:${ip}`, 10, 3600)) {
  return NextResponse.json({ error: 'حاول مجدداً بعد ساعة' }, { status: 429 })
}

// نموذج التواصل: 5 رسائل / ساعة
if (await isRateLimited(`contact:${ip}`, 5, 3600)) {
  return NextResponse.json({ error: 'رسائل كثيرة' }, { status: 429 })
}

// Chatbot: 20 رسالة / ساعة
if (await isRateLimited(`chat_ip:${ip}`, 20, 3600)) {
  return NextResponse.json({ reply: 'حاول مجدداً بعد قليل.' })
}
```

---

## 8. نظام Cron Jobs — المهام المجدولة

### app/api/cron/[name]/route.js
```js
export const dynamic = 'force-dynamic'

export async function GET(req) {
  // حماية إلزامية
  const secret = process.env.CRON_SECRET
  if (!secret) return NextResponse.json({ error: 'not configured' }, { status: 503 })
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // المنطق هنا...
  return NextResponse.json({ ok: true, processed: N })
}
```

### vercel.json — جدولة التشغيل
```json
{
  "crons": [
    {
      "path": "/api/cron/abandoned-reminder",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/check-subscriptions",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### مبدأ Optimistic Write (مهم جداً)
```js
// اكتب في قاعدة البيانات أولاً، ثم أرسل البريد
// هذا يمنع إرسال نفس البريد مرتين عند Vercel timeout

// 1. سجّل في Redis أن البريد "سيُرسَل"
await updateSubmission(client.id, {
  reminderCount: nextCount,
  lastReminderAt: new Date().toISOString(),
})

// 2. أرسل البريد
try {
  await sendEmail({ to: client.email, subject, html, text })
} catch (err) {
  // 3. إذا فشل: أعِد الحالة للخلف
  await updateSubmission(client.id, {
    reminderCount: reminderCount,
    lastReminderAt: client.lastReminderAt || null,
  })
}
```

---

## 9. Middleware — حراسة المسارات

```js
// middleware.js — نمط كامل
export async function middleware(request) {
  const { pathname } = request.nextUrl

  // ── المشرف ──────────────────────────────────
  if (pathname.startsWith('/dashboard') && pathname !== '/dashboard/login') {
    const token = request.cookies.get('admin_token')?.value
    if (!await verifyAdminSession(token)) {
      return NextResponse.redirect(new URL('/dashboard/login', request.url))
    }
  }

  // ── العميل ──────────────────────────────────
  const clientPublic = ['/client/login', '/client', '/client/demo']
  if (pathname.startsWith('/client') && !clientPublic.includes(pathname)) {
    const token   = request.cookies.get('client_token')?.value
    const payload = await verifyClientToken(token)

    if (!payload) {
      const res = NextResponse.redirect(new URL('/client/login', request.url))
      res.cookies.set('client_token', '', { maxAge: 0, path: '/' })
      return res
    }

    // فحص الإيقاف
    if (await isClientSuspended(payload.id)) {
      const msg = encodeURIComponent('تم تعليق حسابك. تواصل مع الأكاديمية.')
      const res = NextResponse.redirect(new URL(`/client/login?suspended=1&msg=${msg}`, request.url))
      res.cookies.set('client_token', '', { maxAge: 0, path: '/' })
      return res
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/client/:path*'],
}
```

---

## 10. كلود AI — نمط الاستخدام

### Chatbot (مساعد ذكي)
```js
// app/api/chat/route.js
const SYSTEM = `أنت مساعد ذكي لأكاديمية أمين.

قواعد الرد الإلزامية:
- الرد بالعربية دائماً
- لا تستخدم نجوم أو markdown — نص عادي فقط
- رد في 2-3 جمل قصيرة كحد أقصى
- لا تذكر الذكاء الاصطناعي أو Claude أبداً
- إذا لم تعرف الإجابة، قل "تواصل معنا مباشرة على واتساب"`

export async function POST(req) {
  // Rate limit أولاً
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (await isRateLimited(`chat_ip:${ip}`, 20, 3600)) {
    return NextResponse.json({ reply: 'حاول مجدداً بعد قليل.' })
  }

  const { messages } = await req.json()
  // تحقق من صحة المدخلات
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 10) {
    return NextResponse.json({ reply: 'حدث خطأ، حاول مجدداً.' })
  }

  // Fallback إذا لم يوجد API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ reply: 'تواصل معنا عبر واتساب.' })
  }

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')  // ← dynamic import
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',  // ← أسرع + أرخص للـ chatbot
      max_tokens: 300,
      system: SYSTEM,
      messages: messages.slice(-6),  // ← آخر 6 رسائل فقط (توفير التوكن)
    })

    return NextResponse.json({ reply: response.content[0].text.trim() })
  } catch {
    return NextResponse.json({ reply: 'تواصل معنا عبر واتساب.' })
  }
}
```

### نموذج التوليد المتقدم (خطط مخصصة)
```js
// للمهام المعقدة: claude-sonnet-4-6 مع structured output
const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 2000,
  system: 'أعد JSON فقط بدون أي نص إضافي. التنسيق: {...}',
  messages: [{ role: 'user', content: prompt }],
})

// فحص أن الرد JSON صالح
try {
  const data = JSON.parse(response.content[0].text)
  return data
} catch {
  // fallback للنظام المحلي
  return localEngine(inputs)
}
```

### المبادئ المهمة
- `claude-haiku-4-5-20251001` للـ chatbot (سريع + رخيص)
- `claude-sonnet-4-6` للتوليد المعقد (خطط، تحليلات)
- دائماً `dynamic import` لـ Anthropic SDK (لا مشاكل في Edge)
- دائماً fallback محلي إذا فشل AI أو لم يوجد API key
- لا تذكر AI أو Claude في النص العربي للمستخدم

---

## 11. واجهة المستخدم — UI Patterns

### الألوان (نظام Amine-Fit)
```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      gold: {
        400: '#fbbf24',  // amber-400 — اللون الرئيسي
        500: '#f59e0b',  // hover state
      },
    },
    fontFamily: {
      cairo: ['var(--font-cairo)', 'Cairo', 'sans-serif'],
    },
  }
}
```

### الخط العربي
```js
// app/layout.js
import { Cairo } from 'next/font/google'
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-cairo',
  display: 'swap',
})

// في HTML: dir="rtl"
<html lang="ar" dir="rtl" className={cairo.variable}>
  <body className="font-cairo antialiased">
```

### globals.css الأساسية
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* { font-family: var(--font-cairo), 'Cairo', sans-serif; box-sizing: border-box; }
html { width: 100%; overflow-x: hidden; scroll-behavior: smooth; }
body { direction: rtl; background: #f8fafc; width: 100%; overflow-x: hidden; }

/* Scrollbar */
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: #f1f5f9; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9px; }

/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, #6366f1 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Card hover */
.card-hover { transition: transform .25s ease, box-shadow .25s ease; }
.card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -8px rgba(99,102,241,.15); }
```

### مشكلة RTL مع الأرقام (بالغة الأهمية)
```jsx
// المشكلة: Arabic RTL bidi يعكس الأرقام والأكواد اللاتينية
// الحل: لفّ كل رقم/كود/هاتف بـ N() component

function N({ v }) {
  return (
    <span style={{ direction: 'ltr', unicodeBidi: 'embed', display: 'inline-block' }}>
      {v}
    </span>
  )
}

// استخدام
<N v="+974 3065 3759" />
<N v="50 د.ت" />
<N v="TN59 1780 1000 0002 1931 0870" />
```

### Countdown Timer (نمط localStorage)
```js
// لا تستخدم تاريخاً ثابتاً! يجب أن يكون شخصياً لكل زائر
const OFFER_DURATION = 5 * 24 * 60 * 60 * 1000  // 5 أيام
const LS_KEY = 'aa_offer_expiry'  // غيّر الـ prefix للمشروع الجديد

function useCountdown() {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0, expired: false })

  useEffect(() => {
    let expiry = parseInt(localStorage.getItem(LS_KEY) || '0', 10)
    if (!expiry || expiry < Date.now()) {
      expiry = Date.now() + OFFER_DURATION
      localStorage.setItem(LS_KEY, String(expiry))
    }

    const tick = () => {
      const diff = expiry - Date.now()
      if (diff <= 0) { setTime({ d: 0, h: 0, m: 0, s: 0, expired: true }); return }
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        expired: false,
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return time
}
```

### Online Status (Heartbeat)
```js
// في layout العميل: ping كل 60 ثانية
useEffect(() => {
  const ping = () => fetch('/api/client/ping')
  ping()
  const id = setInterval(ping, 60000)
  return () => clearInterval(id)
}, [])

// API Route: app/api/client/ping/route.js
export async function GET(req) {
  const token = cookies().get('client_token')?.value
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ ok: false }, { status: 401 })
  await redis.set(`client_last:${payload.id}`, Date.now(), { ex: 600 })  // 10 min TTL
  return NextResponse.json({ ok: true })
}
```

---

## 12. الـ SEO والـ Metadata

```js
// app/layout.js — النمط الكامل
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-academy.com'

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Amine Academy | أكاديمية أمين لأطفال طيف التوحد',
    template: '%s | Amine Academy',
  },
  description: 'منصة تعليمية شاملة لأطفال طيف التوحد...',
  keywords: ['أكاديمية التوحد', 'تعليم أطفال التوحد', ...],
  openGraph: {
    type: 'website',
    locale: 'ar_TN',
    url: BASE_URL,
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

// JSON-LD Schema
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Amine Academy',
  url: BASE_URL,
  // ...
}

// Sitemap: app/sitemap.js
export default function sitemap() {
  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/register`, lastModified: new Date(), priority: 0.9 },
    // ...
  ]
}
```

---

## 13. PDF والطباعة

```css
/* globals.css */
@media print {
  .no-print { display: none !important; }
  body > * { display: none !important; }
  .print-visible { display: block !important; }
  .print-visible > * { display: none !important; }
  #report-page { display: flex !important; }
  .print-visible {
    position: fixed !important;
    inset: 0 !important;
    background: white !important;
    overflow: hidden !important;
  }
  @page { margin: 0; size: A4 portrait; }
}
```

```jsx
// مكون تقرير A4 — يضمن صفحة واحدة
function PrintReport() {
  return (
    <div className="print-visible fixed inset-0 bg-white z-[9999] no-print" style={{ display: 'none' }}>
      <div id="report-page" style={{
        width: '210mm',
        height: '297mm',
        maxHeight: '297mm',
        overflow: 'hidden',    // ← يمنع الصفحة الثانية
        padding: '16mm',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* المحتوى */}
      </div>
    </div>
  )
}

// زر الطباعة
<button onClick={() => window.print()}>طباعة PDF</button>
```

---

## 14. Analytics — Google Analytics 4

```js
// lib/gtag.js
export function trackEvent(action, params = {}) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', action, params)
}

// app/layout.js — تهيئة متزامنة (مهمة: تمنع race condition)
const GA_ID = process.env.NEXT_PUBLIC_GA_ID
{GA_ID && <>
  {/* gtag stub متزامن — يجب أن يُحمَّل قبل أي trackEvent() في useEffect */}
  <script dangerouslySetInnerHTML={{ __html:
    `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}`
  }} />
  <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
  <Script id="ga-init" strategy="afterInteractive">{`
    gtag('js', new Date());
    gtag('config', '${GA_ID}');
  `}</Script>
</>}

// أحداث مهمة للتتبع
trackEvent('page_view')
trackEvent('registration_started')
trackEvent('registration_completed', { plan: planName })
trackEvent('payment_page_view')
trackEvent('plan_selected', { plan_name, plan_price: Number(price) })  // ← Number() ضروري
trackEvent('payment_completed', { value: Number(price), currency: 'TND' })
trackEvent('whatsapp_clicked', { source: 'header' })
```

---

## 15. الأمان — Security

### next.config.mjs — Security Headers
```js
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
  images: { remotePatterns: [/* أضف domains المسموح بها */] },
}
```

### قواعد أمان ثابتة
```
✓ كلمات المرور: scrypt OWASP 2024 (N=65536, r=8, p=1)
✓ المقارنة: timingSafeEqual دائماً
✓ التوكن: HMAC-SHA256 + Redis revocation
✓ Cookies: httpOnly + secure + sameSite: lax
✓ Rate Limiting: كل endpoint يحتاجه (auth, contact, chat)
✓ Fail Closed: إذا Redis غير متاح → احجب (لا تسمح)
✓ CRON_SECRET: لحماية cron endpoints
✓ لا أرقام بطاقات أبداً على الموقع
✓ D17/دفع: عرض "قريباً" إذا الرقم غير مفعّل
```

---

## 16. إدارة الحالة — State Management

```js
// لا Redux، لا Zustand — useState + fetch كافٍ للمنصات الصغيرة/المتوسطة

// نمط: جلب البيانات في Client Component
export default function SomePage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/some-endpoint')
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />
  return <div>{/* محتوى */}</div>
}

// نمط: Server Component للبيانات الثابتة
// app/dashboard/(admin)/analytics/page.js
export default async function AnalyticsPage() {
  const data = await getAnalyticsData()  // مباشرة في Server Component
  return <AnalyticsClient data={data} />  // Client Component للـ charts
}
```

---

## 17. أنماط مكررة يجب نسخها مباشرة

### 1. Toast Notification
```jsx
const [toast, setToast] = useState(null)

function showToast(msg, type = 'success') {
  setToast({ msg, type })
  setTimeout(() => setToast(null), 3000)
}

// في JSX
{toast && (
  <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-white font-bold z-50 ${
    toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
  }`}>{toast.msg}</div>
)}
```

### 2. Copy to Clipboard Button
```jsx
const [copied, setCopied] = useState(false)

function copyText(text) {
  navigator.clipboard.writeText(text).catch(() => {})
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
}

// في JSX
<button onClick={() => copyText(value)}>
  {copied ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
</button>
{copied && <span className="text-emerald-400 text-xs">تم النسخ ✓</span>}
```

### 3. Loading State Button
```jsx
const [loading, setLoading] = useState(false)

async function handleSubmit() {
  setLoading(true)
  try {
    await doSomething()
  } finally {
    setLoading(false)
  }
}

// في JSX
<button onClick={handleSubmit} disabled={loading}
  className={`btn ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'إرسال'}
</button>
```

### 4. Admin/Client API Protection
```js
// في كل API route يخدم بيانات حساسة

// للمشرف:
import { requireAdmin } from '@/lib/adminAuth'
export async function GET(req) {
  const authResponse = await requireAdmin(req)
  if (authResponse) return authResponse  // ← يعيد 401 تلقائياً
  // ... المنطق
}

// للعميل:
import { verifyToken } from '@/lib/clientAuth'
export async function GET(req) {
  const token = req.cookies.get('client_token')?.value
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  // استخدم payload.id
}
```

### 5. CSV Export مع Arabic Excel
```js
function exportCSV(data, filename) {
  const BOM = '﻿'  // ← ضروري للـ Excel العربي
  const rows = [
    ['الاسم', 'البريد', 'التاريخ'],  // header
    ...data.map(d => [d.name, d.email, d.date]),
  ]
  const csv = BOM + rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

---

## 18. أخطاء وقعنا فيها — لا تكررها

### ❌ خطأ 1: تاريخ ثابت في Countdown Timer
```js
// ❌ خطأ: كل المستخدمين يرون نفس التاريخ
const deadline = new Date('2025-12-31')

// ✓ صحيح: كل مستخدم لديه عداده الخاص
let expiry = localStorage.getItem('aa_expiry')
if (!expiry || expiry < Date.now()) {
  expiry = Date.now() + 5 * 24 * 60 * 60 * 1000
  localStorage.setItem('aa_expiry', expiry)
}
```

### ❌ خطأ 2: الأرقام معكوسة في RTL
```js
// ❌ خطأ: يعرض "+9753065..." بدل "+97430653759"
<span>+97430653759</span>

// ✓ صحيح
<span style={{ direction: 'ltr', unicodeBidi: 'embed', display: 'inline-block' }}>
  +97430653759
</span>
```

### ❌ خطأ 3: عملة خاطئة في الوثائق القانونية
```
❌ "الأسعار بالريال القطري"
✓ "الأسعار بالدينار التونسي (د.ت)"
```

### ❌ خطأ 4: Slug المقالة لا يطابق المحتوى
```js
// ❌ slug: 'harris-benedict-bmr'  والمحتوى عن Mifflin-St Jeor
// ✓ اجعل الـ slug يطابق المحتوى الفعلي دائماً
slug: 'mifflin-st-jeor-bmr'
```

### ❌ خطأ 5: عرض Placeholder للمستخدمين
```js
// ❌ خطأ: يعرض 'XX XXX XXX' لمستخدمين حقيقيين
const D17_NUMBER = 'XX XXX XXX'

// ✓ صحيح: أضف فحص وعرض "قريباً"
const D17_READY = D17_NUMBER !== 'XX XXX XXX'
// ثم: disable الزر مع badge "قريباً" إذا !D17_READY
```

### ❌ خطأ 6: إرسال بريد قبل الكتابة في Redis
```js
// ❌ خطأ: إذا انتهى Vercel timeout بعد البريد → سيُرسَل مجدداً
await sendEmail(...)
await updateSubmission(...) // قد لا يُنفَّذ

// ✓ صحيح: اكتب في Redis أولاً، ثم أرسل
await updateSubmission(...)  // optimistic write
try { await sendEmail(...) }
catch { await rollbackSubmission(...) }  // rollback إذا فشل
```

### ❌ خطأ 7: ga4 params كـ String بدل Number
```js
// ❌ خطأ: GA4 لا يتعرف على الأسعار كـ string
trackEvent('purchase', { value: plan.price })  // "125" string

// ✓ صحيح
trackEvent('purchase', { value: Number(plan.price), currency: 'TND' })
```

### ❌ خطأ 8: PDF يطلع ورقتين
```jsx
// ❌ إذا لم تضع maxHeight: '297mm' overflow: 'hidden'
// ✓ صحيح
<div style={{ height: '297mm', maxHeight: '297mm', overflow: 'hidden' }}>
```

### ❌ خطأ 9: nesting ثلاثي للـ carbCal في nutrition engine
```js
// ❌ يمكن أن يصبح سالباً
const carbCal = targetCal - proteinCal - fatCal

// ✓ أضف floor
const carbCal = Math.max(targetCal * 0.20, targetCal - proteinCal - fatCal)
```

---

## 19. ما يختلف في AMINE ACADEMY

AMINE ACADEMY منصة تعليمية لأطفال طيف التوحد — هذه الاختلافات تقنية مهمة:

### الهوية البصرية
```
Amine-Fit:    أسود داكن #0a0a0a + ذهبي #fbbf24 (مظهر gym/fitness)
Amine Academy: أبيض/فاتح + ألوان هادئة (بنفسجي/أزرق) (مظهر أكاديمي/طفولي)
```

### فئة المستخدمين
```
Amine-Fit:    بالغون يريدون لياقة بدنية
Amine Academy: ولي الأمر (يسجّل) + طفله (يستخدم)
→ نموذج التسجيل يجب أن يجمع: بيانات ولي الأمر + بيانات الطفل
→ الواجهة مزدوجة: لوحة تحكم للوالدين + واجهة مبسطة للطفل
```

### الدفع
```
Amine-Fit:    D17 + CCP (تونس فقط)
Amine Academy: اعتمد على واتساب + CCP في البداية
               إذا أردت دولياً: استكشف Stripe مستقبلاً
```

### المحتوى
```
Amine-Fit:    برامج تدريب + خطط غذائية (نصية، مخطط ADA)
Amine Academy: محتوى تعليمي (فيديوهات، تمارين تفاعلية، قصص)
→ تحتاج لنظام تخزين الملفات: Vercel Blob أو Cloudinary للفيديوهات
```

### المتغيرات التي ستبقى نفسها
```
AUTH_SECRET, UPSTASH_REDIS_*, GMAIL_*, RESEND_*, ANTHROPIC_API_KEY
CRON_SECRET, NEXT_PUBLIC_GA_ID
```

### الأسعار (عيّنها بالدينار التونسي دائماً)
```js
// لا تضع أسعار بعملة أخرى في الوثائق القانونية
const PLANS = {
  basic:    { price: 'XX', currency: 'د.ت' },
  standard: { price: 'XX', currency: 'د.ت' },
}
```

---

## 20. قائمة التحقق قبل الإطلاق

```markdown
### التقني
- [ ] كل المسارات تعيد 200 (افحص /، /register، /payment، /blog، /legal/*)
- [ ] 404 مخصص يعمل
- [ ] Middleware يحمي /dashboard/* و /client/* (افحص بدون cookie)
- [ ] Rate limiting على جميع auth routes (افحص 11+ طلب متتالي)
- [ ] CRON_SECRET موجود في Vercel env vars
- [ ] vercel.json يحتوي على crons

### البيانات والمحتوى
- [ ] لا placeholders (XX XXX XXX وما شابه) تظهر للمستخدمين
- [ ] العملة صحيحة في الوثائق القانونية
- [ ] تاريخ الوثائق القانونية محدّث
- [ ] Slugs المقالات تطابق محتواها
- [ ] الأسعار متطابقة في: الصفحة الرئيسية + صفحة الدفع + الـ chat system prompt

### الهوية والاحترافية
- [ ] لا اسم demo (أحمد محمد) في أي مكان يراه المستخدم
- [ ] لا ذكر للذكاء الاصطناعي في النص العربي للمستخدم
- [ ] لا ذكر لأسماء النماذج (Claude, GPT, ...) في واجهة المستخدم

### الأمان
- [ ] AUTH_SECRET قيمة قوية (openssl rand -hex 32)
- [ ] Cookies: httpOnly + secure + sameSite
- [ ] لا بيانات حساسة في localStorage أو URL params
- [ ] ANTHROPIC_API_KEY غير مكشوف في client-side code

### الـ SEO
- [ ] og-image.png موجود (1200×630)
- [ ] manifest.json موجود (PWA)
- [ ] JSON-LD schema صحيح
- [ ] robots.js + sitemap.js يعملان

### الإطلاق
- [ ] Domain مربوط بـ Vercel
- [ ] SSL يعمل
- [ ] Google Analytics تستقبل events
- [ ] تجربة عبر الهاتف المحمول (RTL + اتجاه النص)
- [ ] العداد التنازلي يبدأ لكل زائر من جديد (localStorage)
```

---

## ملاحظات نهائية

### مصادر مرجعية
- Mifflin-St Jeor (1990): BMR الأدق للسكان المعاصرين
- ADA Food Exchange Lists 2019: نظام تبادل الأغذية
- OWASP 2024: معايير تشفير كلمات المرور (scrypt)
- Upstash Redis Docs: https://upstash.com/docs/redis

### الملفات الأساسية التي يجب نسخها أولاً
```
1. lib/password.js         ← لا تعيد كتابة التشفير
2. lib/rateLimit.js        ← نفس المنطق تماماً
3. lib/mailer.js           ← فقط غيّر اسم المنصة
4. middleware.js           ← نفس البنية، غيّر المسارات
5. app/globals.css         ← نفس القواعد الأساسية
6. lib/clientAuth.js       ← نفس منطق HMAC
7. lib/submissions.js      ← نفس نمط Redis + double parse
```

---

*وثيقة أُنشئت من تجربة بناء Amine-Fit — منصة التدريب الشخصي والتغذية*
*آخر تحديث: يونيو 2026*
