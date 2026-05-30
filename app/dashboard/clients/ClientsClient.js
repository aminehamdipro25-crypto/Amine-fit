'use client'
import { useState } from 'react'
import {
  Search, Eye, X, User, Target, Activity,
  Droplets, Moon, Utensils, Heart, CheckCircle2, Clock, AlertCircle, Download
} from 'lucide-react'

function printClientPDF(client) {
  const goalLabels = { loss:'خسارة وزن', gain:'بناء عضلات', maintain:'الحفاظ على الوزن', performance:'أداء رياضي' }
  const actLabels  = { sedentary:'خامل', light:'خفيف', moderate:'متوسط', high:'عالي' }
  const yesNo = v => v === 'yes' ? 'نعم' : v === 'no' ? 'لا' : v === 'sometimes' ? 'أحياناً' : v || '—'
  const v = x => x?.toString().trim() || '—'

  const rows = (items) => items.map(([label, value]) =>
    value && value !== '—' ? `<tr><td class="lbl">${label}</td><td>${value}</td></tr>` : ''
  ).join('')

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>استبيان — ${client.name}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #111; background: #fff; padding: 20px; }
  .header { background: linear-gradient(135deg,#4f46e5,#10b981); color: #fff; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
  .header h1 { font-size: 18px; margin-bottom: 4px; }
  .header p { font-size: 11px; opacity: .85; }
  .avatar { width: 50px; height: 50px; border-radius: 50%; background: rgba(255,255,255,.3); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: bold; flex-shrink: 0; }
  .stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 16px; }
  .stat { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center; }
  .stat .num { font-size: 18px; font-weight: bold; color: #4f46e5; }
  .stat .lbl { font-size: 10px; color: #64748b; margin-top: 2px; }
  section { margin-bottom: 14px; }
  section h2 { font-size: 12px; font-weight: bold; color: #4f46e5; background: #eef2ff; padding: 6px 10px; border-right: 3px solid #4f46e5; margin-bottom: 0; }
  table { width: 100%; border-collapse: collapse; }
  tr:nth-child(even) { background: #f8fafc; }
  td { padding: 7px 10px; border: 1px solid #e2e8f0; font-size: 11px; }
  td.lbl { font-weight: 600; background: #f1f5f9; width: 38%; color: #374151; }
  .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
  @media print { body { padding: 10px; } .no-print { display: none; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <h1>🏋️ استبيان العميل — Amine-Fit</h1>
    <p>تاريخ التسجيل: ${new Date(client.createdAt).toLocaleString('ar', { timeZone: 'Asia/Qatar' })}</p>
  </div>
  <div class="avatar">${client.name?.[0] ?? '?'}</div>
</div>

<div class="stats">
  <div class="stat"><div class="num">${v(client.age)}</div><div class="lbl">العمر (سنة)</div></div>
  <div class="stat"><div class="num">${v(client.weight)}</div><div class="lbl">الوزن (كغ)</div></div>
  <div class="stat"><div class="num">${v(client.height)}</div><div class="lbl">الطول (سم)</div></div>
  <div class="stat"><div class="num">${v(client.targetWeight)}</div><div class="lbl">الوزن المستهدف</div></div>
</div>

<section>
  <h2>📋 المعلومات الشخصية</h2>
  <table>${rows([
    ['الاسم الكامل', v(client.name)],
    ['البريد الإلكتروني', v(client.email)],
    ['رقم الهاتف', v(client.phone)],
    ['الجنس', client.gender === 'male' ? 'ذكر' : 'أنثى'],
    ['طبيعة العمل', v(client.workActivity)],
    ['ميزان في المطبخ', yesNo(client.hasScale)],
  ])}</table>
</section>

<section>
  <h2>🎯 الأهداف والتدريب</h2>
  <table>${rows([
    ['الهدف الرئيسي', goalLabels[client.goal] || v(client.goal)],
    ['الوزن المستهدف', v(client.targetWeight) + ' كغ'],
    ['مستوى النشاط', actLabels[client.activityLevel] || v(client.activityLevel)],
    ['نوع الرياضة', v(client.sportType)],
    ['قياسات InBody', client.hasInBody === 'yes' ? ('نعم — ' + v(client.inBodyNote)) : 'لا'],
    ['تحاليل دم NFS', client.hasNFS === 'yes' ? ('نعم — ' + v(client.nfsNote)) : 'لا'],
  ])}</table>
</section>

<section>
  <h2>🥗 العادات الغذائية</h2>
  <table>${rows([
    ['عدد الوجبات اليومية', v(client.dailyMeals)],
    ['كمية الماء يومياً', v(client.waterIntake) + ' لتر'],
    ['حساسية غذائية', v(client.foodAllergy)],
    ['أطعمة غير مرغوبة', v(client.dislikedFoods)],
    ['أطعمة مفضلة', v(client.preferredFoods)],
    ['شهية الطعام', {high:'عالية جداً',medium:'متوسطة',low:'ضعيفة'}[client.appetite] || v(client.appetite)],
    ['النظام الغذائي الحالي', v(client.currentDiet)],
  ])}</table>
</section>

<section>
  <h2>🏥 الحالة الصحية ونمط الحياة</h2>
  <table>${rows([
    ['أمراض مزمنة', client.hasChronicDisease === 'yes' ? (v(client.chronicDiseaseNote) || 'نعم') : 'لا'],
    ['أدوية / مكملات', v(client.medications)],
    ['ساعات النوم', v(client.sleepHours) + ' ساعات'],
    ['ضغوط نفسية', yesNo(client.hasPsychStress)],
    ['من يحضر الطعام', v(client.foodPrep)],
  ])}</table>
</section>

<section>
  <h2>💬 ملاحظات إضافية</h2>
  <table>${rows([
    ['الدافع للانضمام', v(client.motivation)],
    ['برامج سابقة', v(client.previousPrograms)],
    ['الالتزام المتوقع', v(client.commitment)],
    ['كيف سمع عنّا', v(client.heardFrom)],
    ['ملاحظات', v(client.notes)],
  ])}</table>
</section>

<div class="footer">
  <span>Amine-Fit • الدوحة، قطر • +974 3065 3759</span>
  <span>amine-fit.vercel.app</span>
</div>

<script>window.onload = () => window.print()</script>
</body></html>`

  const win = window.open('', '_blank')
  win.document.write(html)
  win.document.close()
}

const goalMap = {
  loss:        { label:'خسارة وزن',       color:'bg-red-100 text-red-700',       icon:'📉' },
  gain:        { label:'بناء عضلات',       color:'bg-blue-100 text-blue-700',      icon:'💪' },
  maintain:    { label:'الحفاظ على الوزن', color:'bg-green-100 text-green-700',    icon:'⚖️' },
  performance: { label:'أداء رياضي',       color:'bg-purple-100 text-purple-700',  icon:'🏃' },
}
const statusMap = {
  new:         { label:'جديد',     color:'bg-amber-100 text-amber-700 border border-amber-200',   icon: Clock },
  reviewed:    { label:'تمت المراجعة', color:'bg-blue-100 text-blue-700 border border-blue-200', icon: Eye },
  active:      { label:'نشط',      color:'bg-emerald-100 text-emerald-700 border border-emerald-200', icon: CheckCircle2 },
}
const actMap = {
  sedentary:'خامل', light:'خفيف', moderate:'متوسط', high:'عالي'
}

function Badge({ status }) {
  const cfg = statusMap[status] || statusMap.new
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  )
}

function DetailRow({ icon: Icon, label, value, color = 'text-primary-600' }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className={`w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm text-slate-800 font-semibold mt-0.5 break-words">{value}</p>
      </div>
    </div>
  )
}

function ClientModal({ client, onClose, onStatusChange }) {
  const goal = goalMap[client.goal]
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center text-white font-extrabold text-2xl flex-shrink-0">
              {client.name?.[0] ?? '?'}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">{client.name}</h2>
              <p className="text-slate-500 text-sm">{client.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge status={client.status} />
                {goal && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${goal.color}`}>
                    {goal.icon} {goal.label}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label:'العمر', value: client.age ? `${client.age} سنة` : '—' },
              { label:'الطول', value: client.height ? `${client.height} سم` : '—' },
              { label:'الوزن', value: client.weight ? `${client.weight} كغ` : '—' },
              { label:'الهدف', value: client.targetWeight ? `${client.targetWeight} كغ` : '—' },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 rounded-2xl p-3 text-center">
                <p className="text-lg font-extrabold text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Sections */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">المعلومات الأساسية</h3>
            <div className="bg-slate-50 rounded-2xl px-4">
              <DetailRow icon={User}     label="الجنس"           value={{male:'ذكر',female:'أنثى'}[client.gender]} />
              <DetailRow icon={Activity} label="طبيعة العمل"     value={client.workActivity} />
              <DetailRow icon={Utensils} label="ميزان المطبخ"    value={{yes:'نعم',no:'لا'}[client.hasScale]} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">النمط الغذائي</h3>
            <div className="bg-slate-50 rounded-2xl px-4">
              <DetailRow icon={Utensils} label="عدد الوجبات اليومية" value={client.dailyMeals ? `${client.dailyMeals} وجبات` : null} />
              <DetailRow icon={Heart}    label="الشهية" value={{high:'عالية جداً',medium:'متوسطة',low:'ضعيفة'}[client.appetite]} />
              <DetailRow icon={AlertCircle} label="حساسية الطعام" value={client.foodAllergy} />
              <DetailRow icon={X}        label="أطعمة مستبعدة"   value={client.dislikedFoods} />
              <DetailRow icon={CheckCircle2} label="أطعمة مفضلة" value={client.preferredFoods} />
              <DetailRow icon={Target}   label="النظام الغذائي الحالي" value={client.currentDiet} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">الصحة والنشاط</h3>
            <div className="bg-slate-50 rounded-2xl px-4">
              <DetailRow icon={Droplets} label="الماء يومياً"   value={client.waterIntake ? `${client.waterIntake} لتر` : null} />
              <DetailRow icon={Activity} label="مستوى النشاط"   value={actMap[client.activityLevel]} />
              <DetailRow icon={Heart}    label="نوع الرياضة"    value={client.sportType} />
              <DetailRow icon={AlertCircle} label="أمراض مزمنة" value={client.hasChronicDisease === 'yes' ? (client.chronicDiseaseNote || 'نعم') : 'لا'} />
              <DetailRow icon={Heart}    label="الأدوية / المكملات" value={client.medications} />
            </div>
          </div>

          {(client.hasInBody === 'yes' || client.hasNFS === 'yes') && (
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">نتائج الفحوصات</h3>
              <div className="bg-slate-50 rounded-2xl px-4">
                {client.hasInBody === 'yes' && <DetailRow icon={Activity} label="نتائج InBody" value={client.inBodyNote || 'مرفوعة'} />}
                {client.hasNFS === 'yes'    && <DetailRow icon={Heart}    label="نتائج تحاليل الدم NFS" value={client.nfsNote || 'مرفوعة'} />}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">نمط الحياة</h3>
            <div className="bg-slate-50 rounded-2xl px-4">
              <DetailRow icon={Moon}  label="ساعات النوم"    value={client.sleepHours ? `${client.sleepHours} ساعات` : null} />
              <DetailRow icon={Heart} label="ضغط نفسي"       value={{yes:'نعم',no:'لا',sometimes:'أحياناً'}[client.hasPsychStress]} />
              <DetailRow icon={Utensils} label="مَن يحضر الطعام" value={client.foodPrep} />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 flex-wrap">
          <button onClick={() => printClientPDF(client)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition">
            <Download className="w-3.5 h-3.5" />
            تنزيل PDF
          </button>
          <p className="text-xs text-slate-400 flex-1">
            {new Date(client.createdAt).toLocaleDateString('ar', { year:'numeric', month:'long', day:'numeric' })}
          </p>
          {['new','reviewed','active'].map(s => (
            <button key={s} onClick={() => onStatusChange(client.id, s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border
                ${client.status === s
                  ? statusMap[s].color
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {statusMap[s].label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ClientsClient({ submissions: initial }) {
  const [clients, setClients]     = useState(initial)
  const [query, setQuery]         = useState('')
  const [filterStatus, setFS]     = useState('all')
  const [filterGoal, setFG]       = useState('all')
  const [selected, setSelected]   = useState(null)

  const filtered = clients.filter(c => {
    const q = query.toLowerCase()
    const matchQ = !q || c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
    const matchS = filterStatus === 'all' || c.status === filterStatus
    const matchG = filterGoal  === 'all' || c.goal  === filterGoal
    return matchQ && matchS && matchG
  })

  async function changeStatus(id, status) {
    await fetch(`/api/register/${id}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ status }) })
    setClients(cs => cs.map(c => c.id === id ? { ...c, status } : c))
    if (selected?.id === id) setSelected(s => ({ ...s, status }))
  }

  const counts = {
    all: clients.length,
    new: clients.filter(c => c.status === 'new').length,
    reviewed: clients.filter(c => c.status === 'reviewed').length,
    active: clients.filter(c => c.status === 'active').length,
  }

  return (
    <>
      {selected && (
        <ClientModal client={selected} onClose={() => setSelected(null)} onStatusChange={changeStatus} />
      )}

      <div className="space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="بحث بالاسم أو البريد..."
              className="w-full pr-9 pl-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition" />
          </div>
          <select value={filterGoal} onChange={e => setFG(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-sm outline-none focus:border-primary-400 transition appearance-none cursor-pointer">
            <option value="all">كل الأهداف</option>
            {Object.entries(goalMap).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 bg-white border border-slate-200 rounded-2xl p-1.5 w-fit shadow-sm flex-wrap">
          {[['all','الكل'],['new','جديد'],['reviewed','تمت المراجعة'],['active','نشط']].map(([k,l]) => (
            <button key={k} onClick={() => setFS(k)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
                ${filterStatus===k ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
              {l}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterStatus===k ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {counts[k]}
              </span>
            </button>
          ))}
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <User className="w-14 h-14 mx-auto mb-3 opacity-20" />
            <p className="font-medium">لا توجد بيانات بعد</p>
            <p className="text-sm mt-1">سيظهر هنا العملاء بعد ملء الاستبيان</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(c => {
              const goal = goalMap[c.goal]
              return (
                <div key={c.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelected(c)}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-emerald-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {c.name?.[0] ?? '?'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{c.name}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[130px]">{c.email}</p>
                      </div>
                    </div>
                    <Badge status={c.status} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      {label:'العمر',  val: c.age ? `${c.age}س`   : '—'},
                      {label:'الوزن',  val: c.weight ? `${c.weight}كغ` : '—'},
                      {label:'الطول',  val: c.height ? `${c.height}سم` : '—'},
                    ].map(s => (
                      <div key={s.label} className="bg-slate-50 rounded-xl p-2 text-center">
                        <p className="text-xs font-bold text-slate-700">{s.val}</p>
                        <p className="text-xs text-slate-400">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    {goal
                      ? <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${goal.color}`}>{goal.icon} {goal.label}</span>
                      : <span className="text-xs text-slate-400">—</span>
                    }
                    <span className="text-xs text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString('ar-DZ')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
