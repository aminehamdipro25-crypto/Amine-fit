'use client'
import { useState } from 'react'
import { Bell, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'

export default function WaitingList() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [msg, setMsg] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!email || !email.includes('@')) { setMsg('أدخل بريداً إلكترونياً صحيحاً'); setStatus('error'); return }
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'خطأ')
      setStatus('done')
    } catch (err) {
      setMsg(err.message)
      setStatus('error')
    }
  }

  return (
    <section className="py-20 bg-[#0a0a0a] border-t border-white/5">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        <div className="inline-flex items-center gap-2 border border-gold-400/25 bg-gold-400/5 rounded-full px-4 py-2 mb-6">
          <Bell className="w-4 h-4 text-gold-400" />
          <span className="text-gold-400 text-xs font-extrabold uppercase tracking-wider">الأماكن محدودة</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
          لا تفوّت الإطلاق الرسمي
        </h2>
        <p className="text-white/40 text-sm leading-relaxed mb-8 font-medium max-w-md mx-auto">
          سجّل بريدك الإلكتروني لتكون من أوائل المسجلين وتحصل على عرض حصري عند الإطلاق الرسمي.
        </p>

        {status === 'done' ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-7 flex flex-col items-center gap-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            <p className="text-white font-extrabold text-lg">تم التسجيل بنجاح!</p>
            <p className="text-white/40 text-sm">سنرسل لك إشعاراً قبل الإطلاق مباشرة.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setStatus('idle'); setMsg('') }}
              placeholder="بريدك الإلكتروني"
              dir="ltr"
              className="flex-1 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:border-gold-400/50 outline-none transition text-sm font-medium"
            />
            <button type="submit" disabled={status === 'loading'}
              className="flex items-center justify-center gap-2 px-7 py-4 bg-gold-400 text-black font-extrabold rounded-2xl hover:bg-gold-300 disabled:opacity-60 transition-all shadow-lg shadow-gold-400/20 whitespace-nowrap">
              {status === 'loading'
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <><Bell className="w-4 h-4" /> أشعرني</>}
            </button>
          </form>
        )}

        {status === 'error' && msg && (
          <p className="text-red-400 text-sm font-medium mt-3">{msg}</p>
        )}

        <p className="text-white/20 text-xs mt-5 font-medium">
          لن نرسل لك سبام — فقط إشعار الإطلاق وعرض حصري للمسجلين الأوائل
        </p>
      </div>
    </section>
  )
}
