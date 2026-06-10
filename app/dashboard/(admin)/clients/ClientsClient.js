'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, Eye, X, User, Target, Activity,
  Droplets, Moon, Utensils, Heart, CheckCircle2, Clock, AlertCircle, Download,
  Key, ExternalLink, Loader2, UserPlus, Mail, Phone, Lock, Dumbbell, LogOut as KickIcon,
  Calendar, CreditCard, RefreshCw, Star, TrendingUp, ClipboardList, Scale, Camera, Gift, Copy
} from 'lucide-react'
import { COUNTRIES } from '@/lib/countries'

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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-client-modal-title"
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-400 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 id="add-client-modal-title" className="text-lg font-extrabold text-slate-900">إضافة عميل جديد</h2>
              <p className="text-xs text-slate-400 font-medium">سيتمكن العميل من تسجيل الدخول فوراً</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="إغلاق" className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition">
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
  <span>amine-fit.com</span>
</div>

<script>window.onload = () => window.print()</script>
</body></html>`

  const win = window.open('', '_blank')
  win.document.write(html)
  win.document.close()
}

// ── Subscription helpers ──────────────────────────────────────────────────────
const PLANS_INFO = {
  basic:    { label: 'برنامج التدريب', short: 'تدريب',   color: 'bg-blue-50 text-blue-700 border-blue-200',       days: 30 },
  standard: { label: 'الباقة الشهرية', short: 'شهرية',   color: 'bg-violet-50 text-violet-700 border-violet-200', days: 30 },
  premium:  { label: 'باقة 3 أشهر',   short: '3 أشهر',  color: 'bg-amber-50 text-amber-700 border-amber-200',    days: 90 },
}
const PLAN_NAME_MAP = {
  'برنامج التدريب': 'basic',
  'الباقة الشهرية': 'standard',
  'باقة 3 أشهر':   'premium',
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
  const interestedKey = PLAN_NAME_MAP[client.interestedPlan] || null
  const defaultPlan   = client.subscriptionPlan || interestedKey || 'standard'
  const [plan, setPlan]           = useState(defaultPlan)
  const [duration, setDuration]   = useState(
    client.subscriptionDays || PLANS_INFO[defaultPlan]?.days || 30
  )
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]             = useState(false)
  const [savedMsg, setSavedMsg]       = useState('')
  const [clearing, setClearing]       = useState(false)

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
        setSavedMsg(data.activationSent ? '✅ تم الحفظ وإرسال رمز التفعيل للعميل' : '✅ تم حفظ الاشتراك')
        setSaved(true)
        setTimeout(() => { setSaved(false); setSavedMsg('') }, 4000)
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

        {/* Interested plan hint */}
        {!sub && client.interestedPlan && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
            <Star className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-extrabold text-amber-800">اختار عند التسجيل</p>
              <p className="text-sm font-bold text-amber-700">{client.interestedPlan}</p>
            </div>
          </div>
        )}

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
                <option value="basic">برنامج التدريب — 50 د.ت</option>
                <option value="standard">الباقة الشهرية — 125 د.ت</option>
                <option value="premium">باقة 3 أشهر — 300 د.ت</option>
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
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> :
               saved  ? savedMsg :
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

function ClientAccessSection({ client, onUpdate }) {
  const [sending, setSending]   = useState(false)
  const [sentMsg, setSentMsg]   = useState('')
  const isActive = !!client.clientPassword

  async function sendActivation() {
    if (!confirm(`إرسال رمز التفعيل إلى ${client.email}؟`)) return
    setSending(true)
    setSentMsg('')
    try {
      const res  = await fetch(`/api/dashboard/approve/${client.id}`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        onUpdate(client.id, { status: 'active' })
        if (data.emailSent) {
          setSentMsg(`✅ تم إرسال الإيميل — الكود: ${data.activationCode}`)
        } else {
          setSentMsg(`⚠️ الكود: ${data.activationCode} — فشل الإيميل، شارك الكود عبر واتساب`)
        }
      } else {
        setSentMsg('❌ فشل الإرسال — حاول مرة أخرى')
      }
    } catch {
      setSentMsg('❌ خطأ في الاتصال')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">وصول العميل</h3>
      <div className="bg-slate-50 rounded-2xl p-4 space-y-3">

        {/* Status */}
        <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${
          isActive ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-bold ${isActive ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isActive ? 'الحساب مفعّل — العميل يمكنه تسجيل الدخول' : 'الحساب بانتظار التفعيل'}
            </p>
            {!isActive && (
              <p className="text-xs text-amber-600 mt-0.5">
                أرسل رمز التفعيل وسيضبط العميل كلمة مروره بنفسه
              </p>
            )}
          </div>
        </div>

        {/* Send activation button */}
        {client.email && (
          <div className="space-y-2">
            <button
              onClick={sendActivation} disabled={sending}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0a0a0a] text-white font-bold text-sm hover:bg-black transition disabled:opacity-50">
              {sending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><Mail className="w-4 h-4" /> {isActive ? 'إعادة إرسال رمز التفعيل' : 'إرسال رمز التفعيل للعميل'}</>}
            </button>
            {sentMsg && (
              <div>
                <p className="text-xs font-bold text-center text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 select-all">
                  {sentMsg}
                </p>
                {sentMsg.startsWith('✅') && (
                  <p className="text-[10px] text-amber-600 text-center mt-1.5 font-medium">
                    إذا لم يصل الإيميل — اطلب من العميل التحقق من مجلد Spam
                  </p>
                )}
              </div>
            )}
            <p className="text-xs text-slate-400 text-center">
              سيصل الرمز إلى: <span className="text-slate-600 font-bold" dir="ltr">{client.email}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ProtocolSection({ client, onUpdate }) {
  const [generating, setGenerating] = useState(false)
  const [genMsg, setGenMsg]         = useState('')
  const [active, setActive]         = useState(client.labProtocol?.active ?? true)
  const [toggling, setToggling]     = useState(false)
  const proto = client.labProtocol

  async function generate() {
    if (!confirm('توليد بروتوكول المختبر لهذا العميل بالذكاء الاصطناعي؟')) return
    setGenerating(true); setGenMsg('')
    try {
      // Step 1: generate via AI
      const genRes  = await fetch('/api/ai-protocol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id }),
      })
      const genData = await genRes.json()
      if (!genRes.ok || !genData.protocol) throw new Error('فشل التوليد')

      // Step 2: save to client record
      const saveRes  = await fetch(`/api/admin/clients/${client.id}/protocol`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocol: genData.protocol }),
      })
      const saveData = await saveRes.json()
      if (!saveRes.ok) throw new Error('فشل الحفظ')

      onUpdate(client.id, { labProtocol: saveData.protocol })
      setActive(true)
      setGenMsg(`✅ تم التوليد — ${saveData.protocol.methodName}`)
    } catch (err) {
      setGenMsg(`❌ ${err.message}`)
    } finally {
      setGenerating(false)
    }
  }

  async function toggleActive(val) {
    setToggling(true)
    const res = await fetch(`/api/admin/clients/${client.id}/protocol`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: val }),
    })
    if (res.ok) {
      setActive(val)
      onUpdate(client.id, { labProtocol: { ...client.labProtocol, active: val } })
    }
    setToggling(false)
  }

  async function deleteProtocol() {
    if (!confirm('حذف بروتوكول المختبر لهذا العميل؟')) return
    await fetch(`/api/admin/clients/${client.id}/protocol`, { method: 'DELETE' })
    onUpdate(client.id, { labProtocol: null })
    setGenMsg('')
  }

  return (
    <div>
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">المختبر العلمي 🔬</h3>
      <div className="bg-slate-50 rounded-2xl p-4 space-y-3">

        {proto ? (
          <>
            {/* Current protocol card */}
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{proto.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-slate-900 text-sm" dir="ltr">{proto.methodName}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{proto.tagline}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  {active ? 'مفعّل' : 'مخفي'}
                </span>
              </div>
              {proto.weeklyStats && (
                <div className="flex gap-3 mt-3 pt-3 border-t border-slate-100">
                  <div className="text-center flex-1">
                    <p className="font-extrabold text-slate-800 text-base">{proto.weeklyStats.sessions}</p>
                    <p className="text-slate-400 text-[10px]">جلسات</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="font-extrabold text-slate-800 text-base">{proto.weeklyStats.totalMinutes}</p>
                    <p className="text-slate-400 text-[10px]">دقيقة</p>
                  </div>
                  <div className="text-center flex-1 min-w-0">
                    <p className="font-extrabold text-slate-800 text-xs leading-tight">{proto.weeklyStats.intensityProfile}</p>
                    <p className="text-slate-400 text-[10px]">توزيع</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={() => toggleActive(!active)} disabled={toggling}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition disabled:opacity-40 ${active ? 'bg-white border-slate-200 text-slate-600 hover:border-red-200 hover:text-red-500' : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'}`}>
                {toggling ? '...' : active ? 'إخفاء عن العميل' : 'تفعيل للعميل'}
              </button>
              <button onClick={generate} disabled={generating}
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-[#0a0a0a] text-white text-xs font-bold hover:bg-black transition disabled:opacity-50">
                {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '🔄 توليد جديد'}
              </button>
              <button onClick={deleteProtocol}
                className="px-3 py-2 rounded-xl border border-red-200 text-red-400 text-xs hover:bg-red-50 transition">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        ) : (
          <button onClick={generate} disabled={generating}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0a0a0a] text-white font-bold text-sm hover:bg-black transition disabled:opacity-50">
            {generating
              ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري التوليد...</>
              : <>🔬 توليد بروتوكول المختبر</>}
          </button>
        )}

        {genMsg && (
          <p className="text-xs font-bold text-center text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2">
            {genMsg}
          </p>
        )}
        <p className="text-xs text-slate-400 text-center">
          يُولَّد تلقائياً بالذكاء الاصطناعي بناءً على بيانات العميل
        </p>
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

// ── Client Progress + Check-ins (admin view) ─────────────────────────────────
function ClientProgressPanel({ clientId }) {
  const [progress, setProgress]   = useState(null)
  const [checkins, setCheckins]   = useState(null)
  const [reply, setReply]         = useState('')
  const [sending, setSending]     = useState(false)
  const [sent, setSent]           = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/clients/${clientId}/progress`).then(r => r.ok ? r.json() : []),
      fetch(`/api/admin/clients/${clientId}/checkins`).then(r => r.ok ? r.json() : []),
    ]).then(([p, c]) => { setProgress(p); setCheckins(c) }).catch(() => {})
  }, [clientId])

  const latestWeight = progress?.filter(e => e.weight)?.at(-1)
  const prevWeight   = progress?.filter(e => e.weight)?.at(-2)
  const weightDiff   = latestWeight?.weight && prevWeight?.weight
    ? (latestWeight.weight - prevWeight.weight).toFixed(1) : null
  const lastCheckin  = checkins?.at(-1)

  async function sendReply() {
    if (!reply.trim() || !lastCheckin) return
    setSending(true)
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/checkin-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkinId: lastCheckin.id, reply }),
      })
      if (!res.ok) throw new Error(`server ${res.status}`)
      setCheckins(prev => prev.map(c =>
        c.id === lastCheckin.id ? { ...c, coachReply: reply, repliedAt: new Date().toISOString() } : c
      ))
      setReply('')
      setSent(true)
      setTimeout(() => setSent(false), 3000)
    } catch (e) {
      console.error('[sendReply]', e.message)
      alert('فشل إرسال الرد — حاول مرة أخرى')
    } finally { setSending(false) }
  }

  if (!progress && !checkins) return (
    <div className="flex items-center justify-center py-6">
      <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
    </div>
  )

  return (
    <div className="space-y-3">
      {/* Latest measurements */}
      {latestWeight ? (
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-4 h-4 text-amber-500" />
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">آخر قياس</p>
            <span className="text-[10px] text-slate-300 mr-auto">
              {new Date(latestWeight.date).toLocaleDateString('ar', { month:'short', day:'numeric' })}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label:'الوزن', val: latestWeight.weight, unit:'كغ', diff: weightDiff },
              { label:'الخصر', val: latestWeight.waist,  unit:'سم', diff: null },
              { label:'الصدر', val: latestWeight.chest,  unit:'سم', diff: null },
            ].filter(f => f.val).map(f => (
              <div key={f.label} className="bg-white rounded-xl p-2.5 text-center border border-slate-100">
                <p className="text-sm font-extrabold text-slate-900">{f.val} <span className="text-[10px] font-semibold text-slate-400">{f.unit}</span></p>
                <p className="text-[10px] text-slate-400 font-semibold">{f.label}</p>
                {f.diff !== null && (
                  <p className={`text-[10px] font-extrabold mt-0.5 ${+f.diff < 0 ? 'text-emerald-500' : +f.diff > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                    {+f.diff > 0 ? '+' : ''}{f.diff} {f.unit}
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">
            {progress.length} إدخال مسجل
          </p>
        </div>
      ) : (
        <p className="text-xs text-slate-400 text-center py-3">لا توجد قياسات بعد</p>
      )}

      {/* Last check-in + coach reply */}
      {lastCheckin ? (
        <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-violet-500" />
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">آخر تقرير أسبوعي</p>
            <span className="text-[10px] text-slate-300 mr-auto">
              {new Date(lastCheckin.date).toLocaleDateString('ar', { month:'short', day:'numeric' })}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label:'الطاقة', val:`${lastCheckin.energy}/5`,               emoji:'⚡' },
              { label:'النوم',  val:`${lastCheckin.sleep}ساعة`,               emoji:'🌙' },
              { label:'التوتر', val: lastCheckin.stress ? `${lastCheckin.stress}/5` : '—', emoji:'😤' },
              { label:'تدريب',  val:`${lastCheckin.trainingDone}أيام`,        emoji:'🏋️' },
              { label:'تغذية',  val:`${lastCheckin.nutritionDays}/7`,         emoji:'🥗' },
              { label:'الوزن',  val: lastCheckin.weight ? `${lastCheckin.weight}كغ` : '—', emoji:'⚖️' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl p-2 text-center border border-slate-100">
                <p className="text-base">{s.emoji}</p>
                <p className="text-xs font-extrabold text-slate-800">{s.val}</p>
                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          {lastCheckin.pain && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
              <p className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wide mb-1">⚠️ ألم / إصابة مُبلَّغ عنها</p>
              <p className="text-xs text-slate-700">{lastCheckin.pain}</p>
            </div>
          )}
          {lastCheckin.note && (
            <p className="text-xs text-slate-500 bg-white rounded-xl px-3 py-2 border border-slate-100 italic">
              "{lastCheckin.note}"
            </p>
          )}
          {/* Coach reply */}
          {lastCheckin.coachReply ? (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
              <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wide mb-1">ردك للعميل ✅</p>
              <p className="text-xs text-slate-700">{lastCheckin.coachReply}</p>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
                placeholder="اكتب ردك للعميل... (Enter للإرسال)"
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-violet-400 transition font-medium"
              />
              <button onClick={sendReply} disabled={sending || !reply.trim()}
                className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition
                  ${sent ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40'}`}>
                {sent ? '✓ أُرسل' : sending ? '...' : 'ردّ'}
              </button>
            </div>
          )}
          <p className="text-[10px] text-slate-400 text-center font-medium">{checkins.length} تقرير مسجل</p>
        </div>
      ) : (
        <p className="text-xs text-slate-400 text-center py-3">لا توجد تقارير أسبوعية بعد</p>
      )}
    </div>
  )
}

// ── Client Photos (admin view) ────────────────────────────────────────────────
function ClientPhotosPanel({ clientId }) {
  const [photos, setPhotos] = useState(null)

  useEffect(() => {
    fetch(`/api/admin/clients/${clientId}/photos`)
      .then(r => r.ok ? r.json() : [])
      .then(setPhotos)
      .catch(() => setPhotos([]))
  }, [clientId])

  if (!photos) return null
  if (!photos.length) return null

  const TYPE_LABEL = { before: 'قبل 📸', progress: 'تقدم 📊', after: 'بعد 🏆' }
  const TYPE_COLOR = { before: 'bg-blue-100 text-blue-700', progress: 'bg-amber-100 text-amber-700', after: 'bg-emerald-100 text-emerald-700' }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Camera className="w-3.5 h-3.5 text-slate-400" />
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">صور العميل ({photos.length})</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {photos.slice(-9).map(p => (
          <div key={p.id} className="relative rounded-xl overflow-hidden border border-slate-100 aspect-square bg-slate-50">
            <img src={p.dataUrl} alt={p.type} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 inset-x-0 bg-black/50 px-2 py-1 flex items-center gap-1.5">
              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${TYPE_COLOR[p.type] || 'bg-slate-100 text-slate-600'}`}>
                {TYPE_LABEL[p.type] || p.type}
              </span>
              <span className="text-white/60 text-[9px]">
                {new Date(p.date).toLocaleDateString('ar', { month:'short', day:'numeric' })}
              </span>
            </div>
          </div>
        ))}
      </div>
      {photos.length > 9 && (
        <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">+ {photos.length - 9} صور أخرى</p>
      )}
    </div>
  )
}

// ── Payment Receipt (admin view) ──────────────────────────────────────────────
function ClientReceiptPanel({ clientId, onConfirmPayment, client }) {
  const [receipt,   setReceipt]   = useState(undefined) // undefined=loading
  const [expanded,  setExpanded]  = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [confirmed,  setConfirmed]  = useState(false)

  useEffect(() => {
    fetch(`/api/admin/clients/${clientId}/receipt`)
      .then(r => r.ok ? r.json() : null)
      .then(setReceipt)
      .catch(() => setReceipt(null))
  }, [clientId])

  const interestedKey = PLAN_NAME_MAP[client.interestedPlan] || null
  const canConfirm = !client.subscriptionPlan && (interestedKey || client.interestedPlan)

  async function confirmPayment() {
    if (!confirm(`تأكيد دفع "${client.name}" وتفعيل اشتراك "${client.interestedPlan || 'standard'}"؟`)) return
    setConfirming(true)
    const plan      = interestedKey || 'standard'
    const planDays  = PLANS_INFO[plan]?.days || 30
    const startDate = new Date().toISOString().slice(0, 10)
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, durationDays: planDays, startDate }),
      })
      const data = await res.json()
      if (res.ok) {
        onConfirmPayment(clientId, {
          subscriptionPlan:      plan,
          subscriptionStartDate: data.subscription.startDate,
          subscriptionEndDate:   data.subscription.endDate,
          subscriptionDays:      data.subscription.days,
          status:                'active',
        })
        setConfirmed(true)
      }
    } catch {}
    finally { setConfirming(false) }
  }

  if (receipt === undefined) return (
    <div className="flex items-center gap-2 py-2">
      <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
      <p className="text-xs text-slate-400">جاري التحميل...</p>
    </div>
  )

  return (
    <div className="space-y-3">
      {/* Quick confirm button — shown when client has interestedPlan but no subscription */}
      {canConfirm && !confirmed && (
        <button
          onClick={confirmPayment} disabled={confirming}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 text-white font-extrabold text-sm hover:bg-emerald-600 transition disabled:opacity-50 shadow-sm">
          {confirming
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <><CheckCircle2 className="w-4 h-4" /> تأكيد الدفع وتفعيل الاشتراك</>}
        </button>
      )}
      {confirmed && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-extrabold text-emerald-700">✅ تم تأكيد الدفع وتفعيل الاشتراك</p>
        </div>
      )}

      {/* Receipt image */}
      {receipt ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">إيصال الدفع</p>
            <p className="text-[10px] text-slate-400 font-medium" dir="ltr">
              {new Date(receipt.uploadedAt).toLocaleString('ar', {
                timeZone: 'Asia/Qatar', year: 'numeric', month: 'short',
                day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
          <div
            className="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 cursor-pointer"
            onClick={() => setExpanded(true)}
            style={{ maxHeight: expanded ? 'none' : 160 }}>
            <img src={receipt.data} alt="إيصال الدفع" className="w-full object-contain" />
            {!expanded && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/60 to-transparent py-3 text-center">
                <span className="text-white text-xs font-bold">اضغط لعرض كامل</span>
              </div>
            )}
          </div>
          {expanded && (
            <button onClick={() => setExpanded(false)} className="w-full text-xs text-slate-400 hover:text-slate-600 transition font-medium py-1">
              طي الصورة ↑
            </button>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-400 font-medium bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
          لم يرفع العميل إيصال دفع بعد
        </p>
      )}
    </div>
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

/* ── Client Tasks Panel ──────────────────────────────────────────────────── */
function ClientTasksPanel({ clientId }) {
  const [tasks,   setTasks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [text,    setText]    = useState('')
  const [emoji,   setEmoji]   = useState('✅')
  const [adding,  setAdding]  = useState(false)
  const [delId,   setDelId]   = useState(null)

  useEffect(() => {
    fetch(`/api/admin/clients/${clientId}/tasks`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { setTasks(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [clientId])

  async function addTask(e) {
    e.preventDefault()
    if (!text.trim()) return
    setAdding(true)
    const res = await fetch(`/api/admin/clients/${clientId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim(), emoji }),
    })
    if (res.ok) {
      const d = await res.json()
      setTasks(prev => [...prev, d.task])
      setText('')
    }
    setAdding(false)
  }

  async function deleteTask(id) {
    setDelId(id)
    await fetch(`/api/admin/clients/${clientId}/tasks`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setTasks(prev => prev.filter(t => t.id !== id))
    setDelId(null)
  }

  const EMOJIS = ['✅','🏋️','🥗','💧','🧘','🚶','😴','🍎','💊','📏']

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-violet-50 rounded-xl flex items-center justify-center">
          <ClipboardList className="w-3.5 h-3.5 text-violet-500" />
        </div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">مهام العميل اليومية</h3>
        <span className="text-xs text-slate-400">({tasks.length}/10)</span>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 text-center py-3">جاري التحميل...</p>
      ) : (
        <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
          {tasks.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-2">لا توجد مهام بعد</p>
          )}
          {tasks.map(t => (
            <div key={t.id} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-slate-100">
              <span className="text-base flex-shrink-0">{t.emoji}</span>
              <span className="flex-1 text-sm text-slate-700 font-medium">{t.text}</span>
              <button
                onClick={() => deleteTask(t.id)}
                disabled={delId === t.id}
                className="text-red-400 hover:text-red-600 transition p-1 rounded-lg hover:bg-red-50 flex-shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {tasks.length < 10 && (
            <form onSubmit={addTask} className="flex gap-2 pt-1">
              <div className="flex gap-1 flex-wrap">
                {EMOJIS.map(e => (
                  <button key={e} type="button" onClick={() => setEmoji(e)}
                    className={`text-base p-1 rounded-lg transition ${emoji === e ? 'bg-violet-100' : 'hover:bg-slate-100'}`}>
                    {e}
                  </button>
                ))}
              </div>
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="نص المهمة..."
                maxLength={200}
                className="flex-1 min-w-0 text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-300"
              />
              <button type="submit" disabled={adding || !text.trim()}
                className="px-3 py-2 bg-violet-500 text-white rounded-xl text-xs font-bold hover:bg-violet-600 transition disabled:opacity-50 flex-shrink-0">
                {adding ? '...' : 'إضافة'}
              </button>
            </form>
          )}
        </div>
      )}
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
        <div
          role="alert"
          aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
          onClick={() => setToast(null)}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl font-bold text-sm transition-all cursor-pointer
            ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}
        >
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
                  {(c.subscriptionPlan || c.interestedPlan) && (
                    <div className="mb-3 flex items-center gap-2 flex-wrap">
                      <SubBadge client={c} />
                      {!c.subscriptionPlan && c.interestedPlan && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 whitespace-nowrap">
                          ⭐ {c.interestedPlan}
                        </span>
                      )}
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
