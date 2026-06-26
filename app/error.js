'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('[global error]', error)
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-center px-6">
      <div className="text-7xl mb-4">⚡</div>
      <h1 className="text-2xl font-extrabold text-white mb-3">حدث خطأ غير متوقع</h1>
      <p className="text-slate-400 mb-8 max-w-sm">
        نعتذر عن هذا الخطأ. يمكنك المحاولة مجدداً أو العودة للرئيسية.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="bg-amber-400 text-black font-bold px-5 py-3 rounded-xl hover:bg-amber-300 transition"
        >
          أعد المحاولة
        </button>
        <Link
          href="/"
          className="border border-slate-600 text-slate-300 font-bold px-5 py-3 rounded-xl hover:border-slate-400 transition"
        >
          الرئيسية
        </Link>
      </div>
    </div>
  )
}
