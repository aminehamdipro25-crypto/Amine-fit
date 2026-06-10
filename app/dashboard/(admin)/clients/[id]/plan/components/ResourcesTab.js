'use client'
import { useState, useEffect } from 'react'
import { Loader2, Plus, Trash2, Paperclip } from 'lucide-react'

/* ── ResourcesTab ─────────────────────────────────────────────────────────── */
export default function ResourcesTab({ clientId }) {
  const [resList, setResList]   = useState([])
  const [resLoading, setResLoading] = useState(false)
  const [resAdding, setResAdding]   = useState(false)
  const [resForm, setResForm]   = useState({ title: '', type: 'link', url: '', fileDataUrl: '', filename: '', description: '' })

  async function fetchResources() {
    setResLoading(true)
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/resources`)
      const data = await res.json()
      setResList(data.resources || [])
    } catch {}
    finally { setResLoading(false) }
  }

  async function addResource() {
    if (!resForm.title.trim()) return
    const url = resForm.type === 'pdf' || resForm.type === 'image' ? resForm.fileDataUrl : resForm.url
    if (!url.trim()) return
    setResAdding(true)
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: resForm.title,
          type: resForm.type,
          url,
          description: resForm.description,
          filename: resForm.filename,
        }),
      })
      if (res.ok) {
        setResForm({ title: '', type: 'link', url: '', fileDataUrl: '', filename: '', description: '' })
        await fetchResources()
      }
    } catch {}
    finally { setResAdding(false) }
  }

  async function deleteResource(resourceId) {
    if (!confirm('حذف هذا الملف/الرابط؟')) return
    try {
      await fetch(`/api/admin/clients/${clientId}/resources?resourceId=${resourceId}`, { method: 'DELETE' })
      await fetchResources()
    } catch {}
  }

  function handleResFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setResForm(f => ({ ...f, fileDataUrl: ev.target.result, filename: file.name }))
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    fetchResources()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-5">

      {/* Add resource form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <h2 className="font-extrabold text-slate-800 flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-gold-500" /> إضافة ملف أو رابط
        </h2>

        {/* Title */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">العنوان *</label>
          <input
            value={resForm.title}
            onChange={e => setResForm(f => ({ ...f, title: e.target.value }))}
            placeholder="مثال: تمارين الظهر المنزلية"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium"
          />
        </div>

        {/* Type */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">النوع</label>
          <select
            value={resForm.type}
            onChange={e => setResForm(f => ({ ...f, type: e.target.value, url: '', fileDataUrl: '', filename: '' }))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium bg-white"
          >
            <option value="link">🔗 رابط</option>
            <option value="pdf">📄 PDF</option>
            <option value="video">🎬 فيديو</option>
            <option value="image">🖼️ صورة</option>
          </select>
        </div>

        {/* URL (link / video) */}
        {(resForm.type === 'link' || resForm.type === 'video') && (
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">الرابط *</label>
            <input
              dir="ltr"
              value={resForm.url}
              onChange={e => setResForm(f => ({ ...f, url: e.target.value }))}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium"
            />
          </div>
        )}

        {/* File upload (pdf / image) */}
        {(resForm.type === 'pdf' || resForm.type === 'image') && (
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
              {resForm.type === 'pdf' ? 'ملف PDF *' : 'صورة *'}
            </label>
            <input
              type="file"
              accept={resForm.type === 'pdf' ? '.pdf,application/pdf' : 'image/*'}
              onChange={handleResFileChange}
              className="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-gold-50 file:text-gold-700 file:font-bold hover:file:bg-gold-100 transition"
            />
            {resForm.filename && (
              <p className="text-xs text-emerald-600 mt-1 font-medium">✓ {resForm.filename}</p>
            )}
          </div>
        )}

        {/* Description */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">وصف (اختياري)</label>
          <textarea
            value={resForm.description}
            onChange={e => setResForm(f => ({ ...f, description: e.target.value }))}
            rows={2}
            placeholder="وصف مختصر عن المحتوى..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium resize-none"
          />
        </div>

        <button
          onClick={addResource}
          disabled={resAdding || !resForm.title.trim() || (resForm.type === 'link' || resForm.type === 'video' ? !resForm.url.trim() : !resForm.fileDataUrl)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] text-white rounded-xl font-bold text-sm hover:bg-black transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {resAdding
            ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الإضافة...</>
            : <><Plus className="w-4 h-4" /> إضافة</>
          }
        </button>
      </div>

      {/* Resources list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-slate-800 flex items-center gap-2 text-sm">
            <Paperclip className="w-4 h-4 text-gold-500" /> الملفات والروابط ({resList.length})
          </h2>
        </div>

        {resLoading ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            جاري التحميل...
          </div>
        ) : resList.length === 0 ? (
          <div className="text-center py-8 text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">
            <Paperclip className="w-7 h-7 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">لا توجد ملفات — أضف أول ملف أو رابط</p>
          </div>
        ) : (
          resList.map(r => {
            const icons = { link:'🔗', pdf:'📄', video:'🎬', image:'🖼️' }
            return (
              <div key={r.id} className="flex items-start gap-3 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                <span className="text-2xl flex-shrink-0">{icons[r.type] || '📎'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{r.title}</p>
                  {r.description && <p className="text-xs text-slate-400 mt-0.5 truncate">{r.description}</p>}
                  <span className="inline-block mt-1 text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">
                    {r.type}
                  </span>
                </div>
                <button
                  onClick={() => deleteResource(r.id)}
                  className="p-1.5 text-red-300 hover:text-red-500 transition flex-shrink-0"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
