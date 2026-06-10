'use client'
import { useState, useEffect } from 'react'
import { ClipboardList, Loader2, X } from 'lucide-react'

export default function ClientTasksPanel({ clientId }) {
  const [tasks,   setTasks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [text,    setText]    = useState('')
  const [emoji,   setEmoji]   = useState('✅')
  const [adding,  setAdding]  = useState(false)
  const [delId,   setDelId]   = useState(null)

  useEffect(() => {
    fetch(`/api/admin/clients/${clientId}/tasks`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { setTasks(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [clientId])

  async function addTask(e) {
    e.preventDefault()
    if (!text.trim()) return
    setAdding(true)
    const res = await fetch(`/api/admin/clients/${clientId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim(), emoji }),
    })
    if (res.ok) {
      const d = await res.json()
      setTasks(prev => [...prev, d.task])
      setText('')
    }
    setAdding(false)
  }

  async function deleteTask(id) {
    setDelId(id)
    await fetch(`/api/admin/clients/${clientId}/tasks`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setTasks(prev => prev.filter(t => t.id !== id))
    setDelId(null)
  }

  const EMOJIS = ['✅','🏋️','🥗','💧','🧘','🚶','😴','🍎','💊','📏']

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-violet-50 rounded-xl flex items-center justify-center">
          <ClipboardList className="w-3.5 h-3.5 text-violet-500" />
        </div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">مهام العميل اليومية</h3>
        <span className="text-xs text-slate-400">({tasks.length}/10)</span>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 text-center py-3">جاري التحميل...</p>
      ) : (
        <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
          {tasks.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-2">لا توجد مهام بعد</p>
          )}
          {tasks.map(t => (
            <div key={t.id} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-slate-100">
              <span className="text-base flex-shrink-0">{t.emoji}</span>
              <span className="flex-1 text-sm text-slate-700 font-medium">{t.text}</span>
              <button
                onClick={() => deleteTask(t.id)}
                disabled={delId === t.id}
                className="text-red-400 hover:text-red-600 transition p-1 rounded-lg hover:bg-red-50 flex-shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {tasks.length < 10 && (
            <form onSubmit={addTask} className="flex gap-2 pt-1">
              <div className="flex gap-1 flex-wrap">
                {EMOJIS.map(e => (
                  <button key={e} type="button" onClick={() => setEmoji(e)}
                    className={`text-base p-1 rounded-lg transition ${emoji === e ? 'bg-violet-100' : 'hover:bg-slate-100'}`}>
                    {e}
                  </button>
                ))}
              </div>
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="نص المهمة..."
                maxLength={200}
                className="flex-1 min-w-0 text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-300"
              />
              <button type="submit" disabled={adding || !text.trim()}
                className="px-3 py-2 bg-violet-500 text-white rounded-xl text-xs font-bold hover:bg-violet-600 transition disabled:opacity-50 flex-shrink-0">
                {adding ? '...' : 'إضافة'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
