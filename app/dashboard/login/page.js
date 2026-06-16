'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Lock, Loader2, Eye, EyeOff, Shield } from 'lucide-react'

export default function DashboardLogin() {
  const router = useRouter()
  const [password,     setPassword]     = useState('')
  const [showPw,       setShowPw]       = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  // 2FA state
  const [step,         setStep]         = useState('password')  // 'password' | 'otp'
  const [pendingToken, setPendingToken] = useState('')
  const [otp,          setOtp]          = useState('')

  async function submitPassword(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/dashboard/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const d = await res.json()
      if (!res.ok) { setError(d.error || 'كلمة المرور غير صحيحة'); return }
      if (d.step === '2fa') {
        setPendingToken(d.pending)
        setStep('otp')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('حدث خطأ، حاول مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  async function submitOtp(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/dashboard/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pending: pendingToken, otp }),
      })
      const d = await res.json()
      if (!res.ok) { setError(d.error || 'رمز غير صحيح'); return }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('حدث خطأ، حاول مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  const decorEmojis = [
    { e: '🏋️', top: '8%',  left: '4%',  size: 80, deg: -15 },
    { e: '📊', top: '15%', right: '6%', size: 64, deg: 10 },
    { e: '💪',  top: '55%', left: '3%',  size: 72, deg: 8 },
    { e: '🎯',  top: '60%', right: '4%', size: 68, deg: -12 },
    { e: '⚡',  top: '80%', left: '20%', size: 52, deg: 0 },
    { e: '🏆',  top: '25%', left: '20%', size: 48, deg: -5 },
  ]

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #111827 50%, #0a0a0a 100%)' }}>

      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {decorEmojis.map((item, i) => (
          <span key={i} className="absolute opacity-[0.07]" style={{
            top: item.top, left: item.left, right: item.right,
            fontSize: item.size, lineHeight: 1,
            transform: `rotate(${item.deg}deg)`,
          }}>{item.e}</span>
        ))}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative w-full max-w-sm z-10">
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl transition-all duration-300 ${
            step === 'otp' ? 'bg-blue-500 shadow-blue-500/20' : 'bg-gold-400 shadow-gold-400/20'
          }`}>
            {step === 'otp'
              ? <Shield className="w-8 h-8 text-white" />
              : <Zap className="w-8 h-8 text-black" fill="black" />
            }
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight uppercase">
            Amine<span className="text-gold-400">Fit</span>
          </h1>
          <p className="text-white/30 text-sm mt-1 font-medium">لوحة تحكم المدرب</p>
        </div>

        <div className="rounded-2xl p-7 border border-white/8" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}>

          {step === 'password' ? (
            <>
              <h2 className="text-xl font-extrabold text-white mb-1">دخول المدرب</h2>
              <p className="text-white/30 text-sm mb-4 font-medium">
                هذه بوابة خاصة بالمدرب أمين فقط — لا تحتاج إلى بريد إلكتروني، فقط كلمة المرور
              </p>
              <form onSubmit={submitPassword} className="space-y-4">
                <div>
                  <label className="text-white/40 text-xs font-bold uppercase tracking-wide block mb-1.5">كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input type={showPw ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/15 focus:border-gold-400/60 outline-none transition text-sm font-medium" />
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
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gold-400 hover:bg-gold-300 disabled:opacity-50 text-black font-extrabold rounded-xl transition-all shadow-lg shadow-gold-400/20">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الدخول...</>
                    : <><Zap className="w-4 h-4" fill="black" /> دخول</>
                  }
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-extrabold text-white mb-1">التحقق الثنائي</h2>
              <p className="text-white/40 text-sm mb-4 font-medium">
                تم إرسال رمز التحقق إلى تيليغرام — أدخله هنا للمتابعة
              </p>
              <form onSubmit={submitOtp} className="space-y-4">
                <div>
                  <label className="text-white/40 text-xs font-bold uppercase tracking-wide block mb-1.5">رمز التحقق (6 أرقام)</label>
                  <input
                    type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
                    value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000" required autoFocus
                    className="w-full text-center tracking-[0.4em] py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xl font-extrabold placeholder-white/15 focus:border-blue-400/60 outline-none transition"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 font-medium">
                    {error}
                  </p>
                )}

                <button type="submit" disabled={loading || otp.length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-extrabold rounded-xl transition-all">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري التحقق...</>
                    : <><Shield className="w-4 h-4" /> تحقق</>
                  }
                </button>

                <button type="button" onClick={() => { setStep('password'); setError(''); setOtp(''); setPendingToken('') }}
                  className="w-full text-center text-white/30 text-xs font-medium hover:text-white/50 transition mt-1">
                  ← العودة لكلمة المرور
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
