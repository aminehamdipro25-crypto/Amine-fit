'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Utensils, Dumbbell, Zap, ArrowLeft, Clock, CheckCircle2, User } from 'lucide-react'

const goalLabels = {
  loss: 'خسارة وزن', gain: 'بناء عضلات',
  maintain: 'الحفاظ على الوزن', performance: 'أداء رياضي',
}

export default function ClientDashboard() {
  const router = useRouter()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/client/me')
      .then(r => {
        if (r.status === 401) { router.push('/client/login'); return null }
        return r.json()
      })
      .then(d => { if (d) setClient(d) })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!client) return null

  const hasPlan = !!client.plan
  const hasNutrition = hasPlan && !!client.plan?.nutrition
  const hasTraining  = hasPlan && !!client.plan?.training

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* Welcome */}
      <div className="bg-[#0a0a0a] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -left-4 -top-4 w-32 h-32 bg-gold-400/6 rounded-full" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-2">بوابتك الشخصية</p>
            <h1 className="text-2xl font-extrabold text-white">
              مرحباً، <span className="text-gold-400">{client.name?.split(' ')[0]}</span> ⚡
            </h1>
            <p className="text-white/30 text-sm mt-2 font-medium">
              {hasPlan ? 'برنامجك جاهز — ابدأ رحلتك اليوم' : 'برنامجك قيد الإعداد — سيُرسَل لك قريباً'}
            </p>
          </div>
          <div className="w-14 h-14 bg-gold-400 rounded-2xl flex items-center justify-center text-black font-extrabold text-2xl flex-shrink-0 shadow-lg shadow-gold-400/20">
            {client.name?.[0] ?? '؟'}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'الوزن الحالي',   val: client.weight   ? `${client.weight} كغ` : '—' },
          { label: 'الوزن المستهدف', val: client.targetWeight ? `${client.targetWeight} كغ` : '—' },
          { label: 'الطول',          val: client.height   ? `${client.height} سم` : '—' },
          { label: 'العمر',          val: client.age      ? `${client.age} سنة`   : '—' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
            <p className="text-2xl font-extrabold text-slate-900">{s.val}</p>
            <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Nutrition */}
        <Link href="/client/plan/nutrition"
          className={`group rounded-2xl p-6 border transition-all hover:-translate-y-0.5 hover:shadow-lg
            ${hasNutrition ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5 cursor-default pointer-events-none'}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4
            ${hasNutrition ? 'bg-gold-50' : 'bg-white/5'}`}>
            <Utensils className={`w-6 h-6 ${hasNutrition ? 'text-gold-600' : 'text-white/20'}`} />
          </div>
          <h3 className={`font-extrabold text-lg mb-1 ${hasNutrition ? 'text-slate-900' : 'text-white/30'}`}>
            الخطة الغذائية
          </h3>
          <p className={`text-sm font-medium ${hasNutrition ? 'text-slate-500' : 'text-white/20'}`}>
            {hasNutrition
              ? `${client.plan.nutrition.calories} سعرة • ${client.plan.nutrition.meals?.length ?? 0} وجبات`
              : 'قيد الإعداد من المدرب'}
          </p>
          {hasNutrition && (
            <div className="flex items-center gap-1 mt-4 text-gold-600 text-sm font-bold">
              عرض الخطة <ArrowLeft className="w-4 h-4" />
            </div>
          )}
          {!hasNutrition && (
            <div className="flex items-center gap-1 mt-4 text-white/20 text-sm font-medium">
              <Clock className="w-4 h-4" /> قريباً
            </div>
          )}
        </Link>

        {/* Training */}
        <Link href="/client/plan/training"
          className={`group rounded-2xl p-6 border transition-all hover:-translate-y-0.5 hover:shadow-lg
            ${hasTraining ? 'bg-white border-slate-100 shadow-sm' : 'bg-white/5 border-white/5 cursor-default pointer-events-none'}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4
            ${hasTraining ? 'bg-slate-100' : 'bg-white/5'}`}>
            <Dumbbell className={`w-6 h-6 ${hasTraining ? 'text-slate-700' : 'text-white/20'}`} />
          </div>
          <h3 className={`font-extrabold text-lg mb-1 ${hasTraining ? 'text-slate-900' : 'text-white/30'}`}>
            الخطة التدريبية
          </h3>
          <p className={`text-sm font-medium ${hasTraining ? 'text-slate-500' : 'text-white/20'}`}>
            {hasTraining
              ? `${client.plan.training.daysPerWeek} أيام/أسبوع`
              : 'قيد الإعداد من المدرب'}
          </p>
          {hasTraining && (
            <div className="flex items-center gap-1 mt-4 text-slate-700 text-sm font-bold">
              عرض الخطة <ArrowLeft className="w-4 h-4" />
            </div>
          )}
          {!hasTraining && (
            <div className="flex items-center gap-1 mt-4 text-white/20 text-sm font-medium">
              <Clock className="w-4 h-4" /> قريباً
            </div>
          )}
        </Link>
      </div>

      {/* Goal + status */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-slate-600" />
        </div>
        <div className="flex-1">
          <p className="font-extrabold text-slate-900 text-sm">هدفك: {goalLabels[client.goal] ?? client.goal ?? '—'}</p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            الحالة: {client.status === 'active' ? '✅ نشط' : client.status === 'reviewed' ? '👀 تمت المراجعة' : '🕐 جديد'}
          </p>
        </div>
        {client.status === 'active' && (
          <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> نشط
          </div>
        )}
      </div>

      <p className="text-center text-slate-400 text-xs font-medium">
        تحتاج مساعدة؟{' '}
        <a href="tel:+97430653759" className="text-gold-600 font-bold hover:text-gold-500 transition">
          تواصل مع المدرب أمين
        </a>
      </p>
    </div>
  )
}
