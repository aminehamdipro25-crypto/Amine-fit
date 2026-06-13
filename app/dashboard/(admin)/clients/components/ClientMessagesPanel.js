'use client'
import { useState, useEffect, useRef } from 'react'
import { Send, Loader2, MessageSquare, RefreshCw } from 'lucide-react'

const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو',
                 'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

function fmtTime(iso) {
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}
function fmtDate(iso) {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}
function shouldShowDate(messages, i) {
  if (i === 0) return true
  return new Date(messages[i-1].date).toDateString() !== new Date(messages[i].date).toDateString()
}

export default function ClientMessagesPanel({ clientId, clientName }) {
  const [messages, setMessages] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [input,    setInput]    = useState('')
  const [sending,  setSending]  = useState(false)
  const [error,    setError]    = useState('')
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  async function load() {
    try {
      const r = await fetch(`/api/admin/clients/${clientId}/messages`)
      if (r.ok) { const d = await r.json(); if (Array.isArray(d)) setMessages(d) }
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [clientId])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setError('')
    setSending(true)
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/messages`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'خطأ'); setInput(text) }
      else setMessages(prev => [...prev, data])
    } catch {
      setError('خطأ في الاتصال'); setInput(text)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const unread = messages.filter(m => m.from === 'client' && !m.read).length

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">الرسائل</h3>
          {unread > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {unread} جديد
            </span>
          )}
        </div>
        <button onClick={load} className="text-slate-400 hover:text-slate-600 transition p-1">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
        {/* Messages area */}
        <div className="p-4 space-y-1 max-h-72 overflow-y-auto" dir="rtl">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm font-medium">لا توجد رسائل بعد</p>
              <p className="text-slate-300 text-xs mt-1">أرسل رسالة ترحيبية للعميل!</p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => {
                const isAdmin = msg.from === 'admin'
                const showDate = shouldShowDate(messages, i)
                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="flex justify-center my-3">
                        <span className="bg-white border border-slate-200 text-slate-400 text-[10px] font-bold px-3 py-0.5 rounded-full">
                          {fmtDate(msg.date)}
                        </span>
                      </div>
                    )}
                    <div className={`flex mb-1 ${isAdmin ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                      <div className={`max-w-[78%] px-3 py-2 rounded-xl text-xs font-medium leading-relaxed
                        ${isAdmin
                          ? 'bg-[#0a0a0a] text-white rounded-tl-sm'
                          : 'bg-white border border-slate-100 text-slate-800 shadow-sm rounded-tr-sm'
                        }`}
                      >
                        {!isAdmin && (
                          <p className="text-[10px] font-extrabold text-amber-600 mb-0.5">{clientName}</p>
                        )}
                        {msg.text}
                        <span className={`block text-[9px] mt-0.5 ${isAdmin ? 'text-white/40' : 'text-slate-400'}`}>
                          {fmtTime(msg.date)}
                          {isAdmin && <span className="mr-1">{msg.read ? ' ✓✓' : ' ✓'}</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 bg-white flex items-end gap-2 px-3 py-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={`رد على ${clientName}...`}
            rows={1}
            maxLength={1000}
            disabled={sending}
            className="flex-1 text-xs resize-none outline-none text-slate-800 font-medium placeholder:text-slate-300 bg-transparent max-h-24"
            style={{ fieldSizing: 'content' }}
            dir="rtl"
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            className="w-7 h-7 bg-[#0a0a0a] rounded-lg flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-[#1a1a1a] transition"
          >
            {sending
              ? <Loader2 className="w-3 h-3 text-[#fbbf24] animate-spin" />
              : <Send className="w-3 h-3 text-[#fbbf24]" />
            }
          </button>
        </div>
        {error && <p className="text-xs text-red-500 font-medium text-center py-1 px-3">{error}</p>}
      </div>
    </div>
  )
}
