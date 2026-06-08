# Amine-Fit — وثيقة المشروع الشاملة

> **أمين حمدي** — مدرب شخصي ومدرب تغذية معتمد، الدوحة، قطر  
> الموقع: https://amine-fit.com | البريد: amine.hamdi.pro25@gmail.com | واتساب: +974 3065 3759

---

## قواعد Git (إلزامية)

- **دائماً commit وpush مباشرة إلى `main`**
- لا تُنشئ فروعاً (feature branches) أبداً
- كل تعديل → `git add <files> && git commit && git push origin main`
- Vercel يرصد `main` وينشر تلقائياً عند كل push

---

## Stack التقني

| الطبقة | التقنية |
|--------|---------|
| Frontend/Backend | Next.js 14 App Router (SSR + API Routes) |
| CSS | Tailwind CSS — واجهة عربية RTL |
| قاعدة البيانات | Upstash Redis (REST API) |
| المصادقة (مدير) | Cookie `admin_token` → Redis session |
| المصادقة (عميل) | Cookie `client_token` HMAC-SHA256 + Redis session |
| البريد الإلكتروني | Gmail SMTP (أساسي) + Resend (احتياطي) |
| الإشعارات | Telegram Bot API |
| الاستضافة | Vercel (Auto-deploy من main) |
| PWA | Service Worker + SwRegister component |
| التحليلات | Google Analytics 4 |

---

## متغيرات البيئة المطلوبة (Vercel Environment Variables)

```
# Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
# أو البديل:
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Auth
AUTH_SECRET=                  # سر HMAC للتوكنات (عشوائي طويل)
DASHBOARD_PASSWORD=           # كلمة مرور لوحة التحكم

# Email
GMAIL_USER=                   # amine.hamdi.pro25@gmail.com
GMAIL_APP_PASSWORD=           # App Password من Google
RESEND_API_KEY=               # احتياطي
NOTIFY_EMAIL=                 # الإيميل الذي يستقبل إشعارات التسجيل

# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Site
NEXT_PUBLIC_BASE_URL=https://amine-fit.com

# AI (Claude API)
ANTHROPIC_API_KEY=

# Analytics
NEXT_PUBLIC_GA_ID=

# Cron (لحماية نقاط cron)
CRON_SECRET=
```

---

## هيكل الملفات الرئيسية

### lib/ — المكتبات المشتركة

| الملف | الغرض |
|-------|-------|
| `lib/submissions.js` | Redis read/write للعملاء (saveSubmission, getSubmissionByEmail, updateSubmission) — double JSON.parse |
| `lib/nutritionEngine.js` | Harris-Benedict BMR + ADA 2019 food exchange + FFM-based protein (Mifflin-St Jeor) |
| `lib/clientAuth.js` | createToken, verifyToken (HMAC-SHA256, 30-day, Redis session revocation) |
| `lib/clientSession.js` | إنشاء/حذف Redis sessions للعملاء |
| `lib/adminAuth.js` | isAdmin, requireAdmin — يقرأ cookie admin_token |
| `lib/adminSession.js` | createAdminSession, verifyAdminSession, deleteAdminSession في Redis |
| `lib/mailer.js` | sendEmail — Gmail SMTP أولاً، Resend احتياطياً |
| `lib/telegram.js` | sendTelegramMessage — يُهمل بصمت إذا لم تُضبط env vars |
| `lib/rateLimit.js` | isRateLimited — Redis INCR + EXPIRE |
| `lib/securityAlert.js` | sendSecurityAlert — تنبيه عند هجمات brute-force |
| `lib/password.js` | bcrypt/scrypt لكلمات مرور العملاء |
| `lib/blogPosts.js` | بيانات مقالات المدونة (static) |
| `lib/mockData.js` | بيانات وهمية للرسوم البيانية |

### middleware.js
يحمي `/dashboard/*` (يطلب admin_token) و`/client/*` (يطلب client_token).

---

## نقاط API الرئيسية

### Auth والمصادقة

| المسار | الطريقة | الغرض |
|--------|---------|-------|
| `/api/dashboard/auth` | POST/GET/DELETE | تسجيل دخول/خروج المدير — rate-limited 5/15min |
| `/api/client/auth` | POST | تفعيل حساب العميل بكود 6 أحرف أو كلمة مرور |
| `/api/client/logout` | POST | حذف client session من Redis |
| `/api/client/me` | GET | بيانات العميل الحالي |
| `/api/client/ping` | POST | تسجيل "آخر ظهور" للعميل |

### التسجيل والهدايا

| المسار | الطريقة | الغرض |
|--------|---------|-------|
| `/api/register` | POST | تسجيل عميل جديد — إذا كان giftCode صالح يُفعَّل تلقائياً |
| `/api/gift` | GET | التحقق من كود الهدية (public) |
| `/api/gift` | POST | تأشير الكود كـ used |
| `/api/admin/gift` | POST | إنشاء كود هدية جديد (admin-only) |
| `/api/dashboard/approve/[id]` | POST | موافقة يدوية + توليد كود تفعيل 6 أحرف |

### لوحة التحكم — العملاء

| المسار | الطريقة | الغرض |
|--------|---------|-------|
| `/api/clients` | GET | قائمة جميع العملاء |
| `/api/admin/clients/[id]/subscription` | POST/DELETE | تعديل اشتراك عميل |
| `/api/admin/clients/[id]/kick` | POST | طرد عميل (إلغاء session) |
| `/api/admin/clients/[id]/protocol` | GET/POST | بروتوكول العميل |
| `/api/admin/clients/[id]/tasks` | GET/POST/DELETE | مهام العميل |
| `/api/admin/clients/[id]/resources` | GET/POST/DELETE | موارد (روابط/ملفات) |
| `/api/admin/clients/[id]/progress` | GET/POST | تسجيلات التقدم |
| `/api/admin/clients/[id]/photos` | GET/DELETE | صور العميل |
| `/api/admin/clients/[id]/checkins` | GET | سجل check-ins |
| `/api/admin/clients/[id]/checkin-reply` | POST | رد المدرب على check-in |
| `/api/admin/preview-client/[id]` | POST/DELETE | معاينة بوابة العميل كمدير |

### AI والبرامج

| المسار | الطريقة | الغرض |
|--------|---------|-------|
| `/api/ai-plan` | POST | توليد خطة تغذية (Claude API) |
| `/api/ai-training` | POST | توليد برنامج تدريبي (Claude API) |
| `/api/ai-protocol` | POST | توليد بروتوكول عميل (Claude API) |
| `/api/ai-chat` | POST | مساعد AI للعميل |

### Pricing والمدفوعات

| المسار | الطريقة | الغرض |
|--------|---------|-------|
| `/api/pricing` | GET/POST | قراءة/تعديل الأسعار (admin-only للـ POST) |
| `/api/admin/offer` | GET/POST/DELETE | إدارة العروض والخصومات |
| `/api/geo` | GET | تحديد بلد الزائر (Vercel geo headers) |

### أدوات أخرى

| المسار | الطريقة | الغرض |
|--------|---------|-------|
| `/api/dashboard/test-telegram` | POST | اختبار إشعارات تيليغرام (admin-only) |
| `/api/cron/check-subscriptions` | GET | فحص انتهاء الاشتراكات (cron يومي) |
| `/api/cron/abandoned-reminder` | GET | تذكير المتخلين عن الدفع (cron يومي) |
| `/api/print/[id]` | GET | طباعة/PDF لاستبيان عميل |

---

## صفحات الموقع

### الصفحات العامة (Landing)

| المسار | الغرض |
|--------|-------|
| `/` | الصفحة الرئيسية (Hero + Pricing + Testimonials...) |
| `/register` | استبيان تسجيل العميل — 8 أقسام |
| `/register/success` | صفحة نجاح التسجيل |
| `/payment` | صفحة الدفع — D17 / بريد / Fawra حسب الموقع الجغرافي |
| `/payment/success` | نجاح الدفع |
| `/blog` | قائمة المقالات |
| `/blog/[slug]` | مقال واحد |
| `/plan-report` | تقرير خطة التغذية (طباعة PDF) |
| `/legal/privacy` | سياسة الخصوصية |
| `/legal/terms` | شروط الاستخدام |
| `/legal/cancellation` | سياسة الإلغاء |

### بوابة العميل `/client/*`

| المسار | الغرض |
|--------|-------|
| `/client/login` | تسجيل دخول العميل (كود تفعيل أو كلمة مرور) — صورة المدرب في الخلفية |
| `/client/dashboard` | لوحة تحكم العميل الرئيسية |
| `/client/plan/nutrition` | خطة التغذية |
| `/client/plan/training` | البرنامج التدريبي |
| `/client/progress` | متابعة التقدم |
| `/client/photos` | صور المقارنة |
| `/client/lab` | مختبر التحليلات (InBody) |
| `/client/journal` | يومية التدريب |
| `/client/shopping` | قائمة التسوق |
| `/client/resources` | الموارد والملفات |

### لوحة التحكم `/dashboard/*`

| المسار | الغرض |
|--------|-------|
| `/dashboard/login` | دخول المدرب بكلمة مرور |
| `/dashboard` | الصفحة الرئيسية — إحصائيات + عروض + اختبار تيليغرام |
| `/dashboard/clients` | قائمة العملاء + تفاصيل + إدارة كاملة |
| `/dashboard/clients/[id]/plan` | بناء خطة تغذية/تدريب لعميل |
| `/dashboard/analytics` | الإحصائيات المالية والتشغيلية |
| `/dashboard/calculator` | حاسبة التغذية للمدرب |
| `/dashboard/training-planner` | مولد البرامج التدريبية |
| `/dashboard/subscribers` | إدارة المشتركين |
| `/dashboard/testimonials` | إدارة تقييمات العملاء |

---

## نظام المصادقة بالتفصيل

### مدير (Dashboard)
1. POST `/api/dashboard/auth` بكلمة المرور
2. `crypto.timingSafeEqual` مقارنة timing-safe
3. يُولَّد `crypto.randomBytes(32).toString('base64url')` كـ session token
4. يُحفظ في Redis: `admin_sess:{token}` = `'1'`  TTL 30 يوم
5. Cookie: `admin_token` httpOnly, sameSite=strict, maxAge 8h
6. Rate limit: 5 محاولات / 15 دقيقة — تنبيه Telegram عند تجاوزه

### عميل (Client Portal)
**التفعيل الأولي:**
1. بعد الموافقة، يُولَّد كود 6 أحرف (CSPRNG)، يُحفظ hash-SHA256 في Redis
2. يُرسل للعميل بالبريد
3. العميل يدخل البريد + الكود في `/client/login`
4. يُنشئ كلمة مرور جديدة → تُشفَّر بـ scrypt
5. يُولَّد `client_token` HMAC-SHA256 + Redis session `client_sess:{id}`
6. Cookie: `client_token` httpOnly, sameSite=lax, maxAge 30 يوم

**للهدايا (تلقائي):**
- عند التسجيل بgiftCode صالح → كود التفعيل يُولَّد ويُرسل بالبريد فوراً
- لا حاجة لموافقة يدوية من المدرب

---

## نظام الهدايا (Gift Codes)

### الإنشاء (مدير)
- `POST /api/admin/gift` ← `{ plan, duration, note }`
- يُولَّد كود 8 أحرف عشوائي (بدون أحرف مبهمة: 0/O/1/I)
- مخزن في Redis: `gift_code:{CODE}` — TTL 60 يوم
- البيانات: `{ plan, planName, price, duration, note, used, createdAt }`
- واجهة المدير: اختيار مدة 7/14/30/60/90 يوم

### الاستخدام (عميل)
- العميل يفتح الرابط: `https://amine-fit.com/register?gift=XXXXXXXX`
- في `POST /api/register`:
  1. يتحقق من الكود مسبقاً قبل حفظ السجل
  2. إذا صالح: status='active', subscriptionPlan/End مضبوطان، giftCode مسجّل
  3. يُولَّد كود تفعيل تلقائياً ويُرسل بالبريد
  4. يُؤشَّر الكود كـ used بعد الحفظ
  5. Telegram للمدرب: "🎁 هدية مُستخدمة — [الاسم] — [الباقة] — ينتهي [التاريخ] — كود التفعيل: XXXXXX"

### في الإحصائيات
- `giftClients` = العملاء الذين لديهم `giftCode` field
- مستثنون من: totalRevenue, MRR, thisMonthRevenue, paidClients
- يظهرون بشارة `🎁 N هدية` بجانب عداد النشطاء
- في تقرير PDF: صفوف بنفسجية "هدية مجانية" مستقلة عن جدول المدفوعين
- في CSV: قسم منفصل "عملاء الهدايا"

---

## نظام الأسعار الجغرافي

### المناطق
- **Maghreb (افتراضي):** TN, MA, DZ, LY → أسعار بالدينار التونسي (د.ت)
- **Gulf:** QA, AE, SA, KW, BH, OM → أسعار بالريال القطري (ر.ق)

### التطبيق
- `GET /api/geo` يقرأ header `x-vercel-ip-country`
- `components/landing/Pricing.jsx`: يعرض العملة المناسبة في modal الباقات
- `app/payment/page.js`: يعرض طرق الدفع المناسبة:
  - Maghreb: D17 + بريد تونس
  - Gulf: Fawra فقط
- تعديل المدير للأسعار: `POST /api/admin/pricing`
- المدير يرى عملته حسب موقعه (لا يوجد زر تبديل — احترافية)

---

## محرك التغذية (nutritionEngine.js)

- **BMR:** Mifflin-St Jeor (وليس Harris-Benedict)
- **Protein:** بناءً على FFM (Fat-Free Mass) لا الوزن الكلي — حد أقصى `3.0 × FFM`
- **Carbs:** حد أدنى 130g/يوم (520 kcal)
- **Fiber:** `starches × 1.5` تقديراً واقعياً
- **مبادلات ADA 2019:** starches, fruits, vegetables, dairy, proteins, fats
- **توليد خطة التغذية:** `POST /api/ai-plan` باستخدام Claude API + nutritionEngine

---

## مولد البرامج التدريبية (ai-training/route.js)

### القواعد في SYSTEM_PROMPT:
- **الهدف = Performance:** تمارين انفجارية (Box Jump, Sprint Drill, Med Ball Slam) + قوة 3-5 reps/3min rest
- **المعدات:**
  - `gym`: كل المعدات
  - `home`: دمبل + مطاط + عارضة فقط — لا barbells/cables
  - `bodyweight`: Push-Up, Pull-Up, Dip, Pistol Squat — لا أثقال
- **Fat loss:** 12-20 reps / 30-60s rest
- **Gain:** 6-12 reps / 60-90s rest
- **لا يومَيْن متتاليَيْن لنفس العضلة**
- **Warmup + Cooldown إلزاميان لكل يوم**
- **تسميات التمارين: ENGLISH دائماً** (WARM UP, COOL DOWN, Sets, Reps)
- **Fallbacks:** 2 أيام, 3 أيام (Push/Pull/Legs), 6 أيام (PPL×2)

---

## الإحصائيات والتحليلات (AnalyticsClient.js)

### مجموعات العملاء:
```
activeClients      = status === 'active'
paidClients        = subscriptionPlan && !giftCode && status in [active, suspended, cancelled]
giftClients        = giftCode && status in [active, suspended]
expiredClients     = status === 'payment_expired'
pendingClients     = status === 'pending'
abandonedClients   = expired + pending
```

### الإيرادات:
- `totalRevenue` = paidClients فقط
- `mrr` = activeClients.filter(!giftCode)
- `lostRevenue` = expired + pending + active-without-plan
- الهدايا مستثناة تماماً من كل حسابات الإيراد

---

## أنماط Redis المستخدمة

```
# بيانات العملاء
submission:{id}              → JSON مشفر مرتين (double-encoded)
email_index:{email}          → {id}

# Sessions
admin_sess:{token}           → '1'  TTL 30 يوم
client_sess:{clientId}       → sessionId  TTL 30 يوم
client_preview:{clientId}    → sessionId  TTL 1 ساعة

# Gift codes
gift_code:{CODE}             → JSON { plan, planName, price, duration, note, used, giftCode... }

# Rate limiting
admin_login:{ip}             → count  TTL 900s
register_ip:{ip}             → count  TTL 3600s
gift_check:{ip}              → count  TTL 300s

# Misc
pricing_config               → JSON الأسعار
active_offer                 → JSON العرض الحالي
online:{clientId}            → '1'  TTL 5 دقائق
```

> **تحذير Redis:** البيانات مخزنة بـ double JSON.parse:
> ```js
> const raw = await redisGet(key)
> const data = JSON.parse(typeof raw === 'string' ? raw : JSON.stringify(raw))
> ```

---

## الأمان

| الإجراء | التفاصيل |
|---------|---------|
| Rate limiting | كل نقاط API الحساسة — Redis INCR |
| Timing-safe comparison | تسجيل دخول المدير — crypto.timingSafeEqual |
| HMAC signatures | توكنات العملاء |
| SHA-256 hashing | activation codes مخزنة كـ hash فقط |
| Brute-force alert | Telegram + email عند 5 محاولات فاشلة |
| Input sanitization | allowlist صارمة في كل API routes |
| MIME validation | رفع الصور: jpeg/jpg/png/webp فقط |
| httpOnly cookies | كل cookies المصادقة |
| sameSite=strict | admin_token; sameSite=lax لـ client_token |
| force-dynamic | كل API routes التي تتعامل مع البيانات |

---

## التعديلات الرئيسية لهذه الجلسة

### 1. نظام الأسعار الجغرافي (Pricing.jsx + payment/page.js)
- تونس/المغرب → د.ت، قطر/الخليج → ر.ق
- Modal الباقات يعرض العملة المحلية فقط
- صفحة الدفع تعرض طرق الدفع المناسبة لكل منطقة

### 2. صورة المدرب في صفحة تسجيل دخول العميل
- `app/client/login/page.js`: صورة `/coach-hero.jpg` بخلفية opacity=0.22
- objectPosition: `35% 10%` لإظهار الوجه بجانب البطاقة
- mask-image لتلاشي الحواف

### 3. إصلاح زر "شارك تجربتك" (TestimonialWidget)
- كان مخفياً للعملاء بدون subscriptionPlan
- أُزيل الشرط: يظهر لجميع العملاء المسجلين

### 4. التدقيق الأمني الشامل وإصلاح المشاكل
- `app/api/client/receipt/route.js`: MIME allowlist صارمة
- `lib/clientSession.js`: try/catch لمنع تعطل Redis
- `app/api/ai-training/route.js`: warmup/cooldown إلزامي، قواعد المعدات
- `lib/nutritionEngine.js`: تصحيح fiber estimate وحد أدنى الكربوهيدرات

### 5. نظام الهدايا (Gift System) — إصلاح كامل
- `app/api/admin/gift/route.js`: إضافة حقل `duration` + PLAN_INFO محدّث
- `app/api/gift/route.js`: إرجاع `duration` في GET response
- `app/api/register/route.js`:
  - التحقق من الكود مسبقاً (synchronous)
  - الهدية تُفعَّل تلقائياً: status=active + subscription fields
  - كود تفعيل يُولَّد ويُرسل بالبريد فوراً (بريد بنفسجي مميز)
  - Telegram: يتضمن كود التفعيل للمدرب
- `app/dashboard/(admin)/clients/ClientsClient.js`: اختيار مدة 7/14/30/60/90 يوم في UI

### 6. الإحصائيات (AnalyticsClient.js)
- الهدايا مستثناة من كل حسابات الإيراد
- عداد "نشطون" يعرض المدفوعين + شارة الهدايا منفصلة
- تقرير PDF + CSV يميّزان بين مدفوعين وهدايا

### 7. أدوات إضافية
- `app/api/dashboard/test-telegram/route.js`: نقطة اختبار الإشعارات
- `app/dashboard/(admin)/DashboardClient.js`: زر "اختبار تيليغرام"

---

## المكونات الرئيسية (Components)

| المكون | الغرض |
|--------|-------|
| `components/landing/Pricing.jsx` | بطاقات الأسعار + modal — جغرافي |
| `components/landing/Hero.jsx` | قسم Hero الرئيسي |
| `components/landing/Testimonials.jsx` | تقييمات العملاء |
| `components/landing/PromoBanner.jsx` | شريط العروض |
| `components/SwRegister.jsx` | تسجيل Service Worker للـ PWA |
| `components/dashboard/Sidebar.jsx` | القائمة الجانبية للوحة التحكم |
| `components/dashboard/Header.jsx` | رأس لوحة التحكم |

---

## ملاحظات مهمة للمطور

1. **لا تذكر "AI" أو "ذكاء اصطناعي" في واجهة المستخدم** — هذا شرط صارم من صاحب المشروع
2. **أرقام البطاقات وCVV لا تظهر على الموقع أبداً**
3. **تسميات التمارين تبقى بالإنجليزية دائماً** (Sets, Reps, WARM UP, COOL DOWN)
4. **لون Gold:** `gold-400` = amber/yellow في Tailwind
5. **Redis double-encode:** دائماً `JSON.parse(JSON.parse(...))` أو `JSON.parse(typeof raw === 'string' ? raw : JSON.stringify(raw))`
6. **force-dynamic:** مطلوب على كل route تقرأ/تكتب بيانات حية
7. **الـ PWA:** أي تغيير في `/client/login` يشمل التطبيق تلقائياً
8. **الفواتير:** المدير يؤكد الدفع يدوياً عبر `/dashboard/clients` — لا بوابة دفع إلكترونية حالياً
