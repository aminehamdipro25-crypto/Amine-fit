'use client'
import { usePathname } from 'next/navigation'
import { Menu, Bell, Search } from 'lucide-react'

const titles = {
  '/dashboard':              { title: 'لوحة التحكم',   sub: 'مرحباً بك في Amine-Fit' },
  '/dashboard/subscribers':  { title: 'المشتركون',      sub: 'إدارة قائمة المشتركين' },
  '/dashboard/calculator':   { title: 'حاسبة التبادل', sub: 'حساب الحصص الغذائية' },
}

export default function Header({ onMenuClick }) {
  const pathname = usePathname()
  const page = titles[pathname] || titles['/dashboard']

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
      <button onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition">
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold text-slate-800 truncate">{page.title}</h1>
        <p className="text-xs text-slate-400 hidden sm:block">{page.sub}</p>
      </div>

      <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2 w-52">
        <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <input type="text" placeholder="بحث..." className="bg-transparent text-sm text-slate-700 placeholder-slate-400 w-full outline-none" />
      </div>

      <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
      </button>
    </header>
  )
}
