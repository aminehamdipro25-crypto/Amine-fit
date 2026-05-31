'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Menu, Bell, User, Clock, ChevronLeft } from 'lucide-react'

const titles = {
  '/dashboard':             'لوحة التحكم',
  '/dashboard/clients':     'إدارة العملاء',
  '/dashboard/subscribers': 'المشتركون',
  '/dashboard/calculator':  'حاسبة التبادل',
  '/dashboard/analytics':   'الإحصائيات',
}

export default function Header({ onMenuClick }) {
  const pathname = usePathname()
  const title = titles[pathname] || 'لوحة التحكم'

  const [open, setOpen]           = useState(false)
  const [notifications, setNotes] = useState([])
  const [loading, setLoading]     = useState(false)
  const ref = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function fetchNotifications() {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard/notifications')
      const data = await res.json()
      setNotes(data.notifications || [])
    } catch {}
    finally { setLoading(false) }
  }

  function toggle() {
    if (!open) fetchNotifications()
    setOpen(o => !o)
  }

  const unread = notifications.filter(n => !n.read).length

  return (
    <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
      <button onClick={onMenuClick}
        className="lg:hidden w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition">
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-base font-extrabold text-slate-900 tracking-tight">{title}</h1>
      </div>

      {/* Bell */}
      <div className="relative" ref={ref}>
        <button onClick={toggle}
          className="relative w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition">
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
          {unread === 0 && notifications.length === 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-gold-400 rounded-full ring-2 ring-white" />
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute left-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <p className="font-extrabold text-slate-800 text-sm">التنبيهات</p>
              {unread > 0 && <span className="text-xs text-slate-400">{unread} غير مقروء</span>}
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-400 text-sm">جاري التحميل...</div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 mx-auto text-slate-200 mb-2" />
                <p className="text-sm text-slate-400 font-medium">لا توجد تنبيهات</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {notifications.map((n, i) => (
                  <Link key={i} href={n.href} onClick={() => setOpen(false)}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition ${!n.read ? 'bg-gold-50/40' : ''}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5
                      ${n.type === 'new_client' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                      {n.type === 'new_client' ? <User className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{n.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{n.body}</p>
                    </div>
                    {!n.read && <span className="w-2 h-2 bg-gold-400 rounded-full flex-shrink-0 mt-2" />}
                  </Link>
                ))}
              </div>
            )}

            <div className="px-4 py-3 border-t border-slate-100">
              <Link href="/dashboard/clients" onClick={() => setOpen(false)}
                className="flex items-center gap-1 text-xs font-bold text-gold-600 hover:text-gold-700 transition">
                عرض كل العملاء <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
