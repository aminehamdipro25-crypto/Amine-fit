'use client'
import { useState } from 'react'
import { Key, Loader2, Mail, CheckCircle2, Pencil, X, Check } from 'lucide-react'

export default function ClientAccessSection({ client, onUpdate }) {
  const [sending, setSending]   = useState(false)
  const [sentMsg, setSentMsg]   = useState('')
  const isActive = !!client.clientPassword

  // ── Email correction ──
  const [editingEmail, setEditingEmail] = useState(false)
  const [newEmail, setNewEmail]         = useState(client.email || '')
  const [savingEmail, setSavingEmail]   = useState(false)
  const [emailErr, setEmailErr]         = useState('')

  async function saveEmail() {
    const val = newEmail.trim().toLowerCase()
    if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { setEmailErr('بريد إلكتروني غير صالح'); return }
    if (val === (client.email || '').toLowerCase()) { setEditingEmail(false); return }
    setSavingEmail(true)
    setEmailErr('')
    try {
      const res  = await fetch(`/api/admin/clients/${client.id}/email`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: val }),
      })
      const data = await res.json()
      if (res.ok) {
        onUpdate(client.id, { email: data.email })
        setEditingEmail(false)
      } else {
        setEmailErr(data.error || 'تعذّر التحديث')
      }
    } catch {
      setEmailErr('خطأ في الاتصال')
    } finally {
      setSavingEmail(false)
    }
  }

  async function sendActivation() {
    const warn = isActive
      ? `⚠️ تنبيه: هذا الحساب مفعّل بالفعل وللعميل كلمة مرور.\n\nإعادة إرسال رمز التفعيل ستُلغي كلمة مروره الحالية ويجب أن يُفعّل الحساب من جديد.\n\nإن كان العميل يريد فقط استعادة كلمة المرور، اطلب منه استخدام "نسيت كلمة المرور".\n\nهل تريد فعلاً إرسال رمز تفعيل جديد إلى ${client.email}؟`
      : `إرسال رمز التفعيل إلى ${client.email}؟`
    if (!confirm(warn)) return
    setSending(true)
    setSentMsg('')
    try {
      const res  = await fetch(`/api/dashboard/approve/${client.id}`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        onUpdate(client.id, { status: 'active' })
        if (data.emailSent) {
          setSentMsg(`✅ تم إرسال الإيميل — الكود: ${data.activationCode}`)
        } else {
          setSentMsg(`⚠️ الكود: ${data.activationCode} — فشل الإيميل، شارك الكود عبر واتساب`)
        }
      } else {
        setSentMsg('❌ فشل الإرسال — حاول مرة أخرى')
      }
    } catch {
      setSentMsg('❌ خطأ في الاتصال')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">وصول العميل</h3>
      <div className="bg-slate-50 rounded-2xl p-4 space-y-3">

        {/* Status */}
        <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${
          isActive ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-bold ${isActive ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isActive ? 'الحساب مفعّل — العميل يمكنه تسجيل الدخول' : 'الحساب بانتظار التفعيل'}
            </p>
            {!isActive && (
              <p className="text-xs text-amber-600 mt-0.5">
                أرسل رمز التفعيل وسيضبط العميل كلمة مروره بنفسه
              </p>
            )}
          </div>
        </div>

        {/* Email — with inline correction (fixes typos made at registration) */}
        <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5">
          {!editingEmail ? (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">البريد الإلكتروني</p>
                <p className="text-sm font-bold text-slate-700 truncate" dir="ltr">{client.email || '— غير مسجّل —'}</p>
              </div>
              <button
                onClick={() => { setNewEmail(client.email || ''); setEmailErr(''); setEditingEmail(true) }}
                className="flex items-center gap-1 text-xs font-bold text-[#0a0a0a] hover:text-black bg-slate-100 hover:bg-slate-200 rounded-lg px-2.5 py-1.5 transition flex-shrink-0">
                <Pencil className="w-3 h-3" /> تصحيح
              </button>
            </div>
          ) : (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">تصحيح البريد الإلكتروني</p>
              <div className="flex items-center gap-2">
                <input
                  type="email" dir="ltr" value={newEmail}
                  onChange={e => { setNewEmail(e.target.value); setEmailErr('') }}
                  onKeyDown={e => e.key === 'Enter' && saveEmail()}
                  placeholder="correct@email.com"
                  className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#fbbf24]"
                  autoFocus
                />
                <button onClick={saveEmail} disabled={savingEmail}
                  className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-500 transition disabled:opacity-50">
                  {savingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button onClick={() => { setEditingEmail(false); setEmailErr('') }} disabled={savingEmail}
                  className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {emailErr && <p className="text-xs font-bold text-red-500 mt-1.5">{emailErr}</p>}
              <p className="text-[10px] text-slate-400 mt-1.5">
                سيُحدَّث فهرس الدخول تلقائياً — يستطيع العميل التفعيل/الدخول بالبريد الجديد فوراً
              </p>
            </div>
          )}
        </div>

        {/* Send activation button */}
        {client.email && (
          <div className="space-y-2">
            <button
              onClick={sendActivation} disabled={sending}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0a0a0a] text-white font-bold text-sm hover:bg-black transition disabled:opacity-50">
              {sending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><Mail className="w-4 h-4" /> {isActive ? 'إعادة إرسال رمز التفعيل' : 'إرسال رمز التفعيل للعميل'}</>}
            </button>
            {sentMsg && (
              <div>
                <p className="text-xs font-bold text-center text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 select-all">
                  {sentMsg}
                </p>
                {sentMsg.startsWith('✅') && (
                  <p className="text-[10px] text-amber-600 text-center mt-1.5 font-medium">
                    إذا لم يصل الإيميل — اطلب من العميل التحقق من مجلد Spam
                  </p>
                )}
              </div>
            )}
            <p className="text-xs text-slate-400 text-center">
              سيصل الرمز إلى: <span className="text-slate-600 font-bold" dir="ltr">{client.email}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

