'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Zap, LayoutDashboard, Utensils, Dumbbell, TrendingUp, LogOut, Menu, X, Eye, ArrowRight, Pencil, BookOpen, Paperclip, FlaskConical, ShoppingCart, Camera, MessageCircle, ClipboardList } from 'lucide-react'

const navItems = [
  { href: '/client/dashboard',        icon: LayoutDashboard, label: 'الرئيسية' },
  { href: '/client/plan/nutrition',   icon: Utensils,        label: 'الخطة الغذائية' },
  { href: '/client/plan/training',    icon: Dumbbell,        label: 'الخطة التدريبية' },
  { href: '/client/lab',             icon: FlaskConical,    label: 'المختبر 🔬' },
  { href: '/client/progress',         icon: TrendingUp,      label: 'متابعة التقدم' },
  { href: '/client/checkins',         icon: ClipboardList,   label: 'تقاريري 📋' },
  { href: '/client/chat',             icon: MessageCircle,   label: 'مساعدي 💬' },
  { href: '/client/journal',          icon: BookOpen,        label: 'يوميتي 💧' },
  { href: '/client/shopping',         icon: ShoppingCart,    label: 'قائمة التسوق 🛒' },
  { href: '/client/photos',           icon: Camera,          label: 'صوري 📸' },
  { href: '/client/resources',        icon: Paperclip,       label: 'ملفاتي 📎' },
]

function CoachPreviewBar() {
  const [previewData, setPreviewData] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)coach_preview=([^;]+)/)
    if (match) {
      try { setPreviewData(JSON.parse(decodeURIComponent(match[1]))) } catch {}
    }
  }, [])

  async function exitPreview() {
    document.cookie = 'coach_preview=; Max-Age=0; path=/'
    await fetch('/api/client/logout', { method: 'POST' })
    router.push('/dashboard/clients')
  }

  if (!previewData) return null

  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-emerald-600 text-white px-4 py-2.5 flex items-center gap-3 shadow-lg">
      <Eye className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm font-bold flex-1">
        أنت تشاهد بوابة العميل: <span className="text-emerald-200">{previewData.name}</span>
      </span>
      <Link href={`/dashboard/clients/${previewData.id}/plan`}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-bold transition">
        <Pencil className="w-3.5 h-3.5" />
        تعديل الخطة
      </Link>
      <button onClick={exitPreview}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-emerald-700 hover:bg-emerald-50 text-xs font-bold transition">
        <ArrowRight className="w-3.5 h-3.5" />
        خروج من المعاينة
      </button>
    </div>
  )
}

export default function ClientLayout({ children }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [open, setOpen]           = useState(false)       // mobile drawer
  const [collapsed, setCollapsed] = useState(false)       // desktop collapse
  const [isPreview, setIsPreview] = useState(false)
  const [clientInitial, setClientInitial] = useState('؟')

  const isLogin = pathname === '/client/login' || pathname === '/client' || pathname === '/client/demo'

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)coach_preview=([^;]+)/)
    setIsPreview(!!match)
  }, [])

  useEffect(() => {
    if (isLogin) return
    fetch('/api/client/me').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.name) setClientInitial(data.name.trim()[0].toUpperCase())
    }).catch(() => {})
  }, [isLogin])

  // Heartbeat — keeps online status alive every 60 seconds
  useEffect(() => {
    if (isLogin) return
    const ping = () => fetch('/api/client/ping', { method: 'POST' }).catch(() => {})
    ping()
    const iv = setInterval(ping, 60_000)
    return () => clearInterval(iv)
  }, [isLogin])

  async function logout() {
    document.cookie = 'coach_preview=; Max-Age=0; path=/'
    await fetch('/api/client/logout', { method: 'POST' })
    router.push('/client/login')
  }

  if (isLogin) return <>{children}</>

  return (
    <div className={`flex bg-[#f5f5f5] overflow-hidden ${isPreview ? 'h-[calc(100vh-44px)] mt-[44px]' : 'h-screen'}`}>
      <CoachPreviewBar />

      {/* Sidebar */}
      <>
        {open && (
          <div className="fixed inset-0 bg-black/70 z-20 lg:hidden backdrop-blur-sm" onClick={() => setOpen(false)} />
        )}
        <aside className={`
          fixed top-0 right-0 h-full z-30 w-60
          lg:static overflow-hidden flex-shrink-0
          bg-[#0a0a0a] border-l border-white/5
          transition-all duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          ${collapsed ? 'lg:w-0 lg:border-l-0' : ''}
        `}>
          <div className={`w-60 h-full flex flex-col ${isPreview ? 'pt-[44px] lg:pt-0' : ''}`}>

            <div className="flex items-center justify-between px-5 py-6 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gold-400 rounded-xl flex items-center justify-center">
                  <Zap className="w-4 h-4 text-black" fill="black" />
                </div>
                <span className="text-white font-extrabold text-sm tracking-wider uppercase">
                  Amine<span className="text-gold-400">Fit</span>
                </span>
              </div>
              <button onClick={() => setOpen(false)} className="lg:hidden text-white/30 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-5 space-y-0.5">
              <p className="text-white/20 text-[10px] uppercase tracking-widest px-3 mb-4 font-bold">بوابتك الشخصية</p>
              {navItems.map(({ href, icon: Icon, label }) => {
                const active = pathname === href
                return (
                  <Link key={href} href={href} onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                      ${active ? 'bg-gold-400 text-black' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}>
                    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-black' : 'text-white/25'}`} />
                    <span className={`font-bold text-sm ${active ? 'text-black' : ''}`}>{label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="px-3 pb-4 pt-2 border-t border-white/5">
              <button onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-white/25 hover:text-red-400 hover:bg-red-500/5 transition text-sm font-medium">
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </button>
            </div>

          </div>
        </aside>
      </>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center gap-4">
          {/* Mobile: open drawer | Desktop: toggle collapse */}
          <button
            onClick={() => { if (window.innerWidth >= 1024) setCollapsed(c => !c); else setOpen(true) }}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="w-8 h-8 rounded-full bg-[#0a0a0a] text-gold-400 flex items-center justify-center font-extrabold text-sm">
            {clientInitial}
          </div>
        </header>
        <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
