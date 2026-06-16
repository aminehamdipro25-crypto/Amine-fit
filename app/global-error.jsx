'use client'
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-white/40 text-6xl mb-4">⚡</p>
          <h2 className="text-white text-xl font-extrabold mb-2">حدث خطأ غير متوقع</h2>
          <p className="text-white/40 text-sm mb-6">تم إبلاغ الفريق تلقائياً</p>
          <button onClick={reset}
            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-bold text-sm transition">
            حاول مجدداً
          </button>
        </div>
      </body>
    </html>
  )
}
