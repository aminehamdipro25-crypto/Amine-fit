'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, CheckCircle2, Droplets, Star, AlertTriangle, Calendar, X, Send, ClipboardList, Upload, ImageIcon, Loader2, Trash2, Trophy, Dumbbell, MessageCircle, TrendingDown, Share2, Download } from 'lucide-react'
import { SkeletonDashboard } from '@/components/SkeletonLoader'
import PushSubscriber from '@/components/PushSubscriber'

const PLAN_DISPLAY = {
  basic:     { label: 'برنامج التدريب',  emoji: '🏋️', color: 'from-blue-600 to-blue-800' },
  standard:  { label: 'الباقة الشهرية', emoji: '⚡',  color: 'from-amber-500 to-yellow-600' },
  premium:   { label: 'باقة 3 أشهر',   emoji: '🏆', color: 'from-violet-600 to-purple-800' },
  // Legacy gift plan keys — kept for backward compatibility with old registrations
  training:  { label: 'برنامج التدريب',  emoji: '🏋️', color: 'from-blue-600 to-blue-800' },
  monthly:   { label: 'الباقة الشهرية', emoji: '⚡',  color: 'from-amber-500 to-yellow-600' },
  '3months': { label: 'باقة 3 أشهر',   emoji: '🏆', color: 'from-violet-600 to-purple-800' },
}
const PLAN_NAME_DISPLAY = {
  'برنامج التدريب': PLAN_DISPLAY.basic,
  'الباقة الشهرية': PLAN_DISPLAY.standard,
  'باقة 3 أشهر':   PLAN_DISPLAY.premium,
}

function SubscriptionCard({ client }) {
  const endDateStr   = client.subscriptionEndDate   || client.subscriptionEnd
  const startDateStr = client.subscriptionStartDate || client.subscriptionStart
  const sub = client.subscriptionPlan && endDateStr
    ? {
        info:     PLAN_DISPLAY[client.subscriptionPlan],
        end:      new Date(endDateStr),
        start:    new Date(startDateStr),
        msLeft:   new Date(endDateStr).getTime() - Date.now(),
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
            {(client.giftCode || client.isGift) && (
              <p className="text-white/70 text-xs font-bold mt-0.5">🎁 هدية من المدرب أمين</p>
            )}
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

  // No active subscription — show interested plan + payment deadline countdown
  if (client.interestedPlan) {
    const info = PLAN_NAME_DISPLAY[client.interestedPlan]

    // Payment deadline countdown
    const deadline   = client.paymentDeadline ? new Date(client.paymentDeadline) : null
    const msLeft     = deadline ? deadline.getTime() - Date.now() : null
    const expired    = msLeft !== null && msLeft <= 0
    const daysLeft   = (msLeft !== null && msLeft > 0) ? Math.floor(msLeft / 86400000) : 0
    const hoursLeft  = (msLeft !== null && msLeft > 0) ? Math.floor((msLeft % 86400000) / 3600000) : 0
    const urgent     = !expired && msLeft !== null && daysLeft === 0 // < 24 h

    return (
      <div className={`rounded-2xl border overflow-hidden ${expired ? 'border-red-300' : urgent ? 'border-orange-300' : 'border-amber-200'}`}>
        {/* Header row */}
        <div className={`px-5 py-4 flex items-center gap-4 ${expired ? 'bg-red-50' : urgent ? 'bg-orange-50' : 'bg-amber-50'}`}>
          <div className="text-2xl">{info?.emoji || '⭐'}</div>
          <div className="flex-1">
            <p className={`font-extrabold text-sm ${expired ? 'text-red-800' : 'text-amber-800'}`}>
              الباقة المختارة: {client.interestedPlan}
            </p>
            <p className={`text-xs font-medium mt-0.5 ${expired ? 'text-red-600' : 'text-amber-600'}`}>
              {expired ? '⚠️ انتهت مهلة الدفع — تواصل مع المدرب' : 'في انتظار تأكيد الدفع من المدرب'}
            </p>
          </div>
          <a href="https://wa.me/97430653759" target="_blank" rel="noreferrer"
            className="flex-shrink-0 bg-green-500 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-green-600 transition">
            تواصل
          </a>
        </div>

        {/* Deadline countdown bar */}
        {deadline && (
          <div className={`px-5 py-3 border-t flex items-center justify-between gap-3 ${
            expired ? 'bg-red-100 border-red-200' : urgent ? 'bg-orange-100 border-orange-200' : 'bg-white border-amber-100'
          }`}>
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 flex-shrink-0 ${expired ? 'text-red-500' : urgent ? 'text-orange-500' : 'text-amber-500'}`} />
              <span className={`text-xs font-bold ${expired ? 'text-red-700' : urgent ? 'text-orange-700' : 'text-amber-700'}`}>
                {expired
                  ? 'انتهت مهلة إتمام الدفع'
                  : 'المتبقي لإتمام الدفع:'}
              </span>
            </div>
            {!expired && (
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                urgent
                  ? 'bg-orange-200 text-orange-800 border-orange-300'
                  : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}>
                {daysLeft > 0
                  ? `${daysLeft} يوم${hoursLeft > 0 ? ` و ${hoursLeft} ساعة` : ''}`
                  : `${hoursLeft} ساعة فقط`}
              </span>
            )}
          </div>
        )}
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

/* ── Streak widget ──────────────────────────────────────────────────────── */
function StreakWidget() {
  const [streak, setStreak] = useState(null)

  useEffect(() => {
    fetch('/api/client/logs')
      .then(r => r.ok ? r.json() : [])
      .then(logs => {
        if (!Array.isArray(logs) || !logs.length) { setStreak(0); return }
        // Build set of logged dates
        const logged = new Set(logs.map(l => l.date?.slice(0, 10)))
        // Count consecutive days backward from today
        let count = 0
        const now = new Date()
        for (let i = 0; i < 365; i++) {
          const d = new Date(now.getTime() - i * 86400000)
          const ds = d.toISOString().slice(0, 10)
          if (logged.has(ds)) count++
          else if (i > 0) break // gap — stop
        }
        setStreak(count)
      })
      .catch(() => setStreak(0))
  }, [])

  if (streak === null) return null
  if (streak === 0) return null

  const level = streak >= 30 ? '🏆' : streak >= 14 ? '⚡' : streak >= 7 ? '🔥' : '✨'
  const msg   = streak >= 30 ? 'أسطوري!' : streak >= 14 ? 'رائع جداً!' : streak >= 7 ? 'أسبوع كامل!' : 'استمر!'

  return (
    <div className="bg-gradient-to-l from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-4">
      <div className="text-4xl flex-shrink-0">{level}</div>
      <div className="flex-1">
        <p className="font-extrabold text-slate-900 text-base">
          {streak} {streak === 1 ? 'يوم' : 'يوم'} متتالي! {msg}
        </p>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          سجّلت يومياتك {streak} {streak === 1 ? 'يوم' : 'يوم'} متواصل — حافظ على الاستمرار
        </p>
      </div>
      <Link href="/client/journal"
        className="flex-shrink-0 text-xs font-bold text-amber-600 hover:text-amber-700 transition">
        السجل ←
      </Link>
    </div>
  )
}

/* ── Weekly check-in widget ─────────────────────────────────────────────── */
const ENERGY_LABELS = ['', '😩 سيء', '😔 ضعيف', '😐 متوسط', '😊 جيد', '😁 ممتاز']
const STRESS_LABELS = ['', '😌 هادئ', '🙂 عادي', '😐 متوسط', '😟 مرتفع', '😤 شديد']

function WeeklyCheckin() {
  const [open, setOpen]       = useState(false)
  const [last, setLast]       = useState(null)
  const [saving, setSaving]   = useState(false)
  const [done, setDone]       = useState(false)
  const [form, setForm] = useState({
    energy: 3, sleep: 7, trainingDone: 3, nutritionDays: 5,
    note: '', weight: '', stress: 3, pain: '',
  })

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
          <>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: 'الطاقة',   val: `${last.energy}/5`,                           color: 'text-amber-600' },
                { label: 'النوم',    val: `${last.sleep} ساعة`,                          color: 'text-blue-600' },
                { label: 'الوزن',    val: last.weight ? `${last.weight} كغ` : '—',       color: 'text-slate-600' },
                { label: 'التوتر',   val: last.stress ? `${last.stress}/5` : '—',         color: 'text-purple-600' },
                { label: 'التدريب',  val: `${last.trainingDone} أيام`,                   color: 'text-emerald-600' },
                { label: 'التغذية',  val: `${last.nutritionDays}/7`,                     color: 'text-rose-600' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 rounded-xl p-2.5 text-center">
                  <p className={`font-extrabold text-sm ${s.color}`}>{s.val}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            {last.pain && (
              <div className="mt-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2">
                <p className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wide mb-0.5">⚠️ ألم أو إصابة مُبلَّغ عنها</p>
                <p className="text-xs text-slate-700 leading-relaxed">{last.pain}</p>
              </div>
            )}
            {/* Coach reply */}
            {last.coachReply && (
              <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wide mb-1.5">💬 رد المدرب أمين</p>
                <p className="text-sm text-slate-700 leading-relaxed">{last.coachReply}</p>
              </div>
            )}
          </>
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
                  <span>3 ساعات</span><span>12 ساعة</span>
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wide block mb-2">
                  وزنك هذا الأسبوع <span className="text-slate-300 font-medium normal-case">(اختياري)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number" min="30" max="300" step="0.1"
                    value={form.weight}
                    onChange={e => setForm(p => ({...p, weight: e.target.value}))}
                    placeholder="مثال: 82.5"
                    className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-400 transition font-medium"
                  />
                  <span className="text-sm font-bold text-slate-400 flex-shrink-0">كغ</span>
                </div>
              </div>

              {/* Stress */}
              <div>
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wide block mb-2">مستوى الضغط والتوتر</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setForm(p => ({...p, stress: n}))}
                      className={`flex-1 py-2.5 rounded-xl text-lg font-bold border-2 transition-all
                        ${form.stress === n ? 'border-purple-400 bg-purple-50 scale-105' : 'border-slate-100 hover:border-slate-200'}`}>
                      {['😌','🙂','😐','😟','😤'][n-1]}
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs font-bold text-slate-400 mt-1.5">{STRESS_LABELS[form.stress]}</p>
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

              {/* Pain / injury */}
              <div>
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wide block mb-2">
                  ألم أو إصابة؟ <span className="text-slate-300 font-medium normal-case">(اتركه فارغاً إن لم يكن هناك شيء)</span>
                </label>
                <input
                  type="text"
                  value={form.pain}
                  onChange={e => setForm(p => ({...p, pain: e.target.value}))}
                  placeholder="مثال: ألم في الركبة اليسرى، آلام ظهر..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-orange-400 transition font-medium"
                />
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

/* ── Daily Tasks widget ─────────────────────────────────────────────────── */
function DailyTasksWidget() {
  const [tasks, setTasks]   = useState([])
  const [done,  setDone]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/client/tasks')
      .then(r => r.ok ? r.json() : { tasks: [], done: [] })
      .then(d => { setTasks(d.tasks || []); setDone(d.done || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function toggleTask(taskId) {
    const newDone = done.includes(taskId) ? done.filter(id => id !== taskId) : [...done, taskId]
    setDone(newDone)
    await fetch('/api/client/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId }),
    }).catch(() => {})
  }

  if (loading || !tasks.length) return null

  const allDone = tasks.every(t => done.includes(t.id))

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-50 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-4 h-4 text-violet-500" />
          </div>
          <div>
            <p className="font-extrabold text-slate-800 text-sm">مهام اليوم</p>
            <p className="text-[10px] text-slate-400 font-medium">{done.length} / {tasks.length} مكتملة</p>
          </div>
        </div>
        {allDone && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
            🎉 أحسنت!
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-100 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-violet-500 rounded-full transition-all duration-500"
          style={{ width: `${tasks.length ? (done.length / tasks.length) * 100 : 0}%` }}
        />
      </div>

      <div className="space-y-2">
        {tasks.map(task => {
          const isDone = done.includes(task.id)
          return (
            <button key={task.id} onClick={() => toggleTask(task.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-right transition-all
                ${isDone ? 'bg-violet-50 border-violet-200' : 'bg-slate-50 border-slate-100 hover:border-violet-200'}`}>
              <span className={`text-xl flex-shrink-0 ${isDone ? '' : 'grayscale opacity-50'}`}>{task.emoji}</span>
              <span className={`flex-1 text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                {task.text}
              </span>
              <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                ${isDone ? 'bg-violet-500 border-violet-500' : 'border-slate-300'}`}>
                {isDone && <CheckCircle2 className="w-3 h-3 text-white" />}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Training Attendance widget ──────────────────────────────────────────── */
function TrainingAttendanceWidget({ trainingDaysPerWeek }) {
  const [log,     setLog]     = useState({})
  const [toggling, setToggling] = useState(null)

  useEffect(() => {
    fetch('/api/client/training-log')
      .then(r => r.ok ? r.json() : {})
      .then(setLog)
      .catch(() => {})
  }, [])

  // Build last 14 days grid
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400000)
    return {
      date:    d.toISOString().slice(0, 10),
      dayName: d.toLocaleDateString('ar', { weekday: 'short', timeZone: 'Asia/Qatar' }),
      dayNum:  d.getDate(),
      isToday: i === 13,
    }
  })

  const streak = (() => {
    let s = 0
    for (let i = 0; i < 60; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
      if (log[d]) s++
      else if (i > 0) break
    }
    return s
  })()

  async function toggleDay(date) {
    setToggling(date)
    const res = await fetch('/api/client/training-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    })
    if (res.ok) {
      const d = await res.json()
      setLog(d.log || {})
    }
    setToggling(null)
  }

  const totalLogged = Object.keys(log).filter(d => log[d]).length

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="font-extrabold text-slate-800 text-sm">حضور التدريب</p>
            <p className="text-[10px] text-slate-400 font-medium">
              {trainingDaysPerWeek ? `${trainingDaysPerWeek} أيام/أسبوع في خطتك` : 'سجّل أيام تدريبك'}
            </p>
          </div>
        </div>
        {streak > 0 && (
          <span className="text-xs font-extrabold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">
            🔥 {streak} يوم متتالي
          </span>
        )}
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-3">
        {days.map(d => {
          const trained = !!log[d.date]
          const isToggling = toggling === d.date
          const isFuture = d.date > new Date().toISOString().slice(0, 10)
          return (
            <button key={d.date}
              onClick={() => !isFuture && !isToggling && toggleDay(d.date)}
              disabled={isFuture}
              className={`flex flex-col items-center gap-0.5 py-2 rounded-xl border transition-all
                ${isFuture   ? 'opacity-20 cursor-not-allowed border-transparent' :
                  isToggling ? 'opacity-50 border-amber-200' :
                  trained    ? 'bg-amber-400 border-amber-400 shadow-sm' :
                  d.isToday  ? 'bg-slate-50 border-amber-200 border-dashed' :
                  'bg-slate-50 border-slate-100 hover:border-amber-200'}`}>
              <span className={`text-[9px] font-bold ${trained ? 'text-black/70' : 'text-slate-400'}`}>{d.dayName}</span>
              <span className={`text-xs font-extrabold ${trained ? 'text-black' : d.isToday ? 'text-amber-500' : 'text-slate-600'}`}>{d.dayNum}</span>
              {isToggling && <div className="w-2 h-2 rounded-full border border-amber-500 border-t-transparent animate-spin" />}
            </button>
          )
        })}
      </div>

      <p className="text-xs text-slate-400 text-center font-medium">
        إجمالي الأيام المسجلة: <strong className="text-slate-600">{totalLogged} يوم</strong>
      </p>
    </div>
  )
}

/* ── Testimonial prompt widget ───────────────────────────────────────────── */
function TestimonialWidget() {
  const [existing, setExisting]   = useState(undefined)
  const [open, setOpen]           = useState(false)
  const [rating, setRating]       = useState(5)
  const [result, setResult]       = useState('')
  const [text, setText]           = useState('')
  const [shareName, setShareName] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)

  useEffect(() => {
    fetch('/api/client/testimonial')
      .then(r => r.ok ? r.json() : null)
      .then(setExisting)
      .catch(() => setExisting(null))
  }, [])

  async function submit() {
    if (text.trim().length < 20) return
    setSaving(true)
    try {
      const res = await fetch('/api/client/testimonial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, rating, result, shareName }),
      })
      if (res.ok) { setSaved(true); setOpen(false); setExisting({ text, rating, result, shareName, approved: false }) }
    } catch {}
    finally { setSaving(false) }
  }

  if (existing === undefined) return null
  if (existing && !open) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">⭐</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-amber-800">شكراً على تقييمك!</p>
          <p className="text-xs text-amber-600 font-medium mt-0.5">
            {existing.approved ? 'تقييمك ظاهر الآن في الموقع ✅' : 'سيراجعه المدرب ويضيفه للموقع قريباً'}
          </p>
          <p className="text-xs text-slate-500 mt-1 italic">"{existing.text?.slice(0, 80)}..."</p>
        </div>
        <button onClick={() => setOpen(true)} className="text-xs text-amber-600 font-bold hover:text-amber-700 transition flex-shrink-0">
          تعديل
        </button>
      </div>
    )
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full bg-gradient-to-l from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 hover:border-amber-300 transition text-right">
        <span className="text-2xl flex-shrink-0">⭐</span>
        <div className="flex-1">
          <p className="text-sm font-extrabold text-amber-800">شارك تجربتك مع أمين!</p>
          <p className="text-xs text-amber-600 font-medium mt-0.5">تقييمك يساعد المدربين والعملاء الجدد</p>
        </div>
        <span className="text-amber-500 text-lg">←</span>
      </button>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-extrabold text-slate-800">شارك تجربتك</p>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
      </div>

      {/* Stars */}
      <div>
        <p className="text-xs font-bold text-slate-500 mb-2">التقييم</p>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(s => (
            <button key={s} onClick={() => setRating(s)} className="text-3xl transition-transform hover:scale-110">
              <span className={s <= rating ? 'text-amber-400' : 'text-slate-200'}>★</span>
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      <div>
        <label className="text-xs font-bold text-slate-500 block mb-1.5">نتيجتك (اختياري) — مثال: فقدت 10 كغ</label>
        <input value={result} onChange={e => setResult(e.target.value)} maxLength={80}
          placeholder="مثال: فقدت 12 كغ في 3 أشهر"
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-amber-400 transition" />
      </div>

      {/* Text */}
      <div>
        <label className="text-xs font-bold text-slate-500 block mb-1.5">تجربتك * (20 حرف على الأقل)</label>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={3} maxLength={500}
          placeholder="اكتب تجربتك مع المدرب أمين..."
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-amber-400 transition resize-none" />
        <p className="text-[10px] text-slate-300 text-left mt-0.5">{text.length}/500</p>
      </div>

      {/* Share name */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={shareName} onChange={e => setShareName(e.target.checked)}
          className="w-4 h-4 rounded accent-amber-500" />
        <span className="text-xs font-medium text-slate-600">الموافقة على ذكر اسمي الكامل (وإلا الحرف الأول فقط)</span>
      </label>

      {saved && <p className="text-emerald-600 text-sm font-bold text-center">✅ شكراً! تقييمك قيد المراجعة</p>}

      <button onClick={submit} disabled={saving || text.trim().length < 20}
        className="w-full py-3 bg-amber-400 text-black font-extrabold text-sm rounded-xl hover:bg-amber-300 transition disabled:opacity-40">
        {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'إرسال التقييم'}
      </button>
    </div>
  )
}

/* ── Leaderboard widget ──────────────────────────────────────────────────── */
function LeaderboardWidget() {
  const [board, setBoard] = useState(null)

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.ok ? r.json() : [])
      .then(setBoard)
      .catch(() => setBoard([]))
  }, [])

  if (!board || board.length < 2) return null

  const goalEmoji = { loss: '📉', gain: '💪', maintain: '⚖️', performance: '🏃' }
  const medals    = ['🥇', '🥈', '🥉']

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
          <Trophy className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <p className="font-extrabold text-slate-800 text-sm">لوحة المتصدرين</p>
          <p className="text-[10px] text-slate-400 font-medium">أكثر العملاء التزاماً بالتدريب (آخر 60 يوم)</p>
        </div>
      </div>

      <div className="space-y-2">
        {board.slice(0, 5).map((entry, i) => (
          <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl ${i === 0 ? 'bg-amber-50 border border-amber-100' : 'bg-slate-50'}`}>
            <span className="text-lg flex-shrink-0 w-6 text-center">{medals[i] || `${i + 1}`}</span>
            <span className="text-sm font-extrabold text-slate-700 flex-1" dir="ltr">{entry.displayName}</span>
            <span className="text-[10px] text-slate-400">{goalEmoji[entry.goal]}</span>
            <div className="text-right flex-shrink-0">
              {entry.streak > 0 ? (
                <span className="text-xs font-extrabold text-amber-600">🔥 {entry.streak} يوم</span>
              ) : (
                <span className="text-xs text-slate-400">{entry.days} يوم</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-300 text-center mt-3 font-medium">الأسماء مختصرة للخصوصية</p>
    </div>
  )
}

/* ── Payment receipt upload (shown when waiting for payment confirmation) ── */
function ReceiptUpload() {
  const [receipt,   setReceipt]   = useState(undefined) // undefined=loading, null=none
  const [uploading, setUploading] = useState(false)
  const [deleting,  setDeleting]  = useState(false)
  const [uploaded,  setUploaded]  = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    fetch('/api/client/receipt')
      .then(r => r.ok ? r.json() : null)
      .then(setReceipt)
      .catch(() => setReceipt(null))
  }, [])

  function compressAndUpload(file) {
    setError('')
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const MAX = 1200
        let w = img.width, h = img.height
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX }
          else       { w = Math.round(w * MAX / h); h = MAX }
        }
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.78)
        saveReceipt(dataUrl, file.name)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }

  async function saveReceipt(data, filename) {
    setUploading(true)
    try {
      const res = await fetch('/api/client/receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, filename, mimeType: 'image/jpeg' }),
      })
      const d = await res.json()
      if (!res.ok) { setError(d.error || 'فشل الرفع'); return }
      setReceipt({ data, filename, uploadedAt: d.uploadedAt })
      setUploaded(true)
      setTimeout(() => setUploaded(false), 4000)
    } catch { setError('حدث خطأ، حاول مرة أخرى') }
    finally { setUploading(false) }
  }

  if (receipt === undefined) return null

  return (
    <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
          <ImageIcon className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <p className="font-extrabold text-slate-800 text-sm">إيصال الدفع</p>
          <p className="text-xs text-slate-400 font-medium">صوّر إيصال الدفع وارفعه لتأكيد اشتراكك</p>
        </div>
      </div>

      {receipt ? (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50" style={{ maxHeight: 220 }}>
            <img src={receipt.data} alt="إيصال الدفع" className="w-full object-contain" style={{ maxHeight: 220 }} />
          </div>
          <p className="text-xs text-emerald-600 font-bold text-center bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-100">
            ✅ تم رفع الإيصال — سيراجعه المدرب ويؤكد اشتراكك قريباً
          </p>
          <p className="text-[10px] text-slate-400 text-center font-medium">
            رُفع في: {new Date(receipt.uploadedAt).toLocaleString('ar', { timeZone: 'Asia/Qatar', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
          <div className="flex gap-2">
            <label className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-bold cursor-pointer hover:bg-slate-50 transition">
              <Upload className="w-4 h-4" /> استبدال
              <input type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && compressAndUpload(e.target.files[0])} />
            </label>
            <button
              onClick={async () => {
                if (!confirm('حذف الإيصال؟')) return
                setDeleting(true)
                try {
                  await fetch('/api/client/receipt', { method: 'DELETE' })
                  setReceipt(null)
                } catch { setError('فشل الحذف') }
                finally { setDeleting(false) }
              }}
              disabled={deleting}
              className="px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-bold hover:bg-red-50 transition disabled:opacity-40">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <label className={`w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed cursor-pointer transition
            ${uploading ? 'border-amber-200 bg-amber-50' : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'}`}>
            {uploading
              ? <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              : <>
                  <Upload className="w-8 h-8 text-slate-300" />
                  <span className="text-sm font-bold text-slate-500">اضغط لاختيار صورة الإيصال</span>
                  <span className="text-xs text-slate-300">JPG / PNG — يضغط تلقائياً</span>
                </>
            }
            <input type="file" accept="image/*" className="hidden" disabled={uploading}
              onChange={e => e.target.files?.[0] && compressAndUpload(e.target.files[0])} />
          </label>
          {error && <p className="text-xs text-red-500 font-medium text-center">{error}</p>}
          {uploaded && (
            <p className="text-xs text-emerald-600 font-bold text-center bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-100">
              ✅ تم رفع الإيصال بنجاح — سيراجعه المدرب قريباً
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Weight progress mini chart ─────────────────────────────────────────── */
function WeightProgressWidget() {
  const [points, setPoints] = useState(null)

  useEffect(() => {
    fetch('/api/client/checkin')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (!Array.isArray(data)) { setPoints([]); return }
        const withW = data.filter(c => c.weight).slice(-8)
        setPoints(withW.map(c => ({ w: c.weight, d: c.date })))
      })
      .catch(() => setPoints([]))
  }, [])

  if (!points || points.length < 2) return null

  const min   = Math.min(...points.map(p => p.w))
  const max   = Math.max(...points.map(p => p.w))
  const range = max - min || 1
  const W = 200, H = 48, PAD = 6
  const xs = points.map((_, i) => PAD + (i / (points.length - 1)) * (W - PAD * 2))
  const ys = points.map(p => H - PAD - ((p.w - min) / range) * (H - PAD * 2))
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x} ${ys[i]}`).join(' ')

  const first = points[0].w
  const last  = points[points.length - 1].w
  const diff  = (last - first).toFixed(1)
  const down  = last < first

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="font-extrabold text-slate-800 text-sm">تطور الوزن</p>
            <p className="text-[10px] text-slate-400 font-medium">من التقارير الأسبوعية</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-lg font-extrabold ${down ? 'text-emerald-600' : diff > 0 ? 'text-orange-500' : 'text-slate-600'}`}>
            {diff > 0 ? '+' : ''}{diff} كغ
          </p>
          <p className="text-[10px] text-slate-400 font-medium">{points.length} قراءات</p>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        <path d={path} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {xs.map((x, i) => (
          <circle key={i} cx={x} cy={ys[i]} r="3" fill={i === points.length - 1 ? '#10b981' : '#d1fae5'} stroke="#10b981" strokeWidth="1.5" />
        ))}
      </svg>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-slate-400 font-medium">{points[0].w} كغ</span>
        <span className="text-[10px] text-emerald-600 font-bold">{last} كغ الآن</span>
      </div>
      <Link href="/client/checkins"
        className="block text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition mt-2">
        كل التقارير ←
      </Link>
    </div>
  )
}

/* ── Achievement badges ─────────────────────────────────────────────────── */
function AchievementBadgesWidget() {
  const [data, setData] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/client/checkin').then(r => r.ok ? r.json() : []),
      fetch('/api/client/training-log').then(r => r.ok ? r.json() : {}),
      fetch('/api/client/logs').then(r => r.ok ? r.json() : []),
    ])
      .then(([checkins, trainingLog, logs]) => setData({ checkins, trainingLog, logs }))
      .catch(() => {})
  }, [])

  if (!data) return null

  const checkins    = Array.isArray(data.checkins)    ? data.checkins    : []
  const trainingLog = data.trainingLog && typeof data.trainingLog === 'object' ? data.trainingLog : {}
  const logs        = Array.isArray(data.logs)        ? data.logs        : []

  // Compute badges
  const trainDays = Object.keys(trainingLog).filter(k => trainingLog[k]).length
  const logDays   = logs.length
  const streak    = (() => {
    let s = 0
    for (let i = 0; i < 90; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
      if (trainingLog[d]) s++
      else if (i > 0) break
    }
    return s
  })()

  const badges = [
    { id: 'first_checkin',  icon: '📋', label: 'أول تقرير',          desc: 'أرسلت أول تقرير أسبوعي',            earned: checkins.length >= 1 },
    { id: 'checkin_4',      icon: '🗓️', label: 'شهر من التقارير',    desc: '4 تقارير أسبوعية متتالية',          earned: checkins.length >= 4 },
    { id: 'checkin_12',     icon: '📅', label: '3 أشهر',             desc: '12 تقرير أسبوعي',                   earned: checkins.length >= 12 },
    { id: 'train_7',        icon: '💪', label: 'أسبوع تدريب',        desc: 'سجّلت 7 أيام تدريب',                earned: trainDays >= 7 },
    { id: 'train_30',       icon: '🏋️', label: 'شهر تدريب',          desc: 'سجّلت 30 يوم تدريب',               earned: trainDays >= 30 },
    { id: 'streak_7',       icon: '🔥', label: 'أسبوع متتالي',       desc: '7 أيام تدريب متواصلة',              earned: streak >= 7 },
    { id: 'streak_30',      icon: '⚡', label: 'شهر متواصل',         desc: '30 يوم تدريب متواصل',               earned: streak >= 30 },
    { id: 'journal_7',      icon: '✨', label: 'مداوم على اليومية',   desc: 'سجّلت 7 أيام في اليومية',           earned: logDays >= 7 },
    { id: 'journal_30',     icon: '🏆', label: 'مثابر',              desc: 'سجّلت 30 يوم في اليومية',           earned: logDays >= 30 },
  ]

  const earned = badges.filter(b => b.earned)
  if (earned.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
          <Trophy className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <p className="font-extrabold text-slate-800 text-sm">إنجازاتي</p>
          <p className="text-[10px] text-slate-400 font-medium">{earned.length} / {badges.length} شارة مكتسبة</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {badges.map(b => (
          <div
            key={b.id}
            title={b.desc}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition
              ${b.earned
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-slate-50 text-slate-300 border border-slate-100 grayscale opacity-50'
              }`}
          >
            <span>{b.icon}</span>
            <span>{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Quick links to new features ─────────────────────────────────────────── */
function QuickLinksWidget() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Link href="/client/chat"
        className="group bg-[#0a0a0a] rounded-2xl p-4 flex items-center gap-3 hover:bg-[#1a1a1a] transition">
        <div className="w-9 h-9 bg-[#fbbf24]/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-5 h-5 text-[#fbbf24]" />
        </div>
        <div className="min-w-0">
          <p className="font-extrabold text-white text-sm">مساعدي</p>
          <p className="text-white/40 text-[10px] font-medium truncate">أسئلة التغذية والتدريب</p>
        </div>
      </Link>
      <Link href="/client/checkins"
        className="group bg-violet-600 rounded-2xl p-4 flex items-center gap-3 hover:bg-violet-700 transition">
        <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <ClipboardList className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-extrabold text-white text-sm">تقاريري</p>
          <p className="text-white/60 text-[10px] font-medium truncate">سجل التقارير وردود المدرب</p>
        </div>
      </Link>
    </div>
  )
}

const goalLabels = {
  loss: 'خسارة وزن', gain: 'بناء عضلات',
  maintain: 'الحفاظ على الوزن', performance: 'أداء رياضي',
}

/* ── Referral card ───────────────────────────────────────────────────────── */
function ReferralCard({ clientId }) {
  const [copied, setCopied] = useState(false)
  const BASE = typeof window !== 'undefined' ? window.location.origin : 'https://amine-fit.com'
  const link = `${BASE}/register?ref=${clientId}`

  function copy() {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  return (
    <div className="bg-gradient-to-l from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Share2 className="w-4 h-4 text-violet-600" />
        </div>
        <div>
          <p className="font-extrabold text-slate-800 text-sm">شارك وساعد صديقك</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">أرسل الرابط لمن يريد الانضمام مع المدرب أمين</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-white border border-violet-100 rounded-xl px-3 py-2 text-xs font-medium text-slate-400 truncate dir-ltr text-left">
          {link}
        </div>
        <button onClick={copy}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all
            ${copied ? 'bg-emerald-500 text-white' : 'bg-violet-600 text-white hover:bg-violet-700'}`}>
          {copied ? '✓ نُسخ' : 'نسخ'}
        </button>
      </div>
    </div>
  )
}

/* ── First-time onboarding modal ─────────────────────────────────────────── */
const ONBOARDING_KEY = 'af_onboarded_v1'

function OnboardingModal({ client, onDone }) {
  const [step, setStep] = useState(0)

  const steps = [
    {
      emoji: '🎉',
      title: `أهلاً وسهلاً ${client.name?.split(' ')[0] || ''}!`,
      body: 'مرحباً بك في بوابتك الشخصية مع المدرب أمين. دعنا نريك أهم الميزات في 3 خطوات سريعة.',
      color: 'from-amber-400 to-yellow-500',
    },
    {
      emoji: '🥗',
      title: 'خطتك المخصصة',
      body: 'ستجد هنا خطتك الغذائية والتدريبية المصممة خصيصاً لك من المدرب أمين. تحدّث يومياً للحصول على أفضل النتائج.',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      emoji: '📊',
      title: 'تابع تقدمك',
      body: 'سجّل وزنك وقياساتك أسبوعياً، وارسل تقريرك للمدرب. الاستمرارية هي سر النتائج الحقيقية!',
      color: 'from-violet-500 to-purple-700',
    },
  ]

  const current = steps[step]

  function finish() {
    try { localStorage.setItem(ONBOARDING_KEY, '1') } catch {}
    onDone()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Progress dots */}
        <div className={`bg-gradient-to-l ${current.color} px-6 pt-8 pb-10 text-center relative`}>
          <div className="flex justify-center gap-2 absolute bottom-3 inset-x-0">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-white' : 'w-2 bg-white/40'}`} />
            ))}
          </div>
          <p className="text-6xl mb-4">{current.emoji}</p>
          <h2 className="text-white font-extrabold text-xl leading-tight">{current.title}</h2>
        </div>

        <div className="p-6">
          <p className="text-slate-600 text-sm leading-relaxed text-center font-medium mb-6">
            {current.body}
          </p>

          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition">
                السابق
              </button>
            )}
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)}
                className="flex-1 py-3 rounded-xl bg-[#0a0a0a] text-[#fbbf24] font-extrabold text-sm hover:bg-[#1a1a1a] transition">
                التالي
              </button>
            ) : (
              <button onClick={finish}
                className="flex-1 py-3 rounded-xl bg-[#0a0a0a] text-[#fbbf24] font-extrabold text-sm hover:bg-[#1a1a1a] transition">
                ابدأ الآن 🚀
              </button>
            )}
          </div>

          {step === 0 && (
            <button onClick={finish}
              className="w-full text-center text-xs text-slate-300 font-medium mt-3 hover:text-slate-400 transition">
              تخطي
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ClientDashboard() {
  const router = useRouter()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    let mounted = true
    let fetched = false
    async function fetchClient() {
      try {
        const r = await fetch('/api/client/me')
        if (!mounted) return
        if (r.status === 401) { router.push('/client/login'); return }
        if (r.status === 403) {
          const d = await r.json()
          router.push(`/client/login?suspended=1&msg=${encodeURIComponent(d.error || 'تم تعليق حسابك')}`)
          return
        }
        if (!r.ok) return
        const d = await r.json()
        if (mounted && d && (d.id || d.name)) {
          setClient(d)
          // Show onboarding modal on first visit only
          if (!fetched) {
            fetched = true
            try {
              if (!localStorage.getItem(ONBOARDING_KEY)) setShowOnboarding(true)
            } catch {}
          }
        }
      } catch {} finally {
        if (mounted) setLoading(false)
      }
    }
    fetchClient()
    const poll = setInterval(fetchClient, 30000)
    const onVisible = () => { if (!document.hidden) fetchClient() }
    document.addEventListener('visibilitychange', onVisible)
    return () => { mounted = false; clearInterval(poll); document.removeEventListener('visibilitychange', onVisible) }
  }, [router])

  if (loading) {
    return <SkeletonDashboard />
  }

  if (!client) return null

  const hasPlan       = !!client.plan
  const calcPlan      = client.nutritionCalcPlan
  const hasNutrition  = !!(client.plan?.nutrition?.calories) || !!(calcPlan?.target)
  const hasTraining   = hasPlan && Array.isArray(client.plan?.training?.days) && client.plan.training.days.length > 0

  return (
    <div className="space-y-5 max-w-3xl mx-auto">

      {/* First-time onboarding */}
      {showOnboarding && client && (
        <OnboardingModal client={client} onDone={() => setShowOnboarding(false)} />
      )}

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
              {hasNutrition && hasTraining
                ? 'خطتك المخصصة جاهزة — تغذية وتدريب ✓'
                : hasNutrition
                ? 'خطتك الغذائية جاهزة — البرنامج التدريبي قيد الإعداد'
                : hasTraining
                ? 'برنامجك التدريبي جاهز — الخطة الغذائية قيد الإعداد'
                : 'يعمل المدرب أمين على تحضير خطتك المخصصة — ستصلك قريباً'}
            </p>
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs font-bold">حسابك نشط</span>
              </span>
              <PushSubscriber />
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

      {/* Receipt upload — only when waiting for payment confirmation */}
      {client.interestedPlan && !client.subscriptionPlan && <ReceiptUpload />}

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
                ? `${client.plan?.nutrition?.calories || calcPlan?.target || 0} سعرة • ${
                    client.plan?.nutrition?.meals?.length
                    ?? (calcPlan?.duration === 'day'
                        ? calcPlan?.menu?.length
                        : calcPlan?.duration === 'month'
                        ? calcPlan?.weeks?.[0]?.menu?.length
                        : calcPlan?.days?.[0]?.menu?.length)
                    ?? 0
                  } وجبات`
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

      {/* Quick links — Chat + Check-ins */}
      <QuickLinksWidget />

      {/* Streak */}
      <StreakWidget />

      {/* Water tracker */}
      <WaterWidget />

      {/* Weekly check-in */}
      <WeeklyCheckin />

      {/* Weight progress mini chart */}
      <WeightProgressWidget />

      {/* Achievement badges */}
      <AchievementBadgesWidget />

      {/* Daily tasks from coach */}
      <DailyTasksWidget />

      {/* Training attendance calendar */}
      <TrainingAttendanceWidget trainingDaysPerWeek={client.plan?.training?.daysPerWeek} />

      {/* Leaderboard */}
      <LeaderboardWidget />

      {/* Share experience — visible for all logged-in clients */}
      <TestimonialWidget />

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

      {/* Referral card */}
      {client.status === 'active' && <ReferralCard clientId={client.id} />}

      {/* Data export */}
      <div className="flex justify-center pb-1">
        <a href="/api/client/export" download
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-600 transition px-4 py-2 rounded-xl hover:bg-slate-50">
          <Download className="w-3.5 h-3.5" />
          تنزيل بياناتي
        </a>
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
