'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardList, ChevronDown, ChevronUp } from 'lucide-react'

const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو',
                 'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

function fmtDate(iso) {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function fmtDay(iso) {
  return new Date(iso).toLocaleDateString('ar', { weekday: 'long', timeZone: 'Asia/Qatar' })
}

const ENERGY_LABELS = ['', '😩 سيء', '😔 ضعيف', '😐 متوسط', '😊 جيد', '😁 ممتاز']
const ENERGY_COLORS = ['', 'text-red-500', 'text-orange-500', 'text-amber-500', 'text-emerald-500', 'text-emerald-600']
const STRESS_LABELS = ['', '😌 هادئ', '🙂 عادي', '😐 متوسط', '😟 مرتفع', '😤 شديد']
const STRESS_COLORS = ['', 'text-emerald-600', 'text-emerald-500', 'text-amber-500', 'text-orange-500', 'text-red-500']

function Bar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function CheckinCard({ entry }) {
  const [open, setOpen] = useState(false)
  const hasReply = !!entry.coachReply

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${hasReply ? 'border-amber-200' : 'border-slate-100'}`}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 text-right hover:bg-slate-50/50 transition"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-extrabold text-slate-800 text-sm">{fmtDay(entry.date)}</p>
            <p className="text-xs text-slate-400 font-medium">{fmtDate(entry.date)}</p>
            {hasReply && (
              <span className="text-[10px] font-extrabold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                💬 رد المدرب
              </span>
            )}
          </div>
          {/* Quick stats row */}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className={`text-xs font-bold ${ENERGY_COLORS[entry.energy]}`}>{ENERGY_LABELS[entry.energy]}</span>
            <span className="text-xs text-blue-500 font-bold">😴 {entry.sleep}ساعة</span>
            {entry.weight && <span className="text-xs text-slate-500 font-bold">⚖️ {entry.weight} كغ</span>}
            <span className="text-xs text-emerald-600 font-bold">🏋️ {entry.trainingDone}/7</span>
          </div>
        </div>
        <div className="flex-shrink-0 text-slate-300">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="border-t border-slate-100 px-5 py-4 space-y-4">

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-amber-50 rounded-xl p-3">
              <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wide mb-1">الطاقة</p>
              <p className={`text-lg font-extrabold ${ENERGY_COLORS[entry.energy]}`}>{entry.energy}/5</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{ENERGY_LABELS[entry.energy]}</p>
            </div>

            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wide mb-1">النوم</p>
              <p className="text-lg font-extrabold text-blue-700">{entry.sleep}ساعة</p>
              <p className={`text-xs font-medium mt-0.5 ${entry.sleep >= 7 ? 'text-emerald-600' : 'text-orange-500'}`}>
                {entry.sleep >= 7 ? '✅ ممتاز' : '⚠️ يحتاج تحسين'}
              </p>
            </div>

            <div className={`rounded-xl p-3 ${entry.stress >= 4 ? 'bg-red-50' : 'bg-purple-50'}`}>
              <p className={`text-[10px] font-extrabold uppercase tracking-wide mb-1 ${entry.stress >= 4 ? 'text-red-600' : 'text-purple-600'}`}>التوتر</p>
              <p className={`text-lg font-extrabold ${STRESS_COLORS[entry.stress || 3]}`}>{entry.stress || 3}/5</p>
              <p className={`text-xs font-medium mt-0.5 ${STRESS_COLORS[entry.stress || 3]}`}>{STRESS_LABELS[entry.stress || 3]}</p>
            </div>

            {entry.weight && (
              <div className="bg-emerald-50 rounded-xl p-3">
                <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wide mb-1">الوزن</p>
                <p className="text-lg font-extrabold text-emerald-700">{entry.weight} كغ</p>
              </div>
            )}
          </div>

          {/* Training & Nutrition bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-extrabold text-slate-600">🏋️ التدريب</span>
                <span className="text-xs font-bold text-emerald-600">{entry.trainingDone}/7 أيام</span>
              </div>
              <Bar value={entry.trainingDone} max={7} color={entry.trainingDone >= 4 ? 'bg-emerald-500' : 'bg-amber-400'} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-extrabold text-slate-600">🥗 التغذية</span>
                <span className="text-xs font-bold text-rose-600">{entry.nutritionDays}/7 أيام</span>
              </div>
              <Bar value={entry.nutritionDays} max={7} color={entry.nutritionDays >= 5 ? 'bg-emerald-500' : 'bg-rose-400'} />
            </div>
          </div>

          {/* Pain */}
          {entry.pain && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
              <p className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wide mb-1">⚠️ ألم أو إصابة مُبلَّغ عنها</p>
              <p className="text-sm text-slate-700 leading-relaxed">{entry.pain}</p>
            </div>
          )}

          {/* Client note */}
          {entry.note && (
            <div className="bg-slate-50 border-r-4 border-slate-300 rounded-xl px-4 py-3">
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-1">ملاحظتك</p>
              <p className="text-sm text-slate-700 leading-relaxed italic">"{entry.note}"</p>
            </div>
          )}

          {/* Coach reply */}
          {entry.coachReply && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wide mb-2">💬 رد المدرب أمين</p>
              <p className="text-sm text-slate-800 leading-relaxed font-medium">{entry.coachReply}</p>
              {entry.repliedAt && (
                <p className="text-[10px] text-amber-500 font-medium mt-2">
                  {fmtDate(entry.repliedAt)}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function CheckinsPage() {
  const router   = useRouter()
  const [checkins, setCheckins] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    fetch('/api/client/checkin')
      .then(r => {
        if (r.status === 401) { router.push('/client/login'); return null }
        return r.json()
      })
      .then(data => {
        if (Array.isArray(data)) setCheckins([...data].reverse())
      })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-2 border-[#fbbf24] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const replied = checkins.filter(c => c.coachReply).length

  return (
    <div className="space-y-5 max-w-2xl mx-auto" dir="rtl">

      {/* Header */}
      <div>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">تتبعك الأسبوعي</p>
        <h1 className="text-2xl font-extrabold text-slate-900">تقاريري الأسبوعية 📋</h1>
        <p className="text-sm text-slate-400 mt-1">سجل تقدمك وردود مدربك على مر الأسابيع</p>
      </div>

      {/* Summary stats */}
      {checkins.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-extrabold text-slate-900">{checkins.length}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1">تقرير مُرسل</p>
          </div>
          <div className="bg-amber-50 rounded-2xl border border-amber-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-extrabold text-amber-700">{replied}</p>
            <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wide mt-1">رد من المدرب</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
            {(() => {
              const withWeight = checkins.filter(c => c.weight)
              if (withWeight.length < 2) return (
                <>
                  <p className="text-2xl font-extrabold text-slate-900">—</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1">تغير الوزن</p>
                </>
              )
              const first = withWeight[withWeight.length - 1].weight
              const last  = withWeight[0].weight
              const diff  = (last - first).toFixed(1)
              const pos   = diff > 0
              return (
                <>
                  <p className={`text-2xl font-extrabold ${pos ? 'text-emerald-600' : diff < 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {diff > 0 ? '+' : ''}{diff} كغ
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1">تغير الوزن</p>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* List */}
      {checkins.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 py-16 text-center px-6">
          <p className="text-6xl mb-4">📋</p>
          <p className="font-extrabold text-slate-700 text-lg mb-2">لا توجد تقارير بعد</p>
          <p className="text-slate-400 text-sm leading-relaxed">
            أرسل تقريرك الأسبوعي من الرئيسية ليظهر هنا
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {checkins.map((entry) => (
            <CheckinCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
