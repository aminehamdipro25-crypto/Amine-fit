# Amine-Fit — المرجع التقني الكامل
> آخر تحديث: يونيو 2026 | Next.js 14 + Upstash Redis + Vercel

---

## 1. نظرة عامة على المشروع

منصة تدريب شخصي عربية RTL كاملة تشمل:
- صفحة هبوط احترافية (landing page)
- نموذج تسجيل متعدد الخطوات
- لوحة أدمن لإدارة العملاء
- بوابة عميل محمية
- حاسبة تغذية بنظام ADA Food Exchange
- مولّد خطط تدريب وتغذية بالذكاء الاصطناعي
- مساعد ذكي داخلي (chatbot)
- بوت واتساب تلقائي (يحتاج Meta Business Verification)
- تتبع إحصائيات GA4

**الدومين:** `amine-fit.com`  
**الاستضافة:** Vercel (auto-deploy من main branch)  
**قاعدة البيانات:** Upstash Redis (REST API)

---

## 2. Stack التقني

| الطبقة | التقنية |
|--------|---------|
| Framework | Next.js 14.2.5 — App Router |
| Language | JavaScript / JSX |
| Styling | Tailwind CSS 3.4.11 — RTL Arabic |
| Database | Upstash Redis (REST, لا TCP) |
| Auth | HMAC-SHA256 tokens (client) + Redis sessions (admin) |
| Email | Resend API + Gmail SMTP (fallback) |
| AI | Anthropic Claude (claude-haiku-4-5-20251001) |
| Analytics | Google Analytics 4 |
| PDF | pdfkit + @pdf-lib/fontkit |
| Charts | recharts 2.12.7 |
| Icons | lucide-react 0.441.0 |
| Payments | Stripe (مدمج) + D17 + CCP (يدوي) |
| Deploy | Vercel + Cron Jobs |

---

## 3. قواعد ثابتة لا تتغير أبداً

```
✅ الأسعار بالدينار التونسي (د.ت) فقط — لا ريال قطري أبداً
✅ الموقع كله RTL عربي
✅ الموقع: الدوحة، قطر
✅ معادلة السعرات: Mifflin-St Jeor (ليس Harris-Benedict)
✅ تسميات التدريب بالإنجليزية دائماً (Sets, Reps, WARM UP, COOL DOWN...)
✅ لا تُذكر AI أو Claude أو Anthropic للمستخدمين أبداً
✅ لا أرقام بطاقة بنكية أو CVV في الموقع
✅ D17_NUMBER = 'XX XXX XXX' حتى يُفعّل الوالد الرقم
✅ CCP IBAN: TN59 1780 1000 0002 1931 0870 | الاسم: HAMDI AMINE B JALOUL
```

---

## 4. متغيرات البيئة (21 متغير)

```env
# ─── Redis (Upstash) ───────────────────────────────────────────────────
UPSTASH_REDIS_REST_URL=https://....upstash.io
UPSTASH_REDIS_REST_TOKEN=...
# بديل (Vercel KV):
KV_REST_API_URL=...
KV_REST_API_TOKEN=...

# ─── Auth & Security ───────────────────────────────────────────────────
AUTH_SECRET=...           # HMAC secret للـ client tokens — مطلوب إلزامياً
DASHBOARD_PASSWORD=...    # كلمة سر الأدمن
CRON_SECRET=...           # للتحقق من Cron Jobs

# ─── Email ────────────────────────────────────────────────────────────
GMAIL_USER=...            # Gmail للإرسال
GMAIL_APP_PASSWORD=...    # App Password من Google
RESEND_API_KEY=...        # بديل Resend (الأفضل)
NOTIFY_EMAIL=...          # إيميل تنبيهات الأمان

# ─── AI ───────────────────────────────────────────────────────────────
ANTHROPIC_API_KEY=...     # Claude API — مطلوب للمساعد الذكي وتوليد الخطط

# ─── WhatsApp Bot (Meta) ──────────────────────────────────────────────
WHATSAPP_TOKEN=...        # Access Token من Meta Developer Console
WHATSAPP_PHONE_ID=...     # Phone Number ID (ليس رقم الهاتف)
WHATSAPP_VERIFY_TOKEN=... # كلمة سر عشوائية تختارها

# ─── Payments ─────────────────────────────────────────────────────────
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# ─── Analytics & Public ───────────────────────────────────────────────
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_BASE_URL=https://amine-fit.com
GOOGLE_SITE_VERIFICATION=...
NODE_ENV=production
```

---

## 5. هيكل الملفات الكامل

```
/Amine-fit
├── app/
│   ├── page.js                          # الصفحة الرئيسية (Landing)
│   ├── layout.js                        # Root layout + GA4 + Cairo font
│   ├── globals.css
│   ├── error.js
│   ├── not-found.js
│   ├── icon.js
│   ├── robots.js
│   ├── sitemap.js
│   │
│   ├── register/
│   │   ├── page.js                      # نموذج التسجيل 5 خطوات
│   │   └── success/page.js              # صفحة النجاح بعد التسجيل
│   │
│   ├── payment/
│   │   ├── page.js                      # صفحة الدفع (D17 + CCP)
│   │   └── success/page.js
│   │
│   ├── blog/
│   │   ├── page.js                      # قائمة المقالات
│   │   ├── BlogContent.jsx
│   │   └── [slug]/page.js               # مقال فردي
│   │
│   ├── plan-report/page.js              # تقرير PDF للطباعة
│   ├── verify-email/page.js
│   │
│   ├── legal/
│   │   ├── layout.js
│   │   ├── privacy/page.js              # سياسة الخصوصية
│   │   ├── terms/page.js                # الشروط والأحكام
│   │   └── cancellation/page.js         # سياسة الإلغاء
│   │
│   ├── client/                          # بوابة العميل (محمية بـ middleware)
│   │   ├── layout.js
│   │   ├── page.js
│   │   ├── login/page.js
│   │   ├── demo/page.js
│   │   ├── dashboard/page.js
│   │   ├── plan/
│   │   │   ├── training/page.js
│   │   │   └── nutrition/page.js
│   │   ├── progress/page.js
│   │   ├── photos/page.js
│   │   ├── journal/page.js
│   │   ├── shopping/page.js
│   │   └── lab/
│   │       ├── page.js
│   │       └── guide/page.js
│   │
│   ├── dashboard/                       # لوحة الأدمن (محمية بـ middleware)
│   │   ├── login/page.js
│   │   └── (admin)/
│   │       ├── layout.js
│   │       ├── page.js
│   │       ├── DashboardClient.js
│   │       ├── analytics/
│   │       │   ├── page.js
│   │       │   └── AnalyticsClient.js   # ⚠️ كان premium:100 أُصلح لـ 300
│   │       ├── clients/
│   │       │   ├── page.js
│   │       │   ├── ClientsClient.js
│   │       │   └── [id]/plan/
│   │       │       ├── page.js
│   │       │       └── PlanBuilder.js
│   │       ├── subscribers/
│   │       │   ├── page.js
│   │       │   └── SubscribersClient.js
│   │       ├── calculator/page.js
│   │       └── training-planner/page.js
│   │
│   └── api/
│       ├── register/                    # تسجيل عميل جديد
│       │   ├── route.js                 # POST: يحفظ في Redis + يرسل إيميل
│       │   ├── [id]/route.js
│       │   └── [id]/plan/route.js
│       │
│       ├── client/
│       │   ├── auth/route.js            # POST: تسجيل دخول العميل
│       │   ├── logout/route.js
│       │   ├── me/route.js
│       │   ├── ping/route.js            # heartbeat — يحدث last seen
│       │   ├── checkin/route.js
│       │   ├── protocol/route.js
│       │   ├── shopping-list/route.js
│       │   ├── photos/route.js
│       │   └── logs/route.js
│       │
│       ├── admin/
│       │   ├── clients/route.js
│       │   ├── clients/[id]/
│       │   │   ├── checkins/route.js
│       │   │   ├── checkin-reply/route.js
│       │   │   ├── protocol/route.js
│       │   │   ├── subscription/route.js
│       │   │   ├── progress/route.js
│       │   │   ├── resources/route.js
│       │   │   ├── photos/route.js
│       │   │   └── kick/route.js        # طرد/تعليق العميل
│       │   ├── preview-client/[id]/route.js
│       │   ├── gift/route.js
│       │   └── online/route.js
│       │
│       ├── dashboard/
│       │   ├── auth/route.js            # POST: تسجيل دخول الأدمن
│       │   ├── notifications/route.js
│       │   └── approve/[id]/route.js
│       │
│       ├── ai-plan/route.js             # توليد خطة تغذية بـ Claude
│       ├── ai-training/route.js         # توليد برنامج تدريب
│       ├── ai-protocol/route.js
│       ├── chat/route.js                # المساعد الذكي (chatbot)
│       │
│       ├── contact/route.js             # نموذج التواصل
│       ├── gift/route.js                # التحقق من كود هدية
│       ├── clients/route.js
│       ├── exercise-image/route.js      # ✅ أُضيف rate limiting
│       ├── print/[id]/route.js
│       ├── progress/route.js
│       │
│       ├── payment/
│       │   ├── create-session/route.js
│       │   └── webhook/route.js
│       │
│       ├── cron/
│       │   ├── check-subscriptions/route.js   # يومياً 1 AM UTC
│       │   └── abandoned-reminder/route.js    # يومياً 10 AM UTC
│       │
│       └── webhook/
│           └── whatsapp/route.js        # بوت واتساب (Meta Cloud API)
│
├── components/
│   ├── landing/
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── Stats.jsx
│   │   ├── Services.jsx
│   │   ├── About.jsx
│   │   ├── HowItWorks.jsx
│   │   ├── Pricing.jsx                  # ✅ أُضيف GA4 tracking
│   │   ├── ComparisonTable.jsx
│   │   ├── Calculator.jsx
│   │   ├── Results.jsx
│   │   ├── Testimonials.jsx
│   │   ├── VideoSection.jsx
│   │   ├── PlatformTour.jsx
│   │   ├── AnimatedPlatformDemo.jsx
│   │   ├── PlanQuiz.jsx
│   │   ├── FAQ.jsx
│   │   ├── ContactForm.jsx              # ✅ أُصلحت الأسعار TND + GA4
│   │   ├── ContactSection.jsx
│   │   ├── WaitingList.jsx
│   │   ├── Referral.jsx
│   │   ├── PromoBanner.jsx
│   │   ├── WhatsAppButton.jsx           # المساعد الذكي + GA4 tracking
│   │   ├── Footer.jsx
│   │   └── ScrollToTop.jsx
│   │
│   └── dashboard/
│       ├── Header.jsx
│       └── Sidebar.jsx
│
├── lib/
│   ├── nutritionEngine.js               # Mifflin-St Jeor + ADA Exchange
│   ├── submissions.js                   # Redis CRUD للتسجيلات
│   ├── clientAuth.js                    # HMAC token creation/verification
│   ├── clientSession.js                 # Redis session management
│   ├── adminAuth.js                     # Admin session helper
│   ├── adminSession.js                  # Admin Redis CRUD
│   ├── clientLogs.js                    # Training logs
│   ├── mailer.js                        # Resend + Gmail fallback
│   ├── password.js                      # scrypt2 (OWASP 2024)
│   ├── rateLimit.js                     # Redis rate limiting (fail-closed)
│   ├── securityAlert.js                 # Email alerts
│   ├── blogPosts.js                     # 9 مقالات عربية مسبقة الكتابة
│   ├── gtag.js                          # GA4 trackEvent()
│   └── mockData.js                      # بيانات تجريبية
│
├── middleware.js                        # حماية /dashboard/* و /client/*
├── next.config.mjs                      # Security headers + CSP
├── tailwind.config.js                   # Custom colors: primary + gold
├── vercel.json                          # Cron jobs config
├── package.json
├── CLAUDE.md                            # تعليمات المشروع
├── AMINE_FIT_FULL_REFERENCE.md          # هذا الملف
└── AMINE_ACADEMY_BLUEPRINT.md           # مرجع المنصة الثانية
```

---

## 6. نظام المصادقة (Auth)

### أ. مصادقة العميل (HMAC-SHA256)

```js
// إنشاء Token — lib/clientAuth.js
const payload = { id: clientId, sessionId, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 }
const data    = Buffer.from(JSON.stringify(payload)).toString('base64url')
const sig     = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('base64url')
const token   = `${data}.${sig}`

// التحقق (async) — يتحقق من التوقيع + صلاحية + Redis session
export async function verifyToken(token) {
  const payload = verifySignature(token)   // HMAC check + exp
  if (!payload || !payload.sessionId) return null
  const stored = await redisGet(`client_sess:${payload.id}`)
  if (stored === payload.sessionId) return payload
  // Admin preview token?
  const preview = await redisGet(`client_preview:${payload.id}`)
  if (preview === payload.sessionId) return payload
  return null   // محذوف/انتهت الجلسة
}
```

**Redis keys للعملاء:**
```
client_sess:{clientId}       → sessionId (30-day TTL)
client_preview:{clientId}    → sessionId للأدمن (preview)
client_lastseen:{clientId}   → timestamp (10-min TTL)
client_login_time:{clientId} → timestamp (30-day TTL)
```

### ب. مصادقة الأدمن

```js
// token عشوائي 32 بايت
const token = crypto.randomBytes(32).toString('hex')
await redis.set(`admin_sess:${token}`, '1', { ex: 30 * 24 * 60 * 60 })

// كوكي: HttpOnly, Secure, SameSite=Lax
res.cookies.set('admin_token', token, {
  httpOnly: true, secure: true, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60
})
```

### ج. Middleware (حماية المسارات)

```js
// middleware.js — يحمي /dashboard/* و /client/*
export const config = {
  matcher: ['/dashboard/:path*', '/client/:path*'],
}

// Admin: يتحقق من admin_sess:{token} في Redis
// Client: يتحقق من HMAC + Redis session + حالة التعليق (suspended)
// Suspended clients → redirect to /client/login?suspended=1
```

---

## 7. Redis — هيكل البيانات

### ⚠️ قاعدة مهمة: Double JSON Parse

```js
// Redis يُعيد string → JSON.parse مرة أولى
// النتيجة قد تكون string أيضاً → JSON.parse مرة ثانية
let data = await redis.get(key)
if (typeof data === 'string') data = JSON.parse(data)
if (typeof data === 'string') data = JSON.parse(data)
```

### مخطط مفاتيح Redis الكامل

```
# ─── التسجيلات ──────────────────────────────────────────────────
sub:{id}                    → JSON كامل للعميل
subs:index                  → JSON array من IDs (الأحدث أولاً)
sub:email:{email}           → id للبحث السريع O(1)
amine_fit_submissions       → Legacy blob (يُرحَّل تلقائياً)

# ─── الجلسات ─────────────────────────────────────────────────────
admin_sess:{token}          → '1' (30-day TTL)
client_sess:{clientId}      → sessionId (30-day TTL)
client_preview:{clientId}   → sessionId للأدمن
client_lastseen:{clientId}  → timestamp (10-min TTL)
client_login_time:{clientId}→ timestamp (30-day TTL)

# ─── Logs & Rate Limiting ──────────────────────────────────────────
amine_fit_logs_{clientId}   → JSON array للـ training logs
rl:{key}                    → INCR counter (window: windowSeconds TTL)
wa_msg:{msgId}              → '1' NX EX 300 (dedup واتساب)

# ─── Gift Codes ────────────────────────────────────────────────────
gift_code:{CODE}            → JSON { plan, planName, price, used, usedBy, usedAt }
```

### Schema التسجيل الكامل

```json
{
  "id":               "AF-1748600000000-abc123",
  "createdAt":        "2026-06-07T12:00:00.000Z",
  "email":            "client@example.com",
  "name":             "أحمد بن علي",
  "phone":            "+974 3065 xxxx",
  "gender":           "male | female",
  "age":              30,
  "height":           175,
  "weight":           75,
  "targetWeight":     65,
  "goal":             "loss | gain | maintain | performance",
  "activityLevel":    "sedentary | light | moderate | active | veryActive",
  "interestedPlan":   "برنامج التدريب | الباقة الشهرية | باقة 3 أشهر",
  "status":           "new | pending | active | expired | suspended",
  "activationCode":   "SHA256-hex أو null",
  "clientPassword":   "scrypt2$salt$hash أو null",
  "subscriptionEnd":  "ISO-8601 أو null",
  "subscriptionPlan": "basic | standard | premium",
  "trainingPlan":     { /* خطة التدريب الكاملة */ },
  "nutritionPlan":    { /* خطة التغذية الكاملة */ }
}
```

---

## 8. محرك التغذية (Nutrition Engine)

**الملف:** `lib/nutritionEngine.js`

### معادلة السعرات: Mifflin-St Jeor (1990)

```js
// ذكر:  BMR = 10×weight + 6.25×height - 5×age + 5
// أنثى: BMR = 10×weight + 6.25×height - 5×age - 161
// TDEE = BMR × Activity Factor
```

### معاملات النشاط

| المفتاح | الوصف | المعامل |
|---------|-------|---------|
| sedentary | خامل | 1.20 |
| light | خفيف (1-3 أيام) | 1.375 |
| moderate | معتدل (3-5 أيام) | 1.55 |
| active | نشيط (6-7 أيام) | 1.725 |
| veryActive | نشيط جداً | 1.90 |

### تعديل الهدف

| الهدف | تعديل السعرات | بروتين | ماكرو |
|-------|--------------|-------|-------|
| loss (خسارة) | -500 kcal | 2.0g/kg | C40% P35% F25% |
| maintain | 0 | 1.8g/kg | C45% P30% F25% |
| gain (بناء) | +300 kcal | 2.2g/kg | C45% P35% F20% |

### نظام ADA Food Exchange (2019)

```js
// 6 مجموعات غذائية
starch:    { kcal: 80,  carbs: 15, protein: 3,  fat: 1 }  // نشويات
meat:      { kcal: 45,  carbs: 0,  protein: 7,  fat: 2 }  // بروتين
milk:      { kcal: 90,  carbs: 12, protein: 8,  fat: 0 }  // ألبان
fat:       { kcal: 45,  carbs: 0,  protein: 0,  fat: 5 }  // دهون
fruit:     { kcal: 60,  carbs: 15, protein: 0,  fat: 0 }  // فواكه
vegetable: { kcal: 25,  carbs: 5,  protein: 2,  fat: 0 }  // خضروات
```

**قاعدة بيانات الطعام:** 50+ صنف بالغرام ووقت الوجبة (B/S/L/D)

---

## 9. الباقات والأسعار

```js
// الأسعار الصحيحة — بالدينار التونسي فقط
const PLAN_PRICE = { basic: 50, standard: 125, premium: 300 }
const PLAN_LABELS = {
  basic:    'برنامج التدريب',  // 50 د.ت / شهر
  standard: 'الباقة الشهرية', // 125 د.ت / شهر (الأكثر طلباً)
  premium:  'باقة 3 أشهر',   // 300 د.ت / 3 أشهر (الأوفر)
}
// الأسعار الأصلية (قبل خصم 50%): 100 / 250 / 600 د.ت
```

---

## 10. نظام الدفع

### الدفع اليدوي (الحالي)
- **CCP IBAN:** TN59 1780 1000 0002 1931 0870 | الاسم: HAMDI AMINE B JALOUL
- **D17:** `XX XXX XXX` (معطّل حتى التفعيل)

```js
// app/payment/page.js
const D17_NUMBER = 'XX XXX XXX'
const D17_READY  = D17_NUMBER !== 'XX XXX XXX'
// زر D17 معطّل مع badge "قريباً" عندما D17_READY = false
```

### Stripe (مدمج لكن غير مُفعَّل)
- `/api/payment/create-session` — يُنشئ Checkout Session
- `/api/payment/webhook` — يستقبل أحداث Stripe

---

## 11. المساعد الذكي (Chatbot)

**المكوّن:** `components/landing/WhatsAppButton.jsx`  
**الـ API:** `app/api/chat/route.js`

```js
// localStorage key لتذكّر إغلاق الـ tooltip
const TOOLTIP_KEY = 'af_wa_tooltip_dismissed'

// GA4 Events المُتتبَّعة
trackEvent('chat_widget_opened')
trackEvent('chat_message_sent', { question: userText.slice(0, 50) })
trackEvent('whatsapp_chat_clicked', { source: 'chat_widget' })

// النموذج: quick questions → chat AI → فتح واتساب مباشرة
```

**الأسئلة السريعة:**
- ما هي الأسعار؟
- كيف أبدأ البرنامج؟
- هل يناسب المبتدئين؟
- كيف يتم الدفع؟

---

## 12. بوت واتساب التلقائي (Meta Cloud API)

**الملف:** `app/api/webhook/whatsapp/route.js`

### إعداد Meta (مرة واحدة — يحتاج Business Verification)

```
1. business.facebook.com/settings/security → Vérification de l'entreprise
2. developers.facebook.com → Create App → WhatsApp
3. Webhook URL: https://amine-fit.com/api/webhook/whatsapp
4. Verify Token: قيمة WHATSAPP_VERIFY_TOKEN
5. Subscribe to: messages
```

### منطق البوت

```js
// GET: التحقق من webhook (hub.challenge)
export async function GET(req) {
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN)
    return new Response(challenge, { status: 200 })
}

// POST: استقبال رسالة → Claude → رد تلقائي
export async function POST(req) {
  const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
  if (!text || text.length > 1000) return OK  // ✅ حماية طول الرسالة
  if (await isDuplicate(message.id)) return OK  // dedup بـ Redis NX EX 300
  if (await isRateLimited(`wa_num:${from}`, 10, 3600)) return OK  // 10 رسائل/ساعة
  const reply = await getReply(text)  // Claude Haiku
  await sendReply(from, reply)        // Meta Graph API v20.0
}
```

---

## 13. Rate Limiting (حماية الـ APIs)

**الملف:** `lib/rateLimit.js` — **Fail Closed** (يحجب عند فشل Redis)

```js
export async function isRateLimited(key, maxRequests, windowSeconds) {
  // Redis SET NX EX + INCR في pipeline واحد
  // يُعيد true (محجوب) إذا تجاوز maxRequests
  // يُعيد true إذا فشل Redis (fail-closed لمنع bypass)
}
```

### حدود Rate Limiting المُطبَّقة

| الـ Endpoint | الحد | النافذة |
|-------------|------|---------|
| Gift code check (GET) | 10 طلبات | 5 دقائق |
| Gift code redeem (POST) | 5 طلبات | ساعة |
| Exercise image | 60 طلباً | دقيقة |
| WhatsApp bot (per number) | 10 رسائل | ساعة |

---

## 14. تشفير كلمات المرور

**الملف:** `lib/password.js`

```js
// scrypt2 — OWASP 2024 (N=65536, r=8, p=1, keyLen=64, salt=32 bytes)
export function hashPassword(plain) {
  const salt = crypto.randomBytes(32).toString('hex')
  const hash = crypto.scryptSync(plain, salt, 64, { N: 65536, r: 8, p: 1 }).toString('hex')
  return `scrypt2$${salt}$${hash}`
}

// دعم الصيغة القديمة (scrypt$) للمقارنة فقط — يُعاد تشفيرها عند الدخول التالي
```

---

## 15. Analytics — تتبع الأحداث GA4

**الملف:** `lib/gtag.js`

```js
export function trackEvent(eventName, params = {}) {
  if (typeof window !== 'undefined' && window.gtag)
    window.gtag('event', eventName, params)
}
```

### الأحداث المُتتبَّعة

| الحدث | المكان | الـ Params |
|-------|--------|-----------|
| `form_start` | Register page | `{ form_name, interested_plan }` |
| `form_step_complete` | Register page | `{ step_number, step_name }` |
| `registration_complete` | Register page | `{ interested_plan, goal, gender, heard_from }` |
| `chat_widget_opened` | WhatsApp button | — |
| `chat_message_sent` | WhatsApp button | `{ question: first50chars }` |
| `whatsapp_chat_clicked` | WhatsApp button | `{ source }` |
| `plan_modal_opened` | Pricing | `{ plan }` |
| `plan_cta_clicked` | Pricing | `{ plan, price }` |
| `contact_form_submitted` | ContactForm | `{ goal, pkg }` |

---

## 16. SEO والمواد الثابتة

```js
// app/sitemap.js — يُنشئ sitemap.xml تلقائياً
// app/robots.js  — يُنشئ robots.txt
// app/icon.js    — Favicon ديناميكي

// Meta tags في layout.js
export const metadata = {
  title: 'Amine-Fit | المدرب أمين حمدي',
  description: '...',
  openGraph: { ... },
  twitter: { ... },
}

// Blog slugs (lib/blogPosts.js) — 9 مقالات:
// mifflin-st-jeor-bmr, protein-building, ...
```

---

## 17. Security Headers (next.config.mjs)

```js
// CSP يسمح بـ:
// Google Analytics + googletagmanager.com
// fonts.gstatic.com + fonts.googleapis.com
// الـ API الخاص فقط (self)

headers: [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Content-Security-Policy', value: "default-src 'self'..." },
]
```

---

## 18. Cron Jobs (Vercel)

```json
// vercel.json
{
  "crons": [
    { "path": "/api/cron/check-subscriptions", "schedule": "0 1 * * *" },
    { "path": "/api/cron/abandoned-reminder",  "schedule": "0 10 * * *" }
  ]
}
```

- **check-subscriptions:** يُعدّل status إلى `expired` عند انتهاء الاشتراك
- **abandoned-reminder:** يُرسل تذكير لمن سجّل ولم يدفع بعد 24 ساعة

---

## 19. Tailwind — الألوان المخصصة

```js
// tailwind.config.js
colors: {
  primary: { 400:'#818cf8', 500:'#6366f1', 600:'#4f46e5', 900:'#1e1b4b' },
  gold: {
    300: '#fcd34d',
    400: '#fbbf24',  // ← الذهبي الرئيسي
    500: '#f59e0b',
  }
}
// الخط الرئيسي: Cairo (Google Fonts) — RTL
```

---

## 20. الصور التمارين

**الملف:** `app/api/exercise-image/route.js`

```
Priority:
1. Static Map (170+ تمرين — instant, no network)
2. wger.de API fallback (مع timeout 5 ثوانٍ)
3. in-memory cache (Map) للنتائج

Rate limit: 60 req/min per IP ✅
```

---

## 21. تاريخ التغييرات المهمة (Changelog)

### قبل الإطلاق
```
✅ D17: زر معطّل مع badge "قريباً" (D17_NUMBER = 'XX XXX XXX')
✅ Legal pages: التاريخ يونيو 2026، العملة د.ت
✅ Blog slug: harris-benedict → mifflin-st-jeor-bmr
✅ WhatsApp chatbot: tooltip localStorage، GA4 tracking، greeting
✅ WhatsApp bot: بوت تلقائي (يحتاج Meta Business Verification)
```

### بعد الإطلاق (إصلاحات الأمان والجودة)
```
✅ AnalyticsClient.js: PLAN_PRICE.premium 100→300 (bug إيرادات حرج)
✅ gift/route.js GET: أسباب الخطأ not_found/used → invalid (منع enumeration)
✅ exercise-image/route.js: أُضيف rate limiting (60/min per IP)
✅ webhook/whatsapp: حد أقصى 1000 حرف للرسائل
✅ ContactForm.jsx: أسعار القطري ر.ق → الدينار التونسي د.ت
✅ register/page.js: grid-cols-3 → grid-cols-1 sm:grid-cols-3 (mobile)
✅ register/page.js: min/max لحقول الطول (100-250) والوزن (30-300)
✅ Pricing.jsx: GA4 events (plan_modal_opened, plan_cta_clicked)
✅ ContactForm.jsx: GA4 event (contact_form_submitted)
```

---

## 22. ما تبقّى (Pending)

| الموضوع | الأولوية | الحل |
|---------|---------|------|
| بوت واتساب التلقائي | 🔴 عالية | إتمام Meta Business Verification |
| D17 payment | 🔴 عالية | تفعيل الرقم من الوالد ثم تعديل `D17_NUMBER` |
| Cookie consent banner | 🟡 متوسطة | GDPR — GA4 يعمل دون موافقة |

---

## 23. أوامر Git

```bash
# ⚠️ دائماً commit مباشرة على main — لا feature branches
git add <files>
git commit -m "رسالة الـ commit"
git push origin main
# Vercel يُنشر تلقائياً خلال 30-60 ثانية
```

---

## 24. معلومات المدرب (System Prompt الـ AI)

```
أمين حمدي — مدرب شخصي ومدرب تغذية معتمد
خبرة: أكثر من 10 سنوات
من: تونس — يعمل من الدوحة، قطر

الباقات:
• برنامج التدريب: 50 د.ت/شهر
• الباقة الشهرية: 125 د.ت/شهر (الأكثر طلباً)
• باقة 3 أشهر: 300 د.ت (الأوفر — خصم 50% الآن)

التسجيل: amine-fit.com/register (مجاني) → مراجعة خلال 24 ساعة
الدفع: D17 أو إيداع في مكتب البريد التونسي → إثبات على واتساب → تفعيل خلال ساعة
```

---

*آخر تحديث: يونيو 2026 — كل الكود على branch: main*
