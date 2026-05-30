'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Calculator, X, Dumbbell, ChevronLeft, ArrowUpLeft } from 'lucide-react'

const navItems = [
  { href: '/dashboard',              icon: LayoutDashboard, label: 'لوحة التحكم' },
  { href: '/dashboard/subscribers',  icon: Users,           label: 'المشتركون' },
  { href: '/dashboard/calculator',   icon: Calculator,      label: 'حاسبة التبادل' },
]

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname()

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 right-0 h-full z-30 w-64
        bg-gradient-to-b from-slate-900 to-primary-900
        shadow-2xl flex flex-col
        lg:static transition-transform duration-300
        ${open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">Amine-Fit</p>
              <p className="text-white/40 text-xs mt-0.5">لوحة التحكم</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-white/30 text-xs uppercase tracking-wider px-3 mb-3">القائمة</p>
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href)
            return (
              <Link key={href} href={href}
                onClick={() => typeof window !== 'undefined' && window.innerWidth < 1024 && onClose()}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group
                  ${active
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }`}>
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-white/40 group-hover:text-white'}`} />
                <span className="font-medium">{label}</span>
                {active && <ChevronLeft className="w-4 h-4 mr-auto opacity-60" />}
              </Link>
            )
          })}
        </nav>

        {/* Back to site */}
        <div className="px-3 py-3 border-t border-white/10">
          <Link href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition text-sm">
            <ArrowUpLeft className="w-4 h-4" />
            العودة للموقع
          </Link>
        </div>

        {/* Profile */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              أ
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">أمين حمدي</p>
              <p className="text-white/40 text-xs">المدرب الشخصي</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
