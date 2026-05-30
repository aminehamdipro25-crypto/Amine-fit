'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'

export default function ClientLogin() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/client/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'خطأ في تسجيل الدخول'); return }
      router.push('/client/dashboard')
    } catch {
      setError('حدث خطأ، حاول مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4"
      style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px', backgroundBlendMode: 'overlay', opacity: 1 }}>
      <div className="absolute inset-0 bg-[#0a0a0a]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gold-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-gold-400/20">
            <Zap className="w-8 h-8 text-black" fill="black" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight uppercase">
            Amine<span className="text-gold-400">Fit</span>
          </h1>
          <p className="text-white/30 text-sm mt-1 font-medium">بوابة العميل الشخصية</p>
        </div>

        {/* Card */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-8">
          <h2 className="text-xl font-extrabold text-white mb-1">تسجيل الدخول</h2>
          <p className="text-white/30 text-sm mb-7 font-medium">أدخل بياناتك للوصول لبرنامجك</p>

          <form onSubmit={submit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-white/40 text-xs font-bold uppercase tracking-wide block mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" dir="ltr" required
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/15 focus:border-gold-400/50 focus:bg-white/8 outline-none transition text-sm font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-white/40 text-xs font-bold uppercase tracking-wide block mb-2">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/15 focus:border-gold-400/50 focus:bg-white/8 outline-none transition text-sm font-medium"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 font-medium">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gold-400 hover:bg-gold-300 disabled:opacity-50 text-black font-extrabold rounded-xl transition-all shadow-lg shadow-gold-400/20 mt-2">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الدخول...</>
                : <><Zap className="w-4 h-4" fill="black" /> دخول</>
              }
            </button>
          </form>

          <p className="text-center text-white/20 text-xs mt-6 font-medium">
            مشكلة في الدخول؟{' '}
            <a href="tel:+97430653759" className="text-gold-400 hover:text-gold-300 transition">
              تواصل مع المدرب
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
