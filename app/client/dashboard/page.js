'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, CheckCircle2, Droplets, Star, AlertTriangle, Calendar, X, Send, ClipboardList } from 'lucide-react'

const PLAN_DISPLAY = {
  basic:    { label: 'برنامج التدريب',  emoji: '🏋️', color: 'from-blue-600 to-blue-800' },
  standard: { label: 'الباقة الشهرية', emoji: '⚡',  color: 'from-amber-500 to-yellow-600' },
  premium:  { label: 'باقة 3 أشهر',   emoji: '🏆', color: 'from-violet-600 to-purple-800' },
}
const PLAN_NAME_DISPLAY = {
  'برنامج التدريب': PLAN_DISPLAY.basic,
  'الباقة الشهرية': PLAN_DISPLAY.standard,
  'باقة 3 أشهر':   PLAN_DISPLAY.premium,
}

function SubscriptionCard({ client }) {
  const sub = client.subscriptionPlan && client.subscriptionEndDate
    ? {
        info:     PLAN_DISPLAY[client.subscriptionPlan],
        end:      new Date(client.subscriptionEndDate),
        start:    new Date(client.subscriptionStartDate),
        msLeft:   new Date(client.subscriptionEndDate).getTime() - Date.now(),
      }
    : null

  if (sub) {
    const expired  = sub.msLeft <= 0
    const daysLeft = Math.max(0, Math.floor(sub.msLeft / 86400000))
    const hoursLeft = Math.max(0, Math.floor((sub.msLeft % 86400000) / 3600000))
    const urgent   = !expired && daysLeft <= 7

    return (
      <div className={`rounded-2xl overflow-hidden shadow-sm border ${
        expired ? 'border-red-200' : urgent ? 'border-amber-200' : 'border-slate-100'}`}>
        <div className={`bg-gradient-to-l ${sub.info?.color || 'from-slate-700 to-slate-900'} px-5 py-4 flex items-center gap-4`}>
          <div className="text-3xl">{sub.info?.emoji || '⭐'}</div>
          <div className="flex-1">
            <p className="text-white/60 text-xs font-bold uppercase tracking-wide">اشتراكك الحالي</p>
            <p className="text-white font-extrabold text-lg">{sub.info?.label || client.subscriptionPlan}</p>
          </div>
          {!expired && (
            <div className={`text-center px-3 py-2 rounded-xl ${urgent ? 'bg-red-500/20 border border-red-400/30' : 'bg-white/10'}`}>
              <p className={`text-xl font-extrabold ${urgent ? 'text-red-300' : 'text-white'}`}>{daysLeft}</p>
              <p className="text-white/50 text-[10px] font-bold uppercase">يوم</p>
            </div>
          )}
        </div>
        <div className="bg-white px-5 py-3 flex items-center justify-between flex-wrap gap-2">
          {expired ? (
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-extrabold text-sm">انتهى اشتراكك — تواصل مع المدرب للتجديد</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                <Calendar className="w-3.5 h-3.5" />
                ينتهي في: <strong className="text-slate-700">
                  {sub.end.toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Qatar' })}
                </strong>
              </div>
              <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${
                urgent
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {urgent ? '⚠️ ' : '✅ '}
                {daysLeft < 1 ? `${hoursLeft} ساعة` : `${daysLeft} يوم${hoursLeft > 0 ? ` و ${hoursLeft} ساعة` : ''}`} متبقي
              </span>
            </>
          )}
        </div>
      </div>
    )
  }

  // No active subscription — show interested plan if exists
  if (client.interestedPlan) {
    const info = PLAN_NAME_DISPLAY[client.interestedPlan]
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-center gap-4">
        <div className="text-2xl">{info?.emoji || '⭐'}</div>
        <div className="flex-1">
          <p className="font-extrabold text-amber-800 text-sm">الباقة المختارة: {client.interestedPlan}</p>
          <p className="text-amber-600 text-xs font-medium mt-0.5">في انتظار تأكيد الدفع من المدرب</p>
        </div>
        <a href="https://wa.me/97430653759" target="_blank" rel="noreferrer"
          className="flex-shrink-0 bg-green-500 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-green-600 transition">
          تواصل
        </a>
      </div>
    )
  }

  return null
}

/* ── Water tracker widget ──────────────────────────────────────────────── */
function WaterWidget() {
  const [water,   setWater]   = useState(0)
  const [goal,    setGoal]    = useState(8)
  const [saving,  setSaving]  = useState(false)

  const today = (() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  })()

  useEffect(() => {
    fetch('/api/client/logs')
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return
        const entry = data.find(l => l.date === today)
        if (entry) { setWater(entry.water || 0); setGoal(entry.waterGoal || 8) }
      })
      .catch(() => {})
  }, [today])

  async function setGlass(n) {
    const newVal = Math.max(0, Math.min(goal, n))
    setWater(newVal)
    setSaving(true)
    try {
      await fetch('/api/client/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today, water: newVal, waterGoal: goal }),
      })
    } finally { setSaving(false) }
  }

  const pct = goal > 0 ? Math.min(100, Math.round((water / goal) * 100)) : 0

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
            <Droplets className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="font-extrabold text-slate-800 text-sm">شرب الماء اليوم</p>
            <p className="text-[10px] text-slate-400 font-medium">اضغط كوب لتسجيله</p>
          </div>
        </div>
        <Link href="/client/journal"
          className="text-xs font-bold text-blue-500 hover:text-blue-600 transition">
          عرض السجل ←
        </Link>
      </div>

      {/* Cups */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Array.from({ length: goal }).map((_, i) => (
          <button
            key={i}
            onClick={() => setGlass(i < water ? i : i + 1)}
            className={`w-9 h-9 rounded-xl text-lg transition-all active:scale-90 select-none
              ${i < water ? 'bg-blue-500 shadow-sm' : 'bg-slate-100 grayscale opacity-40'}`}
          >
            💧
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-sm font-extrabold text-slate-800">{water} / {goal} أكواب</span>
          <span className="text-xs font-bold text-slate-400">{(water * 0.25).toFixed(2)} لتر · {pct}%{saving ? ' ●' : ''}</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        {pct >= 100 && (
          <p className="text-xs font-bold text-blue-600 text-center">🎉 وصلت هدف اليوم! ممتاز</p>
        )}
      </div>
    </div>
  )
}

/* ── Weekly check-in widget ─────────────────────────────────────────────── */
const ENERGY_LABELS = ['', '😩 سيء', '😔 ضعيف', '😐 متوسط', '😊 جيد', '😁 ممتاز']

function WeeklyCheckin() {
  const [open, setOpen]       = useState(false)
  const [last, setLast]       = useState(null)
  const [saving, setSaving]   = useState(false)
  const [done, setDone]       = useState(false)
  const [form, setForm] = useState({ energy: 3, sleep: 7, trainingDone: 3, nutritionDays: 5, note: '' })

  useEffect(() => {
    fetch('/api/client/checkin')
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data) && data.length) setLast(data.at(-1)) })
      .catch(() => {})
  }, [])

  // Check if already submitted this week
  const alreadyThisWeek = last && (() => {
    const d = new Date(last.date)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 86400000)
    return d > weekAgo
  })()

  async function submit() {
    setSaving(true)
    try {
      const res = await fetch('/api/client/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const entry = await res.json()
      setLast(entry)
      setDone(true)
      setTimeout(() => { setOpen(false); setDone(false) }, 1800)
    } finally { setSaving(false) }
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <p className="font-extrabold text-slate-800 text-sm">تقرير الأسبوع</p>
              <p className="text-[10px] text-slate-400 font-medium">
                {alreadyThisWeek
                  ? `آخر تقرير: ${ENERGY_LABELS[last.energy]} — ${new Date(last.date).toLocaleDateString('ar', { weekday: 'long' })}`
                  : 'لم تُرسل تقريرك هذا الأسبوع بعد'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(true)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition
              ${alreadyThisWeek
                ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                : 'bg-violet-600 text-white hover:bg-violet-700 shadow-sm shadow-violet-200'}`}
          >
            <Send className="w-3.5 h-3.5" />
            {alreadyThisWeek ? 'تقرير جديد' : 'أرسل تقريرك'}
          </button>
        </div>
        {alreadyThisWeek && (
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[
              { label: 'الطاقة', val: `${last.energy}/5`, color: 'text-amber-600' },
              { label: 'النوم', val: `${last.sleep}ساعة`, color: 'text-blue-600' },
              { label: 'التدريب', val: `${last.trainingDone} أيام`, color: 'text-emerald-600' },
              { label: 'التغذية', val: `${last.nutritionDays}/7`, color: 'text-rose-600' },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 rounded-xl p-2.5 text-center">
                <p className={`font-extrabold text-sm ${s.color}`}>{s.val}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">تقرير الأسبوع 📋</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">أخبر مدربك كيف كان الأسبوع</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-300 hover:text-slate-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Energy */}
              <div>
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wide block mb-2">مستوى الطاقة العامة</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setForm(p => ({...p, energy: n}))}
                      className={`flex-1 py-2.5 rounded-xl text-lg font-bold border-2 transition-all
                        ${form.energy === n ? 'border-amber-400 bg-amber-50 scale-105' : 'border-slate-100 hover:border-slate-200'}`}>
                      {['😩','😔','😐','😊','😁'][n-1]}
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs font-bold text-slate-400 mt-1.5">{ENERGY_LABELS[form.energy]}</p>
              </div>

              {/* Sleep */}
              <div>
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wide block mb-2">
                  متوسط ساعات النوم: <span className="text-blue-600">{form.sleep} ساعة</span>
                </label>
                <input type="range" min="3" max="12" step="0.5" value={form.sleep}
                  onChange={e => setForm(p => ({...p, sleep: +e.target.value}))}
                  className="w-full accent-blue-500" />
                <div className="flex justify-between text-[10px] text-slate-300 font-medium mt-1">
                  <span>3ساعات</span><span>12ساعة</span>
                </div>
              </div>

              {/* Training */}
              <div>
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wide block mb-2">
                  أيام التدريب المنجزة: <span className="text-emerald-600">{form.trainingDone} أيام</span>
                </label>
                <div className="flex gap-2">
                  {[0,1,2,3,4,5,6,7].map(n => (
                    <button key={n} onClick={() => setForm(p => ({...p, trainingDone: n}))}
                      className={`flex-1 py-2 rounded-lg text-xs font-extrabold border-2 transition-all
                        ${form.trainingDone === n ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nutrition */}
              <div>
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wide block mb-2">
                  أيام الالتزام بالتغذية: <span className="text-rose-600">{form.nutritionDays}/7</span>
                </label>
                <div className="flex gap-2">
                  {[0,1,2,3,4,5,6,7].map(n => (
                    <button key={n} onClick={() => setForm(p => ({...p, nutritionDays: n}))}
                      className={`flex-1 py-2 rounded-lg text-xs font-extrabold border-2 transition-all
                        ${form.nutritionDays === n ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wide block mb-2">ملاحظات للمدرب (اختياري)</label>
                <textarea rows={2} value={form.note}
                  onChange={e => setForm(p => ({...p, note: e.target.value}))}
                  placeholder="أي شيء تريد إخبار مدربك به..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400 transition font-medium resize-none" />
              </div>
            </div>

            <div className="px-6 pb-6">
              <button onClick={submit} disabled={saving || done}
                className="w-full py-3.5 bg-[#0a0a0a] text-white rounded-xl font-extrabold text-sm disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-black transition">
                {done
                  ? <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> تم الإرسال!</>
                  : saving
                    ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <><Send className="w-4 h-4" /> إرسال التقرير</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const goalLabels = {
  loss: 'خسارة وزن', gain: 'بناء عضلات',
  maintain: 'الحفاظ على الوزن', performance: 'أداء رياضي',
}

export default function ClientDashboard() {
  const router = useRouter()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/client/me')
      .then(async r => {
        if (r.status === 401) { router.push('/client/login'); return null }
        if (r.status === 403) {
          const d = await r.json()
          router.push(`/client/login?suspended=1&msg=${encodeURIComponent(d.error || 'تم تعليق حسابك')}`)
          return null
        }
        return r.json()
      })
      .then(d => { if (d) setClient(d) })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!client) return null

  const hasPlan       = !!client.plan
  const hasNutrition  = hasPlan && !!client.plan?.nutrition
  const hasTraining   = hasPlan && !!client.plan?.training

  return (
    <div className="space-y-5 max-w-3xl mx-auto">

      {/* Welcome hero */}
      <div className="relative rounded-3xl overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #111827 60%, #0a0a0a 100%)',
        minHeight: 180
      }}>
        {/* Background emojis — split nutrition left, training right */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {/* Left: food */}
          {[
            { e: '🥗', top: '5%',  left: '1%',  size: 60, deg: -15 },
            { e: '🍎', top: '50%', left: '2%',  size: 50, deg: 10 },
            { e: '🥦', top: '70%', left: '10%', size: 44, deg: -8 },
            { e: '💧', top: '28%', left: '12%', size: 38, deg: 0 },
          ].map((item, i) => (
            <span key={`f${i}`} className="absolute opacity-[0.12]" style={{
              top: item.top, left: item.left,
              fontSize: item.size, lineHeight: 1,
              transform: `rotate(${item.deg}deg)`,
            }}>{item.e}</span>
          ))}
          {/* Right: gym */}
          {[
            { e: '🏋️', top: '5%',  right: '2%',  size: 64, deg: 15 },
            { e: '💪',  top: '50%', right: '3%',  size: 52, deg: -10 },
            { e: '🔥',  top: '70%', right: '12%', size: 48, deg: 8 },
            { e: '⚡',  top: '28%', right: '14%', size: 40, deg: 0 },
          ].map((item, i) => (
            <span key={`g${i}`} className="absolute opacity-[0.12]" style={{
              top: item.top, right: item.right,
              fontSize: item.size, lineHeight: 1,
              transform: `rotate(${item.deg}deg)`,
            }}>{item.e}</span>
          ))}
        </div>

        {/* Gold diagonal line */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute opacity-[0.06]" style={{
            width: '200%', height: '2px',
            background: 'linear-gradient(90deg,transparent,#fbbf24,transparent)',
            top: '55%', left: '-50%',
            transform: 'rotate(-5deg)',
          }} />
        </div>

        <div className="relative z-10 px-6 py-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-gold-400/70 text-xs font-bold uppercase tracking-widest mb-3">منصة Amine-Fit الشخصية</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
              أهلاً وسهلاً،{' '}
              <span className="text-gold-400">{client.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-white/50 text-sm mt-2 font-medium leading-relaxed max-w-xs">
              {hasPlan
                ? 'عميلنا العزيز، خطتك المخصصة جاهزة — نحن معك في كل خطوة نحو هدفك'
                : 'عميلنا العزيز، يعمل المدرب أمين على تحضير خطتك المخصصة — ستصلك قريباً'}
            </p>
            <div className="flex items-center gap-2 mt-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-bold">حسابك نشط</span>
            </div>
          </div>
          <div className="w-14 h-14 bg-gold-400 rounded-2xl flex items-center justify-center text-black font-extrabold text-2xl flex-shrink-0 shadow-lg shadow-gold-400/20">
            {client.name?.[0] ?? '؟'}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'الوزن الحالي',    val: client.weight      ? `${client.weight} كغ`      : '—', emoji: '⚖️' },
          { label: 'الوزن المستهدف',  val: client.targetWeight? `${client.targetWeight} كغ`: '—', emoji: '🎯' },
          { label: 'الطول',           val: client.height      ? `${client.height} سم`       : '—', emoji: '📏' },
          { label: 'العمر',           val: client.age         ? `${client.age} سنة`         : '—', emoji: '🎂' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
            <div className="text-2xl mb-1">{s.emoji}</div>
            <p className="text-xl font-extrabold text-slate-900">{s.val}</p>
            <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Subscription card */}
      <SubscriptionCard client={client} />

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Nutrition card */}
        <Link href="/client/plan/nutrition"
          className={`group relative rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-xl
            ${hasNutrition ? 'cursor-pointer' : 'cursor-default pointer-events-none'}`}
          style={{ minHeight: 160 }}>
          {/* Background */}
          <div className="absolute inset-0" style={{
            background: hasNutrition
              ? 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #059669 100%)'
              : 'linear-gradient(135deg, #1a1a1a 0%, #222 100%)',
          }} />
          {/* Floating emojis */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {['🥗','🍎','🥦','🥑'].map((e, i) => (
              <span key={i} className="absolute opacity-[0.15]" style={{
                fontSize: [52,42,36,38][i],
                top: ['8%','55%','70%','30%'][i],
                right: ['5%','8%','20%','2%'][i],
                transform: `rotate(${[-15,10,-8,20][i]}deg)`,
                lineHeight: 1,
              }}>{e}</span>
            ))}
          </div>
          <div className="relative z-10 p-5">
            <div className="text-4xl mb-3">🥗</div>
            <h3 className={`font-extrabold text-lg mb-1 ${hasNutrition ? 'text-white' : 'text-white/30'}`}>
              الخطة الغذائية
            </h3>
            <p className={`text-sm font-medium ${hasNutrition ? 'text-emerald-200' : 'text-white/20'}`}>
              {hasNutrition
                ? `${client.plan.nutrition.calories} سعرة • ${client.plan.nutrition.meals?.length ?? 0} وجبات`
                : 'قيد الإعداد من المدرب'}
            </p>
            {hasNutrition ? (
              <div className="flex items-center gap-1 mt-4 text-white text-sm font-bold">
                عرض الخطة <ArrowLeft className="w-4 h-4" />
              </div>
            ) : (
              <div className="flex items-center gap-1 mt-4 text-white/20 text-sm font-medium">
                <Clock className="w-4 h-4" /> قريباً
              </div>
            )}
          </div>
        </Link>

        {/* Training card */}
        <Link href="/client/plan/training"
          className={`group relative rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-xl
            ${hasTraining ? 'cursor-pointer' : 'cursor-default pointer-events-none'}`}
          style={{ minHeight: 160 }}>
          <div className="absolute inset-0" style={{
            background: hasTraining
              ? 'linear-gradient(135deg, #0a0a0a 0%, #1f2937 50%, #111827 100%)'
              : 'linear-gradient(135deg, #1a1a1a 0%, #222 100%)',
          }} />
          {/* Gold accent stripe */}
          {hasTraining && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute opacity-[0.15]" style={{
                width: '200%', height: '2px',
                background: 'linear-gradient(90deg,transparent,#fbbf24,transparent)',
                top: '60%', left: '-50%',
                transform: 'rotate(-8deg)',
              }} />
            </div>
          )}
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {['🏋️','💪','🔥','⚡'].map((e, i) => (
              <span key={i} className="absolute opacity-[0.12]" style={{
                fontSize: [52,44,38,36][i],
                top: ['8%','55%','72%','28%'][i],
                right: ['5%','8%','22%','2%'][i],
                transform: `rotate(${[15,-10,8,0][i]}deg)`,
                lineHeight: 1,
              }}>{e}</span>
            ))}
          </div>
          <div className="relative z-10 p-5">
            <div className="text-4xl mb-3">🏋️</div>
            <h3 className={`font-extrabold text-lg mb-1 ${hasTraining ? 'text-white' : 'text-white/30'}`}>
              الخطة التدريبية
            </h3>
            <p className={`text-sm font-medium ${hasTraining ? 'text-gold-400/80' : 'text-white/20'}`}>
              {hasTraining
                ? `${client.plan.training.daysPerWeek} أيام/أسبوع`
                : 'قيد الإعداد من المدرب'}
            </p>
            {hasTraining ? (
              <div className="flex items-center gap-1 mt-4 text-gold-400 text-sm font-bold">
                عرض الخطة <ArrowLeft className="w-4 h-4" />
              </div>
            ) : (
              <div className="flex items-center gap-1 mt-4 text-white/20 text-sm font-medium">
                <Clock className="w-4 h-4" /> قريباً
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Water tracker */}
      <WaterWidget />

      {/* Weekly check-in */}
      <WeeklyCheckin />

      {/* Goal + status */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
        <div className="text-3xl flex-shrink-0">
          {client.goal === 'loss' ? '📉' : client.goal === 'gain' ? '💪' : client.goal === 'maintain' ? '⚖️' : '🏃'}
        </div>
        <div className="flex-1">
          <p className="font-extrabold text-slate-900 text-sm">هدفك: {goalLabels[client.goal] ?? client.goal ?? '—'}</p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            الحالة: {client.status === 'active' ? '✅ نشط' : client.status === 'reviewed' ? '👀 تمت المراجعة' : '🕐 جديد'}
          </p>
        </div>
        {client.status === 'active' && (
          <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> نشط
          </div>
        )}
      </div>

      <p className="text-center text-slate-400 text-xs font-medium pb-2">
        تحتاج مساعدة؟{' '}
        <a href="tel:+97430653759" className="text-gold-600 font-bold hover:text-gold-500 transition">
          تواصل مع المدرب أمين
        </a>
      </p>
    </div>
  )
}
