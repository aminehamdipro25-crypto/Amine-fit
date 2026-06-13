'use client'
import { useState } from 'react'
import { Loader2, RefreshCw, Star, X } from 'lucide-react'

// ── Subscription helpers ──────────────────────────────────────────────────────
export const PLANS_INFO = {
  basic:     { label: 'برنامج التدريب', short: 'تدريب',  color: 'bg-blue-50 text-blue-700 border-blue-200',       days: 30 },
  standard:  { label: 'الباقة الشهرية', short: 'شهرية',  color: 'bg-violet-50 text-violet-700 border-violet-200', days: 30 },
  premium:   { label: 'باقة 3 أشهر',   short: '3 أشهر', color: 'bg-amber-50 text-amber-700 border-amber-200',    days: 90 },
  // Legacy gift plan keys
  training:  { label: 'برنامج التدريب', short: 'تدريب',  color: 'bg-blue-50 text-blue-700 border-blue-200',       days: 30 },
  monthly:   { label: 'الباقة الشهرية', short: 'شهرية',  color: 'bg-violet-50 text-violet-700 border-violet-200', days: 30 },
  '3months': { label: 'باقة 3 أشهر',   short: '3 أشهر', color: 'bg-amber-50 text-amber-700 border-amber-200',    days: 90 },
}

export const PLAN_NAME_MAP = {
  'برنامج التدريب': 'basic',
  'الباقة الشهرية': 'standard',
  'باقة 3 أشهر':   'premium',
}

export function subStatus(client) {
  const endDateStr   = client.subscriptionEndDate   || client.subscriptionEnd
  const startDateStr = client.subscriptionStartDate || client.subscriptionStart
  if (!endDateStr) return null
  const ms = new Date(endDateStr).getTime() - Date.now()
  const absH = Math.floor(Math.abs(ms) / 3600000)
  return {
    plan:      client.subscriptionPlan,
    endDate:   endDateStr,
    startDate: startDateStr,
    days:      client.subscriptionDays,
    msLeft:    ms,
    daysLeft:  Math.max(0, Math.floor(ms / 86400000)),
    hoursLeft: absH % 24,
    expired:   ms <= 0,
  }
}

export function SubBadge({ client }) {
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

export default function SubscriptionSection({ client, onUpdate }) {
  const sub = subStatus(client)
  const interestedKey = PLAN_NAME_MAP[client.interestedPlan] || null
  const defaultPlan   = client.subscriptionPlan || interestedKey || 'standard'
  const [plan, setPlan]           = useState(defaultPlan)
  const [duration, setDuration]   = useState(
    client.subscriptionDays || PLANS_INFO[defaultPlan]?.days || 30
  )
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [isGift, setIsGift]       = useState(!!(client.giftCode || client.isGift))
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
        body: JSON.stringify({ plan, durationDays: duration, startDate, isGift }),
      })
      const data = await res.json()
      if (res.ok) {
        onUpdate(client.id, {
          subscriptionPlan:      plan,
          subscriptionStartDate: data.subscription.startDate,
          subscriptionEndDate:   data.subscription.endDate,
          subscriptionDays:      data.subscription.days,
          status:                'active',
          isGift:                isGift || null,
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
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div
              onClick={() => setIsGift(v => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors ${isGift ? 'bg-violet-500' : 'bg-slate-200'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isGift ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-xs font-bold text-slate-600">
              🎁 هدية من المدرب
            </span>
          </label>
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
