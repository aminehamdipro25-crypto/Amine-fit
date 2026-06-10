'use client'
import { Loader2, Brain, Wand2, X } from 'lucide-react'

/* ── AI Generate Modal ───────────────────────────────────────────────────── */
export default function AIGenerateModal({ form, setForm, onGenerate, onClose, loading }) {
  const goalOptions    = [{ v:'gain', l:'بناء العضلات 💪' }, { v:'loss', l:'خسارة الدهون 🔥' }, { v:'maintain', l:'الحفاظ على اللياقة ⚡' }]
  const levelOptions   = [{ v:'beginner', l:'مبتدئ' }, { v:'intermediate', l:'متوسط' }, { v:'advanced', l:'متقدم' }]
  const daysOptions    = ['2','3','4','5','6']
  const equipOptions   = [{ v:'gym', l:'صالة كاملة 🏋️' }, { v:'home', l:'منزل (دمبل+بار) 🏠' }, { v:'bodyweight', l:'بدون معدات 🤸' }]

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-[#0a0a0a] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#fbbf24]/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-[#fbbf24]" />
            </div>
            <div>
              <p className="text-white font-extrabold text-sm">توليد بالذكاء الاصطناعي</p>
              <p className="text-white/40 text-[11px]">برنامج مخصص في ثوانٍ</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">الهدف</label>
            <div className="grid grid-cols-3 gap-2">
              {goalOptions.map(o => (
                <button key={o.v} type="button" onClick={() => setForm(f => ({ ...f, goal: o.v }))}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${form.goal === o.v ? 'bg-[#0a0a0a] text-[#fbbf24] border-[#0a0a0a]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">المستوى</label>
            <div className="grid grid-cols-3 gap-2">
              {levelOptions.map(o => (
                <button key={o.v} type="button" onClick={() => setForm(f => ({ ...f, level: o.v }))}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${form.level === o.v ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">أيام التدريب / أسبوع</label>
            <div className="flex gap-2">
              {daysOptions.map(d => (
                <button key={d} type="button" onClick={() => setForm(f => ({ ...f, daysPerWeek: d }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-extrabold border transition-all ${form.daysPerWeek === d ? 'bg-[#fbbf24] text-black border-[#fbbf24]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">المعدات</label>
            <div className="grid grid-cols-3 gap-2">
              {equipOptions.map(o => (
                <button key={o.v} type="button" onClick={() => setForm(f => ({ ...f, equipment: o.v }))}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${form.equipment === o.v ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">إصابات أو قيود (اختياري)</label>
            <input value={form.injuries} onChange={e => setForm(f => ({ ...f, injuries: e.target.value }))}
              placeholder="مثال: ألم في الركبة اليسرى..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#fbbf24] transition font-medium" />
          </div>
          <button onClick={onGenerate} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0a0a0a] text-white rounded-2xl font-extrabold text-sm hover:bg-black transition disabled:opacity-60 shadow-lg">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري التوليد...</>
              : <><Wand2 className="w-4 h-4 text-[#fbbf24]" /> توليد البرنامج</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
