'use client'
import Link from 'next/link'
import { CheckCircle2, Zap } from 'lucide-react'

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4" dir="rtl">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-3">تم الدفع بنجاح! 🎉</h1>
        <p className="text-white/40 font-medium mb-2">سيتواصل معك المدرب أمين خلال 24 ساعة لبدء رحلتك.</p>
        <p className="text-white/20 text-sm mb-8">تحقق من بريدك الإلكتروني للتأكيد.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/client/login"
            className="px-6 py-3 bg-[#fbbf24] text-black font-extrabold rounded-xl hover:bg-[#f59e0b] transition text-sm">
            الدخول لبوابتي
          </Link>
          <Link href="/"
            className="px-6 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition text-sm border border-white/10">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}
