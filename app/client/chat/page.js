'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2, MessageCircle, RefreshCw } from 'lucide-react'

const SUGGESTIONS = [
  'كيف أحسّن جودة نومي لتعزيز التعافي؟',
  'ما هو الوقت الأفضل لتناول البروتين بعد التمرين؟',
  'كيف أحافظ على عضلاتي أثناء خسارة الوزن؟',
  'ما الفرق بين الكربوهيدرات البسيطة والمعقدة؟',
  'كيف أتعامل مع نقطة التوقف عن فقدان الوزن؟',
  'ما هي أفضل الأطعمة قبل التمرين وبعده؟',
]

function MsgBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#0a0a0a] flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-[#fbbf24] text-sm font-extrabold">A</span>
        </div>
      )}
      <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed
        ${isUser
          ? 'bg-[#0a0a0a] text-white rounded-tl-sm'
          : 'bg-white border border-slate-100 shadow-sm text-slate-800 rounded-tr-sm'
        }`}
        dir="rtl"
      >
        {msg.content}
      </div>
    </div>
  )
}

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [initialized, setInit]  = useState(false)
  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)

  // Auth check
  useEffect(() => {
    fetch('/api/client/me')
      .then(r => { if (!r.ok) router.push('/client/login') })
      .finally(() => setInit(true))
  }, [router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text) {
    const content = (text || input).trim()
    if (!content || loading) return

    setInput('')
    setError('')
    const newMessages = [...messages, { role: 'user', content }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch('/api/client/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'حدث خطأ — حاول مجدداً')
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
      }
    } catch {
      setError('تعذّر الاتصال بالخادم — تحقق من اتصالك')
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  if (!initialized) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-2 border-[#fbbf24] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-2xl mx-auto" dir="rtl">

      {/* Header */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <div className="w-10 h-10 bg-[#0a0a0a] rounded-2xl flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-[#fbbf24]" />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">بوابتك الشخصية</p>
          <h1 className="text-xl font-extrabold text-slate-900">مساعدي 💬</h1>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="mr-auto flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            محادثة جديدة
          </button>
        )}
      </div>

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 mb-4 flex-shrink-0">
        <p className="text-xs text-amber-700 font-medium leading-relaxed">
          <strong>مساعدك المتخصص</strong> في التغذية واللياقة البدنية — اسأله عن مفاهيم التغذية، التمارين، والتعافي.
          لتعديل خطتك الغذائية تواصل مع المدرب أمين مباشرة.
        </p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">

        {messages.length === 0 ? (
          <div className="space-y-4">
            {/* Welcome */}
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-[#0a0a0a] flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-[#fbbf24] text-sm font-extrabold">A</span>
              </div>
              <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-tr-sm px-4 py-3 max-w-[78%]">
                <p className="text-sm font-medium text-slate-800 leading-relaxed">
                  مرحباً! أنا مساعدك المتخصص في التغذية واللياقة البدنية. 💪
                  <br /><br />
                  يمكنني مساعدتك في فهم مفاهيم التغذية، شرح التمارين، والإجابة على أسئلتك الصحية العامة.
                  ما الذي تودّ معرفته؟
                </p>
              </div>
            </div>

            {/* Suggestions */}
            <div className="space-y-2 pr-10">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">أسئلة مقترحة</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s)}
                    disabled={loading}
                    className="text-right px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm text-slate-600 font-medium hover:border-[#fbbf24] hover:bg-amber-50 transition-all shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => <MsgBubble key={i} msg={msg} />)
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0a0a0a] flex items-center justify-center flex-shrink-0">
              <span className="text-[#fbbf24] text-sm font-extrabold">A</span>
            </div>
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-tr-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm font-medium text-center">
            ⚠️ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-white border border-slate-200 rounded-2xl flex items-end gap-2 p-2 shadow-sm">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="اكتب سؤالك هنا..."
          rows={1}
          maxLength={600}
          disabled={loading}
          className="flex-1 px-3 py-2 text-sm resize-none outline-none text-slate-800 font-medium placeholder:text-slate-300 bg-transparent max-h-32"
          style={{ fieldSizing: 'content' }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="w-9 h-9 bg-[#0a0a0a] rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-[#1a1a1a] transition"
        >
          {loading
            ? <Loader2 className="w-4 h-4 text-[#fbbf24] animate-spin" />
            : <Send className="w-4 h-4 text-[#fbbf24]" />
          }
        </button>
      </div>

      <p className="text-center text-[10px] text-slate-300 font-medium mt-2 flex-shrink-0">
        الحد: 15 رسالة في الساعة
      </p>
    </div>
  )
}
