'use client'
import { useState } from 'react'
import { Send, CheckCircle, Loader2 } from 'lucide-react'

const goals = ['خسارة الوزن', 'بناء العضلات', 'الحفاظ على الوزن', 'تحسين اللياقة العامة', 'أخرى']
const packages = ['الباقة الأساسية (500 ر.ق)', 'الباقة المتقدمة (900 ر.ق)', 'الباقة الاحترافية (1,500 ر.ق)', 'لم أقرر بعد']

const init = { name: '', phone: '', email: '', goal: '', pkg: '', message: '' }

export default function ContactForm() {
  const [form, setForm]     = useState(init)
  const [loading, setLoad]  = useState(false)
  const [success, setOk]    = useState(false)
  const [error, setError]   = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    if (!form.name || !form.phone) { setError('الاسم ورقم الهاتف مطلوبان'); return }
    setLoad(true); setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setOk(true); setForm(init)
    } catch {
      setError('حدث خطأ، يرجى المحاولة مرة أخرى أو التواصل مباشرة عبر الهاتف.')
    } finally {
      setLoad(false)
    }
  }

  const inputCls = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:bg-white/8 focus:border-gold-400/50 outline-none transition text-sm font-medium"

  if (success) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gold-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-black" />
        </div>
        <h3 className="text-2xl font-extrabold text-white mb-3">تم إرسال طلبك! ⚡</h3>
        <p className="text-white/40 mb-6 font-medium">سأتواصل معك خلال 24 ساعة لتحديد موعد بدء برنامجك.</p>
        <button onClick={() => setOk(false)}
          className="px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition">
          إرسال طلب آخر
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-white/40 text-xs font-bold uppercase tracking-wide block mb-2">الاسم الكامل *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="أحمد بن علي" className={inputCls} />
        </div>
        <div>
          <label className="text-white/40 text-xs font-bold uppercase tracking-wide block mb-2">رقم الهاتف *</label>
          <input value={form.phone} onChange={e => set('phone', e.target.value)}
            placeholder="+974 3065 3759" dir="ltr" type="tel" className={inputCls} />
        </div>
      </div>

      <div>
        <label className="text-white/40 text-xs font-bold uppercase tracking-wide block mb-2">البريد الإلكتروني</label>
        <input value={form.email} onChange={e => set('email', e.target.value)}
          placeholder="ahmed@example.com" type="email" dir="ltr" className={inputCls} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-white/40 text-xs font-bold uppercase tracking-wide block mb-2">هدفك الرئيسي</label>
          <select value={form.goal} onChange={e => set('goal', e.target.value)} className={inputCls}>
            <option value="" className="text-slate-800 bg-slate-900">اختر هدفك</option>
            {goals.map(g => <option key={g} value={g} className="text-slate-800 bg-slate-900">{g}</option>)}
          </select>
        </div>
        <div>
          <label className="text-white/40 text-xs font-bold uppercase tracking-wide block mb-2">الباقة المهتم بها</label>
          <select value={form.pkg} onChange={e => set('pkg', e.target.value)} className={inputCls}>
            <option value="" className="text-slate-800 bg-slate-900">اختر باقة</option>
            {packages.map(p => <option key={p} value={p} className="text-slate-800 bg-slate-900">{p}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-white/40 text-xs font-bold uppercase tracking-wide block mb-2">رسالة إضافية (اختياري)</label>
        <textarea value={form.message} onChange={e => set('message', e.target.value)}
          placeholder="أخبرني أكثر عن وضعك الحالي وأهدافك..." rows={3}
          className={inputCls + ' resize-none'} />
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 font-medium">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-4 px-6
          bg-gold-400 hover:bg-gold-300 disabled:opacity-60
          text-black font-extrabold text-base rounded-xl
          shadow-xl shadow-gold-400/20 hover:scale-[1.01] transition-all">
        {loading
          ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري الإرسال...</>
          : <><Send className="w-5 h-5" /> أرسل طلبك الآن</>
        }
      </button>
    </form>
  )
}
