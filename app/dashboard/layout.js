'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import Header  from '@/components/dashboard/Header'

export default function DashboardLayout({ children }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Login page renders standalone — no sidebar
  if (pathname === '/dashboard/login') return <>{children}</>

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
