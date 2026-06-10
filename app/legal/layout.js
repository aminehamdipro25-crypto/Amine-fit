import Link from 'next/link'
import { Zap, ArrowRight } from 'lucide-react'

export default function LegalLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white transition text-sm font-medium">
          <ArrowRight className="w-4 h-4" /> العودة
        </Link>
        <Link href="/" className="flex items-center gap-2 mr-auto">
          <div className="w-7 h-7 bg-gold-400 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-black" fill="black" />
          </div>
          <span className="text-white font-extrabold text-sm uppercase">Amine<span className="text-gold-400">Fit</span></span>
        </Link>
      </header>
      <main id="main-content" className="max-w-3xl mx-auto px-6 py-12">{children}</main>
    </div>
  )
}
