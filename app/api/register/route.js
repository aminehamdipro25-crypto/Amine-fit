import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { saveSubmission, getSubmissionByEmail, updateSubmission } from '@/lib/submissions'
import { isRateLimited } from '@/lib/rateLimit'
import { sendTelegramMessage } from '@/lib/telegram'
import { sendEmail } from '@/lib/mailer'
import { deleteDraft } from '@/lib/leadDraft'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const STR_MAX = 500  // max length for text fields

function sanitizeStr(v, max = STR_MAX) {
  if (v === undefined || v === null) return ''
  return String(v).replace(/[\r\n]/g, ' ').trim().slice(0, max)
}

export async function POST(req) {
  let giftCode = null
  let isGift = false
  try {
    // Rate-limit: 5 registrations per hour per IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (await isRateLimited(`register_ip:${ip}`, 5, 3600)) {
      return NextResponse.json({ error: 'محاولات كثيرة — حاول بعد ساعة' }, { status: 429 })
    }

    const body = await req.json()

    const required = ['email', 'name', 'gender', 'age', 'height', 'weight',
      'workActivity', 'goal', 'targetWeight', 'dailyMeals',
      'waterIntake', 'activityLevel', 'sleepHours']

    const missing = required.filter(k => !body[k]?.toString().trim())
    if (missing.length) {
      return NextResponse.json(
        { error: 'يرجى ملء جميع الحقول الإلزامية', missing },
        { status: 400 }
      )
    }

    const emailLower = sanitizeStr(body.email, 254).toLowerCase()
    if (!emailLower || !/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(emailLower)) {
      return NextResponse.json({ error: 'بريد إلكتروني غير صالح' }, { status: 400 })
    }

    const existing = await getSubmissionByEmail(emailLower)
    if (existing) {
      const interestedPlan = sanitizeStr(body.interestedPlan, 100)
      // Existing client with no active subscription selecting a plan → save their choice
      if (interestedPlan && !existing.subscriptionPlan) {
        await updateSubmission(existing.id, { interestedPlan })
        return NextResponse.json({ success: true, alreadyRegistered: true })
      }
      return NextResponse.json({
        error: existing.subscriptionPlan
          ? 'أنت مشترك بالفعل — سجّل الدخول لبوابتك الشخصية'
          : 'هذا البريد الإلكتروني مسجل مسبقاً — تواصل مع المدرب عبر واتساب لتحديد باقتك',
        loginUrl: '/client/login',
      }, { status: 409 })
    }

    // Validate gift code early so we can set subscription fields before saving
    giftCode = sanitizeStr(body.giftCode, 12).toUpperCase()
    let validatedGift = null
    if (giftCode) {
      try {
        const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'
        const giftRes = await fetch(`${BASE}/api/gift?code=${encodeURIComponent(giftCode)}`, { cache: 'no-store' })
        const giftData = await giftRes.json()
        if (giftData.valid) validatedGift = giftData
      } catch { /* gift validation failure is non-fatal — fall through to pending */ }
    }

    // Map gift plan keys to subscription plan keys used by the admin panel
    const GIFT_PLAN_MAP = { training: 'basic', monthly: 'standard', '3months': 'premium' }

    const now = Date.now()
    isGift = validatedGift !== null
    const subStart = isGift ? new Date(now).toISOString() : null

    // Pre-generate activation code for gift clients so they can log in immediately
    let giftActivationCode = null
    let giftActivationCodeHash = null
    if (isGift) {
      const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
      const bytes = crypto.randomBytes(6)
      giftActivationCode = Array.from(bytes).map(b => chars[b % chars.length]).join('')
      giftActivationCodeHash = crypto.createHash('sha256').update(giftActivationCode).digest('hex')
    }
    const subEnd   = isGift ? new Date(now + (validatedGift.duration || 30) * 24 * 60 * 60 * 1000).toISOString() : null

    // Explicit allowlist — never spread raw body into storage
    const safeEntry = {
      email:              emailLower,
      name:               sanitizeStr(body.name, 100),
      gender:             ['male','female'].includes(body.gender) ? body.gender : '',
      age:                sanitizeStr(body.age, 10),
      height:             sanitizeStr(body.height, 10),
      weight:             sanitizeStr(body.weight, 10),
      workActivity:       sanitizeStr(body.workActivity),
      goal:               sanitizeStr(body.goal),
      targetWeight:       sanitizeStr(body.targetWeight, 10),
      dailyMeals:         sanitizeStr(body.dailyMeals, 10),
      waterIntake:        sanitizeStr(body.waterIntake, 10),
      activityLevel:       ['sedentary','light','moderate','active','veryActive'].includes(body.activityLevel) ? body.activityLevel : '',
      sleepHours:          sanitizeStr(body.sleepHours, 10),
      phone:               sanitizeStr(body.phone, 30),
      sportType:           sanitizeStr(body.sportType),
      hasScale:            ['yes','no'].includes(body.hasScale) ? body.hasScale : '',
      hasInBody:           ['yes','no'].includes(body.hasInBody) ? body.hasInBody : '',
      inBodyNote:          sanitizeStr(body.inBodyNote),
      bodyFatPct: body.bodyFatPct ? Math.min(70, Math.max(3, parseFloat(body.bodyFatPct) || 0)) || null : null,
      hasNFS:              ['yes','no'].includes(body.hasNFS) ? body.hasNFS : '',
      nfsNote:             sanitizeStr(body.nfsNote),
      foodAllergy:         sanitizeStr(body.foodAllergy),
      dislikedFoods:       sanitizeStr(body.dislikedFoods),
      preferredFoods:      sanitizeStr(body.preferredFoods),
      appetite:            sanitizeStr(body.appetite),
      currentDiet:         sanitizeStr(body.currentDiet),
      hasChronicDisease:   ['yes','no'].includes(body.hasChronicDisease) ? body.hasChronicDisease : '',
      chronicDiseaseNote:  sanitizeStr(body.chronicDiseaseNote),
      hasDigestiveIssues:       ['yes','no'].includes(body.hasDigestiveIssues) ? body.hasDigestiveIssues : '',
      digestiveIssuesNote:      sanitizeStr(body.digestiveIssuesNote),
      hasHormonalIssues:        ['yes','no'].includes(body.hasHormonalIssues) ? body.hasHormonalIssues : '',
      hormonalIssuesNote:       sanitizeStr(body.hormonalIssuesNote),
      hasPhysicalLimitations:   ['yes','no'].includes(body.hasPhysicalLimitations) ? body.hasPhysicalLimitations : '',
      injuries:                 sanitizeStr(body.injuries, 500),
      physicalLimitationsNote:  sanitizeStr(body.physicalLimitationsNote, 500),
      medications:              sanitizeStr(body.medications),
      hasPsychStress:      ['yes','no','sometimes'].includes(body.hasPsychStress) ? body.hasPsychStress : '',
      foodPrep:            sanitizeStr(body.foodPrep),
      goalTimeline:        sanitizeStr(body.goalTimeline),
      trainingExperience:  ['beginner','intermediate','advanced'].includes(body.trainingExperience) ? body.trainingExperience : '',
      motivation:          sanitizeStr(body.motivation),
      previousPrograms:    sanitizeStr(body.previousPrograms),
      commitment:          sanitizeStr(body.commitment),
      heardFrom:           sanitizeStr(body.heardFrom),
      referredBy:          sanitizeStr(body.referredBy, 50),
      notes:               sanitizeStr(body.notes),
      interestedPlan:      isGift ? validatedGift.plan : sanitizeStr(body.interestedPlan, 100),
      status:              isGift ? 'active' : 'pending',
      paymentDeadline:     isGift ? null : new Date(now + 72 * 60 * 60 * 1000).toISOString(),
      paymentMethodChosen: null,
      ...(isGift && {
        subscriptionPlan:      GIFT_PLAN_MAP[validatedGift.plan] || validatedGift.plan,
        subscriptionPlanName:  validatedGift.planName,
        subscriptionStartDate: subStart,
        subscriptionEndDate:   subEnd,
        subscriptionDays:      validatedGift.duration || 30,
        giftCode,
        activationCode:        giftActivationCodeHash,
        approvedAt:            new Date(now).toISOString(),
      }),
    }

    // Mark gift as used BEFORE saving client to prevent race condition
    if (isGift) {
      try {
        const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'
        const markRes = await fetch(`${BASE}/api/gift`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: giftCode, email: emailLower }),
        })
        const markData = await markRes.json()
        if (!markData.ok) {
          return NextResponse.json({ error: 'كود الهدية استُخدم مسبقاً أو انتهت صلاحيته' }, { status: 400 })
        }
      } catch {
        return NextResponse.json({ error: 'تعذّر التحقق من كود الهدية — حاول مجدداً' }, { status: 500 })
      }
    }

    const entry = await saveSubmission(safeEntry)
    deleteDraft(emailLower).catch(() => {})
    sendEmailNotification(entry).catch(err => logger.error('register', 'notification email failed', { err: err.message }))

    // Telegram push notification to admin
    const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'
    const goalAr = { loss: 'خسارة وزن', gain: 'بناء عضلات', maintain: 'الحفاظ على الوزن', performance: 'أداء رياضي' }

    if (isGift) {
      const endDate = new Date(subEnd).toLocaleDateString('ar', { timeZone: 'Asia/Qatar', year: 'numeric', month: 'long', day: 'numeric' })

      // Send activation email to the gift recipient automatically
      sendGiftActivationEmail(entry, giftActivationCode).catch(err =>
        console.error('[gift activation email]', err.message)
      )

      sendTelegramMessage(
        `🎁 <b>هدية مُستخدمة!</b>\n\n` +
        `👤 <b>${entry.name}</b>\n` +
        `📧 ${entry.email}\n` +
        `📱 ${entry.phone || '—'}\n` +
        `📦 باقة: ${validatedGift.planName}\n` +
        `📅 تنتهي: ${endDate}\n\n` +
        `🔑 كود التفعيل: <code>${giftActivationCode}</code>\n` +
        `(أُرسل تلقائياً لبريد العميل — احتفظ به للإرسال عبر واتساب إذا لزم)\n\n` +
        `<a href="${BASE}/dashboard/clients">⚡ فتح لوحة التحكم</a>`
      ).catch(err => console.error('[telegram gift]', err.message))
    } else {
      sendTelegramMessage(
        `🏋️ <b>طلب تسجيل جديد!</b>\n\n` +
        `👤 <b>${entry.name}</b>\n` +
        `📧 ${entry.email}\n` +
        `📱 ${entry.phone || '—'}\n` +
        `🎯 ${goalAr[entry.goal] || entry.goal || '—'}\n` +
        `📦 ${entry.interestedPlan || '—'}\n\n` +
        `<a href="${BASE}/dashboard/clients">⚡ فتح لوحة التحكم</a>`
      ).catch(() => {})
    }

    return NextResponse.json({ success: true, id: entry.id, email: safeEntry.email })
  } catch (err) {
    if (err.code === 'EMAIL_EXISTS') {
      return NextResponse.json({
        error: 'هذا البريد الإلكتروني مسجل مسبقاً — تواصل مع المدرب عبر واتساب لتحديد باقتك',
        loginUrl: '/client/login',
      }, { status: 409 })
    }
    if (isGift && giftCode) {
      // Gift was already marked used before this failure — no account was created,
      // so the code is effectively burned. Needs the admin to manually reissue it.
      logger.critical('register', 'Gift code burned but account creation failed — needs manual reissue', { giftCode, err: err.message })
    } else {
      logger.critical('register', 'Registration failed', { err: err.message })
    }
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

async function sendEmailNotification(entry) {
  if (!process.env.RESEND_API_KEY || !process.env.NOTIFY_EMAIL) return
  const adminEmail = process.env.NOTIFY_EMAIL
  const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'
  const printUrl = `${BASE}/api/print/${entry.id}`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Amine-Fit <onboarding@resend.dev>',
      to: [adminEmail],
      subject: `🏋️ استبيان جديد — ${entry.name} | Amine-Fit`,
      html: buildEmailHtml(entry, printUrl),
    }),
  })
  const result = await res.json()
  if (!res.ok) {
    console.error('[email resend error]', res.status, JSON.stringify(result))
  } else {
    console.log('[email sent]', result.id, '->', adminEmail)
  }
}

function val(v) { return v?.toString().trim() || '—' }

function section(title) {
  return `<tr><td colspan="2" style="padding:10px 12px;background:#4f46e5;color:#fff;font-weight:bold;font-size:14px">${title}</td></tr>`
}

function row(label, value) {
  return `
    <tr>
      <td style="padding:9px 12px;background:#f8fafc;font-weight:600;border:1px solid #e2e8f0;width:40%;color:#374151">${label}</td>
      <td style="padding:9px 12px;border:1px solid #e2e8f0;color:#111827">${value ?? '—'}</td>
    </tr>`
}

function buildEmailHtml(e, printUrl) {
  const date = new Date(e.createdAt).toLocaleString('ar', { timeZone: 'Asia/Qatar' })
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial,sans-serif">
<div style="max-width:650px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)">

  <div style="background:linear-gradient(135deg,#4f46e5,#10b981);padding:28px 24px;text-align:center">
    <div style="font-size:32px">🏋️</div>
    <h1 style="color:#fff;margin:8px 0 4px;font-size:22px">استبيان جديد</h1>
    <p style="color:rgba(255,255,255,.85);margin:0;font-size:14px">Amine-Fit — ${date}</p>
  </div>

  <div style="background:#ecfdf5;border-right:4px solid #10b981;padding:14px 16px;margin:20px">
    <p style="margin:0;color:#065f46;font-size:14px">
      ✅ عميل جديد أكمل الاستبيان — <strong>${val(e.name)}</strong> — راجع التفاصيل أدناه
    </p>
  </div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:16px">

    ${section('📋 المعلومات الشخصية')}
    ${row('الاسم الكامل', val(e.name))}
    ${row('البريد الإلكتروني', val(e.email))}
    ${row('رقم الهاتف', val(e.phone))}
    ${row('الجنس', val(e.gender) === 'male' ? 'ذكر' : val(e.gender) === 'female' ? 'أنثى' : val(e.gender))}
    ${row('العمر', val(e.age) + ' سنة')}
    ${row('الطول', val(e.height) + ' سم')}
    ${row('الوزن الحالي', val(e.weight) + ' كغ')}
    ${row('طبيعة العمل', val(e.workActivity))}
    ${row('هل لديه ميزان؟', val(e.hasScale) === 'yes' ? 'نعم' : 'لا')}

    ${section('🎯 الأهداف والتدريب')}
    ${row('الهدف الرئيسي', val(e.goal))}
    ${row('الوزن المثالي', val(e.targetWeight) + ' كغ')}
    ${row('مستوى النشاط', val(e.activityLevel))}
    ${row('نوع الرياضة', val(e.sportType))}
    ${row('قياسات InBody', val(e.hasInBody) === 'yes' ? 'نعم — ' + val(e.inBodyNote) : 'لا')}
    ${row('تحاليل دم NFS', val(e.hasNFS) === 'yes' ? 'نعم — ' + val(e.nfsNote) : 'لا')}

    ${section('🥗 العادات الغذائية')}
    ${row('عدد الوجبات اليومية', val(e.dailyMeals))}
    ${row('كمية الماء يومياً', val(e.waterIntake) + ' لتر')}
    ${row('حساسية غذائية', val(e.foodAllergy))}
    ${row('أطعمة غير مرغوبة', val(e.dislikedFoods))}
    ${row('أطعمة مفضلة', val(e.preferredFoods))}
    ${row('شهية الطعام', val(e.appetite))}
    ${row('النظام الغذائي الحالي', val(e.currentDiet))}

    ${section('🏥 الحالة الصحية')}
    ${row('أمراض مزمنة', val(e.hasChronicDisease) === 'yes' ? 'نعم — ' + val(e.chronicDiseaseNote) : 'لا')}
    ${row('أدوية أو مكملات', val(e.medications))}
    ${row('ساعات النوم', val(e.sleepHours) + ' ساعات')}
    ${row('ضغوط نفسية', val(e.hasPsychStress) === 'yes' ? 'نعم' : val(e.hasPsychStress) === 'no' ? 'لا' : 'أحياناً')}
    ${row('من يحضر الطعام؟', val(e.foodPrep))}

    ${section('💬 ملاحظات إضافية')}
    ${row('الدافع للانضمام', val(e.motivation))}
    ${row('برامج سابقة', val(e.previousPrograms))}
    ${row('الالتزام المتوقع', val(e.commitment))}
    ${row('كيف سمع عنّا؟', val(e.heardFrom))}
    ${row('ملاحظات أخرى', val(e.notes))}

  </table>

  <div style="background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0">
    <a href="${printUrl}"
       style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;margin-left:10px">
      🖨️ تنزيل / طباعة PDF
    </a>
    <a href="${BASE}/dashboard/clients"
       style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">
      عرض في لوحة التحكم
    </a>
    <p style="color:#9ca3af;font-size:11px;margin:12px 0 0">Amine-Fit • الدوحة، قطر • +974 3065 3759</p>
  </div>
</div>
</body></html>`
}

async function sendGiftActivationEmail(entry, activationCode) {
  const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'
  const name = entry.name || 'عزيزي العميل'
  await sendEmail({
    to: entry.email,
    subject: 'مرحباً بك في Amine-Fit 🎁 — كود تفعيل حسابك',
    text: `مرحباً ${name}،\n\nتمت هديتك بنجاح! حسابك في Amine-Fit نشط الآن.\n\nكود التفعيل: ${activationCode}\n\nاذهب إلى: ${BASE}/client/login\nاختر "تفعيل الحساب" وأدخل بريدك الإلكتروني والكود.\n\nهذا الكود للاستخدام مرة واحدة فقط.\n\nأمين حمدي — Amine-Fit`,
    html: `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial,sans-serif">
<div style="max-width:500px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)">
  <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:24px;text-align:center">
    <div style="font-size:44px">🎁</div>
    <h1 style="color:#fff;margin:8px 0 4px;font-size:22px">مرحباً ${name}!</h1>
    <p style="color:rgba(255,255,255,.9);margin:0;font-size:14px">هديتك في Amine-Fit جاهزة</p>
  </div>
  <div style="padding:24px">
    <p style="font-size:14px;color:#374151;margin-bottom:20px;line-height:1.7">
      تم تفعيل حسابك بنجاح 🎉 استخدم كود التفعيل أدناه لإنشاء كلمة مرورك والدخول لبوابتك الشخصية.
    </p>
    <div style="background:#faf5ff;border:2px solid #a855f7;border-radius:12px;padding:20px;margin-bottom:20px;text-align:center">
      <p style="margin:0 0 8px;font-weight:bold;color:#6b21a8;font-size:14px">كود التفعيل (استخدام واحد فقط)</p>
      <p style="margin:0;font-family:monospace;font-size:36px;font-weight:900;letter-spacing:8px;color:#7c3aed;direction:ltr">${activationCode}</p>
    </div>
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:14px;margin-bottom:20px">
      <p style="margin:0 0 8px;font-weight:bold;color:#166534;font-size:13px">خطوات التفعيل:</p>
      <ol style="margin:0;padding-right:20px;font-size:13px;color:#374151;line-height:2">
        <li>اذهب إلى بوابة العميل</li>
        <li>اختر تبويب "تفعيل الحساب"</li>
        <li>أدخل بريدك الإلكتروني وكود التفعيل</li>
        <li>أنشئ كلمة مرورك الخاصة</li>
      </ol>
    </div>
    <a href="${BASE}/client/login"
       style="display:block;text-align:center;background:#7c3aed;color:#fff;padding:14px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;margin-bottom:16px">
      تفعيل الحساب الآن
    </a>
    <p style="font-size:11px;color:#9ca3af;text-align:center;margin:0">هذا الكود للاستخدام مرة واحدة فقط — لا تشاركه مع أحد</p>
  </div>
  <div style="background:#f8fafc;padding:12px 24px;text-align:center;border-top:1px solid #e2e8f0">
    <p style="color:#9ca3af;font-size:11px;margin:0">Amine-Fit • الدوحة، قطر • +974 3065 3759</p>
  </div>
</div>
</body></html>`,
  })
}

export async function GET() {
  return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
}
