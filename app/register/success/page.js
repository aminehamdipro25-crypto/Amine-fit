import Link from 'next/link'
import { CheckCircle2, Dumbbell, Clock, MessageCircle } from 'lucide-react'
export const metadata = { title: 'تم التسجيل — Amine-Fit' }

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900
      flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">

        {/* Logo */}
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-extrabold text-xl">Amine-Fit</span>
        </div>

        {/* Success icon */}
        <div className="w-24 h-24 bg-emerald-500/20 border-2 border-emerald-500/40 rounded-full
          flex items-center justify-center mx-auto mb-6 animate-pulse">
          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-3">
          تم تسجيلك بنجاح! 🎉
        </h1>
        <p className="text-white/60 text-lg mb-8 leading-relaxed">
          مرحباً بك في Amine-Fit. يمكنك الآن الدخول لبوابتك الشخصية
          أو انتظار خطتك التي سيعدها المدرب قريباً.
        </p>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white/10 border border-white/15 rounded-2xl p-4 text-right">
            <Clock className="w-8 h-8 text-primary-400 mb-2" />
            <p className="text-white font-semibold text-sm">إعداد الخطة</p>
            <p className="text-white/50 text-xs mt-1">سيعد أمين برنامجك خلال 24 ساعة</p>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-4 text-right">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
            <p className="text-white font-semibold text-sm">حسابك جاهز</p>
            <p className="text-white/50 text-xs mt-1">ادخل ببريدك وكلمة المرور التي اخترتها</p>
          </div>
          <div className="bg-white/10 border border-white/15 rounded-2xl p-4 text-right">
            <MessageCircle className="w-8 h-8 text-emerald-400 mb-2" />
            <p className="text-white font-semibold text-sm">تواصل مباشر</p>
            <p className="text-white/50 text-xs mt-1">واتساب للمتابعة السريعة</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/"
            className="px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition">
            العودة للرئيسية
          </Link>
          <Link href="/client/login"
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-emerald-500 text-white font-bold rounded-2xl hover:opacity-90 transition shadow-lg">
            دخول بوابتي الشخصية ←
          </Link>
        </div>
      </div>
    </div>
  )
}
