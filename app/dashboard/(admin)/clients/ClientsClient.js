'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, Eye, X, User, Target, Activity,
  Droplets, Moon, Utensils, Heart, CheckCircle2, Clock, AlertCircle, Download,
  Key, ExternalLink, Loader2, UserPlus, Mail, Phone, Lock, Dumbbell, LogOut as KickIcon,
  Calendar, CreditCard, RefreshCw
} from 'lucide-react'

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

function AddClientModal({ onClose, onAdded }) {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [phone, setPhone]     = useState('')
  const [password, setPass]   = useState('')
  const [goal, setGoal]       = useState('')
  const [notes, setNotes]     = useState('')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) { setError('الاسم والبريد مطلوبان'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, goal, notes }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'حدث خطأ'); return }
      onAdded({ id: data.id, name, email, phone, goal, notes, clientPassword: password, source: 'manual', status: 'active', createdAt: new Date().toISOString() })
      onClose()
    } catch { setError('حدث خطأ، حاول مرة أخرى') }
    finally { setSaving(false) }
  }

  const inp = "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium"

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-400 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">إضافة عميل جديد</h2>
              <p className="text-xs text-slate-400 font-medium">سيتمكن العميل من تسجيل الدخول فوراً</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">الاسم الكامل *</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input value={name} onChange={e => setName(e.target.value)} placeholder="محمد أحمد" required
                  className={inp + ' pr-9'} />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">البريد الإلكتروني *</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" dir="ltr"
                  placeholder="client@email.com" required className={inp + ' pr-9'} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">رقم الهاتف</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" dir="ltr"
                    placeholder="+974..." className={inp + ' pr-9'} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input value={password} onChange={e => setPass(e.target.value)} dir="ltr"
                    placeholder="12345678" className={inp + ' pr-9'} />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">الهدف</label>
              <select value={goal} onChange={e => setGoal(e.target.value)} className={inp + ' appearance-none bg-white'}>
                <option value="">اختر الهدف (اختياري)</option>
                <option value="loss">خسارة وزن</option>
                <option value="gain">بناء عضلات</option>
                <option value="maintain">الحفاظ على الوزن</option>
                <option value="performance">أداء رياضي</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">ملاحظات (اختياري)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                placeholder="أي معلومات إضافية عن العميل..."
                className={inp + ' resize-none'} />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-medium">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition">
              إلغاء
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0a0a0a] text-white font-extrabold text-sm hover:bg-black transition disabled:opacity-50 shadow-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {saving ? 'جاري الإضافة...' : 'إضافة العميل'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
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
  <span>amine-fit.vercel.app</span>
</div>

<script>window.onload = () => window.print()</script>
</body></html>`

  const win = window.open('', '_blank')
  win.document.write(html)
  win.document.close()
}

// ── Subscription helpers ──────────────────────────────────────────────────────
const PLANS_INFO = {
  basic:    { label: 'الأساسي',   short: 'أساسي',   color: 'bg-blue-50 text-blue-700 border-blue-200',       days: 30 },
  standard: { label: 'المتوسط',   short: 'متوسط',   color: 'bg-violet-50 text-violet-700 border-violet-200', days: 30 },
  premium:  { label: 'البريميوم', short: 'بريميوم', color: 'bg-amber-50 text-amber-700 border-amber-200',    days: 30 },
}

function subStatus(client) {
  if (!client.subscriptionEndDate) return null
  const ms = new Date(client.subscriptionEndDate).getTime() - Date.now()
  const absH = Math.floor(Math.abs(ms) / 3600000)
  return {
    plan:      client.subscriptionPlan,
    endDate:   client.subscriptionEndDate,
    startDate: client.subscriptionStartDate,
    days:      client.subscriptionDays,
    msLeft:    ms,
    daysLeft:  Math.max(0, Math.floor(ms / 86400000)),
    hoursLeft: absH % 24,
    expired:   ms <= 0,
  }
}

function SubBadge({ client }) {
  const sub = subStatus(client)
  if (!sub) return null
  const info = PLANS_INFO[sub.plan]
  if (!info) return null
  if (sub.expired) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200 whitespace-nowrap">
      ⛔ {info.short} · منتهي
    </span>
  )
  const urgentColor = sub.daysLeft <= 7 ? 'bg-amber-50 text-amber-700 border-amber-200' : info.color
  const t = sub.daysLeft < 1 ? `${sub.hoursLeft}س` : `${sub.daysLeft}ي`
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${urgentColor} whitespace-nowrap`}>
      ⭐ {info.short} · {t}
    </span>
  )
}

function SubscriptionSection({ client, onUpdate }) {
  const sub = subStatus(client)
  const [plan, setPlan]           = useState(client.subscriptionPlan || 'basic')
  const [duration, setDuration]   = useState(
    client.subscriptionDays || PLANS_INFO[client.subscriptionPlan || 'basic']?.days || 30
  )
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [clearing, setClearing]   = useState(false)

  async function saveSubscription() {
    setSaving(true)
    try {
      const res  = await fetch(`/api/admin/clients/${client.id}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, durationDays: duration, startDate }),
      })
      const data = await res.json()
      if (res.ok) {
        onUpdate(client.id, {
          subscriptionPlan:      plan,
          subscriptionStartDate: data.subscription.startDate,
          subscriptionEndDate:   data.subscription.endDate,
          subscriptionDays:      data.subscription.days,
          status:                'active',
        })
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally { setSaving(false) }
  }

  async function clearSubscription() {
    if (!confirm('حذف بيانات الاشتراك؟')) return
    setClearing(true)
    await fetch(`/api/admin/clients/${client.id}/subscription`, { method: 'DELETE' })
    onUpdate(client.id, { subscriptionPlan: null, subscriptionStartDate: null, subscriptionEndDate: null, subscriptionDays: null })
    setClearing(false)
  }

  const previewEnd = startDate
    ? new Date(new Date(startDate).getTime() + duration * 86400000).toLocaleDateString('ar', {
        year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
      })
    : null

  return (
    <div>
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">الاشتراك</h3>
      <div className="bg-slate-50 rounded-2xl p-4 space-y-4">

        {/* Current subscription status */}
        {sub ? (
          <div className={`rounded-xl p-3 border ${
            sub.expired                             ? 'bg-red-50 border-red-200' :
            sub.daysLeft <= 3                       ? 'bg-red-50 border-red-200' :
            sub.daysLeft <= 7                       ? 'bg-amber-50 border-amber-200' :
            'bg-emerald-50 border-emerald-200'}`}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">الباقة الحالية</p>
                <p className="font-extrabold text-slate-900 text-sm">{PLANS_INFO[sub.plan]?.label ?? sub.plan}</p>
              </div>
              <div className="text-xs text-slate-500 font-medium text-left space-y-0.5" dir="ltr">
                <p>Start: {new Date(sub.startDate).toLocaleDateString('ar', { timeZone: 'Asia/Qatar' })}</p>
                <p>End: {new Date(sub.endDate).toLocaleDateString('ar', { timeZone: 'Asia/Qatar' })}</p>
              </div>
            </div>
            {sub.expired ? (
              <p className="text-red-600 font-extrabold text-sm mt-2">⛔ انتهى الاشتراك — سيتم تعليق الحساب تلقائياً</p>
            ) : (
              <p className={`font-extrabold text-sm mt-2 ${
                sub.daysLeft <= 3 ? 'text-red-600' :
                sub.daysLeft <= 7 ? 'text-amber-600' :
                'text-emerald-600'}`}>
                ⏱ متبقي: {sub.daysLeft} يوم{sub.hoursLeft > 0 ? ` و ${sub.hoursLeft} ساعة` : ''}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400 font-medium bg-white rounded-xl p-3 border border-slate-200">
            لم يُضبط اشتراك بعد — الحساب مفتوح بدون قيد زمني
          </p>
        )}

        {/* Set / renew form */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            {sub ? 'تجديد / تغيير الاشتراك' : 'تحديد اشتراك جديد'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">الباقة</label>
              <select
                value={plan}
                onChange={e => {
                  const p = e.target.value
                  setPlan(p)
                  setDuration(PLANS_INFO[p]?.days || 30)
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none focus:border-gold-400 appearance-none">
                <option value="basic">الأساسي — 200 ر.ق</option>
                <option value="standard">المتوسط — 350 ر.ق</option>
                <option value="premium">البريميوم — 550 ر.ق</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">المدة (أيام)</label>
              <input
                type="number" value={duration}
                onChange={e => setDuration(Math.max(1, Math.min(365, parseInt(e.target.value) || 30)))}
                min="1" max="365"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none focus:border-gold-400" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">تاريخ البداية</label>
            <input
              type="date" value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none focus:border-gold-400"
              dir="ltr" />
          </div>
          {previewEnd && (
            <p className="text-xs text-slate-500 font-medium bg-white rounded-lg px-3 py-2 border border-slate-200">
              📅 ينتهي الاشتراك في: <strong className="text-slate-700">{previewEnd}</strong>
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={saveSubscription} disabled={saving}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#0a0a0a] text-white font-bold text-sm hover:bg-black transition disabled:opacity-50">
              {saving    ? <Loader2 className="w-4 h-4 animate-spin" /> :
               saved     ? '✓ تم الحفظ' :
               <><RefreshCw className="w-3.5 h-3.5" /> {sub ? 'تجديد الاشتراك' : 'حفظ الاشتراك'}</>}
            </button>
            {sub && (
              <button
                onClick={clearSubscription} disabled={clearing}
                className="px-3 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-bold hover:bg-red-50 transition disabled:opacity-40">
                {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const goalMap = {
  loss:        { label:'خسارة وزن',       color:'bg-amber-50 text-amber-700 border border-amber-200',   icon:'📉' },
  gain:        { label:'بناء عضلات',       color:'bg-blue-50 text-blue-700 border border-blue-200',      icon:'💪' },
  maintain:    { label:'الحفاظ على الوزن', color:'bg-emerald-50 text-emerald-700 border border-emerald-200', icon:'⚖️' },
  performance: { label:'أداء رياضي',       color:'bg-purple-50 text-purple-700 border border-purple-200', icon:'🏃' },
}
const statusMap = {
  new:       { label:'جديد',          color:'bg-amber-100 text-amber-700 border border-amber-200',     icon: Clock },
  reviewed:  { label:'تمت المراجعة',  color:'bg-blue-100 text-blue-700 border border-blue-200',       icon: Eye },
  active:    { label:'نشط',           color:'bg-emerald-100 text-emerald-700 border border-emerald-200', icon: CheckCircle2 },
  suspended: { label:'معلق',          color:'bg-red-100 text-red-700 border border-red-200',           icon: AlertCircle },
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

function ClientModal({ client, onClose, onStatusChange, onDelete, onlineInfo, onKick, onUpdate }) {
  const goal = goalMap[client.goal]
  const [pw, setPw]             = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSaved, setPwSaved]   = useState(false)
  const [kicking, setKicking]   = useState(false)
  const [kicked, setKicked]     = useState(false)

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

  async function savePassword() {
    if (!pw.trim()) return
    setPwSaving(true)
    await fetch(`/api/register/${client.id}/plan`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientPassword: pw.trim() }),
    })
    setPwSaving(false)
    setPwSaved(true)
    setTimeout(() => setPwSaved(false), 3000)
    setPw('')
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

          {/* Client password */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">كلمة مرور العميل</h3>
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-xs text-slate-400 font-medium mb-3">
                {client.clientPassword ? 'تم ضبط كلمة المرور — يمكن للعميل تسجيل الدخول' : 'لم يُضبط بعد — اضبط كلمة مرور لتمكين الوصول'}
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={pw} onChange={e => setPw(e.target.value)}
                    type="text" placeholder="كلمة مرور جديدة..."
                    className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium bg-white" />
                </div>
                <button onClick={savePassword} disabled={pwSaving || !pw.trim()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0a0a0a] text-white font-bold text-xs hover:bg-black transition disabled:opacity-40">
                  {pwSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : pwSaved ? '✓ تم' : 'حفظ'}
                </button>
              </div>
              {client.email && (
                <p className="text-xs text-slate-400 font-medium mt-2">
                  البريد: <span className="text-slate-600 font-bold" dir="ltr">{client.email}</span>
                </p>
              )}
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
  const [onlineData, setOnlineData]   = useState({}) // { [clientId]: { lastSeen, loginTime } }

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
      if (!res.ok) { alert(data.error || 'حدث خطأ'); return }
      setClients(cs => cs.map(c => c.id === id ? { ...c, status: 'active' } : c))
      if (selected?.id === id) setSelected(null)
      setApprovalCode({ email: data.email, code: data.activationCode })
    } catch { alert('حدث خطأ، حاول مرة أخرى') }
  }

  const counts = {
    all:       clients.length,
    pending:   clients.filter(c => c.status === 'pending').length,
    new:       clients.filter(c => c.status === 'new').length,
    reviewed:  clients.filter(c => c.status === 'reviewed').length,
    active:    clients.filter(c => c.status === 'active').length,
    suspended: clients.filter(c => c.status === 'suspended').length,
  }

  return (
    <>
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
                  href={`https://wa.me/?text=${encodeURIComponent(`مرحباً! تم قبول طلبك في Amine-Fit 🎉\n\nكود التفعيل الخاص بك:\n${approvalCode.code}\n\nاذهب إلى: https://amine-fit.vercel.app/client/login\nواختر "تفعيل الحساب"`)}`}
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
          {[['all','الكل'],['pending','انتظار'],['new','جديد'],['reviewed','مراجعة'],['active','نشط'],['suspended','معلق']].map(([k,l]) => (
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
            {filtered.map(c => {
              const goal = goalMap[c.goal]
              return (
                <div key={c.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
                  onClick={() => setSelected(c)}>

                  {/* Card header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-[#0a0a0a] text-gold-400 flex items-center justify-center font-extrabold text-xl">
                          {c.name?.[0] ?? '?'}
                        </div>
                        <span className={`absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 rounded-full border-2 border-white flex-shrink-0
                          ${getOnlineStatus(onlineData[c.id]) === 'online'  ? 'bg-emerald-500' :
                            getOnlineStatus(onlineData[c.id]) === 'away'    ? 'bg-amber-400' :
                            'bg-slate-300'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-extrabold text-slate-900 text-sm leading-tight">{c.name}</p>
                          {c.source === 'contact' && (
                            <span className="text-[9px] font-extrabold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full border border-blue-200 uppercase">تواصل</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate max-w-[140px] mt-0.5">
                          {getOnlineStatus(onlineData[c.id]) === 'online' ? (
                            <span className="text-emerald-600 font-bold">● داخل المنصة الآن</span>
                          ) : onlineData[c.id]?.lastSeen ? (
                            <span className="text-slate-400">{formatAgo(onlineData[c.id]?.lastSeen)}</span>
                          ) : (c.email || c.phone)}
                        </p>
                      </div>
                    </div>
                    <Badge status={c.status} />
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label:'العمر',  val: c.age    ? `${c.age}س`    : '—' },
                      { label:'الوزن',  val: c.weight ? `${c.weight}كغ` : '—' },
                      { label:'الطول',  val: c.height ? `${c.height}سم` : '—' },
                    ].map(s => (
                      <div key={s.label} className="bg-slate-50 rounded-xl p-2.5 text-center">
                        <p className="text-sm font-extrabold text-slate-800">{s.val}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Subscription badge */}
                  {c.subscriptionPlan && (
                    <div className="mb-3">
                      <SubBadge client={c} />
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    {goal
                      ? <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${goal.color}`}>{goal.icon} {goal.label}</span>
                      : <span className="text-xs text-slate-300">—</span>
                    }
                    {c.status === 'pending' ? (
                      <button
                        onClick={e => { e.stopPropagation(); approveClient(c.id, c.email) }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-400 text-black text-[11px] font-extrabold hover:bg-amber-300 transition">
                        ✓ موافقة
                      </button>
                    ) : c.status === 'suspended' ? (
                      <button
                        onClick={e => { e.stopPropagation(); changeStatus(c.id, 'active') }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 text-white text-[11px] font-extrabold hover:bg-emerald-600 transition">
                        <CheckCircle2 className="w-3 h-3" />
                        إعادة تفعيل
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button title="إنشاء كود تفعيل جديد"
                          onClick={e => { e.stopPropagation(); approveClient(c.id, c.email) }}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:border-amber-300 hover:text-amber-500 hover:bg-amber-50 transition">
                          <Key className="w-3.5 h-3.5" />
                        </button>
                        <button title="تعليق الحساب فوراً"
                          onClick={e => { e.stopPropagation(); changeStatus(c.id, 'suspended') }}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition">
                          <AlertCircle className="w-3.5 h-3.5" />
                        </button>
                        <Link href={`/dashboard/clients/${c.id}/plan`}
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0a0a0a] text-gold-400 text-[11px] font-extrabold hover:bg-black transition">
                          <Dumbbell className="w-3 h-3" />
                          {c.plan?.nutrition?.calories || c.plan?.training?.daysPerWeek ? 'تعديل الخطة' : 'بناء الخطة'}
                        </Link>
                      </div>
                    )}
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
