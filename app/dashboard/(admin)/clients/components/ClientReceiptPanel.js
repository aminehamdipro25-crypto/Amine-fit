'use client'
import { useState, useEffect } from 'react'
import { CreditCard, CheckCircle2, Loader2 } from 'lucide-react'
import { PLANS_INFO, PLAN_NAME_MAP } from './SubscriptionSection'

export default function ClientReceiptPanel({ clientId, onConfirmPayment, client }) {
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
