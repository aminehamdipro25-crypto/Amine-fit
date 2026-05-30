import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Calculator, X, Dumbbell,
  ChevronLeft,
} from 'lucide-react'

const navItems = [
  { to: '/',           icon: LayoutDashboard, label: 'لوحة التحكم' },
  { to: '/subscribers', icon: Users,          label: 'المشتركون' },
  { to: '/calculator', icon: Calculator,      label: 'حاسبة التبادل' },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Backdrop on mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 h-full z-30 w-64
          bg-gradient-to-b from-primary-900 to-primary-800
          shadow-2xl sidebar-transition
          flex flex-col
          lg:static lg:translate-x-0
          ${open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-primary-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">Amine-Fit</p>
              <p className="text-primary-300 text-xs mt-0.5">إدارة التدريب الشخصي</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-primary-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-primary-400 text-xs font-semibold uppercase tracking-wider px-3 mb-3">
            القائمة الرئيسية
          </p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-primary-200 hover:bg-primary-700 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-primary-300 group-hover:text-white'}`} />
                  <span className="font-medium">{label}</span>
                  {isActive && <ChevronLeft className="w-4 h-4 mr-auto opacity-70" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-primary-700">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              أ
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">أمين حمدي</p>
              <p className="text-primary-400 text-xs truncate">المدرب الشخصي</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
