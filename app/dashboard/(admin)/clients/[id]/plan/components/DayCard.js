'use client'
import { useState } from 'react'
import { Trash2, ChevronDown, ChevronUp, Plus } from 'lucide-react'

const FOCUS_OPTIONS = ['صدر', 'ظهر', 'كتف', 'ذراعين', 'أرجل', 'بطن', 'كارديو', 'كامل', 'صدر وكتف', 'ظهر وبايسبس']
const FOCUS_ICONS   = { 'صدر':'🫀','ظهر':'🔙','كتف':'💪','ذراعين':'💪','أرجل':'🦵','بطن':'⚡','كارديو':'🏃','كامل':'⚡','صدر وكتف':'🫀','ظهر وبايسبس':'🔙' }

const emptyExercise = () => ({ name: '', sets: '', reps: '', rest: '', note: '', videoUrl: '' })

/* ── ExerciseRow — compact inline edit ───────────────────────────────────── */
function ExerciseRow({ ex, idx, onChange, onRemove }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      {/* Compact row */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="w-6 h-6 bg-slate-100 rounded-lg text-slate-500 text-[10px] font-extrabold flex items-center justify-center flex-shrink-0">
          {idx + 1}
        </span>
        <input
          value={ex.name}
          onChange={e => onChange({ ...ex, name: e.target.value })}
          placeholder="اسم التمرين..."
          className="flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-300 min-w-0"
        />
        <input
          value={ex.sets}
          onChange={e => onChange({ ...ex, sets: e.target.value })}
          placeholder="3"
          title="عدد المجموعات"
          className="w-9 text-center text-xs font-bold text-slate-700 bg-slate-50 rounded-lg py-1 border border-slate-200 outline-none focus:border-gold-400 transition"
        />
        <span className="text-slate-300 text-xs font-bold select-none">×</span>
        <input
          value={ex.reps}
          onChange={e => onChange({ ...ex, reps: e.target.value })}
          placeholder="12"
          title="عدد التكرارات"
          className="w-12 text-center text-xs font-bold text-slate-700 bg-slate-50 rounded-lg py-1 border border-slate-200 outline-none focus:border-gold-400 transition"
        />
        <input
          value={ex.rest}
          onChange={e => onChange({ ...ex, rest: e.target.value })}
          placeholder="60ث"
          title="الراحة"
          className="w-14 text-center text-[11px] text-slate-500 bg-slate-50 rounded-lg py-1 border border-slate-200 outline-none focus:border-gold-400 transition"
        />
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          title="ملاحظة / فيديو"
          className={`p-1 rounded-lg transition flex-shrink-0 ${open ? 'bg-slate-100 text-slate-600' : 'text-slate-300 hover:text-slate-500'}`}
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
        <button type="button" onClick={onRemove} className="p-1 text-red-200 hover:text-red-500 transition flex-shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Expandable details */}
      {open && (
        <div className="border-t border-slate-50 bg-slate-50/50 px-3 pb-3 pt-2 space-y-2">
          <input
            value={ex.note || ''}
            onChange={e => onChange({ ...ex, note: e.target.value })}
            placeholder="ملاحظة للعميل — اختياري"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-gold-400 transition font-medium"
          />
          <input
            value={ex.videoUrl || ''}
            onChange={e => onChange({ ...ex, videoUrl: e.target.value })}
            placeholder="رابط YouTube للشرح — اختياري"
            dir="ltr"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-gold-400 transition font-medium"
          />
        </div>
      )}
    </div>
  )
}

/* ── DayCard ──────────────────────────────────────────────────────────────── */
export default function DayCard({ day, idx, onChange, onRemove }) {
  const [open, setOpen] = useState(true)
  const update = (field, val) => onChange({ ...day, [field]: val })
  const addExercise = () => onChange({ ...day, exercises: [...(day.exercises || []), emptyExercise()] })
  const updateEx = (i, val) => {
    const exercises = [...(day.exercises || [])]
    exercises[i] = val
    onChange({ ...day, exercises })
  }
  const removeEx = (i) => onChange({ ...day, exercises: day.exercises.filter((_, j) => j !== i) })
  const focusIcon = FOCUS_ICONS[day.focus] || '🏋️'

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 p-4 bg-slate-50 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="w-8 h-8 bg-[#0a0a0a] rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-gold-400 font-extrabold text-xs">{idx + 1}</span>
        </div>
        <span className="text-lg">{focusIcon}</span>
        <div className="flex-1 min-w-0">
          <span className="font-bold text-slate-800 text-sm block truncate">{day.name || `اليوم ${idx + 1}`}</span>
          {day.focus && <span className="text-xs text-slate-400">{day.focus} · {day.exercises?.length || 0} تمارين</span>}
        </div>
        <button type="button" onClick={e => { e.stopPropagation(); onRemove() }} className="p-1 text-red-400 hover:text-red-600 transition">
          <Trash2 className="w-4 h-4" />
        </button>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </div>

      {open && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">اسم اليوم</label>
              <input value={day.name} onChange={e => update('name', e.target.value)} placeholder="يوم الصدر..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">العضلة المستهدفة</label>
              <select value={day.focus} onChange={e => update('focus', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium bg-white">
                <option value="">اختر...</option>
                {FOCUS_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* Exercises header */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-xs font-extrabold text-slate-600">التمارين</p>
              <p className="text-[10px] text-slate-400">المجموعات × التكرارات · الراحة — اضغط ↓ لإضافة ملاحظة أو فيديو</p>
            </div>
            <button type="button" onClick={addExercise}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0a0a0a] text-white font-bold text-[11px] hover:bg-black transition">
              <Plus className="w-3 h-3" /> إضافة
            </button>
          </div>

          {(day.exercises || []).length === 0 ? (
            <div className="text-center py-5 border-2 border-dashed border-slate-100 rounded-xl">
              <p className="text-xs text-slate-300 font-medium">لا تمارين — اضغط "إضافة" أو اختر قالباً</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {(day.exercises || []).map((ex, i) => (
                <ExerciseRow key={i} ex={ex} idx={i} onChange={v => updateEx(i, v)} onRemove={() => removeEx(i)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
