'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Calculator, X, Zap, ArrowUpLeft, ClipboardList, LogOut, ExternalLink } from 'lucide-react'

const navItems = [
  { href: '/dashboard',             icon: LayoutDashboard, label: 'لوحة التحكم' },
  { href: '/dashboard/clients',     icon: ClipboardList,   label: 'الاستبيانات', badge: true },
  { href: '/dashboard/subscribers', icon: Users,           label: 'المشتركون' },
  { href: '/dashboard/calculator',  icon: Calculator,      label: 'حاسبة التبادل' },
]

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/dashboard/auth', { method: 'DELETE' })
    router.push('/dashboard/login')
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/70 z-20 lg:hidden backdrop-blur-sm" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 right-0 h-full z-30 w-64
        bg-[#0a0a0a] flex flex-col border-l border-white/5
        lg:static transition-transform duration-300
        ${open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-400 rounded-xl flex items-center justify-center shadow-lg shadow-gold-400/20">
              <Zap className="w-5 h-5 text-black" fill="black" />
            </div>
            <div>
              <p className="text-white font-extrabold text-base leading-none tracking-widest uppercase">Amine Fit</p>
              <p className="text-white/25 text-[11px] mt-0.5 font-medium">لوحة المدرب</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/25 hover:text-white p-1 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          <p className="text-white/20 text-[10px] uppercase tracking-widest px-3 mb-4 font-bold">القائمة</p>
          {navItems.map(({ href, icon: Icon, label, badge }) => {
            const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href)
            return (
              <Link key={href} href={href}
                onClick={() => typeof window !== 'undefined' && window.innerWidth < 1024 && onClose()}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group
                  ${active
                    ? 'bg-gold-400 text-black shadow-lg shadow-gold-400/20'
                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                  }`}>
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors
                  ${active ? 'text-black' : 'text-white/25 group-hover:text-white'}`} />
                <span className={`font-bold flex-1 text-sm ${active ? 'text-black' : ''}`}>{label}</span>
                {badge && !active && (
                  <span className="w-2 h-2 rounded-full bg-gold-400 flex-shrink-0 animate-pulse" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Quick links */}
        <div className="px-3 pt-3 pb-2 border-t border-white/5 space-y-0.5">
          <Link href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white/25 hover:text-white hover:bg-white/5 transition text-sm font-medium">
            <ArrowUpLeft className="w-4 h-4" />
            العودة للموقع
          </Link>
          <Link href="/client/login" target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white/25 hover:text-gold-400 hover:bg-white/5 transition text-sm font-medium">
            <ExternalLink className="w-4 h-4" />
            بوابة العميل
          </Link>
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-white/25 hover:text-red-400 hover:bg-red-500/5 transition text-sm font-medium">
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </button>
        </div>

        {/* Profile */}
        <div className="px-3 pb-4 pt-2 border-t border-white/5">
          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-3">
            <div className="w-9 h-9 rounded-full bg-gold-400 flex items-center justify-center text-black font-extrabold text-sm flex-shrink-0">
              أ
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-bold truncate">أمين حمدي</p>
              <p className="text-white/25 text-xs">المدرب الشخصي · قطر</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
