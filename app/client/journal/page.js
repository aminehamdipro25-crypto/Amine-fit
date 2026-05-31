'use client'
import { useState, useEffect, useCallback } from 'react'
import { ChevronRight, ChevronLeft, Droplets, Scale, BookOpen, Check, Loader2, X, Plus, Minus } from 'lucide-react'

const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
const DAY_ABBR = ['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت']
const MOODS = [
  { key: 'great', label: 'ممتاز',  emoji: '😁' },
  { key: 'ok',    label: 'جيد',    emoji: '😊' },
  { key: 'tired', label: 'تعب',    emoji: '😔' },
]

function dateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
}

function todayStr() {
  const d = new Date()
  return dateStr(d.getFullYear(), d.getMonth(), d.getDate())
}

function buildCalendar(year, month) {
  const firstDay  = new Date(year, month, 1).getDay() // 0=Sun
  const daysCount = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysCount; d++) cells.push(d)
  // pad to full rows
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

/* ── Water cups row ─────────────────────────────────────────────────────── */
function WaterCups({ count, goal, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center my-3">
      {Array.from({ length: goal }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i < count ? i : i + 1)}
          className={`w-10 h-10 rounded-xl text-xl transition-all active:scale-90
            ${i < count
              ? 'bg-blue-500 shadow-md shadow-blue-200'
              : 'bg-slate-100 grayscale opacity-40'}`}
        >
          💧
        </button>
      ))}
    </div>
  )
}

/* ── Day Edit Panel ─────────────────────────────────────────────────────── */
function DayPanel({ date, log, onSave, onClose }) {
  const [water,  setWater]  = useState(log?.water     ?? 0)
  const [goal,   setGoal]   = useState(log?.waterGoal ?? 8)
  const [weight, setWeight] = useState(log?.weight    ?? '')
  const [mood,   setMood]   = useState(log?.mood      ?? '')
  const [notes,  setNotes]  = useState(log?.notes     ?? '')
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  async function save() {
    setSaving(true)
    await onSave(date, { water, waterGoal: goal, weight, mood, notes })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Format date for display
  const d = new Date(date + 'T00:00:00')
  const displayDate = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5">
      {/* Panel header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">تسجيل يوم</p>
          <h3 className="font-extrabold text-slate-800 text-lg">{displayDate}</h3>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Water */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <p className="font-bold text-slate-700 text-sm">شرب الماء</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">الهدف:</span>
            <button onClick={() => setGoal(g => Math.max(1, g - 1))} className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"><Minus className="w-3 h-3" /></button>
            <span className="text-sm font-bold text-slate-700 w-4 text-center">{goal}</span>
            <button onClick={() => setGoal(g => Math.min(20, g + 1))} className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition"><Plus className="w-3 h-3" /></button>
          </div>
        </div>
        <WaterCups count={water} goal={goal} onChange={setWater} />
        <p className="text-center text-sm font-bold text-blue-600">
          {water} / {goal} أكواب
          <span className="text-slate-400 font-normal mr-2">= {(water * 0.25).toFixed(2)} لتر</span>
        </p>
      </div>

      {/* Mood */}
      <div>
        <p className="font-bold text-slate-700 text-sm mb-2">كيف كان يومك؟</p>
        <div className="grid grid-cols-3 gap-2">
          {MOODS.map(m => (
            <button key={m.key} type="button" onClick={() => setMood(mood === m.key ? '' : m.key)}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all
                ${mood === m.key
                  ? 'border-gold-400 bg-gold-50 scale-105 shadow-sm'
                  : 'border-slate-100 hover:border-slate-200'}`}>
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-xs font-bold text-slate-600">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Weight */}
      <div>
        <label className="flex items-center gap-2 font-bold text-slate-700 text-sm mb-2">
          <Scale className="w-4 h-4 text-slate-400" /> الوزن (كغ) — اختياري
        </label>
        <input
          type="number"
          step="0.1"
          value={weight}
          onChange={e => setWeight(e.target.value)}
          placeholder="75.5"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="flex items-center gap-2 font-bold text-slate-700 text-sm mb-2">
          <BookOpen className="w-4 h-4 text-slate-400" /> ملاحظاتك اليومية
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder="كيف كان تمرينك؟ ماذا أكلت؟ أي شيء تريد تذكره..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium resize-none"
        />
      </div>

      {/* Save */}
      <button
        onClick={save}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-3 bg-[#0a0a0a] text-white rounded-xl font-bold text-sm hover:bg-black transition disabled:opacity-50"
      >
        {saving
          ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...</>
          : saved
            ? <><Check className="w-4 h-4 text-emerald-400" /> تم الحفظ</>
            : 'حفظ اليوم'
        }
      </button>
    </div>
  )
}

/* ── Main Journal Page ───────────────────────────────────────────────────── */
export default function JournalPage() {
  const now   = new Date()
  const [year,  setYear]    = useState(now.getFullYear())
  const [month, setMonth]   = useState(now.getMonth())
  const [logs,  setLogs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null) // date string
  const today = todayStr()

  useEffect(() => {
    fetch('/api/client/logs')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setLogs(data) })
      .finally(() => setLoading(false))
  }, [])

  const logMap = Object.fromEntries(logs.map(l => [l.date, l]))

  const cells = buildCalendar(year, month)

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else              { setMonth(m => m - 1) }
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else               { setMonth(m => m + 1) }
  }

  async function saveDay(date, fields) {
    const res = await fetch('/api/client/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, ...fields }),
    })
    const entry = await res.json()
    setLogs(prev => {
      const next = prev.filter(l => l.date !== date)
      next.push(entry)
      return next
    })
  }

  const selectedLog = selected ? logMap[selected] : null

  // Stats for this month
  const monthLogs = logs.filter(l => {
    const d = new Date(l.date + 'T00:00:00')
    return d.getFullYear() === year && d.getMonth() === month
  })
  const loggedDays  = monthLogs.length
  const avgWater    = loggedDays ? Math.round(monthLogs.reduce((s, l) => s + (l.water || 0), 0) / loggedDays) : 0
  const daysGoalMet = monthLogs.filter(l => l.water >= (l.waterGoal || 8)).length

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Page header */}
      <div>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">يوميتي</p>
        <h1 className="text-2xl font-extrabold text-slate-900">السجل اليومي 📓</h1>
        <p className="text-sm text-slate-400 mt-1">تتبع شرب الماء، وزنك، ومزاجك كل يوم</p>
      </div>

      {/* Month stats */}
      {loggedDays > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'أيام مسجلة', val: loggedDays,  emoji: '📅' },
            { label: 'متوسط الماء', val: `${avgWater} كوب`, emoji: '💧' },
            { label: 'وصل الهدف',  val: `${daysGoalMet} يوم`, emoji: '🎯' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-3 text-center">
              <div className="text-xl mb-1">{s.emoji}</div>
              <p className="font-extrabold text-slate-900 text-sm">{s.val}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Calendar card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Month navigation */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <button onClick={prevMonth} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition">
            <ChevronRight className="w-4 h-4" />
          </button>
          <h2 className="font-extrabold text-slate-800">
            {MONTHS[month]} {year}
          </h2>
          <button onClick={nextMonth} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 border-b border-slate-50">
          {DAY_ABBR.map(d => (
            <div key={d} className="py-2 text-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
          </div>
        ) : (
          <div className="grid grid-cols-7 divide-x divide-x-reverse divide-slate-50">
            {cells.map((day, i) => {
              if (!day) return <div key={i} className="aspect-square" />
              const ds  = dateStr(year, month, day)
              const log = logMap[ds]
              const isToday    = ds === today
              const isSelected = ds === selected
              const hasLog     = !!log
              const waterPct   = hasLog ? Math.min(1, log.water / (log.waterGoal || 8)) : 0
              const mood       = log?.mood

              return (
                <button
                  key={i}
                  onClick={() => setSelected(isSelected ? null : ds)}
                  className={`relative flex flex-col items-center justify-center gap-0.5 py-2 transition-all border-b border-slate-50
                    ${isSelected ? 'bg-[#0a0a0a]' : isToday ? 'bg-gold-50' : 'hover:bg-slate-50'}`}
                >
                  {/* Day number */}
                  <span className={`text-sm font-bold leading-none
                    ${isSelected ? 'text-white' : isToday ? 'text-gold-600' : 'text-slate-700'}`}>
                    {day}
                  </span>
                  {/* Water indicator */}
                  {hasLog && waterPct > 0 ? (
                    <span
                      className={`text-[11px] leading-none ${isSelected ? 'opacity-90' : ''}`}
                      title={`${log.water} أكواب`}
                    >
                      {waterPct >= 1 ? '💧' : waterPct >= 0.5 ? '🔵' : '🔹'}
                    </span>
                  ) : (
                    <span className="text-[11px] leading-none opacity-0">·</span>
                  )}
                  {/* Mood emoji */}
                  {mood && (
                    <span className="text-[10px] leading-none">
                      {MOODS.find(m => m.key === mood)?.emoji ?? ''}
                    </span>
                  )}
                  {/* Today dot */}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 w-1.5 h-1.5 bg-gold-400 rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Legend */}
        <div className="px-5 py-3 border-t border-slate-50 flex items-center gap-4 flex-wrap">
          <span className="text-[10px] text-slate-400 font-medium">💧 وصل الهدف &nbsp;·&nbsp; 🔵 نصف الهدف &nbsp;·&nbsp; 🔹 بداية</span>
          <span className="mr-auto text-[10px] font-bold text-gold-600">اضغط أي يوم للتسجيل</span>
        </div>
      </div>

      {/* Day edit panel */}
      {selected && (
        <DayPanel
          date={selected}
          log={selectedLog}
          onSave={saveDay}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Tip */}
      {!selected && (
        <div className="bg-[#0a0a0a] rounded-2xl px-5 py-4 flex items-start gap-3">
          <Droplets className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-xs font-extrabold mb-1">نصيحة الماء 💡</p>
            <p className="text-white/40 text-xs leading-relaxed">
              الهدف اليومي 8 أكواب (2 لتر). ابدأ صباحاً بكوب فور الاستيقاظ، وكوب قبل كل وجبة.
              الجسم المرطب يحرق الدهون بكفاءة أعلى بـ 30٪.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
