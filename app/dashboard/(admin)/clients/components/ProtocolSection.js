'use client'
import { useState } from 'react'
import { ClipboardList, Loader2, RefreshCw, CheckCircle2, X, Bookmark, ChevronDown } from 'lucide-react'

export default function ProtocolSection({ client, onUpdate }) {
  const [generating, setGenerating] = useState(false)
  const [genMsg, setGenMsg]         = useState('')
  const [active, setActive]         = useState(client.labProtocol?.active ?? true)
  const [toggling, setToggling]     = useState(false)
  const [templates, setTemplates]   = useState(null)
  const [showTpls, setShowTpls]     = useState(false)
  const [savingTpl, setSavingTpl]   = useState(false)
  const [tplName, setTplName]       = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)
  const proto = client.labProtocol

  async function generate() {
    if (!confirm('توليد بروتوكول المختبر لهذا العميل بالذكاء الاصطناعي؟')) return
    setGenerating(true); setGenMsg('')
    try {
      const genRes  = await fetch('/api/ai-protocol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id }),
      })
      const genData = await genRes.json()
      if (!genRes.ok || !genData.protocol) throw new Error('فشل التوليد')

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

  async function loadTemplates() {
    if (templates !== null) { setShowTpls(v => !v); return }
    const res  = await fetch('/api/admin/protocol-templates')
    const data = await res.json()
    setTemplates(data.templates || [])
    setShowTpls(true)
  }

  async function applyTemplate(tpl) {
    const res = await fetch(`/api/admin/clients/${client.id}/protocol`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ protocol: tpl.protocol }),
    })
    const d = await res.json()
    if (res.ok) {
      onUpdate(client.id, { labProtocol: d.protocol })
      setActive(d.protocol.active ?? true)
      setGenMsg(`✅ تم تطبيق القالب — ${tpl.name}`)
      setShowTpls(false)
    }
  }

  async function saveAsTemplate() {
    if (!tplName.trim() || !proto) return
    setSavingTpl(true)
    const res = await fetch('/api/admin/protocol-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: tplName.trim(), protocol: proto }),
    })
    if (res.ok) {
      setGenMsg(`📋 تم الحفظ كقالب: ${tplName.trim()}`)
      setTemplates(null)
      setTplName('')
      setShowSaveForm(false)
    }
    setSavingTpl(false)
  }

  async function deleteTemplate(id, e) {
    e.stopPropagation()
    await fetch(`/api/admin/protocol-templates?id=${id}`, { method: 'DELETE' })
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div>
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">المختبر العلمي 🔬</h3>
      <div className="bg-slate-50 rounded-2xl p-4 space-y-3">

        {proto ? (
          <>
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

            <div className="flex gap-2">
              <button onClick={() => toggleActive(!active)} disabled={toggling}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition disabled:opacity-40 ${active ? 'bg-white border-slate-200 text-slate-600 hover:border-red-200 hover:text-red-500' : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'}`}>
                {toggling ? '...' : active ? 'إخفاء عن العميل' : 'تفعيل للعميل'}
              </button>
              <button onClick={generate} disabled={generating}
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-[#0a0a0a] text-white text-xs font-bold hover:bg-black transition disabled:opacity-50">
                {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '🔄 توليد جديد'}
              </button>
              <button onClick={() => setShowSaveForm(v => !v)} title="حفظ كقالب"
                className={`px-3 py-2 rounded-xl border text-xs transition ${showSaveForm ? 'bg-blue-600 text-white border-blue-600' : 'border-blue-200 text-blue-500 hover:bg-blue-50'}`}>
                <Bookmark className="w-3.5 h-3.5" />
              </button>
              <button onClick={deleteProtocol}
                className="px-3 py-2 rounded-xl border border-red-200 text-red-400 text-xs hover:bg-red-50 transition">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {showSaveForm && (
              <div className="flex gap-2">
                <input type="text" value={tplName} onChange={e => setTplName(e.target.value)}
                  placeholder="اسم القالب (مثال: برنامج الحرق المتقدم)..."
                  className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-300" />
                <button onClick={saveAsTemplate} disabled={savingTpl || !tplName.trim()}
                  className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition disabled:opacity-50">
                  {savingTpl ? '...' : 'حفظ'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-2">
            <button onClick={generate} disabled={generating}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0a0a0a] text-white font-bold text-sm hover:bg-black transition disabled:opacity-50">
              {generating
                ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري التوليد...</>
                : <>🔬 توليد بروتوكول المختبر</>}
            </button>
            <button onClick={loadTemplates}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-white transition">
              <Bookmark className="w-3.5 h-3.5 text-blue-400" />
              من قالب محفوظ
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTpls ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}

        {showTpls && (
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {!templates ? (
              <p className="text-xs text-slate-400 text-center py-3">جاري التحميل...</p>
            ) : templates.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-3">لا توجد قوالب محفوظة بعد — ولّد بروتوكولاً واحفظه</p>
            ) : templates.map(tpl => (
              <div key={tpl.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 cursor-pointer transition"
                onClick={() => applyTemplate(tpl)}>
                <span className="text-lg">{tpl.protocol?.emoji || '🔬'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-extrabold text-slate-800 truncate">{tpl.name}</p>
                  <p className="text-[10px] text-slate-400">{tpl.protocol?.methodName || ''}</p>
                </div>
                <button onClick={e => deleteTemplate(tpl.id, e)}
                  className="text-slate-300 hover:text-red-400 transition flex-shrink-0 p-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
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
