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

  if (success) {
    return (
      <div className="text-center py-16">
        <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto mb-6 animate-bounce" />
        <h3 className="text-2xl font-bold text-white mb-3">تم إرسال طلبك بنجاح! 🎉</h3>
        <p className="text-white/70 text-lg mb-6">سأتواصل معك خلال 24 ساعة لتحديد موعد بدء برنامجك.</p>
        <button onClick={() => setOk(false)}
          className="px-6 py-3 bg-white/20 border border-white/30 text-white font-bold rounded-2xl hover:bg-white/30 transition">
          إرسال طلب آخر
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-white/80 text-sm font-medium block mb-1.5">الاسم الكامل *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="أحمد بن علي"
            className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40
              focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/20 outline-none transition" />
        </div>
        <div>
          <label className="text-white/80 text-sm font-medium block mb-1.5">رقم الهاتف *</label>
          <input value={form.phone} onChange={e => set('phone', e.target.value)}
            placeholder="+974 3065 3759" dir="ltr" type="tel"
            className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40
              focus:bg-white/15 focus:border-white/40 outline-none transition" />
        </div>
      </div>

      <div>
        <label className="text-white/80 text-sm font-medium block mb-1.5">البريد الإلكتروني</label>
        <input value={form.email} onChange={e => set('email', e.target.value)}
          placeholder="ahmed@example.com" type="email" dir="ltr"
          className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40
            focus:bg-white/15 focus:border-white/40 outline-none transition" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-white/80 text-sm font-medium block mb-1.5">هدفك الرئيسي</label>
          <select value={form.goal} onChange={e => set('goal', e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white
              focus:bg-white/15 focus:border-white/40 outline-none transition appearance-none">
            <option value="" className="text-slate-800">اختر هدفك</option>
            {goals.map(g => <option key={g} value={g} className="text-slate-800">{g}</option>)}
          </select>
        </div>
        <div>
          <label className="text-white/80 text-sm font-medium block mb-1.5">الباقة المهتم بها</label>
          <select value={form.pkg} onChange={e => set('pkg', e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white
              focus:bg-white/15 focus:border-white/40 outline-none transition appearance-none">
            <option value="" className="text-slate-800">اختر باقة</option>
            {packages.map(p => <option key={p} value={p} className="text-slate-800">{p}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-white/80 text-sm font-medium block mb-1.5">رسالة إضافية (اختياري)</label>
        <textarea value={form.message} onChange={e => set('message', e.target.value)}
          placeholder="أخبرني أكثر عن وضعك الحالي وأهدافك..."
          rows={3}
          className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40
            focus:bg-white/15 focus:border-white/40 outline-none transition resize-none" />
      </div>

      {error && (
        <p className="text-rose-300 text-sm bg-rose-500/20 border border-rose-400/30 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-4 px-6
          bg-gradient-to-r from-primary-500 to-emerald-500
          hover:from-primary-600 hover:to-emerald-600
          disabled:opacity-60 text-white font-bold text-lg rounded-2xl
          shadow-2xl shadow-primary-900/30 hover:shadow-primary-600/40
          hover:scale-[1.02] transition-all">
        {loading
          ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري الإرسال...</>
          : <><Send className="w-5 h-5" /> أرسل طلبك الآن</>
        }
      </button>
    </form>
  )
}
