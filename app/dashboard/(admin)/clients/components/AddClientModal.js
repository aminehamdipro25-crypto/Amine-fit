'use client'
import { useState } from 'react'
import { X, UserPlus, Mail, Phone, Lock, User, Loader2 } from 'lucide-react'

export default function AddClientModal({ onClose, onAdded }) {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [phone, setPhone]     = useState('')
  const [password, setPass]   = useState('')
  const [goal, setGoal]       = useState('')
  const [notes, setNotes]     = useState('')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) { setError('الاسم والبريد مطلوبان'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, goal, notes }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'حدث خطأ'); return }
      onAdded({ id: data.id, name, email, phone, goal, notes, clientPassword: password, source: 'manual', status: 'active', createdAt: new Date().toISOString() })
      onClose()
    } catch { setError('حدث خطأ، حاول مرة أخرى') }
    finally { setSaving(false) }
  }

  const inp = "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium"

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-400 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">إضافة عميل جديد</h2>
              <p className="text-xs text-slate-400 font-medium">سيتمكن العميل من تسجيل الدخول فوراً</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">الاسم الكامل *</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input value={name} onChange={e => setName(e.target.value)} placeholder="محمد أحمد" required
                  className={inp + ' pr-9'} />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">البريد الإلكتروني *</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" dir="ltr"
                  placeholder="client@email.com" required className={inp + ' pr-9'} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">رقم الهاتف</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" dir="ltr"
                    placeholder="+974..." className={inp + ' pr-9'} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input value={password} onChange={e => setPass(e.target.value)} dir="ltr"
                    placeholder="12345678" className={inp + ' pr-9'} />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">الهدف</label>
              <select value={goal} onChange={e => setGoal(e.target.value)} className={inp + ' appearance-none bg-white'}>
                <option value="">اختر الهدف (اختياري)</option>
                <option value="loss">خسارة وزن</option>
                <option value="gain">بناء عضلات</option>
                <option value="maintain">الحفاظ على الوزن</option>
                <option value="performance">أداء رياضي</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">ملاحظات (اختياري)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                placeholder="أي معلومات إضافية عن العميل..."
                className={inp + ' resize-none'} />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-medium">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition">
              إلغاء
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0a0a0a] text-white font-extrabold text-sm hover:bg-black transition disabled:opacity-50 shadow-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {saving ? 'جاري الإضافة...' : 'إضافة العميل'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
