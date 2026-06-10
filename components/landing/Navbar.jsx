'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Zap, Menu, X, LogOut, Flame } from 'lucide-react'

const links = [
  { href: '#about',      label: 'من هو أمين' },
  { href: '#services',   label: 'الخدمات' },
  { href: '#how',        label: 'كيف يعمل' },
  { href: '#pricing',    label: 'الأسعار' },
  { href: '#calculator', label: 'الحاسبة' },
  { href: '/blog',       label: 'المدونة', external: true },
  { href: '#faq',        label: 'الأسئلة الشائعة' },
  { href: '#contact',    label: 'تواصل معنا' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [banner, setBanner] = useState(true)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    fetch('/api/dashboard/auth').then(r => { if (r.ok) setIsAdmin(true) }).catch(() => {})
  }, [])

  async function logout() {
    await fetch('/api/dashboard/auth', { method: 'DELETE' })
    setIsAdmin(false)
    window.location.href = '/dashboard/login'
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      {/* Promo Banner */}
      {banner && (
        <div className="relative bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white text-center py-2.5 px-10">
          <div className="flex items-center justify-center gap-2 text-sm font-bold">
            <Flame className="w-4 h-4 animate-pulse flex-shrink-0" />
            <span>🎉 عرض الإطلاق — خصم <strong>50%</strong> على جميع الباقات لفترة محدودة</span>
            <a href="#pricing"
              className="mr-2 border border-white/40 text-white text-xs font-extrabold px-3 py-0.5 rounded-full hover:bg-white/10 transition flex-shrink-0">
              احجز الآن
            </a>
          </div>
          <button onClick={() => setBanner(false)} aria-label="إغلاق الإشعار"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className={`transition-all duration-300
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
          <div className="hidden md:flex items-center gap-2">
            <Link href="/client/login"
              className="px-4 py-2 border border-white/10 text-white/60 text-sm font-bold rounded-xl hover:bg-white/5 hover:text-white transition-all">
              دخول العميل
            </Link>
            {isAdmin && (
              <>
                <Link href="/dashboard"
                  className="px-5 py-2 bg-gold-400 text-black text-sm font-extrabold rounded-xl hover:bg-gold-300 transition-all shadow-lg shadow-gold-400/20">
                  لوحة التحكم
                </Link>
                <button onClick={logout} title="تسجيل خروج المدرب"
                  className="p-2 rounded-xl border border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/30 hover:bg-red-500/5 transition-all">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            aria-expanded={mobileOpen}
            className="md:hidden p-2 rounded-lg text-white/60 hover:text-white transition-colors"
          >
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
          <Link href="/client/login" onClick={() => setMobileOpen(false)}
            className="block mt-2 text-center px-4 py-3 border border-white/10 text-white/70 font-bold rounded-xl">
            دخول العميل
          </Link>
          {isAdmin && (
            <>
              <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                className="block mt-2 text-center px-4 py-3 bg-gold-400 text-black font-extrabold rounded-xl">
                لوحة التحكم
              </Link>
              <button onClick={logout}
                className="w-full mt-1 flex items-center justify-center gap-2 px-4 py-3 border border-white/10 text-white/50 hover:text-red-400 font-medium rounded-xl transition">
                <LogOut className="w-4 h-4" />
                تسجيل خروج المدرب
              </button>
            </>
          )}
        </div>
      )}
      </div>
    </header>
  )
}
