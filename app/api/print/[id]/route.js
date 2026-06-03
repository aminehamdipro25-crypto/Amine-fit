import { getSubmissions } from '@/lib/submissions'
import { isAdmin } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

export async function GET(req, { params }) {
  if (!await isAdmin()) return new Response('غير مصرح', { status: 401 })

  const list = await getSubmissions()
  const e    = list.find(s => s.id === params.id)
  if (!e) return new Response('Not found', { status: 404 })

  // HTML-escape all user content to prevent XSS
  const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;')
  const v   = x => esc(x?.toString().trim()) || '—'
  const yn  = x => x === 'yes' ? 'نعم' : x === 'no' ? 'لا' : x === 'sometimes' ? 'أحياناً' : v(x)
  const r   = (label, value) => `<tr><td class="l">${label}</td><td>${value || '—'}</td></tr>`
  const s   = t => `<tr class="sec"><td colspan="2">${t}</td></tr>`
  const date = new Date(e.createdAt).toLocaleString('ar', { timeZone: 'Asia/Qatar' })

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>استبيان — ${v(e.name)}</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Cairo',Arial,sans-serif;font-size:13px;color:#111;background:#fff;padding:24px}
.hd{background:linear-gradient(135deg,#4f46e5,#10b981);color:#fff;padding:16px 20px;border-radius:8px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:center}
.hd h1{font-size:18px;margin-bottom:4px}.hd p{font-size:11px;opacity:.85}
.av{width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:bold;flex-shrink:0}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}
.st{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;text-align:center}
.st .n{font-size:20px;font-weight:700;color:#4f46e5}.st .lb{font-size:10px;color:#64748b;margin-top:2px}
table{width:100%;border-collapse:collapse;margin-bottom:14px}
tr.sec td{background:#4f46e5;color:#fff;padding:7px 10px;font-weight:700;font-size:12px}
tr:not(.sec):nth-child(even){background:#f8fafc}
td{padding:7px 10px;border:1px solid #e2e8f0;font-size:12px}
td.l{font-weight:600;background:#f1f5f9;width:38%;color:#374151}
.ft{margin-top:14px;padding-top:10px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8}
.btn{display:block;text-align:center;background:linear-gradient(135deg,#4f46e5,#10b981);color:#fff;padding:12px;border-radius:6px;margin-bottom:16px;font-weight:700;cursor:pointer;border:none;width:100%;font-size:14px;font-family:'Cairo',Arial,sans-serif}
@media print{.btn{display:none}@page{margin:15mm}}
</style>
</head>
<body>
<button class="btn" onclick="window.print()">🖨️ حفظ كـ PDF / طباعة</button>
<div class="hd">
  <div><h1>🏋️ استبيان العميل — Amine-Fit</h1><p>${date}</p></div>
  <div class="av">${v(e.name)[0] || '?'}</div>
</div>
<div class="stats">
  <div class="st"><div class="n">${v(e.age)}</div><div class="lb">العمر</div></div>
  <div class="st"><div class="n">${v(e.weight)}</div><div class="lb">الوزن كغ</div></div>
  <div class="st"><div class="n">${v(e.height)}</div><div class="lb">الطول سم</div></div>
  <div class="st"><div class="n">${v(e.targetWeight)}</div><div class="lb">الهدف كغ</div></div>
</div>
<table>
  ${s('📋 المعلومات الشخصية')}
  ${r('الاسم', v(e.name))} ${r('البريد', v(e.email))} ${r('الهاتف', v(e.phone))}
  ${r('الجنس', e.gender==='male'?'ذكر':'أنثى')} ${r('طبيعة العمل', v(e.workActivity))} ${r('ميزان مطبخ', yn(e.hasScale))}
  ${s('🎯 الأهداف')}
  ${r('الهدف', v(e.goal))} ${r('الوزن المستهدف', v(e.targetWeight)+' كغ')} ${r('مستوى النشاط', v(e.activityLevel))}
  ${r('نوع الرياضة', v(e.sportType))} ${r('InBody', e.hasInBody==='yes'?'نعم — '+v(e.inBodyNote):'لا')} ${r('NFS', e.hasNFS==='yes'?'نعم — '+v(e.nfsNote):'لا')}
  ${s('🥗 التغذية')}
  ${r('عدد الوجبات', v(e.dailyMeals))} ${r('الماء يومياً', v(e.waterIntake)+' ل')} ${r('حساسية', v(e.foodAllergy))}
  ${r('أطعمة مستبعدة', v(e.dislikedFoods))} ${r('أطعمة مفضلة', v(e.preferredFoods))} ${r('الشهية', v(e.appetite))}
  ${r('النظام الحالي', v(e.currentDiet))}
  ${s('🏥 الصحة')}
  ${r('أمراض مزمنة', e.hasChronicDisease==='yes'?'نعم — '+v(e.chronicDiseaseNote):'لا')}
  ${r('أدوية/مكملات', v(e.medications))} ${r('النوم', v(e.sleepHours)+' ساعات')}
  ${r('ضغط نفسي', yn(e.hasPsychStress))} ${r('من يحضر الطعام', v(e.foodPrep))}
  ${s('💬 ملاحظات')}
  ${r('الدافع', v(e.motivation))} ${r('برامج سابقة', v(e.previousPrograms))}
  ${r('الالتزام', v(e.commitment))} ${r('كيف سمع عنّا', v(e.heardFrom))} ${r('ملاحظات', v(e.notes))}
</table>
<div class="ft"><span>Amine-Fit • الدوحة، قطر • +974 3065 3759</span><span>amine-fit.com</span></div>
<script>setTimeout(()=>window.print(),800)</script>
</body></html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
