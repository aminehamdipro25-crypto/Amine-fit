'use client'
import { useState, useEffect } from 'react'
import { CalendarDays, Clock, CheckCircle2, XCircle, AlertCircle, ChevronDown, Loader2, Filter } from 'lucide-react'

const TYPE_LABELS = { nutrition: 'استشارة تغذية', training: 'استشارة تدريب', general: 'استشارة عامة' }

const STATUS_UI = {
  pending:   { label: 'بانتظار التأكيد', color: 'amber' },
  confirmed: { label: 'مؤكد',           color: 'emerald' },
  cancelled: { label: 'ملغى',           color: 'red' },
}

function StatusBadge({ status }) {
  const { label, color } = STATUS_UI[status] || STATUS_UI.pending
  const cls = {
    amber:   'bg-amber-100 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    red:     'bg-red-100 text-red-600 border-red-200',
  }[color]
  return (
    <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ${cls}`}>
      {label}
    </span>
  )
}

function ActionModal({ appt, onClose, onUpdated }) {
  const [status, setStatus]         = useState('confirmed')
  const [adminNote, setAdminNote]   = useState(appt.adminNote || '')
  const [confirmedDate, setDate]    = useState(appt.preferredDate || '')
  const [confirmedTime, setTime]    = useState(appt.preferredTime || '')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appt.id, status, adminNote, confirmedDate, confirmedTime }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'حدث خطأ'); return }
      onUpdated(data.appointment)
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-extrabold text-slate-800 text-lg">معالجة الموعد</h2>
          <p className="text-sm text-slate-500 mt-0.5">{appt.clientName} — {TYPE_LABELS[appt.type]}</p>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="flex gap-3">
            {['confirmed', 'cancelled'].map(s => (
              <button key={s} type="button" onClick={() => setStatus(s)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition
                  ${status === s
                    ? s === 'confirmed' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-red-400 bg-red-50 text-red-600'
                    : 'border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}>
                {s === 'confirmed' ? '✅ تأكيد' : '❌ إلغاء'}
              </button>
            ))}
          </div>

          {status === 'confirmed' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">التاريخ المؤكد</label>
                <input type="date" value={confirmedDate} onChange={e => setDate(e.target.value)} required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">الوقت المؤكد</label>
                <input type="time" value={confirmedTime} onChange={e => setTime(e.target.value)} required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">ملاحظة للعميل (اختياري)</label>
            <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)}
              rows={3} maxLength={300} placeholder="سيصلها للعميل عبر البريد والإشعار..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-2.5">{error}</p>}

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition">
              إلغاء
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              حفظ القرار
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AppointmentRow({ appt, onAction }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-extrabold text-slate-800">{appt.clientName}</span>
          <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full">{TYPE_LABELS[appt.type]}</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5" />
            {appt.status === 'confirmed' ? appt.confirmedDate : appt.preferredDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {appt.status === 'confirmed' ? appt.confirmedTime : appt.preferredTime}
          </span>
        </div>
        {appt.note && <p className="text-xs text-slate-400 mt-1.5 truncate">ملاحظة: {appt.note}</p>}
        {appt.adminNote && <p className="text-xs text-slate-500 mt-1 bg-slate-50 rounded-lg px-3 py-1.5">ردك: {appt.adminNote}</p>}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <StatusBadge status={appt.status} />
        {appt.status === 'pending' && (
          <button onClick={() => onAction(appt)}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-bold text-xs transition flex items-center gap-1">
            <ChevronDown className="w-3.5 h-3.5" />
            معالجة
          </button>
        )}
      </div>
    </div>
  )
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [filter, setFilter]             = useState('')
  const [selected, setSelected]         = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/appointments${filter ? `?status=${filter}` : ''}`)
      .then(r => r.ok ? r.json() : { appointments: [] })
      .then(d => setAppointments(d.appointments || []))
      .finally(() => setLoading(false))
  }, [filter])

  function handleUpdated(updated) {
    setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a))
    setSelected(null)
  }

  const pending   = appointments.filter(a => a.status === 'pending').length
  const confirmed = appointments.filter(a => a.status === 'confirmed').length
  const cancelled = appointments.filter(a => a.status === 'cancelled').length

  return (
    <>
      {selected && (
        <ActionModal appt={selected} onClose={() => setSelected(null)} onUpdated={handleUpdated} />
      )}

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">المواعيد 📅</h1>
            <p className="text-slate-500 text-sm mt-1">إدارة طلبات المواعيد من العملاء</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'معلّق', value: pending,   color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200' },
            { label: 'مؤكد',  value: confirmed, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
            { label: 'ملغى',  value: cancelled, color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200' },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border ${s.border} ${s.bg} p-4 text-center`}>
              <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-slate-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          {['', 'pending', 'confirmed', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition
                ${filter === f ? 'bg-[#0a0a0a] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
              {f === '' ? 'الكل' : STATUS_UI[f]?.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin ml-2" />
            جاري التحميل...
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <CalendarDays className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">لا توجد مواعيد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map(a => (
              <AppointmentRow key={a.id} appt={a} onAction={setSelected} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
