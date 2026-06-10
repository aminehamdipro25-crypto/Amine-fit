'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, ExternalLink, CheckCircle2, Clock, Utensils, Dumbbell, Calculator } from 'lucide-react'

function Badge({ ok, label, icon: Icon }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold border
      ${ok ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
      {ok ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

function DeleteBtn({ clientId, field, label, onDone }) {
  const [loading, setLoading] = useState(false)
  async function del() {
    if (!confirm(`هل تريد حذف ${label} لهذا العميل نهائياً؟`)) return
    setLoading(true)
    try {
      const r = await fetch(`/api/admin/clients/${clientId}/plan-field`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field }),
      })
      if (r.ok) onDone()
    } finally { setLoading(false) }
  }
  return (
    <button onClick={del} disabled={loading}
      className="p-1 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-40"
      title={`حذف ${label}`}>
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  )
}

export default function PlansClient({ clients: initial }) {
  const router = useRouter()
  const [clients, setClients] = useState(initial)

  function clearField(id, field) {
    setClients(cs => cs.map(c => {
      if (c.id !== id) return c
      if (field === 'calcPlan')          return { ...c, calcPlan: null }
      if (field === 'nutrition')         return { ...c, protocolNutrition: null }
      if (field === 'training')          return { ...c, training: null }
      return c
    }))
    router.refresh()
  }

  const totalCalcPlan  = clients.filter(c => c.calcPlan).length
  const totalProtocol  = clients.filter(c => c.protocolNutrition).length
  const totalTraining  = clients.filter(c => c.training).length

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6 px-4">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">إدارة الخطط</h1>
        <p className="text-slate-500 text-sm mt-1">جميع خطط العملاء النشطين — يمكنك الحذف والتعديل من هنا</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'خطة غذائية (حاسبة)', val: totalCalcPlan,  color: 'text-violet-600' },
          { label: 'خطة غذائية (بروتوكول)', val: totalProtocol, color: 'text-emerald-600' },
          { label: 'برنامج تدريبي',        val: totalTraining, color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-slate-500 mt-1 font-semibold">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-sm text-slate-600 space-y-1.5">
        <p className="font-bold text-slate-700 mb-2">أين تُحفظ الخطط في قاعدة البيانات؟</p>
        <p><span className="inline-flex items-center gap-1 font-bold text-violet-700"><Calculator className="w-3.5 h-3.5" /> خطة الحاسبة:</span> محفوظة في <code className="bg-white px-1 rounded border border-slate-200 text-xs">nutritionCalcPlan</code> — من صفحة /dashboard/calculator</p>
        <p><span className="inline-flex items-center gap-1 font-bold text-emerald-700"><Utensils className="w-3.5 h-3.5" /> خطة التغذية (بروتوكول):</span> محفوظة في <code className="bg-white px-1 rounded border border-slate-200 text-xs">plan.nutrition</code> — من صفحة تعديل الخطة</p>
        <p><span className="inline-flex items-center gap-1 font-bold text-amber-700"><Dumbbell className="w-3.5 h-3.5" /> البرنامج التدريبي:</span> محفوظ في <code className="bg-white px-1 rounded border border-slate-200 text-xs">plan.training</code> — من صفحة تعديل الخطة أو معد البرامج</p>
        <p className="text-slate-500 text-xs pt-1">منصة العميل تعرض: خطة الحاسبة أولاً إن وُجدت، وإلا خطة البروتوكول. البرنامج التدريبي من plan.training فقط.</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">العميل</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">خطة الحاسبة</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">خطة البروتوكول</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">البرنامج التدريبي</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">

                {/* Client name */}
                <td className="px-4 py-3">
                  <p className="font-bold text-slate-800 text-sm">{c.name}</p>
                  <p className="text-xs text-slate-400">{c.email}</p>
                </td>

                {/* Calc plan */}
                <td className="px-4 py-3">
                  {c.calcPlan ? (
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-xs font-bold text-emerald-700">{c.calcPlan.target?.toLocaleString()} سعرة</p>
                        <p className="text-[10px] text-slate-400">{c.calcPlan.duration === 'day' ? 'يومية' : c.calcPlan.duration === 'week' ? 'أسبوعية' : 'شهرية'}</p>
                      </div>
                      <DeleteBtn clientId={c.id} field="calcPlan" label="خطة الحاسبة" onDone={() => clearField(c.id, 'calcPlan')} />
                    </div>
                  ) : (
                    <Badge ok={false} label="غير موجودة" icon={Calculator} />
                  )}
                </td>

                {/* Protocol nutrition */}
                <td className="px-4 py-3">
                  {c.protocolNutrition ? (
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-xs font-bold text-emerald-700">{c.protocolNutrition.calories?.toLocaleString()} سعرة</p>
                        <p className="text-[10px] text-slate-400">{c.protocolNutrition.meals} وجبات</p>
                      </div>
                      <DeleteBtn clientId={c.id} field="nutrition" label="خطة البروتوكول" onDone={() => clearField(c.id, 'nutrition')} />
                    </div>
                  ) : (
                    <Badge ok={false} label="غير موجودة" icon={Utensils} />
                  )}
                </td>

                {/* Training */}
                <td className="px-4 py-3">
                  {c.training ? (
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-xs font-bold text-amber-700">{c.training.daysPerWeek} أيام/أسبوع</p>
                        <p className="text-[10px] text-slate-400">{c.training.days} يوم مبرمج</p>
                      </div>
                      <DeleteBtn clientId={c.id} field="training" label="البرنامج التدريبي" onDone={() => clearField(c.id, 'training')} />
                    </div>
                  ) : (
                    <Badge ok={false} label="غير موجود" icon={Dumbbell} />
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/clients/${c.id}/plan`}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gold-400 text-black rounded-xl text-xs font-bold hover:bg-gold-300 transition whitespace-nowrap">
                      <ExternalLink className="w-3 h-3" /> تعديل
                    </Link>
                  </div>
                </td>

              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400 text-sm">
                  لا يوجد عملاء نشطون حالياً
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}
