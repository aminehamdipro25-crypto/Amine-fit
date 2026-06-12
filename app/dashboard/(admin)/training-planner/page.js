'use client'
import { useState, useEffect } from 'react'
import {
  Brain, Dumbbell, Zap, Sparkles, Users, Save,
  CheckCircle2, Loader2, ChevronDown, ChevronUp,
  Search, X,
} from 'lucide-react'

const inp = 'w-full px-4 py-2.5 rounded-xl border border-[#2a2a2a] bg-[#111111] text-white text-sm focus:border-[#fbbf24] focus:ring-2 focus:ring-[#fbbf24]/20 outline-none transition placeholder:text-white/20'
const sel = 'w-full px-4 py-2.5 rounded-xl border border-[#2a2a2a] bg-[#111111] text-white text-sm focus:border-[#fbbf24] outline-none transition appearance-none'

const INIT = {
  goal: 'bulk',
  split: 'auto',
  musclePriority: '',
  level: 'beginner',
  daysPerWeek: '3',
  equipment: 'gym',
  duration: '60',
  age: '',
  gender: 'male',
  injuries: '',
}

const GOAL_OPTIONS = [
  { v: 'bulk',        l: 'تضخيم',           icon: '🏋️', desc: 'بناء كتلة عضلية' },
  { v: 'cut',         l: 'تنشيف',           icon: '🔥', desc: 'حرق دهون وتعريف' },
  { v: 'recomp',      l: 'إعادة التشكيل',   icon: '⚖️', desc: 'بناء + حرق معاً' },
  { v: 'strength',    l: 'قوة قصوى',        icon: '🏆', desc: 'أثقال ورفع قصوى' },
  { v: 'performance', l: 'أداء رياضي',      icon: '⚡', desc: 'انفجارية ورشاقة' },
  { v: 'fitness',     l: 'لياقة عامة',      icon: '🏃', desc: 'صحة واستدامة' },
]

const SPLIT_OPTIONS = [
  { v: 'auto', l: 'تلقائي' },
  { v: 'ppl',  l: 'Push/Pull/Legs' },
  { v: 'ul',   l: 'Upper/Lower' },
  { v: 'fb',   l: 'Full Body' },
  { v: 'bro',  l: 'Bro Split' },
]

const MUSCLE_OPTIONS = [
  { v: '',          l: 'بدون' },
  { v: 'chest',     l: 'صدر' },
  { v: 'back',      l: 'ظهر' },
  { v: 'shoulders', l: 'كتف' },
  { v: 'arms',      l: 'ذراعين' },
  { v: 'legs',      l: 'أرجل' },
  { v: 'glutes',    l: 'أرداف' },
  { v: 'core',      l: 'بطن' },
]

const LEVEL_OPTIONS = [
  { v: 'beginner',     l: 'مبتدئ' },
  { v: 'intermediate', l: 'متوسط' },
  { v: 'advanced',     l: 'متقدم' },
]

const EQUIP_OPTIONS = [
  { v: 'gym',        l: 'صالة كاملة', icon: '🏋️' },
  { v: 'home',       l: 'منزل', icon: '🏠' },
  { v: 'bodyweight', l: 'بدون معدات', icon: '🤸' },
]

const LEVEL_AR = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' }
const GOAL_AR = {
  bulk: 'تضخيم', cut: 'تنشيف', recomp: 'إعادة التشكيل',
  strength: 'قوة قصوى', performance: 'أداء رياضي', fitness: 'لياقة عامة',
  gain: 'بناء العضلات', loss: 'خسارة الدهون', maintain: 'الحفاظ على اللياقة',
}

/* ── Client Picker ─────────────────────────────────────────────────────────── */
function ClientPicker({ onSelect }) {
  const [clients, setClients] = useState([])
  const [search,  setSearch]  = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/clients')
      .then(r => r.json())
      .then(d => setClients(d.clients || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const q = search.trim().toLowerCase()
  const filtered = q
    ? clients.filter(c => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q))
    : clients

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        <input
          autoFocus
          placeholder="ابحث بالاسم أو البريد..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] text-white text-sm focus:border-[#fbbf24] focus:ring-2 focus:ring-[#fbbf24]/20 outline-none transition placeholder:text-white/20"
        />
      </div>
      {loading ? (
        <div className="text-center py-6 text-white/30 text-sm">جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-6 text-white/30 text-sm">لا يوجد عملاء مطابقون</div>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-2 pl-1">
          {filtered.map(c => (
            <button key={c.id} onClick={() => onSelect(c)}
              className="w-full text-right flex items-center gap-3 px-4 py-3 rounded-xl border border-[#2a2a2a] hover:border-[#fbbf24]/40 hover:bg-[#fbbf24]/5 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[#fbbf24] font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                {c.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm truncate group-hover:text-[#fbbf24]">{c.name}</p>
                <p className="text-xs text-white/30 truncate">{c.email}</p>
              </div>
              <div className="flex gap-3 text-xs text-white/40 flex-shrink-0">
                {c.age    && <span>{c.age}س</span>}
                {c.weight && <span>{c.weight}كغ</span>}
                {c.height && <span>{c.height}سم</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Day Card ───────────────────────────────────────────────────────────── */
function DayCard({ day }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 border-b border-[#2a2a2a] bg-[#0f0f0f] hover:bg-[#151515] transition-colors text-right"
      >
        <div className="w-8 h-8 rounded-xl bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[#fbbf24] font-extrabold text-sm flex items-center justify-center flex-shrink-0">
          <Dumbbell className="w-4 h-4" />
        </div>
        <div className="flex-1 text-right">
          <p className="font-bold text-white text-sm">{day.name}</p>
          {day.focus && <p className="text-xs text-white/40 mt-0.5">{day.focus}</p>}
        </div>
        <span className="text-xs text-white/25 ml-3">{day.exercises?.length || 0} تمارين</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-white/30" />
          : <ChevronDown className="w-4 h-4 text-white/30" />
        }
      </button>
      {open && (
        <div className="p-4 space-y-2">
          {(day.exercises || []).map((ex, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-[#0a0a0a] border border-[#1e1e1e]">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-[#fbbf24]/10 text-[#fbbf24] text-[10px] font-extrabold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{ex.name}</p>
                  {ex.note && <p className="text-xs text-white/30 mt-0.5">{ex.note}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 text-right flex-shrink-0">
                <span className="text-xs font-extrabold text-[#fbbf24] bg-[#fbbf24]/10 px-2.5 py-1 rounded-lg">
                  {ex.sets} × {ex.reps}
                </span>
                {ex.rest && (
                  <span className="text-[11px] text-white/25 bg-[#1a1a1a] px-2 py-1 rounded-lg hidden sm:block">
                    {ex.rest}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function TrainingPlannerPage() {
  const [form, setForm] = useState(INIT)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [genError, setGenError] = useState(null)

  const [showPicker, setShowPicker]     = useState(false)
  const [pickedClient, setPickedClient] = useState(null)

  // Save to client
  const [selectedClient, setSelectedClient] = useState('')
  const [clients, setClients]               = useState([])
  const [clientsLoading, setClientsLoading] = useState(false)
  const [saving, setSaving]                 = useState(false)
  const [saved, setSaved]                   = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const valid = +form.age > 0

  function fillFromClient(c) {
    setForm(f => ({
      ...f,
      age:      c.age      || '',
      gender:   c.gender   || 'male',
      injuries: c.injuries || c.healthConditions || '',
    }))
    setPickedClient(c)
    setSelectedClient(c.id || '')
    setShowPicker(false)
    setResult(null)
    setSaved(false)
  }

  // Load clients dropdown when result is shown and no client was pre-picked
  useEffect(() => {
    if (!result || pickedClient) return
    setClientsLoading(true)
    fetch('/api/clients')
      .then(r => r.json())
      .then(data => setClients(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setClientsLoading(false))
  }, [result, pickedClient])

  async function generate() {
    if (!valid || loading) return
    setLoading(true)
    setResult(null)
    setGenError(null)
    setSaved(false)
    try {
      const res = await fetch('/api/ai-training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const plan = await res.json()
      if (!res.ok || plan.error) {
        setGenError(plan.error || 'خطأ في توليد البرنامج — حاول مجدداً')
        return
      }
      setResult(plan)
    } catch {
      setGenError('تعذّر الاتصال بالخادم — تحقق من الاتصال وحاول مجدداً')
    } finally {
      setLoading(false)
    }
  }

  async function saveToClient() {
    const clientId = pickedClient?.id || selectedClient
    if (!clientId || !result || saving) return
    setSaving(true)
    try {
      await fetch(`/api/register/${clientId}/plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: { training: { ...result, startDate: new Date().toISOString() } } }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 4000)
    } catch {}
    finally { setSaving(false) }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Page header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#fbbf24]/10 border border-[#fbbf24]/20 flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-[#fbbf24]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">معد البرامج التدريبية</h1>
            <p className="text-sm text-white/40 mt-0.5">أنشئ برنامجاً تدريبياً مخصصاً</p>
          </div>
          <span className="mr-auto text-[11px] font-extrabold bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/20 px-3 py-1 rounded-full">AI ✦</span>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── LEFT: Form ── */}
          <div className="space-y-5">

            {/* ── Client Picker Card ── */}
            <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#2a2a2a] bg-[#0f0f0f] flex items-center gap-3">
                <Users className="w-4 h-4 text-[#fbbf24]" />
                <span className="font-bold text-white text-sm">اختر عميلاً (اختياري)</span>
              </div>
              <div className="p-4">
                {pickedClient ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#fbbf24]/5 border border-[#fbbf24]/20">
                    <div className="w-10 h-10 rounded-xl bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[#fbbf24] font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                      {pickedClient.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">{pickedClient.name}</p>
                      <p className="text-xs text-white/40 truncate">{pickedClient.email}</p>
                    </div>
                    <button
                      onClick={() => { setPickedClient(null); setSelectedClient(''); setShowPicker(false) }}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      <X className="w-3.5 h-3.5 text-white/40" />
                    </button>
                  </div>
                ) : showPicker ? (
                  <div className="space-y-3">
                    <ClientPicker onSelect={fillFromClient} />
                    <button
                      onClick={() => setShowPicker(false)}
                      className="w-full py-2 rounded-xl border border-[#2a2a2a] text-white/40 text-xs hover:text-white/60 transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPicker(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-[#2a2a2a] text-white/40 text-sm hover:border-[#fbbf24]/40 hover:text-[#fbbf24]/60 transition-all"
                  >
                    <Users className="w-4 h-4" />
                    اختر عميلاً لملء البيانات تلقائياً
                  </button>
                )}
              </div>
            </div>

            <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#2a2a2a] bg-[#0f0f0f] flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-[#fbbf24]" />
                <span className="font-bold text-white text-sm">بيانات البرنامج</span>
              </div>

              <div className="p-5 space-y-5">

                {/* Goal */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">الهدف التدريبي</label>
                  <div className="grid grid-cols-3 gap-2">
                    {GOAL_OPTIONS.map(o => (
                      <button key={o.v} onClick={() => set('goal', o.v)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all
                          ${form.goal === o.v
                            ? 'bg-[#fbbf24]/10 border-[#fbbf24] text-[#fbbf24]'
                            : 'border-[#2a2a2a] text-white/40 hover:border-[#3a3a3a]'}`}>
                        <span className="text-xl">{o.icon}</span>
                        <span className="text-xs font-bold">{o.l}</span>
                        <span className="text-[10px] opacity-60">{o.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Split Type */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">نوع التقسيم</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {SPLIT_OPTIONS.map(o => (
                      <button key={o.v} onClick={() => set('split', o.v)}
                        className={`py-2 rounded-xl border-2 transition-all text-[10px] font-bold text-center leading-tight px-1
                          ${form.split === o.v
                            ? 'bg-[#fbbf24]/10 border-[#fbbf24] text-[#fbbf24]'
                            : 'border-[#2a2a2a] text-white/40 hover:border-[#3a3a3a]'}`}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Muscle Priority */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">أولوية عضلية <span className="normal-case font-normal opacity-60">(اختياري)</span></label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {MUSCLE_OPTIONS.map(o => (
                      <button key={o.v} onClick={() => set('musclePriority', o.v)}
                        className={`py-2 rounded-xl border-2 transition-all text-xs font-bold text-center
                          ${form.musclePriority === o.v
                            ? 'bg-[#fbbf24]/10 border-[#fbbf24] text-[#fbbf24]'
                            : 'border-[#2a2a2a] text-white/40 hover:border-[#3a3a3a]'}`}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">المستوى</label>
                  <div className="grid grid-cols-3 gap-2">
                    {LEVEL_OPTIONS.map(o => (
                      <button key={o.v} onClick={() => set('level', o.v)}
                        className={`py-2.5 rounded-xl border-2 transition-all text-xs font-bold
                          ${form.level === o.v
                            ? 'bg-white text-black border-white'
                            : 'border-[#2a2a2a] text-white/40 hover:border-[#3a3a3a]'}`}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Days per week + Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">أيام التدريب/أسبوع</label>
                    <select className={sel} value={form.daysPerWeek} onChange={e => set('daysPerWeek', e.target.value)}>
                      {['3','4','5'].map(d => <option key={d} value={d}>{d} أيام</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">مدة الجلسة (دقيقة)</label>
                    <select className={sel} value={form.duration} onChange={e => set('duration', e.target.value)}>
                      {['45','60','75','90'].map(d => <option key={d} value={d}>{d} دقيقة</option>)}
                    </select>
                  </div>
                </div>

                {/* Equipment */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">المعدات المتاحة</label>
                  <div className="grid grid-cols-3 gap-2">
                    {EQUIP_OPTIONS.map(o => (
                      <button key={o.v} onClick={() => set('equipment', o.v)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-bold
                          ${form.equipment === o.v
                            ? 'bg-[#fbbf24]/10 border-[#fbbf24] text-[#fbbf24]'
                            : 'border-[#2a2a2a] text-white/40 hover:border-[#3a3a3a]'}`}>
                        <span className="text-xl">{o.icon}</span>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age + Gender */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">العمر *</label>
                    <input
                      className={inp}
                      type="number"
                      placeholder="25"
                      min="10" max="90"
                      value={form.age}
                      onChange={e => set('age', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">الجنس</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[{ v:'male', l:'ذكر' }, { v:'female', l:'أنثى' }].map(o => (
                        <button key={o.v} onClick={() => set('gender', o.v)}
                          className={`py-2.5 rounded-xl border-2 transition-all text-xs font-bold
                            ${form.gender === o.v
                              ? 'bg-[#fbbf24]/10 border-[#fbbf24] text-[#fbbf24]'
                              : 'border-[#2a2a2a] text-white/40 hover:border-[#3a3a3a]'}`}>
                          {o.l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Injuries */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">إصابات أو قيود (اختياري)</label>
                  <textarea
                    className={`${inp} resize-none`}
                    rows={2}
                    placeholder="مثال: ألم في الركبة اليسرى، مشكلة في الظهر..."
                    value={form.injuries}
                    onChange={e => set('injuries', e.target.value)}
                  />
                </div>
              </div>

              {/* Generate button */}
              <div className="px-5 pb-5">
                <button
                  onClick={generate}
                  disabled={!valid || loading}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-extrabold text-sm transition-all
                    bg-[#fbbf24] text-black hover:bg-[#f59e0b] disabled:bg-white/10 disabled:text-white/20 shadow-lg shadow-[#fbbf24]/10"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري بناء البرنامج...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      توليد البرنامج
                    </>
                  )}
                </button>
              </div>

              {/* Error */}
              {genError && !loading && (
                <div className="mx-5 mb-5 bg-red-950/40 border border-red-800/50 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-red-400 text-xl flex-shrink-0">⚠️</span>
                  <div className="flex-1">
                    <p className="font-bold text-red-300 text-sm">{genError}</p>
                  </div>
                  <button onClick={() => setGenError(null)} className="text-red-600 hover:text-red-400 flex-shrink-0 text-lg leading-none">×</button>
                </div>
              )}

              {/* Loading shimmer */}
              {loading && (
                <div className="mx-5 mb-5 bg-[#fbbf24]/5 border border-[#fbbf24]/20 rounded-xl p-4 text-center space-y-2">
                  <div className="w-10 h-10 mx-auto bg-[#fbbf24]/10 rounded-full flex items-center justify-center animate-pulse">
                    <Zap className="w-5 h-5 text-[#fbbf24]" />
                  </div>
                  <p className="font-bold text-[#fbbf24] text-sm">يحلّل البيانات...</p>
                  <p className="text-xs text-white/30">يحدد الأيام • يختار التمارين المناسبة • يحسب الحجم الأمثل</p>
                  <div className="flex justify-center gap-1 pt-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 bg-[#fbbf24] rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Preview ── */}
          <div className="space-y-5">
            {!result && !loading && (
              <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#fbbf24]/5 border border-[#fbbf24]/10 flex items-center justify-center mx-auto mb-4">
                  <Dumbbell className="w-8 h-8 text-[#fbbf24]/30" />
                </div>
                <p className="text-white/30 font-bold text-sm">أدخل البيانات واضغط "توليد"</p>
                <p className="text-white/15 text-xs mt-1">سيظهر البرنامج هنا</p>
              </div>
            )}

            {result && (
              <>
                {/* Stats row */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'الهدف', val: GOAL_AR[result.goal] || GOAL_AR[form.goal] || form.goal, icon: '🎯' },
                    { label: 'أيام/أسبوع', val: result.daysPerWeek || form.daysPerWeek, icon: '📅' },
                    { label: 'مدة الجلسة', val: `${result.duration || form.duration} دقيقة`, icon: '⏱️' },
                    { label: 'المستوى', val: LEVEL_AR[result.level] || LEVEL_AR[form.level] || result.level || form.level, icon: '🏅' },
                  ].map(s => (
                    <div key={s.label} className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-3 text-center">
                      <span className="text-2xl block mb-1">{s.icon}</span>
                      <p className="font-extrabold text-[#fbbf24] text-sm">{s.val}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Note */}
                {result.note && (
                  <div className="bg-[#fbbf24]/5 border border-[#fbbf24]/20 rounded-xl px-4 py-3">
                    <p className="text-[#fbbf24] text-xs font-medium leading-relaxed">{result.note}</p>
                  </div>
                )}

                {/* Engine badge */}
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border
                  ${result.ai
                    ? 'bg-[#fbbf24]/5 border-[#fbbf24]/20 text-[#fbbf24]'
                    : 'bg-white/5 border-white/10 text-white/40'}`}>
                  {result.ai
                    ? <><Sparkles className="w-4 h-4" /> تم التوليد بالمحرك المتقدم</>
                    : <><Zap className="w-4 h-4" /> تم التوليد بالمحرك الافتراضي</>
                  }
                </div>

                {/* Day cards */}
                <div className="space-y-3">
                  {(result.days || []).map((day, i) => (
                    <DayCard key={i} day={day} />
                  ))}
                </div>

                {/* Tips */}
                {result.tips?.length > 0 && (
                  <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-4 space-y-2">
                    <p className="text-xs font-extrabold text-white/40 uppercase tracking-widest mb-3">نصائح البرنامج</p>
                    {result.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-white/60">
                        <span className="text-[#fbbf24] mt-0.5 flex-shrink-0">•</span>
                        {tip}
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Save to Client ── */}
                <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#2a2a2a] bg-[#0f0f0f] flex items-center gap-3">
                    <Users className="w-4 h-4 text-[#fbbf24]" />
                    <span className="font-bold text-white text-sm">حفظ لعميل</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {pickedClient ? (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-[#fbbf24]/5 border border-[#fbbf24]/20">
                        <div className="w-8 h-8 rounded-xl bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[#fbbf24] font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                          {pickedClient.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-sm truncate">{pickedClient.name}</p>
                          <p className="text-xs text-white/40 truncate">{pickedClient.email}</p>
                        </div>
                      </div>
                    ) : clientsLoading ? (
                      <div className="flex items-center gap-2 text-white/30 text-sm py-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري تحميل العملاء...
                      </div>
                    ) : (
                      <select
                        className={sel}
                        value={selectedClient}
                        onChange={e => { setSelectedClient(e.target.value); setSaved(false) }}
                      >
                        <option value="">اختر عميلاً...</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
                        ))}
                      </select>
                    )}

                    <button
                      onClick={saveToClient}
                      disabled={!(pickedClient?.id || selectedClient) || saving}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all
                        bg-[#0a0a0a] border border-[#2a2a2a] text-white hover:border-[#fbbf24]/40 hover:text-[#fbbf24]
                        disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...</>
                      ) : saved ? (
                        <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> تم الحفظ بنجاح</>
                      ) : (
                        <><Save className="w-4 h-4" /> حفظ البرنامج للعميل</>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
