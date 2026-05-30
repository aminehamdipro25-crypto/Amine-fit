'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Zap, Menu, X } from 'lucide-react'

const links = [
  { href: '#services', label: 'الخدمات' },
  { href: '#how',      label: 'كيف يعمل' },
  { href: '#pricing',  label: 'الأسعار' },
  { href: '#contact',  label: 'تواصل معنا' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300
      ${scrolled ? 'bg-[#0a0a0a]/95 backdrop-blur shadow-lg shadow-black/20' : 'bg-[#0a0a0a]'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-gold-400 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" fill="black" />
            </div>
            <span className="font-extrabold text-lg text-white tracking-wider uppercase">
              Amine<span className="text-gold-400">Fit</span>
            </span>
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <a key={l.href} href={l.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                {l.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/dashboard"
              className="px-5 py-2 bg-gold-400 text-black text-sm font-extrabold rounded-xl hover:bg-gold-300 transition-all shadow-lg shadow-gold-400/20">
              لوحة التحكم
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(o => !o)}
            className="md:hidden p-2 rounded-lg text-white/60 hover:text-white transition-colors">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0f0f0f] border-t border-white/5 px-4 py-4 space-y-1">
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-xl text-white/60 font-medium hover:bg-white/5 hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
          <Link href="/dashboard" onClick={() => setMobileOpen(false)}
            className="block mt-3 text-center px-4 py-3 bg-gold-400 text-black font-extrabold rounded-xl">
            لوحة التحكم
          </Link>
        </div>
      )}
    </header>
  )
}
