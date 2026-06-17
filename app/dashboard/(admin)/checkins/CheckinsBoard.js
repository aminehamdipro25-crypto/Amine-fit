'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ClipboardList, MessageSquare, Star, ChevronDown, ChevronUp,
  Send, Loader2, Filter,
} from 'lucide-react'

/* ── helpers ─────────────────────────────────────────────────────────────── */

function isThisWeek(dateStr) {
  const d   = new Date(dateStr)
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  return d >= monday
}

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ar', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'Asia/Qatar',
  })
}

function fmtShortDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ar', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Qatar',
  })
}

/* energy: 1=سيء 2=ضعيف 3=متوسط 4=جيد 5=ممتاز */
const ENERGY_CFG = [
  null,
  { label: 'سيء',    bg: 'bg-red-100    text-red-700'   },
  { label: 'ضعيف',   bg: 'bg-orange-100 text-orange-700' },
  { label: 'متوسط',  bg: 'bg-amber-100  text-amber-700'  },
  { label: 'جيد',    bg: 'bg-lime-100   text-lime-700'   },
  { label: 'ممتاز',  bg: 'bg-emerald-100 text-emerald-700' },
]

const STRESS_CFG = [
  null,
  { label: 'هادئ',   bg: 'bg-emerald-100 text-emerald-700' },
  { label: 'عادي',   bg: 'bg-lime-100   text-lime-700'   },
  { label: 'متوسط',  bg: 'bg-amber-100  text-amber-700'  },
  { label: 'مرتفع',  bg: 'bg-orange-100 text-orange-700' },
  { label: 'شديد',   bg: 'bg-red-100    text-red-700'   },
]

function Badge({ cfg, prefix }) {
  if (!cfg) return null
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${cfg.bg}`}>
      {prefix}{cfg.label}
    </span>
  )
}

function MiniBar({ value, max = 7, color = 'bg-amber-400' }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-bold text-slate-500 tabular-nums w-8 text-left">{value}/{max}</span>
    </div>
  )
}

/* ── single check-in card ─────────────────────────────────────────────────── */
function CheckinCard({ ci, defaultOpen = false }) {
  const [open,    setOpen]    = useState(defaultOpen)
  const [reply,   setReply]   = useState(ci.coachReply || '')
  const [sending, setSending] = useState(false)
  const [saved,   setSaved]   = useState(!!ci.coachReply)
  const [error,   setError]   = useState('')

  const energyCfg = ENERGY_CFG[ci.energy]  || null
  const stressCfg = STRESS_CFG[ci.stress]  || null
  const hasReply  = !!ci.coachReply

  async function sendReply() {
    const text = reply.trim()
    if (!text) return
    setSending(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/clients/${ci.clientId}/checkin-reply`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ checkinId: ci.id, reply: text }),
      })
      if (res.ok) {
        setSaved(true)
      } else {
        const d = await res.json().catch(() => ({}))
        setError(d.error || 'فشل الإرسال')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={`bg-white rounded-2xl border shadow-sm transition-all ${
      hasReply ? 'border-slate-100' : 'border-amber-200'
    }`}>
      {/* Card header — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-right px-5 py-4 flex items-start gap-3 hover:bg-slate-50/70 transition rounded-2xl"
        aria-expanded={open}
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-[#0a0a0a] text-amber-400 flex items-center justify-center font-extrabold text-sm flex-shrink-0 mt-0.5">
          {ci.clientName?.[0] ?? '؟'}
        </div>

        <div className="flex-1 min-w-0 text-right">
          {/* Row 1: name + date */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/dashboard/clients?q=${encodeURIComponent(ci.clientEmail)}`}
              onClick={e => e.stopPropagation()}
              className="font-extrabold text-slate-800 text-sm hover:text-amber-600 transition"
            >
              {ci.clientName}
            </Link>
            <span className="text-xs text-slate-400">{fmtShortDate(ci.date)}</span>
            {!hasReply && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full">
                بدون رد
              </span>
            )}
            {hasReply && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full">
                تم الرد
              </span>
            )}
          </div>

          {/* Row 2: badges */}
          <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
            {energyCfg && <Badge cfg={energyCfg} prefix="طاقة: " />}
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              نوم {ci.sleep}س
            </span>
            {stressCfg && <Badge cfg={stressCfg} prefix="توتر: " />}
            {ci.weight && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {ci.weight} كغ
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">
              تدريب {ci.trainingDone}/7
            </span>
          </div>

          {/* Row 3: note preview */}
          {ci.note && !open && (
            <p className="text-xs text-slate-400 mt-1.5 truncate max-w-xs">
              {ci.note}
            </p>
          )}
        </div>

        {/* Expand toggle */}
        <div className="text-slate-300 flex-shrink-0 mt-1">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-50">

          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">مستوى الطاقة</p>
              <div className="flex items-center gap-2">
                <Star className={`w-4 h-4 ${ci.energy >= 4 ? 'text-amber-400' : 'text-slate-300'}`} fill={ci.energy >= 4 ? '#fbbf24' : 'none'} />
                <span className="text-2xl font-extrabold text-slate-800">{ci.energy}<span className="text-sm text-slate-400 font-normal">/5</span></span>
              </div>
              {energyCfg && <p className="text-xs text-slate-500 mt-1">{energyCfg.label}</p>}
            </div>

            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">ساعات النوم</p>
              <span className="text-2xl font-extrabold text-slate-800">{ci.sleep}<span className="text-sm text-slate-400 font-normal"> س</span></span>
              <p className={`text-xs mt-1 font-medium ${ci.sleep >= 7 ? 'text-emerald-600' : 'text-orange-500'}`}>
                {ci.sleep >= 7 ? 'ممتاز' : 'يحتاج تحسين'}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">مستوى التوتر</p>
              <span className="text-2xl font-extrabold text-slate-800">{ci.stress || 3}<span className="text-sm text-slate-400 font-normal">/5</span></span>
              {stressCfg && <p className="text-xs text-slate-500 mt-1">{stressCfg.label}</p>}
            </div>

            {ci.weight && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">الوزن</p>
                <span className="text-2xl font-extrabold text-slate-800">{ci.weight}<span className="text-sm text-slate-400 font-normal"> كغ</span></span>
              </div>
            )}
          </div>

          {/* Progress bars */}
          <div className="space-y-2.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-600">التدريب هذا الأسبوع</span>
                <span className="text-xs text-slate-400">{ci.trainingDone} أيام</span>
              </div>
              <MiniBar
                value={ci.trainingDone}
                max={7}
                color={ci.trainingDone >= 4 ? 'bg-emerald-400' : 'bg-amber-400'}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-600">الالتزام بالتغذية</span>
                <span className="text-xs text-slate-400">{ci.nutritionDays} أيام</span>
              </div>
              <MiniBar
                value={ci.nutritionDays}
                max={7}
                color={ci.nutritionDays >= 5 ? 'bg-emerald-400' : 'bg-amber-400'}
              />
            </div>
          </div>

          {/* Pain report */}
          {ci.pain && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
              <p className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wide mb-1">ألم / إصابة</p>
              <p className="text-sm text-orange-800 leading-relaxed">{ci.pain}</p>
            </div>
          )}

          {/* Note */}
          {ci.note && (
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-3">
              <p className="text-[10px] font-extrabold text-violet-600 uppercase tracking-wide mb-1">ملاحظة العميل</p>
              <p className="text-sm text-violet-900 leading-relaxed">{ci.note}</p>
            </div>
          )}

          {/* Existing reply */}
          {ci.coachReply && saved && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wide mb-1">ردك السابق</p>
              <p className="text-sm text-amber-900 leading-relaxed">{ci.coachReply}</p>
              {ci.repliedAt && (
                <p className="text-[10px] text-amber-500 mt-1">{fmtShortDate(ci.repliedAt)}</p>
              )}
            </div>
          )}

          {/* Reply box */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-600 block">
              <MessageSquare className="w-3.5 h-3.5 inline-block ml-1 text-amber-500" />
              {ci.coachReply ? 'تعديل الرد' : 'اكتب ردك'}
            </label>
            <textarea
              rows={3}
              value={reply}
              onChange={e => { setReply(e.target.value); setSaved(false); setError('') }}
              maxLength={500}
              placeholder="اكتب ردك على العميل... سيصله بالبريد الإلكتروني"
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400 transition resize-none placeholder:text-slate-300"
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] text-slate-300">{reply.length}/500</p>
              <button
                onClick={sendReply}
                disabled={sending || !reply.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-amber-400 text-black font-extrabold text-xs rounded-xl hover:bg-amber-300 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Send className="w-3.5 h-3.5" />}
                {sending ? 'جاري الإرسال...' : 'إرسال الرد'}
              </button>
            </div>
            {saved && !sending && (
              <p className="text-xs font-bold text-emerald-600">تم إرسال الرد بنجاح</p>
            )}
            {error && (
              <p className="text-xs font-bold text-red-500">{error}</p>
            )}
          </div>

          {/* Link to full client profile */}
          <div className="pt-1 border-t border-slate-50">
            <Link
              href={`/dashboard/clients?q=${encodeURIComponent(ci.clientEmail)}`}
              className="text-xs font-bold text-amber-600 hover:text-amber-500 transition"
            >
              عرض ملف العميل الكامل ←
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── main board ──────────────────────────────────────────────────────────── */
export default function CheckinsBoard({ checkins }) {
  const [filter, setFilter] = useState('all') // 'all' | 'no-reply' | 'this-week'

  const filtered = useMemo(() => {
    switch (filter) {
      case 'no-reply':   return checkins.filter(ci => !ci.coachReply)
      case 'this-week':  return checkins.filter(ci => isThisWeek(ci.date))
      default:           return checkins
    }
  }, [checkins, filter])

  const unreplied = checkins.filter(ci => !ci.coachReply).length

  const tabs = [
    { key: 'all',       label: 'الكل',         count: checkins.length },
    { key: 'no-reply',  label: 'بدون رد',       count: unreplied },
    { key: 'this-week', label: 'هذا الأسبوع',   count: checkins.filter(ci => isThisWeek(ci.date)).length },
  ]

  return (
    <div className="space-y-5" dir="rtl">

      {/* Header card */}
      <div className="bg-[#0a0a0a] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -left-6 -top-6 w-36 h-36 bg-amber-400/8 rounded-full pointer-events-none" />
        <div className="absolute left-20 -bottom-8 w-24 h-24 bg-amber-400/5 rounded-full pointer-events-none" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-2">لوحة التحكم</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight">
              تقارير{' '}
              <span className="text-amber-400">المتابعة الأسبوعية</span>
            </h1>
            <p className="text-white/30 text-sm mt-2 font-medium">
              {unreplied > 0
                ? `⚡ ${unreplied} تقرير ينتظر ردك`
                : checkins.length > 0
                  ? 'أحسنت — كل التقارير تمت الإجابة عليها'
                  : 'لا توجد تقارير بعد'}
            </p>
          </div>
          <div className="hidden sm:flex w-14 h-14 bg-amber-400 rounded-2xl items-center justify-center flex-shrink-0 shadow-lg shadow-amber-400/20">
            <ClipboardList className="w-7 h-7 text-black" />
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
          <p className="text-3xl font-extrabold text-slate-800">{checkins.length}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">إجمالي التقارير</p>
        </div>
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4 text-center">
          <p className="text-3xl font-extrabold text-amber-500">{unreplied}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">بدون رد</p>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-4 text-center">
          <p className="text-3xl font-extrabold text-emerald-600">{checkins.length - unreplied}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">تم الرد</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5 flex gap-1">
        <Filter className="w-4 h-4 text-slate-300 self-center mx-2 flex-shrink-0" />
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-bold transition-all ${
              filter === t.key
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {t.label}
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-extrabold ${
              filter === t.key ? 'bg-black/15 text-black' : 'bg-slate-100 text-slate-500'
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Check-in list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-20 text-center">
          <ClipboardList className="w-12 h-12 mx-auto text-slate-200 mb-3" />
          <p className="font-bold text-slate-400">
            {filter === 'no-reply'  ? 'ممتاز! لا توجد تقارير بدون رد' :
             filter === 'this-week' ? 'لا توجد تقارير هذا الأسبوع بعد' :
                                     'لم يُرسل أي عميل تقريراً حتى الآن'}
          </p>
          <p className="text-sm text-slate-300 mt-1">
            التقارير تظهر هنا بعد إرسال العملاء لها من بوابتهم
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ci, idx) => (
            <CheckinCard
              key={`${ci.clientId}-${ci.id || ci.date}-${idx}`}
              ci={ci}
              defaultOpen={!ci.coachReply && idx === 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}
