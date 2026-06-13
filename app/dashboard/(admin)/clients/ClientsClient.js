'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, Eye, X, User, Target, Activity,
  Droplets, Moon, Utensils, Heart, CheckCircle2, Clock, AlertCircle, Download,
  ExternalLink, Loader2, UserPlus, LogOut as KickIcon,
  CreditCard, TrendingUp, Gift, Copy
} from 'lucide-react'
import { COUNTRIES } from '@/lib/countries'
import AddClientModal from './components/AddClientModal'
import SubscriptionSection, { SubBadge } from './components/SubscriptionSection'
import ClientAccessSection from './components/ClientAccessSection'
import ProtocolSection from './components/ProtocolSection'
import ClientProgressPanel from './components/ClientProgressPanel'
import ClientPhotosPanel from './components/ClientPhotosPanel'
import ClientReceiptPanel from './components/ClientReceiptPanel'
import ClientTasksPanel from './components/ClientTasksPanel'
import ClientMessagesPanel from './components/ClientMessagesPanel'
import WorkoutLogPanel from './components/WorkoutLogPanel'
import ClientCard from './components/ClientCard'

// ── Online status helpers ─────────────────────────────────────────────────────
function getOnlineStatus(info) {
  if (!info?.lastSeen) return 'offline'
  const diffMin = (Date.now() - new Date(info.lastSeen).getTime()) / 60000
  if (diffMin < 2)  return 'online'
  if (diffMin < 10) return 'away'
  return 'offline'
}

function formatAgo(iso) {
  if (!iso) return null
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diffMin < 1)  return 'الآن'
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24)   return `منذ ${diffH} ساعة`
  return new Date(iso).toLocaleDateString('ar', { month:'short', day:'numeric' })
}

function formatTime(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleTimeString('ar', { hour:'2-digit', minute:'2-digit', hour12: true, timeZone: 'Asia/Qatar' })
}

function OnlineDot({ status }) {
  const cfg = {
    online:  'bg-emerald-500 shadow-emerald-400/60 animate-pulse',
    away:    'bg-amber-400',
    offline: 'bg-slate-300',
  }
  return <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg[status] || cfg.offline} shadow-sm`} />
}

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
  <span>amine-fit.com</span>
</div>

<script>window.onload = () => window.print()</script>
</body></html>`

  const win = window.open('', '_blank')
  if (!win) { alert('يرجى السماح بفتح نوافذ جديدة في المتصفح'); return }
  win.document.write(html)
  win.document.close()
}

const goalMap = {
  loss:        { label:'خسارة وزن',       color:'bg-amber-50 text-amber-700 border border-amber-200',   icon:'📉' },
  gain:        { label:'بناء عضلات',       color:'bg-blue-50 text-blue-700 border border-blue-200',      icon:'💪' },
  maintain:    { label:'الحفاظ على الوزن', color:'bg-emerald-50 text-emerald-700 border border-emerald-200', icon:'⚖️' },
  performance: { label:'أداء رياضي',       color:'bg-purple-50 text-purple-700 border border-purple-200', icon:'🏃' },
}
const statusMap = {
  new:             { label:'جديد',               color:'bg-amber-100 text-amber-700 border border-amber-200',     icon: Clock },
  reviewed:        { label:'تمت المراجعة',       color:'bg-blue-100 text-blue-700 border border-blue-200',       icon: Eye },
  pending:         { label:'انتظار الدفع',        color:'bg-yellow-100 text-yellow-700 border border-yellow-200', icon: CreditCard },
  payment_expired: { label:'انتهت مهلة الدفع',   color:'bg-orange-100 text-orange-700 border border-orange-200', icon: AlertCircle },
  active:          { label:'نشط',                color:'bg-emerald-100 text-emerald-700 border border-emerald-200', icon: CheckCircle2 },
  suspended:       { label:'معلق',               color:'bg-red-100 text-red-700 border border-red-200',           icon: AlertCircle },
}
const actMap = {
  sedentary:'خامل', light:'خفيف', moderate:'متوسط', high:'عالي'
}

function Badge({ status }) {
  const cfg = statusMap[status] || statusMap.new
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
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

function EditableCountry({ clientId, initialValue, onSaved }) {
  const [editing, setEditing] = useState(false)
  const [value,   setValue]   = useState(initialValue || '')
  const [saving,  setSaving]  = useState(false)

  const countryLabel = COUNTRIES.find(c => c.code === value)?.label

  async function save() {
    setSaving(true)
    try {
      const res = await fetch(`/api/register/${clientId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ country: value }),
      })
      if (res.ok) {
        setEditing(false)
        onSaved?.({ country: value })
      }
    } catch {}
    setSaving(false)
  }

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
        <span className="text-base leading-none">🌍</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 font-medium">البلد / المنطقة</p>
        {editing ? (
          <div className="flex items-center gap-2 mt-1">
            <select
              value={value}
              onChange={e => setValue(e.target.value)}
              className="flex-1 px-2 py-1.5 rounded-xl border border-primary-300 bg-white text-sm outline-none focus:border-primary-500 transition font-medium"
            >
              <option value="">— غير محدد —</option>
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
            <button
              onClick={save}
              disabled={saving}
              className="px-3 py-1.5 rounded-xl bg-primary-500 text-white text-xs font-bold hover:bg-primary-600 transition disabled:opacity-50 flex-shrink-0"
            >
              {saving ? '...' : 'حفظ'}
            </button>
            <button
              onClick={() => { setEditing(false); setValue(initialValue || '') }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-slate-800 font-semibold flex-1">
              {countryLabel || <span className="text-slate-400 font-normal">غير محدد — اضغط لتحديد البلد</span>}
            </p>
            <button
              onClick={() => setEditing(true)}
              className="text-[11px] font-bold text-primary-500 hover:text-primary-700 border border-primary-200 hover:border-primary-400 px-2 py-0.5 rounded-lg transition flex-shrink-0"
            >
              تعديل
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ClientModal({ client, onClose, onStatusChange, onDelete, onlineInfo, onKick, onUpdate }) {
  const goal = goalMap[client.goal]
  const [kicking, setKicking] = useState(false)
  const [kicked, setKicked]   = useState(false)

  const onlineStatus = getOnlineStatus(onlineInfo)

  async function kickClient() {
    if (!confirm(`إخراج "${client.name}" من المنصة الآن؟`)) return
    setKicking(true)
    await fetch(`/api/admin/clients/${client.id}/kick`, { method: 'DELETE' }).catch(() => {})
    setKicking(false)
    setKicked(true)
    setTimeout(() => setKicked(false), 4000)
    onKick(client.id)
  }

  const hasPlan = !!client.plan
  const hasNutrition = hasPlan && !!client.plan?.nutrition?.calories
  const hasTraining  = hasPlan && !!client.plan?.training?.daysPerWeek

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
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge status={client.status} />
                {goal && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${goal.color}`}>
                    {goal.icon} {goal.label}
                  </span>
                )}
                <SubBadge client={client} />
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border
                  ${onlineStatus === 'online'  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    onlineStatus === 'away'    ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-50 text-slate-500 border-slate-200'}`}>
                  <OnlineDot status={onlineStatus} />
                  {onlineStatus === 'online' ? 'داخل المنصة الآن' :
                   onlineStatus === 'away'   ? `غائب · ${formatAgo(onlineInfo?.lastSeen)}` :
                   onlineInfo?.lastSeen      ? `آخر ظهور ${formatAgo(onlineInfo?.lastSeen)}` : 'غير متصل'}
                </span>
              </div>
              {/* Session info */}
              {onlineInfo?.loginTime && (
                <p className="text-xs text-slate-400 mt-1.5">
                  دخل في: <strong className="text-slate-600">{formatTime(onlineInfo.loginTime)}</strong>
                  {onlineInfo.lastSeen && (
                    <> · آخر نشاط: <strong className="text-slate-600">{formatTime(onlineInfo.lastSeen)}</strong></>
                  )}
                </p>
              )}
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
              <EditableCountry
                clientId={client.id}
                initialValue={client.country || ''}
                onSaved={fields => onUpdate(client.id, fields)}
              />
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

          {/* Payment status + receipt */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">الدفع والإيصال</h3>
            <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
              {(client.status === 'pending' || client.status === 'payment_expired') && (
                <div className={`rounded-xl p-3 border ${client.status === 'payment_expired' ? 'bg-orange-50 border-orange-200' : 'bg-amber-50 border-amber-200'}`}>
                  {client.paymentMethodChosen && (
                    <p className="text-sm font-bold text-slate-700 mb-1">
                      طريقة الدفع: <span className="text-amber-700">{{
                        d17: 'D17', post: 'مكتب البريد',
                        later_d17: 'D17 — لاحقاً', later_post: 'مكتب البريد — لاحقاً'
                      }[client.paymentMethodChosen] || client.paymentMethodChosen}</span>
                    </p>
                  )}
                  {client.paymentDeadline && (
                    <p className={`text-sm font-bold ${client.status === 'payment_expired' ? 'text-orange-700' : 'text-amber-700'}`}>
                      {client.status === 'payment_expired' ? '⚠️ انتهت مهلة الدفع' : '⏰ موعد الدفع النهائي'}:
                      {' '}{new Date(client.paymentDeadline).toLocaleString('ar')}
                    </p>
                  )}
                  {!client.paymentMethodChosen && (
                    <p className="text-sm text-slate-500">لم يختر طريقة الدفع بعد</p>
                  )}
                </div>
              )}
              <ClientReceiptPanel clientId={client.id} client={client} onConfirmPayment={onUpdate} />
            </div>
          </div>

          {/* Plan status */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">الخطة</h3>
            <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap gap-y-2">
                <span className={`px-3 py-1.5 rounded-full text-xs font-extrabold border ${hasNutrition ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-400 border-slate-200'}`}>
                  {hasNutrition ? '✅ غذاء' : '⏳ غذاء'}
                </span>
                <span className={`px-3 py-1.5 rounded-full text-xs font-extrabold border ${hasTraining ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-400 border-slate-200'}`}>
                  {hasTraining ? '✅ تدريب' : '⏳ تدريب'}
                </span>
              </div>
              <Link href={`/dashboard/clients/${client.id}/plan`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gold-400 text-black font-bold text-xs hover:bg-gold-300 transition flex-shrink-0">
                <ExternalLink className="w-3.5 h-3.5" />
                {hasPlan ? 'تعديل الخطة' : 'بناء الخطة'}
              </Link>
            </div>
          </div>

          {/* Subscription */}
          <SubscriptionSection client={client} onUpdate={onUpdate} />

          {/* Client access activation */}
          <ClientAccessSection client={client} onUpdate={onUpdate} />

          {/* Lab Protocol */}
          <ProtocolSection client={client} onUpdate={onUpdate} />

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

          {/* Progress & weekly check-ins */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">تقدم العميل وتقاريره الأسبوعية</h3>
            </div>
            <ClientProgressPanel clientId={client.id} />
          </div>

          {/* Before/after photos */}
          <ClientPhotosPanel clientId={client.id} />

          {/* Daily tasks management */}
          <ClientTasksPanel clientId={client.id} />

          {/* Direct messaging */}
          <ClientMessagesPanel clientId={client.id} clientName={client.name} />

          {/* Workout log */}
          <WorkoutLogPanel clientId={client.id} />
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 space-y-3">
          {/* Status buttons */}
          <div className="flex gap-2 flex-wrap">
            {['new','reviewed','active'].map(s => (
              <button key={s} onClick={() => onStatusChange(client.id, s)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border
                  ${client.status === s
                    ? 'bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-sm'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                {statusMap[s].label}
              </button>
            ))}
          </div>
          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => printClientPDF(client)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#0a0a0a] text-gold-400 hover:bg-black transition">
              <Download className="w-3.5 h-3.5" />
              تنزيل PDF
            </button>
            {/* Force logout — only meaningful if client has a session */}
            <button onClick={kickClient} disabled={kicking || kicked}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition
                ${kicked ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                  'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'}`}>
              <KickIcon className="w-3.5 h-3.5" />
              {kicked ? 'تم الإخراج' : kicking ? 'جاري...' : 'إخراج قسري'}
            </button>
            <button onClick={() => onDelete(client.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition">
              <X className="w-3.5 h-3.5" />
              حذف
            </button>
            <span className="text-xs text-slate-300 flex-1 text-left">
              {new Date(client.createdAt).toLocaleDateString('ar', { year:'numeric', month:'long', day:'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ClientsClient({ error }) {
  const router = useRouter()
  const [clients, setClients]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [query, setQuery]         = useState('')
  const [filterStatus, setFS]     = useState('all')
  const [filterGoal, setFG]       = useState('all')
  const [selected, setSelected]   = useState(null)
  const [deleting, setDeleting]   = useState(null)
  const [addOpen, setAddOpen]     = useState(false)
  const [approvalCode, setApprovalCode] = useState(null)
  const [onlineData, setOnlineData]   = useState({})
  const [toast, setToast]           = useState(null)
  const [giftOpen, setGiftOpen]         = useState(false)
  const [giftResult, setGiftResult]     = useState(null)
  const [giftPlan, setGiftPlan]         = useState('monthly')
  const [giftDuration, setGiftDuration] = useState(30)
  const [giftNote, setGiftNote]         = useState('')
  const [giftLoading, setGiftLoading]   = useState(false)

  async function loadClients() {
    setLoading(true)
    try {
      const res = await fetch('/api/clients', { cache: 'no-store' })
      const data = await res.json()
      setClients(Array.isArray(data) ? data : [])
    } catch { setClients([]) }
    finally { setLoading(false) }
  }

  async function loadOnlineStatus() {
    try {
      const res = await fetch('/api/admin/online', { cache: 'no-store' })
      const data = await res.json()
      setOnlineData(data.online || {})
    } catch {}
  }

  useEffect(() => { loadClients() }, [])
  // Refresh online status every 30 seconds
  useEffect(() => {
    loadOnlineStatus()
    const iv = setInterval(loadOnlineStatus, 30_000)
    return () => clearInterval(iv)
  }, [])

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

  function updateClient(id, fields) {
    setClients(cs => cs.map(c => c.id === id ? { ...c, ...fields } : c))
    if (selected?.id === id) setSelected(s => ({ ...s, ...fields }))
  }

  async function deleteClient(id) {
    if (!confirm('هل أنت متأكد من حذف هذا العميل؟')) return
    setDeleting(id)
    try {
      await fetch(`/api/register/${id}`, { method: 'DELETE' })
      setClients(cs => cs.filter(c => c.id !== id))
      if (selected?.id === id) setSelected(null)
    } finally {
      setDeleting(null)
    }
  }

  async function approveClient(id, email) {
    try {
      const res  = await fetch(`/api/dashboard/approve/${id}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setToast({ msg: data.error || 'حدث خطأ', type: 'error' }); return }
      setClients(cs => cs.map(c => c.id === id ? { ...c, status: 'active' } : c))
      if (selected?.id === id) setSelected(null)
      setApprovalCode({ email: data.email, code: data.activationCode })
    } catch { setToast({ msg: 'حدث خطأ، حاول مرة أخرى', type: 'error' }) }
  }

  const counts = {
    all:             clients.length,
    pending:         clients.filter(c => c.status === 'pending').length,
    payment_expired: clients.filter(c => c.status === 'payment_expired').length,
    new:             clients.filter(c => c.status === 'new').length,
    reviewed:        clients.filter(c => c.status === 'reviewed').length,
    active:          clients.filter(c => c.status === 'active').length,
    suspended:       clients.filter(c => c.status === 'suspended').length,
  }

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl font-bold text-sm transition-all
          ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}
          onClick={() => setToast(null)}>
          {toast.type === 'error' ? '✗' : '✓'} {toast.msg}
        </div>
      )}
      {selected && (
        <ClientModal
          client={selected}
          onClose={() => setSelected(null)}
          onStatusChange={changeStatus}
          onDelete={deleteClient}
          onlineInfo={onlineData[selected.id]}
          onKick={id => setOnlineData(prev => ({ ...prev, [id]: { lastSeen: null, loginTime: null } }))}
          onUpdate={updateClient}
        />
      )}
      {addOpen && (
        <AddClientModal
          onClose={() => setAddOpen(false)}
          onAdded={() => { loadClients() }}
        />
      )}

      {/* Gift code modal */}
      {giftOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setGiftOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-6 text-center">
              <div className="text-4xl mb-2">🎁</div>
              <h2 className="text-xl font-extrabold text-white">منح هدية مجانية</h2>
              <p className="text-white/70 text-sm mt-1">أنشئ رابطاً يتيح لصديق الاشتراك مجاناً</p>
            </div>
            <div className="p-6 space-y-4">
              {!giftResult ? (
                <>
                  <div>
                    <label className="text-slate-700 text-sm font-bold mb-1.5 block">الباقة</label>
                    <select value={giftPlan} onChange={e => {
                      const p = e.target.value
                      setGiftPlan(p)
                      setGiftDuration(p === '3months' ? 90 : 30)
                    }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400 transition">
                      <option value="training">برنامج التدريب — 50 د.ت</option>
                      <option value="monthly">الباقة الشهرية — 125 د.ت</option>
                      <option value="3months">باقة 3 أشهر — 300 د.ت</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-700 text-sm font-bold mb-1.5 block">مدة الاشتراك (أيام)</label>
                    <div className="flex gap-2">
                      {[7, 14, 30, 60, 90].map(d => (
                        <button key={d} type="button"
                          onClick={() => setGiftDuration(d)}
                          className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition border ${giftDuration === d ? 'bg-violet-600 text-white border-violet-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-violet-300'}`}>
                          {d === 30 ? '30\nشهر' : d === 90 ? '90\n3 أشهر' : d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-700 text-sm font-bold mb-1.5 block">ملاحظة (اختياري)</label>
                    <input value={giftNote} onChange={e => setGiftNote(e.target.value)}
                      placeholder="مثلاً: هدية لأخي أحمد"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400 transition" />
                  </div>
                  <button
                    disabled={giftLoading}
                    onClick={async () => {
                      setGiftLoading(true)
                      try {
                        const res = await fetch('/api/admin/gift', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ plan: giftPlan, duration: giftDuration, note: giftNote }),
                        })
                        const data = await res.json()
                        if (data.code) setGiftResult(data)
                      } catch {}
                      finally { setGiftLoading(false) }
                    }}
                    className="w-full py-3 rounded-xl bg-violet-600 text-white font-extrabold text-sm hover:bg-violet-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                    {giftLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                    إنشاء رابط الهدية
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-slate-700 text-sm font-bold text-center">✅ تم إنشاء الرابط</p>
                  <div className="bg-violet-50 border border-violet-200 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1 font-medium">الرابط (صالح 60 يوماً)</p>
                    <p className="text-violet-700 text-xs font-bold break-all" dir="ltr">{giftResult.link}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-500 mb-0.5">الكود فقط</p>
                    <p className="text-2xl font-extrabold tracking-widest text-slate-800" dir="ltr">{giftResult.code}</p>
                    <p className="text-xs text-violet-600 font-bold mt-1">{giftResult.planName} · {giftResult.duration} يوم</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => { navigator.clipboard.writeText(giftResult.link) }}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition">
                      <Copy className="w-3.5 h-3.5" /> نسخ الرابط
                    </button>
                    <a href={`https://wa.me/?text=${encodeURIComponent('مرحباً! 🎁 أمين يهديك باقة مجانية في Amine-Fit\n\n' + giftResult.link)}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-500 text-white font-bold text-xs hover:bg-green-600 transition">
                      إرسال واتساب
                    </a>
                  </div>
                </div>
              )}
              <button onClick={() => setGiftOpen(false)}
                className="w-full py-2 text-slate-400 text-sm hover:text-slate-600 transition font-medium">إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* Activation code modal shown after approving a client */}
      {approvalCode && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setApprovalCode(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-gradient-to-br from-amber-400 to-yellow-500 p-6 text-center">
              <div className="text-5xl mb-2">✅</div>
              <h2 className="text-xl font-extrabold text-black">تمت الموافقة!</h2>
              <p className="text-black/70 text-sm mt-1">{approvalCode.email}</p>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600 text-sm font-medium text-center">
                أرسل كود التفعيل هذا للعميل عبر واتساب أو البريد الإلكتروني
              </p>
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-center">
                <p className="text-xs text-amber-600 font-bold uppercase tracking-wide mb-2">كود التفعيل</p>
                <p className="font-mono text-4xl font-black tracking-widest text-amber-600 select-all" dir="ltr">
                  {approvalCode.code}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 font-medium space-y-1">
                <p>• سيدخل العميل هذا الكود في صفحة "تفعيل الحساب"</p>
                <p>• يستخدم الكود مرة واحدة فقط ثم يُحذف</p>
                <p>• العميل سينشئ كلمة مروره بنفسه عند التفعيل</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(approvalCode.code)
                    .catch(() => {})
                  }}
                  className="flex-1 py-2.5 rounded-xl border-2 border-amber-300 text-amber-600 font-extrabold text-sm hover:bg-amber-50 transition">
                  نسخ الكود
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`مرحباً! تم قبول طلبك في Amine-Fit 🎉\n\nكود التفعيل الخاص بك:\n${approvalCode.code}\n\nاذهب إلى: https://amine-fit.com/client/login\nواختر "تفعيل الحساب"`)}`}
                  target="_blank" rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-500 text-white font-extrabold text-sm hover:bg-green-600 transition">
                  واتساب
                </a>
              </div>
              <button onClick={() => setApprovalCode(null)}
                className="w-full py-2.5 rounded-xl bg-[#0a0a0a] text-white font-bold text-sm hover:bg-black transition">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {error === 'not_found' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700 font-medium">
          ⚠️ لم يتم العثور على العميل في قاعدة البيانات. قد يكون بسبب مشكلة في الاتصال بـ Redis — تحقق من{' '}
          <a href="/api/debug" target="_blank" className="underline font-bold">رابط التشخيص</a>.
        </div>
      )}

      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="بحث بالاسم أو البريد..."
              className="w-full pr-9 pl-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-100 transition font-medium" />
          </div>
          <select value={filterGoal} onChange={e => setFG(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-sm outline-none focus:border-gold-400 transition appearance-none cursor-pointer font-medium text-slate-600">
            <option value="all">كل الأهداف</option>
            {Object.entries(goalMap).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-400 text-black font-extrabold text-sm hover:bg-gold-300 transition shadow-sm flex-shrink-0">
            <UserPlus className="w-4 h-4" />
            إضافة عميل
          </button>
          <button onClick={() => { setGiftOpen(true); setGiftResult(null); setGiftPlan('monthly'); setGiftDuration(30); setGiftNote('') }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-100 text-violet-700 border border-violet-200 font-extrabold text-sm hover:bg-violet-200 transition flex-shrink-0">
            <Gift className="w-4 h-4" />
            منح هدية
          </button>
        </div>

        {/* Pending banner */}
        {counts.pending > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">⏳</span>
              <div>
                <p className="font-extrabold text-amber-800 text-sm">
                  {counts.pending} طلب{counts.pending > 1 ? 'ات' : ''} تنتظر موافقتك
                </p>
                <p className="text-xs text-amber-600">راجع الطلبات وأرسل بيانات الدخول</p>
              </div>
            </div>
            <button onClick={() => setFS('pending')}
              className="px-4 py-2 bg-amber-400 text-black font-extrabold text-xs rounded-xl hover:bg-amber-300 transition flex-shrink-0">
              عرض الطلبات
            </button>
          </div>
        )}

        {/* Status tabs */}
        <div className="flex gap-2 flex-wrap">
          {[['all','الكل'],['pending','انتظار'],['payment_expired','منتهية'],['new','جديد'],['reviewed','مراجعة'],['active','نشط'],['suspended','معلق']].map(([k,l]) => (
            <button key={k} onClick={() => setFS(k)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border
                ${filterStatus===k
                  ? k==='pending' ? 'bg-amber-400 text-black border-amber-400 shadow-sm' : 'bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'}`}>
              {l}
              <span className={`text-xs px-2 py-0.5 rounded-full font-extrabold
                ${filterStatus===k
                  ? k==='pending' ? 'bg-black/20 text-black' : 'bg-gold-400 text-black'
                  : k==='pending' && counts.pending > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                {counts[k] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="text-center py-24 text-slate-300">
            <Loader2 className="w-10 h-10 mx-auto mb-3 animate-spin opacity-30" />
            <p className="text-sm text-slate-400">جاري التحميل...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-300">
            <User className="w-14 h-14 mx-auto mb-3 opacity-20" />
            <p className="font-bold text-slate-400">لا توجد بيانات بعد</p>
            <p className="text-sm mt-1 text-slate-300">سيظهر هنا العملاء بعد ملء الاستبيان</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(c => (
              <ClientCard
                key={c.id}
                client={c}
                onlineInfo={onlineData[c.id]}
                onSelect={setSelected}
                onApprove={approveClient}
                onChangeStatus={changeStatus}
                onBuildPlan={id => {}}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
