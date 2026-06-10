'use client'
import { Dumbbell, Zap, Plus, Brain, Sparkles, Wand2 } from 'lucide-react'
import DayCard from './DayCard'

/* ── Training Templates ──────────────────────────────────────────────────── */
const TEMPLATES = {
  ppl: {
    label: 'Push / Pull / Legs',
    emoji: '💪',
    desc: '٣ أيام — PPL',
    days: [
      { name:'Push Day', focus:'صدر وكتف', description:'', exercises:[
        { name:'Barbell Bench Press',    sets:'4', reps:'8-10',  rest:'90s',   note:'Keep the bar touching chest each rep', videoUrl:'' },
        { name:'Incline Dumbbell Press', sets:'3', reps:'10-12', rest:'60s',   note:'', videoUrl:'' },
        { name:'Overhead Press',         sets:'4', reps:'8-10',  rest:'90s',   note:'', videoUrl:'' },
        { name:'Lateral Raise',          sets:'3', reps:'15',    rest:'45s',   note:'Control the descent', videoUrl:'' },
        { name:'Tricep Pushdown',        sets:'3', reps:'15',    rest:'45s',   note:'', videoUrl:'' },
      ]},
      { name:'Pull Day', focus:'ظهر وبايسبس', description:'', exercises:[
        { name:'Wide-Grip Pull-Up',      sets:'4', reps:'6-8',   rest:'90s',   note:'ابدأ الحركة بعضلة الظهر لا الذراع', videoUrl:'' },
        { name:'Barbell Row',            sets:'4', reps:'8-10',  rest:'90s',   note:'', videoUrl:'' },
        { name:'Lat Pulldown',           sets:'3', reps:'12',    rest:'60s',   note:'', videoUrl:'' },
        { name:'Barbell Curl',           sets:'3', reps:'10-12', rest:'60s',   note:'', videoUrl:'' },
        { name:'Hammer Curl',            sets:'3', reps:'12',    rest:'45s',   note:'', videoUrl:'' },
      ]},
      { name:'Legs Day', focus:'أرجل', description:'', exercises:[
        { name:'Barbell Back Squat',     sets:'5', reps:'8-10',  rest:'2 min', note:'ظهر مستقيم، ركبة لا تتجاوز القدم', videoUrl:'' },
        { name:'Leg Press',              sets:'4', reps:'12',    rest:'90s',   note:'', videoUrl:'' },
        { name:'Romanian Deadlift',      sets:'3', reps:'12',    rest:'90s',   note:'', videoUrl:'' },
        { name:'Leg Curl',               sets:'3', reps:'15',    rest:'60s',   note:'', videoUrl:'' },
        { name:'Standing Calf Raise',    sets:'4', reps:'20',    rest:'45s',   note:'', videoUrl:'' },
      ]},
    ],
  },
  upper_lower: {
    label: 'Upper / Lower',
    emoji: '🔄',
    desc: '٤ أيام — علوي/سفلي',
    days: [
      { name:'Upper Body A', focus:'صدر وظهر', description:'', exercises:[
        { name:'Barbell Bench Press',    sets:'4', reps:'6-8',   rest:'2 min', note:'', videoUrl:'' },
        { name:'Barbell Row',            sets:'4', reps:'6-8',   rest:'2 min', note:'', videoUrl:'' },
        { name:'Incline Dumbbell Press', sets:'3', reps:'10-12', rest:'90s',   note:'', videoUrl:'' },
        { name:'Cable Row',              sets:'3', reps:'10-12', rest:'90s',   note:'', videoUrl:'' },
      ]},
      { name:'Lower Body A', focus:'أرجل', description:'', exercises:[
        { name:'Barbell Back Squat',     sets:'4', reps:'6-8',   rest:'2 min', note:'', videoUrl:'' },
        { name:'Leg Press',              sets:'3', reps:'12',    rest:'90s',   note:'', videoUrl:'' },
        { name:'Leg Extension',          sets:'3', reps:'15',    rest:'60s',   note:'', videoUrl:'' },
        { name:'Standing Calf Raise',    sets:'4', reps:'15',    rest:'45s',   note:'', videoUrl:'' },
      ]},
      { name:'Upper Body B', focus:'كتف', description:'', exercises:[
        { name:'Overhead Press',         sets:'4', reps:'8-10',  rest:'90s',   note:'', videoUrl:'' },
        { name:'Lat Pulldown',           sets:'4', reps:'8-10',  rest:'90s',   note:'', videoUrl:'' },
        { name:'Lateral Raise',          sets:'3', reps:'15',    rest:'45s',   note:'', videoUrl:'' },
        { name:'Barbell Curl',           sets:'3', reps:'10-12', rest:'60s',   note:'', videoUrl:'' },
        { name:'Tricep Pushdown',        sets:'3', reps:'12',    rest:'60s',   note:'', videoUrl:'' },
      ]},
      { name:'Lower Body B', focus:'أرجل وبطن', description:'', exercises:[
        { name:'Romanian Deadlift',      sets:'4', reps:'8-10',  rest:'90s',   note:'ظهر مستقيم طوال الحركة', videoUrl:'' },
        { name:'Walking Lunge',          sets:'3', reps:'12 each',rest:'60s',  note:'', videoUrl:'' },
        { name:'Leg Curl',               sets:'3', reps:'12',    rest:'60s',   note:'', videoUrl:'' },
        { name:'Plank',                  sets:'3', reps:'45s',   rest:'30s',   note:'', videoUrl:'' },
        { name:'Cable Crunch',           sets:'3', reps:'20',    rest:'30s',   note:'', videoUrl:'' },
      ]},
    ],
  },
  full_body: {
    label: 'Full Body 3×',
    emoji: '⚡',
    desc: '٣ أيام — جسم كامل',
    days: [
      { name:'Full Body A', focus:'كامل', description:'', exercises:[
        { name:'Barbell Back Squat',     sets:'3', reps:'8',     rest:'2 min', note:'', videoUrl:'' },
        { name:'Barbell Bench Press',    sets:'3', reps:'8',     rest:'90s',   note:'', videoUrl:'' },
        { name:'Barbell Row',            sets:'3', reps:'8',     rest:'90s',   note:'', videoUrl:'' },
        { name:'Overhead Press',         sets:'3', reps:'10',    rest:'90s',   note:'', videoUrl:'' },
        { name:'Plank',                  sets:'3', reps:'45s',   rest:'30s',   note:'', videoUrl:'' },
      ]},
      { name:'Full Body B', focus:'كامل', description:'', exercises:[
        { name:'Romanian Deadlift',      sets:'3', reps:'10',    rest:'90s',   note:'', videoUrl:'' },
        { name:'Incline Dumbbell Press', sets:'3', reps:'12',    rest:'60s',   note:'', videoUrl:'' },
        { name:'Cable Row',              sets:'3', reps:'12',    rest:'60s',   note:'', videoUrl:'' },
        { name:'Lateral Raise',          sets:'3', reps:'15',    rest:'45s',   note:'', videoUrl:'' },
        { name:'Bicycle Crunch',         sets:'3', reps:'20',    rest:'30s',   note:'', videoUrl:'' },
      ]},
      { name:'Full Body C', focus:'كامل', description:'', exercises:[
        { name:'Walking Lunge',          sets:'3', reps:'12 each',rest:'60s',  note:'', videoUrl:'' },
        { name:'Dumbbell Bench Press',   sets:'3', reps:'15',    rest:'60s',   note:'', videoUrl:'' },
        { name:'Lat Pulldown',           sets:'3', reps:'15',    rest:'60s',   note:'', videoUrl:'' },
        { name:'Arnold Press',           sets:'3', reps:'12',    rest:'60s',   note:'', videoUrl:'' },
        { name:'Leg Raise',              sets:'3', reps:'15',    rest:'45s',   note:'', videoUrl:'' },
      ]},
    ],
  },
}

const emptyDay = () => ({ name: '', focus: '', description: '', exercises: [] })

/* ── TrainingTab ─────────────────────────────────────────────────────────── */
export default function TrainingTab({
  form,
  onFormChange,
  days,
  onDaysChange,
  onGenerate,
}) {
  const { daysPerWeek, duration, level, trainingNote, trainingTips } = form

  const updateDay  = (i, val) => { const d = [...days]; d[i] = val; onDaysChange(d) }
  const removeDay  = (i) => onDaysChange(days.filter((_, j) => j !== i))

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <h2 className="font-extrabold text-slate-800 flex items-center gap-2">
          <Zap className="w-4 h-4 text-slate-600" /> إعدادات البرنامج
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">أيام/أسبوع</label>
            <input type="number" value={daysPerWeek} onChange={e => onFormChange({ ...form, daysPerWeek: e.target.value })} placeholder="5"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">المدة (دقيقة)</label>
            <input type="number" value={duration} onChange={e => onFormChange({ ...form, duration: e.target.value })} placeholder="60"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">المستوى</label>
            <select value={level} onChange={e => onFormChange({ ...form, level: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium bg-white">
              <option value="">اختر...</option>
              <option value="مبتدئ">مبتدئ</option>
              <option value="متوسط">متوسط</option>
              <option value="متقدم">متقدم</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">ملاحظة للعميل</label>
          <textarea value={trainingNote} onChange={e => onFormChange({ ...form, trainingNote: e.target.value })} rows={2}
            placeholder="ملاحظة تظهر في أعلى صفحة الخطة..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium resize-none" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">نصائح (سطر لكل نصيحة)</label>
          <textarea value={trainingTips} onChange={e => onFormChange({ ...form, trainingTips: e.target.value })} rows={3}
            placeholder={"احمِّ عضلاتك قبل التمرين\nاشرب ماء كافياً..."}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium resize-none" />
        </div>
      </div>

      {/* AI Generate Button */}
      <button
        type="button"
        onClick={onGenerate}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-dashed border-[#fbbf24]/40 bg-[#fbbf24]/5 hover:bg-[#fbbf24]/10 hover:border-[#fbbf24]/60 transition-all group"
      >
        <div className="w-9 h-9 rounded-xl bg-[#0a0a0a] flex items-center justify-center group-hover:scale-105 transition-transform">
          <Brain className="w-5 h-5 text-[#fbbf24]" />
        </div>
        <div className="text-right">
          <p className="font-extrabold text-slate-800 text-sm">توليد بالذكاء الاصطناعي</p>
          <p className="text-[11px] text-slate-400 font-medium">برنامج مخصص بناءً على بيانات العميل</p>
        </div>
        <Wand2 className="w-4 h-4 text-[#fbbf24] mr-auto" />
      </button>

      {/* Templates */}
      <div className="bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-gold-500" />
          <h3 className="font-extrabold text-slate-700 text-sm">قوالب جاهزة</h3>
          <span className="text-xs text-slate-400 font-medium">— اختر وعدّل بعدها</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(TEMPLATES).map(([key, tpl]) => (
            <button key={key} type="button"
              onClick={() => {
                if (confirm(`تحميل قالب "${tpl.label}"؟ سيُستبدل الأيام الحالية.`)) {
                  const loaded = tpl.days.map(d => ({ ...d, exercises: d.exercises.map(e => ({ ...e })) }))
                  onDaysChange(loaded)
                  onFormChange({ ...form, daysPerWeek: String(loaded.length) })
                }
              }}
              className="flex flex-col items-center gap-1.5 p-4 rounded-xl border border-slate-200 hover:border-gold-400 hover:bg-gold-50 transition text-center group">
              <span className="text-3xl group-hover:scale-110 transition-transform">{tpl.emoji}</span>
              <span className="text-xs font-extrabold text-slate-700 leading-tight">{tpl.label}</span>
              <span className="text-[10px] text-slate-400">{tpl.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-slate-800 flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-slate-600" /> أيام التدريب ({days.length})
          </h2>
          <button onClick={() => onDaysChange([...days, emptyDay()])}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0a0a0a] text-white font-bold text-xs hover:bg-black transition">
            <Plus className="w-3.5 h-3.5" /> إضافة يوم
          </button>
        </div>
        {days.map((day, i) => (
          <DayCard key={i} day={day} idx={i} onChange={v => updateDay(i, v)} onRemove={() => removeDay(i)} />
        ))}
        {days.length === 0 && (
          <div className="text-center py-10 text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">
            <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">اختر قالباً جاهزاً أو أضف يوماً يدوياً</p>
          </div>
        )}
      </div>
    </div>
  )
}
