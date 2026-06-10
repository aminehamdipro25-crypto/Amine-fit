'use client'
import { useState } from 'react'
import { ClipboardList, Loader2, RefreshCw, CheckCircle2, X } from 'lucide-react'

export default function ProtocolSection({ client, onUpdate }) {
  const [generating, setGenerating] = useState(false)
  const [genMsg, setGenMsg]         = useState('')
  const [active, setActive]         = useState(client.labProtocol?.active ?? true)
  const [toggling, setToggling]     = useState(false)
  const proto = client.labProtocol

  async function generate() {
    if (!confirm('توليد بروتوكول المختبر لهذا العميل بالذكاء الاصطناعي؟')) return
    setGenerating(true); setGenMsg('')
    try {
      // Step 1: generate via AI
      const genRes  = await fetch('/api/ai-protocol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id }),
      })
      const genData = await genRes.json()
      if (!genRes.ok || !genData.protocol) throw new Error('فشل التوليد')

      // Step 2: save to client record
      const saveRes  = await fetch(`/api/admin/clients/${client.id}/protocol`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocol: genData.protocol }),
      })
      const saveData = await saveRes.json()
      if (!saveRes.ok) throw new Error('فشل الحفظ')

      onUpdate(client.id, { labProtocol: saveData.protocol })
      setActive(true)
      setGenMsg(`✅ تم التوليد — ${saveData.protocol.methodName}`)
    } catch (err) {
      setGenMsg(`❌ ${err.message}`)
    } finally {
      setGenerating(false)
    }
  }

  async function toggleActive(val) {
    setToggling(true)
    const res = await fetch(`/api/admin/clients/${client.id}/protocol`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: val }),
    })
    if (res.ok) {
      setActive(val)
      onUpdate(client.id, { labProtocol: { ...client.labProtocol, active: val } })
    }
    setToggling(false)
  }

  async function deleteProtocol() {
    if (!confirm('حذف بروتوكول المختبر لهذا العميل؟')) return
    await fetch(`/api/admin/clients/${client.id}/protocol`, { method: 'DELETE' })
    onUpdate(client.id, { labProtocol: null })
    setGenMsg('')
  }

  return (
    <div>
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">المختبر العلمي 🔬</h3>
      <div className="bg-slate-50 rounded-2xl p-4 space-y-3">

        {proto ? (
          <>
            {/* Current protocol card */}
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{proto.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-slate-900 text-sm" dir="ltr">{proto.methodName}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{proto.tagline}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  {active ? 'مفعّل' : 'مخفي'}
                </span>
              </div>
              {proto.weeklyStats && (
                <div className="flex gap-3 mt-3 pt-3 border-t border-slate-100">
                  <div className="text-center flex-1">
                    <p className="font-extrabold text-slate-800 text-base">{proto.weeklyStats.sessions}</p>
                    <p className="text-slate-400 text-[10px]">جلسات</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="font-extrabold text-slate-800 text-base">{proto.weeklyStats.totalMinutes}</p>
                    <p className="text-slate-400 text-[10px]">دقيقة</p>
                  </div>
                  <div className="text-center flex-1 min-w-0">
                    <p className="font-extrabold text-slate-800 text-xs leading-tight">{proto.weeklyStats.intensityProfile}</p>
                    <p className="text-slate-400 text-[10px]">توزيع</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={() => toggleActive(!active)} disabled={toggling}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition disabled:opacity-40 ${active ? 'bg-white border-slate-200 text-slate-600 hover:border-red-200 hover:text-red-500' : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'}`}>
                {toggling ? '...' : active ? 'إخفاء عن العميل' : 'تفعيل للعميل'}
              </button>
              <button onClick={generate} disabled={generating}
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-[#0a0a0a] text-white text-xs font-bold hover:bg-black transition disabled:opacity-50">
                {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '🔄 توليد جديد'}
              </button>
              <button onClick={deleteProtocol}
                className="px-3 py-2 rounded-xl border border-red-200 text-red-400 text-xs hover:bg-red-50 transition">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        ) : (
          <button onClick={generate} disabled={generating}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0a0a0a] text-white font-bold text-sm hover:bg-black transition disabled:opacity-50">
            {generating
              ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري التوليد...</>
              : <>🔬 توليد بروتوكول المختبر</>}
          </button>
        )}

        {genMsg && (
          <p className="text-xs font-bold text-center text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2">
            {genMsg}
          </p>
        )}
        <p className="text-xs text-slate-400 text-center">
          يُولَّد تلقائياً بالذكاء الاصطناعي بناءً على بيانات العميل
        </p>
      </div>
    </div>
  )
}
