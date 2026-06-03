'use client'
import { useState, useRef, useEffect } from 'react'
import { X, ChevronLeft, Send, Loader2 } from 'lucide-react'

const WA_NUMBER = '97430653759'

const QUICK = [
  { q: 'ما هي الأسعار؟',               msg: 'ما هي الأسعار؟' },
  { q: 'كيف أبدأ البرنامج؟',           msg: 'كيف أبدأ البرنامج؟' },
  { q: 'هل يناسب المبتدئين؟',          msg: 'هل البرنامج مناسب للمبتدئين؟' },
  { q: 'كيف يتم الدفع؟',              msg: 'كيف يتم الدفع؟' },
]

function WaIcon({ cls = 'w-7 h-7 fill-white' }) {
  return (
    <svg viewBox="0 0 24 24" className={cls}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  )
}

export default function WhatsAppButton() {
  const [open, setOpen]         = useState(false)
  const [tooltip, setTooltip]   = useState(true)
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [started, setStarted]   = useState(false)
  const bottomRef               = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text) {
    const userText = text || input.trim()
    if (!userText || loading) return
    setInput('')
    setStarted(true)

    const newMessages = [...messages, { role: 'user', content: userText }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'حدث خطأ، تواصل معنا على واتساب مباشرةً.' }])
    } finally {
      setLoading(false)
    }
  }

  function openWA(msg = 'مرحباً أمين، أريد الاستفسار عن برامج التدريب والتغذية') {
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">

      {/* ── Chat panel ── */}
      {open && (
        <div className="w-80 bg-[#111] border border-white/10 rounded-3xl shadow-2xl shadow-black/70 overflow-hidden flex flex-col"
          style={{ maxHeight: '520px' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-extrabold text-sm">
                أح
              </div>
              <div>
                <p className="text-white font-extrabold text-sm leading-none mb-0.5">أمين حمدي</p>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                  <span className="text-white/80 text-xs">مساعد ذكي — يرد فوراً</span>
                </span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0" style={{ maxHeight: '300px' }}>
            {/* Greeting */}
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-600/20 flex items-center justify-center text-xs font-bold text-emerald-400 flex-shrink-0 mt-0.5">أح</div>
              <div className="bg-white/6 border border-white/8 rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[85%]">
                <p className="text-white/80 text-xs leading-relaxed">
                  مرحباً 👋 أنا المساعد الذكي لـ Amine-Fit.<br />
                  اسألني عن الأسعار، البرامج، أو طريقة التسجيل.
                </p>
              </div>
            </div>

            {/* Quick questions — shown only before starting */}
            {!started && (
              <div className="space-y-1.5">
                {QUICK.map((f, i) => (
                  <button key={i} onClick={() => send(f.msg)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white/4 hover:bg-emerald-500/10 border border-white/8 hover:border-emerald-500/30 rounded-xl text-white/60 hover:text-white text-xs font-semibold transition-all text-right">
                    <span>{f.q}</span>
                    <ChevronLeft className="w-3 h-3 flex-shrink-0 opacity-40" />
                  </button>
                ))}
              </div>
            )}

            {/* Conversation */}
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-emerald-600/20 flex items-center justify-center text-xs font-bold text-emerald-400 flex-shrink-0 mt-0.5">أح</div>
                )}
                <div className={`px-3 py-2.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-emerald-600/20 border border-emerald-500/20 text-white rounded-tr-sm'
                    : 'bg-white/6 border border-white/8 text-white/80 rounded-tl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}

            {/* Loading dots */}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-600/20 flex items-center justify-center flex-shrink-0">
                  <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                </div>
                <div className="bg-white/6 border border-white/8 rounded-2xl rounded-tl-sm px-3 py-2.5">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-2 flex-shrink-0 border-t border-white/5">
            <div className="flex gap-2 items-center">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="اكتب سؤالك..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs placeholder-white/25 outline-none focus:border-emerald-500/40 transition"
                dir="rtl"
              />
              <button onClick={() => send()}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center disabled:opacity-30 transition hover:bg-emerald-500 flex-shrink-0">
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <button onClick={() => openWA()}
              className="w-full mt-2 flex items-center justify-center gap-1.5 text-white/30 hover:text-white/60 text-xs transition">
              <WaIcon cls="w-3 h-3 fill-current" />
              تواصل مباشرةً على واتساب
            </button>
          </div>
        </div>
      )}

      {/* ── Tooltip ── */}
      {!open && tooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-white text-gray-800 text-sm font-bold px-4 py-2.5 rounded-2xl shadow-xl shadow-black/20 whitespace-nowrap animate-bounce-slow">
          <span>💬 اسألني أي سؤال</span>
          <button onClick={e => { e.stopPropagation(); setTooltip(false) }}
            className="text-gray-400 hover:text-gray-600 transition ml-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Main button ── */}
      <button
        onClick={() => { setOpen(o => !o); setTooltip(false) }}
        aria-label="تواصل عبر واتساب"
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40 hover:scale-110 transition-transform"
        style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)' }}>
        {open ? <X className="w-6 h-6 text-white" /> : <WaIcon />}
      </button>
    </div>
  )
}
