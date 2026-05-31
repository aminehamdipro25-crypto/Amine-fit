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

    console.log('[register] saving:', body.name, body.email)
    const entry = await saveSubmission(body)
    console.log('[register] saved OK:', entry.id)
    sendEmailNotification(entry).catch(err => console.error('[email error]', err.message))
    return NextResponse.json({ success: true, id: entry.id })
  } catch (err) {
    console.error('[register FAILED]', err.message)
    return NextResponse.json({ error: 'خطأ في الخادم: ' + err.message }, { status: 500 })
  }
}

async function sendEmailNotification(entry) {
  const adminEmail = process.env.NOTIFY_EMAIL || 'amine.hamdi.pro25@gmail.com'
  if (!process.env.RESEND_API_KEY) {
    console.log('[email] no RESEND_API_KEY, skipping')
    return
  }
  const printUrl = `https://amine-fit.vercel.app/api/print/${entry.id}`

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
    <a href="https://amine-fit.vercel.app/dashboard/clients"
       style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">
      عرض في لوحة التحكم
    </a>
    <p style="color:#9ca3af;font-size:11px;margin:12px 0 0">Amine-Fit • الدوحة، قطر • +974 3065 3759</p>
  </div>
</div>
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
