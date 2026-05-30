import { Menu, Bell, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const pageTitles = {
  '/':             { title: 'لوحة التحكم',    subtitle: 'مرحباً بك في Amine-Fit' },
  '/subscribers':  { title: 'المشتركون',       subtitle: 'إدارة قائمة المشتركين' },
  '/calculator':   { title: 'حاسبة التبادل',  subtitle: 'حساب الحصص الغذائية بنظام التبادل' },
}

export default function Header({ onMenuClick }) {
  const location = useLocation()
  const page = pageTitles[location.pathname] || pageTitles['/']

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold text-slate-800 truncate">{page.title}</h1>
        <p className="text-xs text-slate-500 hidden sm:block">{page.subtitle}</p>
      </div>

      {/* Search - hidden on small screens */}
      <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2 w-56">
        <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="بحث..."
          className="bg-transparent text-sm text-slate-700 placeholder-slate-400 w-full"
        />
      </div>

      {/* Notification bell */}
      <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-primary-600 transition-colors">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
      </button>
    </header>
  )
}
