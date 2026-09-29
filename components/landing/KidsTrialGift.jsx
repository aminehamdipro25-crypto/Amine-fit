'use client'
import { useState } from 'react'
import { Gift, X, Loader2, CheckCircle2, Sparkles } from 'lucide-react'

export default function KidsTrialGift() {
  const [open, setOpen]       = useState(false)
  const [status, setStatus]   = useState('idle') // idle | saving | done | dup | error
  const [msg, setMsg]         = useState('')
  const [form, setForm]       = useState({ code: '', parentName: '', phone: '', childName: '', childAge: '', goal: '' })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const valid = form.code.trim() && form.parentName.trim() && form.phone.trim() && form.childName.trim()

  async function submit(e) {
    e?.preventDefault()
    if (!valid || status === 'saving') return
    setStatus('saving'); setMsg('')
    try {
      const res = await fetch('/api/kids-trial', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) { setStatus('done') }
      else if (res.status === 409) { setStatus('dup'); setMsg(data.message || 'سبق تسجيل هذا الرقم.') }
      else { setStatus('error'); setMsg(data.message || data.error || 'تعذّر الإرسال — حاول مجدداً') }
    } catch { setStatus('error'); setMsg('تعذّر الاتصال — تحقق من الإنترنت') }
  }

  function close() { setOpen(false); if (status !== 'saving') { setStatus('idle'); setMsg('') } }

  return (
    <section className="py-14 bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden border border-violet-400/25"
          style={{ background: 'linear-gradient(135deg,#1a1035 0%,#12082a 55%,#0a0a0a 100%)' }}>
          {/* soft decorative glow */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.15]"
            style={{ background: 'radial-gradient(circle at 15% 30%, #7C5CFC 0%, transparent 45%), radial-gradient(circle at 85% 70%, #9A7BFD 0%, transparent 45%)' }} />

          <div className="relative z-10 px-6 py-9 sm:px-10 text-center">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-violet-300 bg-violet-400/10 border border-violet-400/25 px-3 py-1 rounded-full uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5" /> برنامج تدريب الأطفال
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
              🎁 هديّة خاصّة للأولياء —{' '}
              <span className="text-violet-300">شهر مجاني تجريبي</span>{' '}لطفلك
            </h2>
            <p className="text-white/55 text-sm mt-3 max-w-2xl mx-auto leading-relaxed font-medium">
              برنامج علمي وعملي مخصّص لأطفال طيف التوحّد (ASD المستوى 1 و2)، فرط النشاط ونقص الانتباه (ADHD)،
              وصعوبات التحكّم في السلوك — جلسات فرديّة وأنشطة حركيّة حسّية لتعزيز الانتباه والتركيز والثقة بالنفس.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5 text-xs font-bold text-white/60">
              <span className="bg-white/5 border border-white/10 rounded-full px-3 py-1">✓ جلسات تدريب فرديّة</span>
              <span className="bg-white/5 border border-white/10 rounded-full px-3 py-1">✓ أنشطة حركيّة حسّية</span>
              <span className="bg-white/5 border border-white/10 rounded-full px-3 py-1">✓ تعزيز الانتباه والتركيز</span>
            </div>

            {/* Pulsing gift button */}
            <div className="relative inline-block mt-7">
              <span className="absolute inset-0 rounded-2xl bg-violet-400/40 blur-xl animate-pulse" aria-hidden="true" />
              <button
                onClick={() => { setStatus('idle'); setOpen(true) }}
                className="relative flex items-center gap-2.5 px-7 py-4 rounded-2xl font-extrabold text-base
                  bg-gradient-to-l from-violet-500 to-purple-500 text-white
                  shadow-lg shadow-violet-400/30 hover:scale-[1.03] active:scale-95 transition-transform
                  animate-[bounce_2.5s_ease-in-out_infinite]">
                <Gift className="w-5 h-5" />
                احجز شهرك المجاني الآن
              </button>
            </div>
            <p className="text-white/30 text-[11px] mt-3 font-medium">مقاعد محدودة — الجلسات حضوريّة</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={close}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" dir="rtl" onClick={e => e.stopPropagation()}>
            <div className="relative px-6 py-5 text-center" style={{ background: 'linear-gradient(135deg,#6B46F0,#7C5CFC)' }}>
              <button onClick={close} className="absolute top-3 left-3 text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
              <div className="text-4xl mb-1">🎁</div>
              <h3 className="text-white font-extrabold text-lg">تجربة مجانية لمدة شهر كامل لطفلك</h3>
              <p className="text-white/80 text-xs font-medium mt-1">املأ البيانات وسيتواصل معك المدرب أمين لتحديد أول جلسة</p>
            </div>

            {status === 'done' ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-14 h-14 text-purple-500 mx-auto mb-3" />
                <p className="font-extrabold text-slate-800 text-lg mb-1">تم تسجيل طلبك! 🎉</p>
                <p className="text-slate-500 text-sm">سيتواصل معك المدرب أمين قريباً عبر الواتساب لتأكيد موعد الجلسة المجانية.</p>
                <button onClick={close} className="mt-5 px-6 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl">إغلاق</button>
              </div>
            ) : status === 'dup' ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-extrabold text-slate-800 mb-1">رقمك مسجّل مسبقاً</p>
                <p className="text-slate-500 text-sm">{msg}</p>
                <button onClick={close} className="mt-5 px-6 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl">إغلاق</button>
              </div>
            ) : (
              <form onSubmit={submit} className="p-6 space-y-3">
                <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-3">
                  <label className="text-xs font-extrabold text-violet-700 block mb-1">🔑 كود الدعوة *</label>
                  <input value={form.code} onChange={e => set('code', e.target.value)} placeholder="الكود الذي أرسله لك المدرب"
                    className="w-full px-3 py-2.5 rounded-xl border border-violet-200 text-sm outline-none focus:border-violet-400 transition text-center font-bold tracking-widest" />
                  <p className="text-[10px] text-violet-600/80 mt-1">هذه التجربة حصريّة لعملاء الجلسات الحضوريّة — استخدم الكود الذي حصلت عليه من المدرب.</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">اسم الولي *</label>
                  <input value={form.parentName} onChange={e => set('parentName', e.target.value)} placeholder="مثال: أحمد بن علي"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400 transition" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">رقم الهاتف / واتساب *</label>
                  <input value={form.phone} onChange={e => set('phone', e.target.value)} type="tel" dir="ltr" placeholder="+974 ..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400 transition text-right" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">اسم الطفل *</label>
                    <input value={form.childName} onChange={e => set('childName', e.target.value)} placeholder="اسم الطفل"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400 transition" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">العمر</label>
                    <input value={form.childAge} onChange={e => set('childAge', e.target.value)} type="number" min="1" max="18" placeholder="سنوات"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400 transition" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">حالة الطفل أو الهدف من الجلسة (اختياري)</label>
                  <textarea value={form.goal} onChange={e => set('goal', e.target.value)} rows={2} maxLength={400}
                    placeholder="مثال: طيف توحّد مستوى 1 — تعزيز التركيز والتواصل"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400 transition resize-none" />
                </div>
                {status === 'error' && <p className="text-red-500 text-xs font-bold bg-red-50 rounded-lg px-3 py-2">⚠️ {msg}</p>}
                <button type="submit" disabled={!valid || status === 'saving'}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-l from-violet-500 to-purple-500 text-white font-extrabold text-sm disabled:opacity-40 hover:brightness-110 transition">
                  {status === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                  تأكيد الحجز والتواصل
                </button>
                <p className="text-[10px] text-slate-400 text-center">بياناتك تُستخدم للتواصل معك فقط — لا تُشارك مع أي جهة.</p>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
