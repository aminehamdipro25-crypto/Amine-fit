'use client'
import { useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import Header  from '@/components/dashboard/Header'

export default function DashboardLayout({ children }) {
  const [open, setOpen]           = useState(false)  // mobile drawer
  const [collapsed, setCollapsed] = useState(false)  // desktop collapse

  function handleMenuClick() {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setCollapsed(c => !c)
    } else {
      setOpen(true)
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar open={open} collapsed={collapsed} onClose={() => setOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={handleMenuClick} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
