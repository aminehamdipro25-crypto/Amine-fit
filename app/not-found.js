import Link from 'next/link'

export const metadata = { title: 'الصفحة غير موجودة | Amine-Fit' }

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-center px-6">
      <div className="text-8xl font-black text-amber-400 mb-4">404</div>
      <h1 className="text-2xl font-extrabold text-white mb-3">الصفحة غير موجودة</h1>
      <p className="text-slate-400 mb-8 max-w-sm">
        يبدو أن هذه الصفحة لا وجود لها أو تم نقلها.
      </p>
      <Link
        href="/"
        className="bg-amber-400 text-black font-bold px-6 py-3 rounded-xl hover:bg-amber-300 transition"
      >
        العودة للرئيسية
      </Link>
    </div>
  )
}
