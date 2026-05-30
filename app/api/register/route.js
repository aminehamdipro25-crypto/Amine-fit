import { NextResponse } from 'next/server'
import { saveSubmission } from '@/lib/submissions'

export async function POST(req) {
  try {
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

    const entry = await saveSubmission(body)
    sendEmailNotification(entry).catch(err => console.error('[email]', err))
    return NextResponse.json({ success: true, id: entry.id })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

async function sendEmailNotification(entry) {
  const adminEmail = process.env.NOTIFY_EMAIL || 'amine.hamdi.pro25@gmail.com'
  if (!process.env.RESEND_API_KEY) {
    console.log('[NEW SUBMISSION]', JSON.stringify(entry, null, 2))
    return
  }
  const printUrl = `https://amine-fit.vercel.app/api/print/${entry.id}`

  await fetch('https://api.resend.com/emails', {
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

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#4f46e5,#10b981);padding:28px 24px;text-align:center">
    <div style="font-size:32px">🏋️</div>
    <h1 style="color:#fff;margin:8px 0 4px;font-size:22px">استبيان جديد</h1>
    <p style="color:rgba(255,255,255,.85);margin:0;font-size:14px">Amine-Fit — ${date}</p>
  </div>

  <!-- Alert -->
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

  <!-- Footer -->
  <div style="background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0">
    <a href="${printUrl}"
       style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;margin-left:10px">
      🖨️ تنزيل / طباعة PDF
    </a>
    <a href="https://amine-fit.vercel.app/dashboard/clients"
       style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">
      عرض في لوحة التحكم
    </a>
    <p style="color:#9ca3af;font-size:11px;margin:12px 0 0">Amine-Fit • الدوحة، قطر • +974 3065 3759</p>
  </div>
</div>
</body></html>`
}

function buildPrintableHtml(e) {
  const yn = v => v === 'yes' ? 'نعم' : v === 'no' ? 'لا' : v === 'sometimes' ? 'أحياناً' : val(v)
  const r = (label, value) => `<tr><td class="l">${label}</td><td>${value || '—'}</td></tr>`
  const s = title => `<tr class="sec"><td colspan="2">${title}</td></tr>`
  const date = new Date(e.createdAt).toLocaleString('ar', { timeZone: 'Asia/Qatar' })
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>استبيان — ${val(e.name)}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#111;background:#fff;padding:24px}
.hd{background:linear-gradient(135deg,#4f46e5,#10b981);color:#fff;padding:16px 20px;border-radius:8px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:center}
.hd h1{font-size:18px;margin-bottom:4px}.hd p{font-size:11px;opacity:.85}
.av{width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:bold}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}
.st{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;text-align:center}
.st .n{font-size:20px;font-weight:bold;color:#4f46e5}.st .lb{font-size:10px;color:#64748b;margin-top:2px}
table{width:100%;border-collapse:collapse;margin-bottom:14px}
tr.sec td{background:#4f46e5;color:#fff;padding:7px 10px;font-weight:bold;font-size:12px}
tr:not(.sec):nth-child(even){background:#f8fafc}
td{padding:7px 10px;border:1px solid #e2e8f0;font-size:11px}
td.l{font-weight:600;background:#f1f5f9;width:38%;color:#374151}
.ft{margin-top:14px;padding-top:10px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8}
.btn{display:block;text-align:center;background:linear-gradient(135deg,#4f46e5,#10b981);color:#fff;padding:10px;border-radius:6px;margin-bottom:14px;font-weight:bold;cursor:pointer;border:none;width:100%;font-size:13px}
@media print{.btn{display:none}}
</style>
</head>
<body>
<button class="btn" onclick="window.print()">🖨️ طباعة / حفظ كـ PDF</button>
<div class="hd">
  <div><h1>🏋️ استبيان العميل — Amine-Fit</h1><p>${date}</p></div>
  <div class="av">${val(e.name)[0]}</div>
</div>
<div class="stats">
  <div class="st"><div class="n">${val(e.age)}</div><div class="lb">العمر (سنة)</div></div>
  <div class="st"><div class="n">${val(e.weight)}</div><div class="lb">الوزن (كغ)</div></div>
  <div class="st"><div class="n">${val(e.height)}</div><div class="lb">الطول (سم)</div></div>
  <div class="st"><div class="n">${val(e.targetWeight)}</div><div class="lb">الهدف (كغ)</div></div>
</div>
<table>
  ${s('📋 المعلومات الشخصية')}
  ${r('الاسم الكامل', val(e.name))}
  ${r('البريد الإلكتروني', val(e.email))}
  ${r('رقم الهاتف', val(e.phone))}
  ${r('الجنس', e.gender === 'male' ? 'ذكر' : 'أنثى')}
  ${r('طبيعة العمل', val(e.workActivity))}
  ${r('ميزان في المطبخ', yn(e.hasScale))}

  ${s('🎯 الأهداف والتدريب')}
  ${r('الهدف الرئيسي', val(e.goal))}
  ${r('الوزن المستهدف', val(e.targetWeight) + ' كغ')}
  ${r('مستوى النشاط', val(e.activityLevel))}
  ${r('نوع الرياضة', val(e.sportType))}
  ${r('قياسات InBody', e.hasInBody === 'yes' ? 'نعم — ' + val(e.inBodyNote) : 'لا')}
  ${r('تحاليل دم NFS', e.hasNFS === 'yes' ? 'نعم — ' + val(e.nfsNote) : 'لا')}

  ${s('🥗 العادات الغذائية')}
  ${r('عدد الوجبات', val(e.dailyMeals))}
  ${r('الماء يومياً', val(e.waterIntake) + ' لتر')}
  ${r('حساسية غذائية', val(e.foodAllergy))}
  ${r('أطعمة غير مرغوبة', val(e.dislikedFoods))}
  ${r('أطعمة مفضلة', val(e.preferredFoods))}
  ${r('الشهية', val(e.appetite))}
  ${r('النظام الغذائي الحالي', val(e.currentDiet))}

  ${s('🏥 الصحة ونمط الحياة')}
  ${r('أمراض مزمنة', e.hasChronicDisease === 'yes' ? 'نعم — ' + val(e.chronicDiseaseNote) : 'لا')}
  ${r('أدوية / مكملات', val(e.medications))}
  ${r('ساعات النوم', val(e.sleepHours) + ' ساعات')}
  ${r('ضغوط نفسية', yn(e.hasPsychStress))}
  ${r('من يحضر الطعام', val(e.foodPrep))}

  ${s('💬 ملاحظات')}
  ${r('الدافع للانضمام', val(e.motivation))}
  ${r('برامج سابقة', val(e.previousPrograms))}
  ${r('الالتزام', val(e.commitment))}
  ${r('كيف سمع عنّا', val(e.heardFrom))}
  ${r('ملاحظات', val(e.notes))}
</table>
<div class="ft"><span>Amine-Fit • الدوحة، قطر • +974 3065 3759</span><span>amine-fit.vercel.app</span></div>
</body></html>`
}

export async function GET() {
  try {
    const { getSubmissions } = await import('@/lib/submissions')
    const list = await getSubmissions()
    return NextResponse.json(list)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
