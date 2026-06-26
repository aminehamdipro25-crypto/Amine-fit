'use client'
import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function DashboardError({ error, reset }) {
  useEffect(() => {
    console.error('[dashboard error]', error)
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-20">
      <div className="text-6xl mb-4">⚡</div>
      <h2 className="text-xl font-extrabold text-slate-800 mb-2">حدث خطأ في هذه الصفحة</h2>
      <p className="text-slate-500 mb-6 max-w-sm text-sm">
        نعتذر عن هذا الخطأ. يمكنك المحاولة مجدداً أو العودة للوحة التحكم.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="bg-amber-400 text-black font-bold px-5 py-2.5 rounded-xl hover:bg-amber-300 transition text-sm"
        >
          أعد المحاولة
        </button>
        <a
          href="/dashboard"
          className="border border-slate-300 text-slate-600 font-bold px-5 py-2.5 rounded-xl hover:border-slate-400 transition text-sm"
        >
          الرئيسية
        </a>
      </div>
    </div>
  )
}
