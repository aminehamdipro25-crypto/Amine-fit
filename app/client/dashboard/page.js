'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, CheckCircle2, User } from 'lucide-react'

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

  const hasPlan       = !!client.plan
  const hasNutrition  = hasPlan && !!client.plan?.nutrition
  const hasTraining   = hasPlan && !!client.plan?.training

  return (
    <div className="space-y-5 max-w-3xl mx-auto">

      {/* Welcome hero */}
      <div className="relative rounded-3xl overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #111827 60%, #0a0a0a 100%)',
        minHeight: 180
      }}>
        {/* Background emojis — split nutrition left, training right */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {/* Left: food */}
          {[
            { e: '🥗', top: '5%',  left: '1%',  size: 60, deg: -15 },
            { e: '🍎', top: '50%', left: '2%',  size: 50, deg: 10 },
            { e: '🥦', top: '70%', left: '10%', size: 44, deg: -8 },
            { e: '💧', top: '28%', left: '12%', size: 38, deg: 0 },
          ].map((item, i) => (
            <span key={`f${i}`} className="absolute opacity-[0.12]" style={{
              top: item.top, left: item.left,
              fontSize: item.size, lineHeight: 1,
              transform: `rotate(${item.deg}deg)`,
            }}>{item.e}</span>
          ))}
          {/* Right: gym */}
          {[
            { e: '🏋️', top: '5%',  right: '2%',  size: 64, deg: 15 },
            { e: '💪',  top: '50%', right: '3%',  size: 52, deg: -10 },
            { e: '🔥',  top: '70%', right: '12%', size: 48, deg: 8 },
            { e: '⚡',  top: '28%', right: '14%', size: 40, deg: 0 },
          ].map((item, i) => (
            <span key={`g${i}`} className="absolute opacity-[0.12]" style={{
              top: item.top, right: item.right,
              fontSize: item.size, lineHeight: 1,
              transform: `rotate(${item.deg}deg)`,
            }}>{item.e}</span>
          ))}
        </div>

        {/* Gold diagonal line */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute opacity-[0.06]" style={{
            width: '200%', height: '2px',
            background: 'linear-gradient(90deg,transparent,#fbbf24,transparent)',
            top: '55%', left: '-50%',
            transform: 'rotate(-5deg)',
          }} />
        </div>

        <div className="relative z-10 px-6 py-7 flex items-center justify-between gap-4">
          <div>
            <p className="text-white/30 text-xs font-extrabold uppercase tracking-widest mb-2">بوابتك الشخصية</p>
            <h1 className="text-2xl font-extrabold text-white">
              مرحباً، <span className="text-gold-400">{client.name?.split(' ')[0]}</span> ⚡
            </h1>
            <p className="text-white/30 text-sm mt-2 font-medium">
              {hasPlan ? 'برنامجك جاهز — ابدأ رحلتك اليوم 🚀' : 'برنامجك قيد الإعداد — سيُرسَل لك قريباً'}
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
          { label: 'الوزن الحالي',    val: client.weight      ? `${client.weight} كغ`      : '—', emoji: '⚖️' },
          { label: 'الوزن المستهدف',  val: client.targetWeight? `${client.targetWeight} كغ`: '—', emoji: '🎯' },
          { label: 'الطول',           val: client.height      ? `${client.height} سم`       : '—', emoji: '📏' },
          { label: 'العمر',           val: client.age         ? `${client.age} سنة`         : '—', emoji: '🎂' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
            <div className="text-2xl mb-1">{s.emoji}</div>
            <p className="text-xl font-extrabold text-slate-900">{s.val}</p>
            <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Nutrition card */}
        <Link href="/client/plan/nutrition"
          className={`group relative rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-xl
            ${hasNutrition ? 'cursor-pointer' : 'cursor-default pointer-events-none'}`}
          style={{ minHeight: 160 }}>
          {/* Background */}
          <div className="absolute inset-0" style={{
            background: hasNutrition
              ? 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #059669 100%)'
              : 'linear-gradient(135deg, #1a1a1a 0%, #222 100%)',
          }} />
          {/* Floating emojis */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {['🥗','🍎','🥦','🥑'].map((e, i) => (
              <span key={i} className="absolute opacity-[0.15]" style={{
                fontSize: [52,42,36,38][i],
                top: ['8%','55%','70%','30%'][i],
                right: ['5%','8%','20%','2%'][i],
                transform: `rotate(${[-15,10,-8,20][i]}deg)`,
                lineHeight: 1,
              }}>{e}</span>
            ))}
          </div>
          <div className="relative z-10 p-5">
            <div className="text-4xl mb-3">🥗</div>
            <h3 className={`font-extrabold text-lg mb-1 ${hasNutrition ? 'text-white' : 'text-white/30'}`}>
              الخطة الغذائية
            </h3>
            <p className={`text-sm font-medium ${hasNutrition ? 'text-emerald-200' : 'text-white/20'}`}>
              {hasNutrition
                ? `${client.plan.nutrition.calories} سعرة • ${client.plan.nutrition.meals?.length ?? 0} وجبات`
                : 'قيد الإعداد من المدرب'}
            </p>
            {hasNutrition ? (
              <div className="flex items-center gap-1 mt-4 text-white text-sm font-bold">
                عرض الخطة <ArrowLeft className="w-4 h-4" />
              </div>
            ) : (
              <div className="flex items-center gap-1 mt-4 text-white/20 text-sm font-medium">
                <Clock className="w-4 h-4" /> قريباً
              </div>
            )}
          </div>
        </Link>

        {/* Training card */}
        <Link href="/client/plan/training"
          className={`group relative rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-xl
            ${hasTraining ? 'cursor-pointer' : 'cursor-default pointer-events-none'}`}
          style={{ minHeight: 160 }}>
          <div className="absolute inset-0" style={{
            background: hasTraining
              ? 'linear-gradient(135deg, #0a0a0a 0%, #1f2937 50%, #111827 100%)'
              : 'linear-gradient(135deg, #1a1a1a 0%, #222 100%)',
          }} />
          {/* Gold accent stripe */}
          {hasTraining && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute opacity-[0.15]" style={{
                width: '200%', height: '2px',
                background: 'linear-gradient(90deg,transparent,#fbbf24,transparent)',
                top: '60%', left: '-50%',
                transform: 'rotate(-8deg)',
              }} />
            </div>
          )}
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {['🏋️','💪','🔥','⚡'].map((e, i) => (
              <span key={i} className="absolute opacity-[0.12]" style={{
                fontSize: [52,44,38,36][i],
                top: ['8%','55%','72%','28%'][i],
                right: ['5%','8%','22%','2%'][i],
                transform: `rotate(${[15,-10,8,0][i]}deg)`,
                lineHeight: 1,
              }}>{e}</span>
            ))}
          </div>
          <div className="relative z-10 p-5">
            <div className="text-4xl mb-3">🏋️</div>
            <h3 className={`font-extrabold text-lg mb-1 ${hasTraining ? 'text-white' : 'text-white/30'}`}>
              الخطة التدريبية
            </h3>
            <p className={`text-sm font-medium ${hasTraining ? 'text-gold-400/80' : 'text-white/20'}`}>
              {hasTraining
                ? `${client.plan.training.daysPerWeek} أيام/أسبوع`
                : 'قيد الإعداد من المدرب'}
            </p>
            {hasTraining ? (
              <div className="flex items-center gap-1 mt-4 text-gold-400 text-sm font-bold">
                عرض الخطة <ArrowLeft className="w-4 h-4" />
              </div>
            ) : (
              <div className="flex items-center gap-1 mt-4 text-white/20 text-sm font-medium">
                <Clock className="w-4 h-4" /> قريباً
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Goal + status */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
        <div className="text-3xl flex-shrink-0">
          {client.goal === 'loss' ? '📉' : client.goal === 'gain' ? '💪' : client.goal === 'maintain' ? '⚖️' : '🏃'}
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

      <p className="text-center text-slate-400 text-xs font-medium pb-2">
        تحتاج مساعدة؟{' '}
        <a href="tel:+97430653759" className="text-gold-600 font-bold hover:text-gold-500 transition">
          تواصل مع المدرب أمين
        </a>
      </p>
    </div>
  )
}
