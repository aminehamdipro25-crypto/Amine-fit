'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Dumbbell, Menu, X } from 'lucide-react'

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
      ${scrolled ? 'bg-white/95 backdrop-blur shadow-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className={`font-extrabold text-lg transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}>
              Amine-Fit
            </span>
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <a key={l.href} href={l.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${scrolled ? 'text-slate-600 hover:text-primary-600 hover:bg-primary-50'
                             : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
                {l.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/dashboard"
              className="px-5 py-2 bg-gradient-to-r from-primary-600 to-emerald-500 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all">
              لوحة التحكم
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(o => !o)}
            className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-slate-700' : 'text-white'}`}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur border-t border-slate-100 px-4 py-4 space-y-1 shadow-lg">
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-xl text-slate-700 font-medium hover:bg-primary-50 hover:text-primary-600 transition-colors">
              {l.label}
            </a>
          ))}
          <Link href="/dashboard" onClick={() => setMobileOpen(false)}
            className="block mt-2 text-center px-4 py-3 bg-gradient-to-r from-primary-600 to-emerald-500 text-white font-bold rounded-xl">
            لوحة التحكم
          </Link>
        </div>
      )}
    </header>
  )
}
