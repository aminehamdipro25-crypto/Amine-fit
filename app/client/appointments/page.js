'use client'
import { useState, useEffect } from 'react'
import { CalendarDays, Clock, Plus, CheckCircle2, XCircle, AlertCircle, ChevronRight, X, Loader2 } from 'lucide-react'

const TYPE_LABELS = { nutrition: 'استشارة تغذية', training: 'استشارة تدريب', general: 'استشارة عامة' }
const TYPE_COLORS = { nutrition: 'emerald', training: 'blue', general: 'violet' }

const STATUS_UI = {
  pending:   { label: 'بانتظار التأكيد', color: 'amber',   icon: AlertCircle },
  confirmed: { label: 'مؤكد',           color: 'emerald', icon: CheckCircle2 },
  cancelled: { label: 'ملغى',           color: 'red',     icon: XCircle },
}

function StatusBadge({ status }) {
  const { label, color, icon: Icon } = STATUS_UI[status] || STATUS_UI.pending
  const cls = {
    amber:   'bg-amber-100 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    red:     'bg-red-100 text-red-600 border-red-200',
  }[color]
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${cls}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  )
}

function AppointmentCard({ appt }) {
  const color = TYPE_COLORS[appt.type] || 'gray'
  const borderCls = {
    emerald: 'border-l-emerald-400',
    blue:    'border-l-blue-400',
    violet:  'border-l-violet-400',
    gray:    'border-l-gray-300',
  }[color]

  return (
    <div className={`bg-white rounded-2xl border border-slate-100 border-l-4 ${borderCls} shadow-sm p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-base mb-1">{TYPE_LABELS[appt.type] || appt.type}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mb-2">
            <span className="flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" />
              {appt.status === 'confirmed' ? appt.confirmedDate : appt.preferredDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {appt.status === 'confirmed' ? appt.confirmedTime : appt.preferredTime}
            </span>
          </div>
          {appt.note && (
            <p className="text-xs text-slate-400 mb-2 truncate">ملاحظتي: {appt.note}</p>
          )}
          {appt.adminNote && (
            <p className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2 mt-2">
              <span className="font-bold">ملاحظة المدرب: </span>{appt.adminNote}
            </p>
          )}
        </div>
        <StatusBadge status={appt.status} />
      </div>
    </div>
  )
}

function BookingModal({ onClose, onBooked }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ date: '', time: '10:00', type: 'nutrition', note: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/client/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: form.date, time: form.time, type: form.type, note: form.note }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'حدث خطأ'); return }
      onBooked(data.appointment)
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-extrabold text-slate-800 text-lg">طلب موعد جديد</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">نوع الاستشارة</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option value="nutrition">استشارة تغذية</option>
              <option value="training">استشارة تدريب</option>
              <option value="general">استشارة عامة</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">التاريخ المفضّل</label>
              <input type="date" value={form.date} min={today}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">الوقت المفضّل</label>
              <input type="time" value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">ملاحظة (اختياري)</label>
            <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              rows={3} maxLength={300} placeholder="أي تفاصيل تريد إبلاغ المدرب بها..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          {error && <p className="text-red-600 text-sm font-medium bg-red-50 rounded-xl px-4 py-2.5">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            إرسال الطلب
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [showModal, setShowModal]       = useState(false)

  useEffect(() => {
    fetch('/api/client/appointments')
      .then(r => r.ok ? r.json() : { appointments: [] })
      .then(d => setAppointments(d.appointments || []))
      .finally(() => setLoading(false))
  }, [])

  function handleBooked(appt) {
    setAppointments(prev => [appt, ...prev])
    setShowModal(false)
  }

  const pending   = appointments.filter(a => a.status === 'pending')
  const confirmed = appointments.filter(a => a.status === 'confirmed')
  const others    = appointments.filter(a => a.status === 'cancelled')

  return (
    <>
      {showModal && <BookingModal onClose={() => setShowModal(false)} onBooked={handleBooked} />}

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-[#0a0a0a] rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold mb-1">مواعيدي 📅</h1>
              <p className="text-white/50 text-sm">احجز موعداً مع المدرب أمين</p>
            </div>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-sm transition">
              <Plus className="w-4 h-4" />
              طلب موعد
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: 'معلّق', value: pending.length,   color: 'text-amber-400' },
              { label: 'مؤكد',  value: confirmed.length, color: 'text-emerald-400' },
              { label: 'ملغى',  value: others.length,    color: 'text-red-400' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin ml-2" />
            جاري التحميل...
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <CalendarDays className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">لا توجد مواعيد بعد</p>
            <p className="text-slate-400 text-sm mt-1">اضغط "طلب موعد" لحجز موعد مع المدرب</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pending.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">بانتظار التأكيد</h2>
                <div className="space-y-3">
                  {pending.map(a => <AppointmentCard key={a.id} appt={a} />)}
                </div>
              </section>
            )}
            {confirmed.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">مواعيد مؤكدة</h2>
                <div className="space-y-3">
                  {confirmed.map(a => <AppointmentCard key={a.id} appt={a} />)}
                </div>
              </section>
            )}
            {others.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">مواعيد ملغاة</h2>
                <div className="space-y-3">
                  {others.map(a => <AppointmentCard key={a.id} appt={a} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  )
}
