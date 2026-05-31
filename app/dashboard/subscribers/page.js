import { getSubmissions } from '@/lib/submissions'
import Link from 'next/link'
import { Users, Dumbbell, Utensils, CheckCircle2, Clock, ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SubscribersPage() {
  const all = await getSubmissions()
  const subscribers = all.filter(c => c.status === 'active')

  const withPlan     = subscribers.filter(c => c.plan?.nutrition?.calories || c.plan?.training?.daysPerWeek)
  const withoutPlan  = subscribers.filter(c => !c.plan?.nutrition?.calories && !c.plan?.training?.daysPerWeek)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">المشتركون</h1>
        <p className="text-slate-400 text-sm mt-1">العملاء النشطون الذين يمكنهم الدخول لبوابتهم</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'إجمالي المشتركين', val: subscribers.length, color: 'text-slate-800' },
          { label: 'لديهم خطة',        val: withPlan.length,    color: 'text-emerald-600' },
          { label: 'بدون خطة بعد',    val: withoutPlan.length,  color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center">
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {subscribers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-20 text-center">
          <Users className="w-12 h-12 mx-auto text-slate-200 mb-3" />
          <p className="font-bold text-slate-400">لا يوجد مشتركون نشطون بعد</p>
          <p className="text-sm text-slate-300 mt-1">غيّر حالة العميل إلى "نشط" من صفحة الاستبيانات</p>
          <Link href="/dashboard/clients"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gold-400 text-black rounded-xl font-bold text-sm hover:bg-gold-300 transition">
            الذهاب للاستبيانات
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-right text-xs font-extrabold text-slate-400 uppercase tracking-wide px-5 py-3">العميل</th>
                <th className="text-right text-xs font-extrabold text-slate-400 uppercase tracking-wide px-5 py-3">الخطة</th>
                <th className="text-right text-xs font-extrabold text-slate-400 uppercase tracking-wide px-5 py-3">كلمة المرور</th>
                <th className="text-right text-xs font-extrabold text-slate-400 uppercase tracking-wide px-5 py-3">تاريخ التسجيل</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map(c => {
                const hasNutrition = !!c.plan?.nutrition?.calories
                const hasTraining  = !!c.plan?.training?.daysPerWeek
                return (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#0a0a0a] text-gold-400 flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                          {c.name?.[0] ?? '?'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{c.name}</p>
                          <p className="text-xs text-slate-400" dir="ltr">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold border
                          ${hasNutrition ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                          {hasNutrition ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <Utensils className="w-3 h-3" /> غذاء
                        </span>
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold border
                          ${hasTraining ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                          {hasTraining ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <Dumbbell className="w-3 h-3" /> تدريب
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {c.clientPassword
                        ? <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold">✅ مضبوطة</span>
                        : <span className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-[11px] font-bold">⚠️ لم تُضبط</span>
                      }
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString('ar-DZ')}
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/dashboard/clients/${c.id}/plan`}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gold-400 text-black font-bold text-xs hover:bg-gold-300 transition whitespace-nowrap">
                        <ExternalLink className="w-3.5 h-3.5" />
                        {hasNutrition || hasTraining ? 'تعديل الخطة' : 'بناء الخطة'}
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* How it works info */}
      <div className="bg-[#0a0a0a] rounded-2xl p-5 text-white">
        <p className="font-extrabold text-gold-400 text-sm mb-3">كيف تصل الخطة للعميل؟</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-white/60">
          <div className="flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-gold-400 text-black font-extrabold flex items-center justify-center flex-shrink-0 text-[11px]">١</span>
            <p>تضبط كلمة مرور للعميل من زر "بناء الخطة"</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-gold-400 text-black font-extrabold flex items-center justify-center flex-shrink-0 text-[11px]">٢</span>
            <p>تبني الخطة الغذائية والتدريبية وتضغط حفظ</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-gold-400 text-black font-extrabold flex items-center justify-center flex-shrink-0 text-[11px]">٣</span>
            <p>العميل يدخل amine-fit.vercel.app/client/login ببريده وكلمة المرور ويرى خطته مباشرة</p>
          </div>
        </div>
      </div>
    </div>
  )
}
