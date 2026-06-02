'use client'
import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Dumbbell, Clock, MessageCircle, Star } from 'lucide-react'

function SuccessContent() {
  const params = useSearchParams()
  const existing = params.get('existing') === '1'

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

        {/* Icon */}
        <div className="w-24 h-24 bg-emerald-500/20 border-2 border-emerald-500/40 rounded-full
          flex items-center justify-center mx-auto mb-6 animate-pulse">
          {existing
            ? <Star className="w-12 h-12 text-amber-400" />
            : <CheckCircle2 className="w-12 h-12 text-emerald-400" />}
        </div>

        {existing ? (
          <>
            <h1 className="text-3xl font-extrabold text-white mb-3">
              تم حفظ الباقة المختارة! ✅
            </h1>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              تم تسجيل اختيارك بنجاح. سيتواصل معك المدرب أمين عبر واتساب
              لتأكيد الدفع وتفعيل اشتراكك.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold text-white mb-3">
              تم إرسال طلبك! ⏳
            </h1>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              استلمنا طلبك بنجاح. سيراجعه المدرب أمين ويرسل لك بيانات الدخول
              على بريدك الإلكتروني خلال 24 ساعة.
            </p>
          </>
        )}

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white/10 border border-white/15 rounded-2xl p-4 text-right">
            <Clock className="w-8 h-8 text-primary-400 mb-2" />
            <p className="text-white font-semibold text-sm">
              {existing ? 'تأكيد الدفع' : 'مراجعة الطلب'}
            </p>
            <p className="text-white/50 text-xs mt-1">
              {existing ? 'سيتواصل معك أمين لتأكيد الدفع' : 'سيراجع أمين طلبك خلال 24 ساعة'}
            </p>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-4 text-right">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
            <p className="text-white font-semibold text-sm">بريد إلكتروني</p>
            <p className="text-white/50 text-xs mt-1">
              {existing ? 'ستصلك تفاصيل تفعيل اشتراكك' : 'ستصلك كلمة المرور على بريدك'}
            </p>
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
          <a href="https://wa.me/97430653759"
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold rounded-2xl hover:opacity-90 transition shadow-lg">
            تواصل عبر واتساب ←
          </a>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  )
}
