'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Zap, Mail, Lock, Loader2, Eye, EyeOff, KeyRound, ShieldCheck, Ban } from 'lucide-react'

const BG_EMOJIS = {
  left:  [
    { e: '🥗', top: '5%',  left: '3%',   size: 96, deg: -15 },
    { e: '🍎', top: '22%', left: '1%',   size: 72, deg: 10 },
    { e: '🥦', top: '45%', left: '4%',   size: 80, deg: -8 },
    { e: '🥑', top: '65%', left: '2%',   size: 70, deg: 15 },
    { e: '🍗', top: '80%', left: '8%',   size: 64, deg: -5 },
    { e: '💧', top: '12%', left: '16%',  size: 52, deg: 0 },
    { e: '🥚', top: '55%', left: '14%',  size: 48, deg: 8 },
    { e: '🫐', top: '35%', left: '10%',  size: 44, deg: -12 },
  ],
  right: [
    { e: '🏋️', top: '5%',  right: '3%',  size: 96, deg: 15 },
    { e: '💪',  top: '22%', right: '1%',  size: 72, deg: -10 },
    { e: '🔥',  top: '45%', right: '4%',  size: 80, deg: 8 },
    { e: '⚡',  top: '65%', right: '2%',  size: 70, deg: -15 },
    { e: '🏃',  top: '80%', right: '8%',  size: 64, deg: 5 },
    { e: '🎯',  top: '12%', right: '16%', size: 52, deg: 0 },
    { e: '🥊',  top: '55%', right: '14%', size: 48, deg: -8 },
    { e: '🏆',  top: '35%', right: '10%', size: 44, deg: 12 },
  ],
}

function PasswordField({ value, onChange, placeholder = '••••••••', label }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="text-white/40 text-xs font-bold uppercase tracking-wide block mb-1.5">{label}</label>
      <div className="relative">
        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
        <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} required
          className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/15 focus:border-gold-400/60 outline-none transition text-sm font-medium" />
        <button type="button" onClick={() => setShow(v => !v)}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

function ClientLoginInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState('login') // 'login' | 'activate'
  const [suspendedMsg, setSuspendedMsg] = useState('')

  useEffect(() => {
    if (searchParams.get('suspended')) {
      setSuspendedMsg(searchParams.get('msg') || 'تم تعليق حسابك، تواصل مع المدرب')
    }
  }, [searchParams])

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPw, setLoginPw]       = useState('')

  // Activation form
  const [actEmail, setActEmail]       = useState('')
  const [actCode, setActCode]         = useState('')
  const [actPw, setActPw]             = useState('')
  const [actConfirm, setActConfirm]   = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function submitLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/client/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPw }),
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

  async function submitActivation(e) {
    e.preventDefault()
    if (actPw !== actConfirm) { setError('كلمة المرور وتأكيدها غير متطابقتين'); return }
    if (actPw.length < 8)     { setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/client/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: actEmail,
          activationCode: actCode.toUpperCase().trim(),
          password: actPw,
          confirmPassword: actConfirm,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'خطأ في التفعيل'); return }
      router.push('/client/dashboard')
    } catch {
      setError('حدث خطأ، حاول مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  function switchTab(t) {
    setTab(t)
    setError('')
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #111827 50%, #0a0a0a 100%)' }}>

      {/* Background emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {BG_EMOJIS.left.map((item, i) => (
          <span key={`f${i}`} className="absolute opacity-[0.09]" style={{
            top: item.top, left: item.left, fontSize: item.size, lineHeight: 1,
            transform: `rotate(${item.deg}deg)`,
          }}>{item.e}</span>
        ))}
        {BG_EMOJIS.right.map((item, i) => (
          <span key={`g${i}`} className="absolute opacity-[0.09]" style={{
            top: item.top, right: item.right, fontSize: item.size, lineHeight: 1,
            transform: `rotate(${item.deg}deg)`,
          }}>{item.e}</span>
        ))}
        {/* Coach photo — centered between the emoji sides */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/coach-hero.jpg"
            alt=""
            className="h-full max-h-screen w-auto object-cover opacity-[0.22]"
            style={{
              objectPosition: '35% 10%',
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 85%, transparent 100%), linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
              maskComposite: 'intersect',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 85%, transparent 100%), linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
              WebkitMaskComposite: 'destination-in',
            }}
          />
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        {[20, 50, 80].map(pct => (
          <div key={pct} className="absolute opacity-[0.04]" style={{
            width: '200%', height: '1px',
            background: 'linear-gradient(90deg,transparent,#fbbf24,transparent)',
            top: `${pct}%`, left: '-50%',
            transform: 'rotate(-8deg)',
          }} />
        ))}
      </div>

      {/* Card */}
      <div className="relative w-full max-w-sm z-10">

        {/* Suspension notice */}
        {suspendedMsg && (
          <div className="flex items-start gap-3 bg-red-500/15 border border-red-500/30 rounded-2xl px-4 py-4 mb-5">
            <Ban className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-extrabold text-sm">تم تعليق حسابك</p>
              <p className="text-red-300/70 text-xs mt-1 font-medium">{suspendedMsg}</p>
              <a href="https://wa.me/97430653759"
                className="inline-block mt-2 text-xs font-bold text-red-300 hover:text-red-200 transition underline underline-offset-2">
                تواصل مع المدرب عبر واتساب ←
              </a>
            </div>
          </div>
        )}

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-gold-400/20">
            <Zap className="w-8 h-8 text-black" fill="black" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight uppercase">
            Amine<span className="text-gold-400">Fit</span>
          </h1>
          <p className="text-white/30 text-sm mt-1 font-medium">بوابة العميل الشخصية</p>
        </div>

        <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}>

          {/* Tabs */}
          <div className="flex border-b border-white/8">
            <button onClick={() => switchTab('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all
                ${tab === 'login'
                  ? 'bg-gold-400 text-black'
                  : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
              <Lock className="w-4 h-4" />
              دخول
            </button>
            <button onClick={() => switchTab('activate')}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all
                ${tab === 'activate'
                  ? 'bg-gold-400 text-black'
                  : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
              <ShieldCheck className="w-4 h-4" />
              تفعيل الحساب
            </button>
          </div>

          <div className="p-7">
            {tab === 'login' ? (
              <>
                <h2 className="text-xl font-extrabold text-white mb-1">تسجيل الدخول</h2>
                <p className="text-white/30 text-sm mb-6 font-medium">أدخل بريدك وكلمة مرورك للوصول لبرنامجك</p>
                <form onSubmit={submitLogin} className="space-y-4">
                  <div>
                    <label className="text-white/40 text-xs font-bold uppercase tracking-wide block mb-1.5">البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                        placeholder="your@email.com" dir="ltr" required
                        className="w-full pl-4 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/15 focus:border-gold-400/60 outline-none transition text-sm font-medium" />
                    </div>
                  </div>
                  <PasswordField value={loginPw} onChange={setLoginPw} label="كلمة المرور" />
                  {error && (
                    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 font-medium">{error}</p>
                  )}
                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gold-400 hover:bg-gold-300 disabled:opacity-50 text-black font-extrabold rounded-xl transition-all shadow-lg shadow-gold-400/20 mt-1">
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الدخول...</>
                      : <><Zap className="w-4 h-4" fill="black" /> دخول</>}
                  </button>
                </form>
                <p className="text-center text-white/20 text-xs mt-5 font-medium">
                  أول مرة؟{' '}
                  <button onClick={() => switchTab('activate')} className="text-gold-400 hover:text-gold-300 transition font-bold">
                    فعّل حسابك هنا
                  </button>
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-extrabold text-white mb-1">تفعيل الحساب</h2>
                <p className="text-white/30 text-sm mb-1 font-medium">أدخل الكود الذي أرسله لك المدرب وأنشئ كلمة مرورك</p>
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 mb-2">
                  <KeyRound className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <p className="text-amber-300 text-xs font-medium">كود التفعيل يُستخدم مرة واحدة فقط ثم يصبح كلمة مرورك هي وسيلة دخولك</p>
                </div>
                <div className="flex items-start gap-2 bg-blue-500/8 border border-blue-500/15 rounded-xl px-3 py-2 mb-5">
                  <Mail className="w-3.5 h-3.5 text-blue-300 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-200/60 text-xs font-medium leading-relaxed">لم تجد الإيميل؟ تحقق من مجلد <strong className="text-blue-300">Spam / البريد غير المرغوب</strong> — قد يصل متأخراً بضع دقائق</p>
                </div>
                <form onSubmit={submitActivation} className="space-y-4">
                  <div>
                    <label className="text-white/40 text-xs font-bold uppercase tracking-wide block mb-1.5">البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input type="email" value={actEmail} onChange={e => setActEmail(e.target.value)}
                        placeholder="your@email.com" dir="ltr" required
                        className="w-full pl-4 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/15 focus:border-gold-400/60 outline-none transition text-sm font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/40 text-xs font-bold uppercase tracking-wide block mb-1.5">كود التفعيل</label>
                    <div className="relative">
                      <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input type="text" value={actCode} onChange={e => setActCode(e.target.value.toUpperCase())}
                        placeholder="مثال: AB3K7M" dir="ltr" maxLength={6} required
                        className="w-full pl-4 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/15 focus:border-gold-400/60 outline-none transition text-sm font-mono tracking-widest font-bold" />
                    </div>
                  </div>
                  <PasswordField value={actPw} onChange={setActPw} label="كلمة مرور جديدة" placeholder="8 أحرف على الأقل" />
                  <PasswordField value={actConfirm} onChange={setActConfirm} label="تأكيد كلمة المرور" />
                  {error && (
                    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 font-medium">{error}</p>
                  )}
                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gold-400 hover:bg-gold-300 disabled:opacity-50 text-black font-extrabold rounded-xl transition-all shadow-lg shadow-gold-400/20 mt-1">
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري التفعيل...</>
                      : <><ShieldCheck className="w-4 h-4" /> تفعيل وإنشاء كلمة المرور</>}
                  </button>
                </form>
                <p className="text-center text-white/20 text-xs mt-5 font-medium">
                  لديك حساب مفعّل؟{' '}
                  <button onClick={() => switchTab('login')} className="text-gold-400 hover:text-gold-300 transition font-bold">
                    سجّل الدخول
                  </button>
                </p>
              </>
            )}

            {tab === 'login' && (
              <p className="text-center text-white/20 text-xs mt-2 font-medium border-t border-white/5 pt-4">
                مشكلة في الدخول؟{' '}
                <a href="tel:+97430653759" className="text-gold-400 hover:text-gold-300 transition font-bold">
                  تواصل مع المدرب
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ClientLogin() {
  return (
    <Suspense>
      <ClientLoginInner />
    </Suspense>
  )
}
