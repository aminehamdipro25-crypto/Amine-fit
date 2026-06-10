'use client'
import { useState } from 'react'
import { Key, Loader2, Mail, CheckCircle2 } from 'lucide-react'

export default function ClientAccessSection({ client, onUpdate }) {
  const [sending, setSending]   = useState(false)
  const [sentMsg, setSentMsg]   = useState('')
  const isActive = !!client.clientPassword

  async function sendActivation() {
    if (!confirm(`إرسال رمز التفعيل إلى ${client.email}؟`)) return
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
