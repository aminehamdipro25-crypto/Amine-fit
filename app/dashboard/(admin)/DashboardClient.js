'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users, TrendingUp, ClipboardList, CheckCircle2,
  ArrowUpRight, Clock, Eye, Zap, Tag, X, Flame, Send, MessageSquare, CalendarDays,
} from 'lucide-react'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { monthlyData } from '@/lib/mockData'

const goalMap = {
  loss:        { label: 'خسارة وزن',       color: '#f59e0b' },
  gain:        { label: 'بناء عضلات',       color: '#10b981' },
  maintain:    { label: 'الحفاظ على الوزن', color: '#6366f1' },
  performance: { label: 'أداء رياضي',       color: '#f97316' },
}

const statusCfg = {
  new:      { bg: 'bg-amber-100 text-amber-700',   Icon: Clock         },
  reviewed: { bg: 'bg-blue-100 text-blue-700',     Icon: Eye           },
  active:   { bg: 'bg-emerald-100 text-emerald-700', Icon: CheckCircle2 },
}

function StatCard({ icon: Icon, label, value, sub, color, lightBg }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:-translate-y-1 transition-transform">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 ${lightBg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        {sub && (
          <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">
            <ArrowUpRight className="w-3 h-3" />{sub}
          </span>
        )}
      </div>
      <p className="text-4xl font-extrabold text-slate-900 tracking-tight">{value}</p>
      <p className="mt-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
    </div>
  )
}

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#111] border border-white/10 rounded-xl p-3 shadow-xl text-xs">
      <p className="font-bold text-white/50 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-bold">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

/* ── Pricing Manager ──────────────────────────────────────────────────────── */
const PLAN_LABELS = {
  basic:    { name: 'برنامج التدريب 🏋️',  period: '/ شهر' },
  standard: { name: 'الباقة الشهرية ⚡',   period: '/ شهر' },
  premium:  { name: 'باقة 3 أشهر 🏆',     period: '/ 3 أشهر' },
}
const PRICING_DEFAULT = {
  basic:    { tnd: 50,  origTnd: 100, qar: 55,  origQar: 110 },
  standard: { tnd: 125, origTnd: 250, qar: 135, origQar: 270 },
  premium:  { tnd: 300, origTnd: 600, qar: 325, origQar: 650 },
}

function PricingManager() {
  const [prices, setPrices] = useState(PRICING_DEFAULT)
  const [saving, setSaving] = useState(false)
  const [msg,    setMsg]    = useState('')

  useEffect(() => {
    fetch('/api/admin/pricing')
      .then(r => r.ok ? r.json() : PRICING_DEFAULT)
      .then(d => setPrices({ ...PRICING_DEFAULT, ...d }))
      .catch(() => {})
  }, [])

  function update(plan, field, val) {
    setPrices(prev => ({ ...prev, [plan]: { ...prev[plan], [field]: Number(val) || 0 } }))
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true); setMsg('')
    const res = await fetch('/api/admin/pricing', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(prices),
    })
    setMsg(res.ok ? '✅ تم حفظ الأسعار' : '❌ خطأ في الحفظ')
    setSaving(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
          <Tag className="w-4 h-4 text-emerald-500" />
        </div>
        <div>
          <p className="font-extrabold text-slate-800 text-sm">إدارة الأسعار</p>
          <p className="text-[10px] text-slate-400 font-medium">بالدينار التونسي (د.ت) والريال القطري (ر.ق)</p>
        </div>
      </div>

      <form onSubmit={save} className="space-y-4">
        {Object.entries(PLAN_LABELS).map(([key, meta]) => (
          <div key={key} className="bg-slate-50 rounded-2xl p-4">
            <p className="text-sm font-extrabold text-slate-700 mb-3">{meta.name} <span className="text-slate-400 font-medium text-xs">{meta.period}</span></p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">سعر البيع (د.ت)</label>
                <input type="number" min={1} value={prices[key].tnd} onChange={e => update(key, 'tnd', e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-300" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">السعر الأصلي (د.ت)</label>
                <input type="number" min={1} value={prices[key].origTnd} onChange={e => update(key, 'origTnd', e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-300" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">سعر البيع (ر.ق)</label>
                <input type="number" min={1} value={prices[key].qar} onChange={e => update(key, 'qar', e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-300" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">السعر الأصلي (ر.ق)</label>
                <input type="number" min={1} value={prices[key].origQar} onChange={e => update(key, 'origQar', e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-300" />
              </div>
            </div>
          </div>
        ))}
        <button type="submit" disabled={saving}
          className="w-full py-2.5 bg-emerald-500 text-white font-bold rounded-xl text-sm hover:bg-emerald-600 transition disabled:opacity-50">
          {saving ? 'جاري الحفظ...' : '💾 حفظ الأسعار'}
        </button>
        {msg && <p className="text-xs text-center font-medium text-slate-600">{msg}</p>}
      </form>
    </div>
  )
}

/* ── Offer / Discount Manager ──────────────────────────────────────────────── */
function OfferManager() {
  const [offer,   setOffer]   = useState(null)   // null=loading
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState('')
  const [endsAt,  setEndsAt]  = useState('')
  const [discount,setDiscount]= useState(50)
  const [label,   setLabel]   = useState('عرض إطلاق حصري')

  useEffect(() => {
    fetch('/api/admin/offer')
      .then(r => r.ok ? r.json() : {})
      .then(d => {
        setOffer(d)
        if (d.endsAt)   setEndsAt(d.endsAt.slice(0, 16))
        if (d.discount) setDiscount(d.discount)
        if (d.label)    setLabel(d.label)
      })
      .catch(() => setOffer({}))
  }, [])

  const isActive = offer?.endsAt && new Date(offer.endsAt).getTime() > Date.now()

  async function save(e) {
    e.preventDefault()
    setSaving(true); setMsg('')
    const res = await fetch('/api/admin/offer', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ endsAt, discount, label }),
    })
    const d = await res.json()
    if (res.ok) { setMsg('✅ تم تفعيل العرض بنجاح'); setOffer(d.offer) }
    else        { setMsg(`❌ ${d.error}`) }
    setSaving(false)
  }

  async function deactivate() {
    if (!confirm('إيقاف العرض الحالي وإخفاء العد التنازلي؟')) return
    setSaving(true)
    await fetch('/api/admin/offer', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ active: false }),
    })
    setOffer({})
    setMsg('✅ تم إيقاف العرض')
    setSaving(false)
  }

  // Min datetime = now + 1h
  const minDate = new Date(Date.now() + 3600000).toISOString().slice(0, 16)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
          <Flame className="w-4 h-4 text-red-500" />
        </div>
        <div className="flex-1">
          <p className="font-extrabold text-slate-800 text-sm">إدارة العرض والخصم</p>
          <p className="text-[10px] text-slate-400 font-medium">العد التنازلي يظهر للجميع في نفس الوقت</p>
        </div>
        {isActive && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full animate-pulse">
            🔴 نشط الآن
          </span>
        )}
      </div>

      {isActive && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-bold text-red-700">{offer.label} — خصم {offer.discount}%</p>
            <p className="text-[11px] text-red-500 mt-0.5">
              ينتهي: {new Date(offer.endsAt).toLocaleString('ar', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })}
            </p>
          </div>
          <button onClick={deactivate} disabled={saving}
            className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-100 transition flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={save} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">اسم العرض</label>
            <input value={label} onChange={e => setLabel(e.target.value)} maxLength={60}
              placeholder="عرض إطلاق حصري"
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-red-300" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">نسبة الخصم %</label>
            <input type="number" min={1} max={90} value={discount} onChange={e => setDiscount(Number(e.target.value))}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-red-300" />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">تاريخ ووقت انتهاء العرض</label>
          <input type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)}
            min={minDate}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-red-300" />
        </div>
        <button type="submit" disabled={saving || !endsAt}
          className="w-full py-2.5 bg-red-500 text-white font-bold rounded-xl text-sm hover:bg-red-600 transition disabled:opacity-50">
          {saving ? 'جاري الحفظ...' : isActive ? '🔄 تحديث العرض' : '🚀 تفعيل العرض'}
        </button>
        {msg && <p className="text-xs text-center font-medium text-slate-600">{msg}</p>}
      </form>
    </div>
  )
}

function BroadcastMessage() {
  const [msg,       setMsg]       = useState('')
  const [title,     setTitle]     = useState('رسالة من المدرب أمين')
  const [audience,  setAudience]  = useState('active')
  const [withEmail, setWithEmail] = useState(false)
  const [sending,   setSending]   = useState(false)
  const [result,    setResult]    = useState(null)

  async function send() {
    if (!msg.trim()) return
    setSending(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/broadcast', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: msg, title, audience, withEmail }),
      })
      const d = await res.json()
      if (d.ok) {
        setResult({ ok: true, text: `✅ أُرسلت إلى ${d.total} عميل — Push: ${d.pushSent}${d.emailSent ? ` • إيميل: ${d.emailSent}` : ''}` })
        setMsg('')
      } else {
        setResult({ ok: false, text: d.error || 'فشل الإرسال' })
      }
    } catch (e) { setResult({ ok: false, text: e.message }) }
    finally { setSending(false) }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <MessageSquare className="w-4 h-4 text-blue-500" />
        </div>
        <div>
          <p className="text-sm font-extrabold text-slate-800">إذاعة جماعية</p>
          <p className="text-xs text-slate-400 mt-0.5">أرسل إشعاراً لعملائك</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">العنوان</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} maxLength={80}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-300 transition" />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">الرسالة</label>
          <textarea rows={3} value={msg} onChange={e => setMsg(e.target.value)} maxLength={500}
            placeholder="اكتب رسالتك هنا..."
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-300 transition resize-none" />
          <p className="text-right text-[10px] text-slate-300 mt-0.5">{msg.length}/500</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">الجمهور</label>
            <select value={audience} onChange={e => setAudience(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-300 transition bg-white">
              <option value="active">النشطاء فقط</option>
              <option value="all">الكل</option>
            </select>
          </div>
          <label className="flex items-center gap-2 mt-5 cursor-pointer">
            <input type="checkbox" checked={withEmail} onChange={e => setWithEmail(e.target.checked)}
              className="w-4 h-4 rounded accent-blue-500" />
            <span className="text-xs font-medium text-slate-600">إيميل أيضاً</span>
          </label>
        </div>

        <button onClick={send} disabled={sending || !msg.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition disabled:opacity-50">
          {sending
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Send className="w-4 h-4" />}
          {sending ? 'جاري الإرسال...' : 'إرسال'}
        </button>

        {result && (
          <p className={`text-xs font-bold text-center ${result.ok ? 'text-emerald-600' : 'text-red-500'}`}>
            {result.text}
          </p>
        )}
      </div>
    </div>
  )
}

function AppointmentsWidget() {
  const [pending, setPending] = useState(null)

  useEffect(() => {
    fetch('/api/admin/appointments?status=pending')
      .then(r => r.ok ? r.json() : null)
      .then(d => setPending(Array.isArray(d?.appointments) ? d.appointments : []))
      .catch(() => setPending([]))
  }, [])

  return (
    <Link href="/dashboard/appointments"
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between gap-4 hover:-translate-y-1 transition-transform">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <CalendarDays className="w-5 h-5 text-indigo-500" />
        </div>
        <div>
          <p className="font-extrabold text-slate-800 text-sm">طلبات المواعيد</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {pending === null ? 'جاري التحميل...' : pending.length > 0 ? `${pending.length} طلب يحتاج موافقتك` : 'لا توجد طلبات معلقة'}
          </p>
        </div>
      </div>
      {pending !== null && pending.length > 0 && (
        <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 flex-shrink-0">
          {pending.length}
        </span>
      )}
    </Link>
  )
}

function TelegramTest() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  async function test() {
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch('/api/dashboard/test-telegram', { method: 'POST' })
      const d = await res.json()
      setStatus(d.ok ? 'success' : `error:${d.error || (d.missing?.join(', '))}`)
    } catch (e) { setStatus(`error:${e.message}`) }
    finally { setLoading(false) }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold text-slate-800">إشعارات تيليغرام</p>
          <p className="text-xs text-slate-400 mt-0.5">اضغط لإرسال رسالة تجريبية والتأكد من وصول الإشعارات</p>
          {status === 'success' && <p className="text-xs text-emerald-600 font-bold mt-1">✅ الإشعارات تعمل بشكل صحيح</p>}
          {status?.startsWith('error:') && <p className="text-xs text-red-500 font-bold mt-1">❌ {status.replace('error:', '')}</p>}
        </div>
        <button onClick={test} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-extrabold hover:bg-black transition disabled:opacity-50 flex-shrink-0">
          {loading ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '✈️'}
          اختبار
        </button>
      </div>
    </div>
  )
}

export default function DashboardClient({ submissions }) {
  const total    = submissions.length
  const newCount = submissions.filter(s => s.status === 'new').length
  const active   = submissions.filter(s => s.status === 'active').length
  const reviewed = submissions.filter(s => s.status === 'reviewed').length

  const goalCounts = Object.fromEntries(Object.keys(goalMap).map(k => [k, 0]))
  submissions.forEach(s => { if (goalCounts[s.goal] !== undefined) goalCounts[s.goal]++ })

  const pieData = total > 0
    ? Object.entries(goalMap)
        .map(([k, v]) => ({ name: v.label, value: goalCounts[k], color: v.color }))
        .filter(g => g.value > 0)
    : [
        { name: 'خسارة وزن',       value: 45, color: '#f59e0b' },
        { name: 'بناء عضلات',       value: 35, color: '#10b981' },
        { name: 'الحفاظ على الوزن', value: 20, color: '#6366f1' },
      ]

  const recent = submissions.slice(0, 6)

  const today = new Date().toLocaleDateString('ar', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="space-y-5">

      {/* Welcome Banner */}
      <div className="bg-[#0a0a0a] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -left-6 -top-6 w-36 h-36 bg-gold-400/8 rounded-full" />
        <div className="absolute left-20 -bottom-8 w-24 h-24 bg-gold-400/5 rounded-full" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-2">{today}</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight">
              مرحباً،{' '}
              <span className="text-gold-400">استاذ أمين</span>
            </h1>
            <p className="text-white/30 text-sm mt-2 font-medium">
              {newCount > 0
                ? `⚡ لديك ${newCount} استبيان جديد ينتظر مراجعتك`
                : 'لا توجد استبيانات جديدة اليوم'}
            </p>
          </div>
          <div className="hidden sm:flex w-14 h-14 bg-gold-400 rounded-2xl items-center justify-center flex-shrink-0 shadow-lg shadow-gold-400/20">
            <Zap className="w-7 h-7 text-black" fill="black" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ClipboardList} label="إجمالي الاستبيانات" value={total}
          sub={newCount > 0 ? `${newCount} جديد` : undefined}
          color="text-gold-600" lightBg="bg-gold-50" />
        <StatCard icon={Clock}         label="استبيانات جديدة"   value={newCount}
          color="text-orange-500" lightBg="bg-orange-50" />
        <StatCard icon={CheckCircle2}  label="عملاء نشطون"        value={active}
          color="text-emerald-600" lightBg="bg-emerald-50" />
        <StatCard icon={TrendingUp}    label="تمت مراجعتهم"       value={reviewed}
          color="text-blue-600" lightBg="bg-blue-50" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">نمو المشتركين والجلسات</h2>
            <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full font-medium">2025</span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={monthlyData} margin={{ top:5, right:5, bottom:5, left:-20 }}>
              <defs>
                <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gJ" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#94a3b8' }} />
              <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} />
              <Tooltip content={<ChartTip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:12 }} />
              <Area type="monotone" dataKey="مشتركون" stroke="#f59e0b" strokeWidth={2.5} fill="url(#gS)" dot={{ r:4, fill:'#f59e0b' }} />
              <Area type="monotone" dataKey="جلسات"   stroke="#10b981" strokeWidth={2.5} fill="url(#gJ)" dot={{ r:4, fill:'#10b981' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h2 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide mb-1">توزيع الأهداف</h2>
          {total === 0 && <p className="text-xs text-slate-400 mb-3">بيانات تجريبية</p>}
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={v => total > 0 ? `${v} عميل` : `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-xs text-slate-500 font-medium">{d.name}</span>
                </div>
                <span className="text-xs font-extrabold text-slate-800">{total > 0 ? d.value : `${d.value}%`}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments */}
      <AppointmentsWidget />

      {/* Pricing Manager */}
      <PricingManager />

      {/* Offer Manager */}
      <OfferManager />

      {/* Broadcast message */}
      <BroadcastMessage />

      {/* Telegram test */}
      <TelegramTest />

      {/* Recent Submissions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">آخر الاستبيانات</h2>
          <Link href="/dashboard/clients"
            className="flex items-center gap-1 text-gold-600 text-sm font-bold hover:text-gold-500 transition">
            عرض الكل <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-16 text-slate-300">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-bold text-sm">لا توجد استبيانات بعد</p>
            <p className="text-xs mt-1 text-slate-400">ستظهر هنا بعد ملء العملاء للاستبيان</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recent.map(c => {
              const st = statusCfg[c.status] || statusCfg.new
              const Icon = st.Icon
              return (
                <Link key={c.id} href="/dashboard/clients"
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#0a0a0a] text-gold-400 flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                    {c.name?.[0] ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate text-sm">{c.name}</p>
                    <p className="text-xs text-slate-400 truncate">{c.email}</p>
                  </div>
                  <div className="hidden sm:block text-xs text-slate-300 font-medium">
                    {new Date(c.createdAt).toLocaleDateString('ar')}
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${st.bg}`}>
                    <Icon className="w-3 h-3" />
                    {c.status === 'new' ? 'جديد' : c.status === 'reviewed' ? 'مراجعة' : 'نشط'}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
