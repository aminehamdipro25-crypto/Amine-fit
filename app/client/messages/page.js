'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2, MessageSquare, RefreshCw } from 'lucide-react'
import { SkeletonMessages } from '@/components/SkeletonLoader'

const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو',
                 'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

function fmtTime(iso) {
  const d = new Date(iso)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

function fmtDate(iso) {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

function shouldShowDate(messages, idx) {
  if (idx === 0) return true
  const prev = new Date(messages[idx - 1].date).toDateString()
  const curr = new Date(messages[idx].date).toDateString()
  return prev !== curr
}

const QUEUE_KEY = 'af_msg_queue'

function loadQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') } catch { return [] }
}
function saveQueue(q) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)) } catch {}
}

export default function MessagesPage() {
  const router      = useRouter()
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(true)
  const [sending, setSending]   = useState(false)
  const [error, setError]       = useState('')
  const [isOnline, setIsOnline] = useState(true)
  const [pendingMsgs, setPendingMsgs] = useState([])
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)
  const flushingRef = useRef(false)

  async function load() {
    try {
      const r = await fetch('/api/client/messages')
      if (r.status === 401) { router.push('/client/login'); return }
      const data = await r.json()
      if (Array.isArray(data)) setMessages(data)
    } catch {}
    finally { setLoading(false) }
  }

  async function flushQueue() {
    if (flushingRef.current) return
    const queue = loadQueue()
    if (!queue.length) return
    flushingRef.current = true
    const failed = []
    for (const item of queue) {
      try {
        const res = await fetch('/api/client/messages', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: item.text }),
        })
        if (res.ok) {
          const msg = await res.json()
          setMessages(prev => [...prev.filter(m => m.id !== item.tempId), msg])
          setPendingMsgs(prev => prev.filter(m => m.tempId !== item.tempId))
        } else { failed.push(item) }
      } catch { failed.push(item) }
    }
    saveQueue(failed)
    flushingRef.current = false
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    // Restore any pending messages from queue into UI
    const queue = loadQueue()
    if (queue.length) {
      const pending = queue.map(q => ({
        id: q.tempId, tempId: q.tempId, from: 'client',
        text: q.text, date: q.date, pending: true,
      }))
      setPendingMsgs(pending)
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pendingMsgs])

  // Poll for new messages every 30 seconds
  useEffect(() => {
    const iv = setInterval(load, 30000)
    return () => clearInterval(iv)
  }, [])

  // Online/offline detection + SW message listener
  useEffect(() => {
    setIsOnline(navigator.onLine)
    const goOnline = () => { setIsOnline(true); setError(''); flushQueue() }
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)

    // Listen for SW background sync trigger
    const onSwMsg = e => { if (e.data?.type === 'FLUSH_MESSAGE_QUEUE') flushQueue() }
    navigator.serviceWorker?.addEventListener('message', onSwMsg)

    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
      navigator.serviceWorker?.removeEventListener('message', onSwMsg)
    }
  }, [])

  async function send() {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setError('')

    // Optimistically add message to UI
    const tempId = `temp-${Date.now()}`
    const tempMsg = { id: tempId, tempId, from: 'client', text, date: new Date().toISOString(), pending: !isOnline }

    if (!isOnline) {
      // Queue for later
      const queue = loadQueue()
      queue.push({ tempId, text, date: tempMsg.date })
      saveQueue(queue)
      setPendingMsgs(prev => [...prev, tempMsg])
      // Register background sync if supported
      navigator.serviceWorker?.ready.then(reg => {
        reg.sync?.register('af-send-messages').catch(() => {})
      }).catch(() => {})
      return
    }

    setMessages(prev => [...prev, tempMsg])
    setSending(true)
    try {
      const res = await fetch('/api/client/messages', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessages(prev => prev.filter(m => m.id !== tempId))
        setError(data.error || 'حدث خطأ')
        setInput(text)
      } else {
        setMessages(prev => prev.map(m => m.id === tempId ? data : m))
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId))
      setError('تعذّر الإرسال — تحقق من اتصالك')
      setInput(text)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  if (loading) return <SkeletonMessages />

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-2xl mx-auto" dir="rtl">

      {/* Header */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <div className="w-10 h-10 bg-[#0a0a0a] rounded-2xl flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-[#fbbf24]" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">بوابتك الشخصية</p>
          <h1 className="text-xl font-extrabold text-slate-900">رسائلي 📩</h1>
        </div>
        <button onClick={load} className="text-slate-400 hover:text-slate-600 transition p-2">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Info */}
      <div className="bg-[#0a0a0a] rounded-2xl px-4 py-3 mb-4 flex-shrink-0 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gold-400 flex items-center justify-center text-black font-extrabold text-sm flex-shrink-0">
          أ
        </div>
        <div>
          <p className="text-white font-extrabold text-sm">المدرب أمين حمدي</p>
          <p className="text-white/40 text-xs font-medium">يرد عادةً خلال 24 ساعة</p>
        </div>
      </div>

      {/* Offline banner */}
      {!isOnline && (
        <div className="flex-shrink-0 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-2 flex items-center gap-2">
          <span className="text-amber-600 font-bold text-xs">📡 أنت غير متصل — ستُرسل الرسائل تلقائياً عند عودة الاتصال</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-1 pb-4">
        {messages.length === 0 && pendingMsgs.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-5xl">👋</p>
            <p className="font-extrabold text-slate-700">ابدأ محادثة مع مدربك</p>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
              اسأل عن خطتك، استفسر عن تمرين، أو أخبره بأي شيء تودّ مشاركته
            </p>
          </div>
        ) : (
          <>
          {messages.map((msg, i) => {
            const isClient = msg.from === 'client'
            const showDate = shouldShowDate(messages, i)
            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full">
                      {fmtDate(msg.date)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isClient ? 'flex-row-reverse' : 'flex-row'} gap-2 mb-1`}>
                  {!isClient && (
                    <div className="w-7 h-7 rounded-full bg-[#0a0a0a] flex items-center justify-center flex-shrink-0 self-end mb-1">
                      <span className="text-[#fbbf24] text-xs font-extrabold">أ</span>
                    </div>
                  )}
                  <div className={`max-w-[75%] space-y-0.5 ${isClient ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed
                      ${isClient
                        ? 'bg-[#0a0a0a] text-white rounded-tl-sm'
                        : 'bg-white border border-slate-100 shadow-sm text-slate-800 rounded-tr-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-300 font-medium px-1">
                      {fmtTime(msg.date)}
                      {isClient && (
                        <span className="mr-1">{msg.pending ? ' ⏳' : msg.read ? ' ✓✓' : ' ✓'}</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
          {pendingMsgs.map(msg => (
            <div key={msg.tempId} className="flex flex-row-reverse gap-2 mb-1">
              <div className="max-w-[75%] space-y-0.5 items-end flex flex-col">
                <div className="px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed bg-[#0a0a0a]/70 text-white/70 rounded-tl-sm border border-white/10">
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-300 font-medium px-1">
                  {fmtTime(msg.date)} <span className="mr-1">⏳ في الانتظار</span>
                </span>
              </div>
            </div>
          ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="flex-shrink-0 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-red-600 text-sm font-medium mb-2">
          ⚠️ {error}
          <button onClick={load} className="mt-3 px-4 py-2 bg-[#fbbf24] text-black font-bold rounded-xl text-sm block">إعادة المحاولة</button>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 bg-white border border-slate-200 rounded-2xl flex items-end gap-2 p-2 shadow-sm">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="اكتب رسالتك للمدرب..."
          rows={1}
          maxLength={500}
          disabled={sending}
          className="flex-1 px-3 py-2 text-sm resize-none outline-none text-slate-800 font-medium placeholder:text-slate-300 bg-transparent max-h-32"
          style={{ fieldSizing: 'content' }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          className="w-9 h-9 bg-[#0a0a0a] rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-[#1a1a1a] transition"
        >
          {sending
            ? <Loader2 className="w-4 h-4 text-[#fbbf24] animate-spin" />
            : <Send className="w-4 h-4 text-[#fbbf24]" />
          }
        </button>
      </div>
      <p className="text-center text-[10px] text-slate-300 font-medium mt-2 flex-shrink-0">
        Enter للإرسال • Shift+Enter لسطر جديد
      </p>
    </div>
  )
}
