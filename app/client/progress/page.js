'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Plus, Trash2, TrendingDown, TrendingUp, Minus, Scale, Ruler, X, CheckCircle2 } from 'lucide-react'
import { SkeletonList } from '@/components/SkeletonLoader'

const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
function fmtDate(iso) {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

const FIELDS = [
  { key: 'weight', label: 'الوزن', unit: 'كغ', emoji: '⚖️', color: '#fbbf24' },
  { key: 'waist',  label: 'الخصر', unit: 'سم', emoji: '📏', color: '#f97316' },
  { key: 'chest',  label: 'الصدر', unit: 'سم', emoji: '💪', color: '#3b82f6' },
  { key: 'hips',   label: 'الأرداف', unit: 'سم', emoji: '🔵', color: '#8b5cf6' },
  { key: 'arm',    label: 'الذراع', unit: 'سم', emoji: '💪', color: '#10b981' },
  { key: 'thigh',  label: 'الفخذ', unit: 'سم', emoji: '🦵', color: '#ec4899' },
]

export default function ProgressPage() {
  const router = useRouter()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeChart, setActiveChart] = useState('weight')
  const [form, setForm] = useState({ weight:'', waist:'', chest:'', hips:'', arm:'', thigh:'', note:'' })

  useEffect(() => {
    fetch('/api/progress')
      .then(r => { if (r.status === 401) router.push('/client/login'); return r.json() })
      .then(d => Array.isArray(d) ? setEntries(d) : null)
      .finally(() => setLoading(false))
  }, [router])

  async function save() {
    if (!form.weight && !form.waist && !form.chest) return
    setSaving(true)
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) return
      const entry = await res.json()
      if (entry && !entry.error) {
        setEntries(prev => [...prev, entry])
        setForm({ weight:'', waist:'', chest:'', hips:'', arm:'', thigh:'', note:'' })
        setShowForm(false)
      }
    } catch {} finally {
      setSaving(false)
    }
  }

  async function remove(id) {
    const res = await fetch('/api/progress', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) setEntries(prev => prev.filter(e => e.id !== id))
  }

  const chartData = entries
    .filter(e => e[activeChart])
    .map(e => ({ date: fmtDate(e.date), val: e[activeChart] }))

  const field = FIELDS.find(f => f.key === activeChart)
  const latest = entries.filter(e => e[activeChart]).at(-1)?.[activeChart]
  const prev   = entries.filter(e => e[activeChart]).at(-2)?.[activeChart]
  const diff   = latest && prev ? (latest - prev).toFixed(1) : null

  if (loading) return <SkeletonList rows={4} />

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">متابعة التقدم</h1>
          <p className="text-sm text-slate-400 font-medium mt-0.5">سجّل قياساتك وتابع تطورك</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0a0a] text-[#fbbf24] rounded-xl font-bold text-sm hover:bg-[#1a1a1a] transition shadow-sm">
          <Plus className="w-4 h-4" /> تسجيل قياس
        </button>
      </div>

      {/* Stats cards */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {FIELDS.filter(f => entries.some(e => e[f.key])).map(f => {
            const vals = entries.filter(e => e[f.key]).map(e => e[f.key])
            const last = vals.at(-1)
            const prvV = vals.at(-2)
            const d = last && prvV ? +(last - prvV).toFixed(1) : null
            return (
              <button key={f.key} onClick={() => setActiveChart(f.key)}
                className={`rounded-2xl p-4 text-right transition border-2 ${activeChart === f.key ? 'border-[#fbbf24] bg-[#0a0a0a] text-white' : 'border-transparent bg-white text-slate-900 hover:border-slate-200'}`}>
                <p className="text-xs font-bold text-slate-400 mb-1">{f.emoji} {f.label}</p>
                <p className={`text-xl font-extrabold ${activeChart === f.key ? 'text-[#fbbf24]' : 'text-slate-900'}`}>
                  {last} <span className="text-xs font-semibold">{f.unit}</span>
                </p>
                {d !== null && (
                  <p className={`text-xs font-bold mt-1 flex items-center gap-1 ${d < 0 ? 'text-emerald-500' : d > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                    {d < 0 ? <TrendingDown className="w-3 h-3" /> : d > 0 ? <TrendingUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                    {d > 0 ? '+' : ''}{d} {f.unit}
                  </p>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Chart */}
      {chartData.length >= 2 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-sm font-extrabold text-slate-700 mb-4">{field?.emoji} تطور {field?.label}</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,.1)', fontSize: 13 }}
                formatter={v => [`${v} ${field?.unit}`, field?.label]}
              />
              <Line type="monotone" dataKey="val" stroke={field?.color || '#fbbf24'} strokeWidth={2.5}
                dot={{ r: 4, fill: field?.color, strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History */}
      {entries.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest px-1">السجل</p>
          {[...entries].reverse().map(e => (
            <div key={e.id} className="bg-white rounded-2xl border border-slate-100 px-5 py-4 flex items-start gap-4">
              <div className="flex-shrink-0 text-center">
                <p className="text-xs font-bold text-slate-400">{fmtDate(e.date)}</p>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-2 min-w-0">
                {FIELDS.filter(f => e[f.key]).map(f => (
                  <div key={f.key}>
                    <p className="text-[10px] text-slate-400 font-bold">{f.label}</p>
                    <p className="text-sm font-extrabold text-slate-900">{e[f.key]} {f.unit}</p>
                  </div>
                ))}
                {e.note && <p className="col-span-3 text-xs text-slate-400 font-medium mt-1 bg-slate-50 rounded-lg px-2 py-1">{e.note}</p>}
              </div>
              <button onClick={() => remove(e.id)} className="text-slate-200 hover:text-red-400 transition flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 py-16 text-center">
          <p className="text-5xl mb-4">📊</p>
          <p className="font-extrabold text-slate-700 text-lg mb-1">لا توجد قياسات بعد</p>
          <p className="text-slate-400 text-sm mb-6">سجّل أول قياس لتبدأ متابعة تقدمك</p>
          <button onClick={() => setShowForm(true)}
            className="px-5 py-2.5 bg-[#0a0a0a] text-[#fbbf24] rounded-xl font-bold text-sm">
            تسجيل أول قياس
          </button>
        </div>
      )}

      {/* Add form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-slate-900 text-lg">تسجيل قياس جديد</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-300 hover:text-slate-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {FIELDS.map(f => (
                <div key={f.key}>
                  <label className="text-xs font-bold text-slate-500 block mb-1">{f.emoji} {f.label} ({f.unit})</label>
                  <input type="number" step="0.1" value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder="0.0"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-[#fbbf24] transition" />
                </div>
              ))}
            </div>
            <div className="mb-4">
              <label className="text-xs font-bold text-slate-500 block mb-1">ملاحظة (اختياري)</label>
              <textarea rows={2} value={form.note}
                onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                placeholder="كيف تشعر اليوم؟"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-[#fbbf24] transition resize-none" />
            </div>
            <button onClick={save} disabled={saving || (!form.weight && !form.waist && !form.chest)}
              className="w-full py-3 bg-[#0a0a0a] text-[#fbbf24] rounded-xl font-extrabold text-sm disabled:opacity-40 flex items-center justify-center gap-2 hover:bg-[#1a1a1a] transition">
              {saving ? <div className="w-4 h-4 border-2 border-[#fbbf24] border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              حفظ القياس
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
