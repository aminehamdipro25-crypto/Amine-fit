'use client'
import { usePathname } from 'next/navigation'
import { Menu, Bell } from 'lucide-react'

const titles = {
  '/dashboard':             'لوحة التحكم',
  '/dashboard/clients':     'إدارة العملاء',
  '/dashboard/subscribers': 'المشتركون',
  '/dashboard/calculator':  'حاسبة التبادل',
}

export default function Header({ onMenuClick }) {
  const pathname = usePathname()
  const title = titles[pathname] || 'لوحة التحكم'

  return (
    <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
      <button onClick={onMenuClick}
        className="lg:hidden w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition">
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-base font-extrabold text-slate-900 tracking-tight">{title}</h1>
      </div>

      <button className="relative w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition">
        <Bell className="w-4.5 h-4.5" />
        <span className="absolute top-2 right-2 w-2 h-2 bg-gold-400 rounded-full ring-2 ring-white" />
      </button>
    </header>
  )
}
