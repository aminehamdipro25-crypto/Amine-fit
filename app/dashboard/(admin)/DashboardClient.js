'use client'
import Link from 'next/link'
import {
  Users, TrendingUp, ClipboardList, CheckCircle2,
  ArrowUpRight, Clock, Eye, Zap,
} from 'lucide-react'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { monthlyData } from '@/lib/mockData'

const goalMap = {
  loss:        { label: 'خسارة وزن',       color: '#f59e0b' },
  gain:        { label: 'بناء عضلات',       color: '#10b981' },
  maintain:    { label: 'الحفاظ على الوزن', color: '#6366f1' },
  performance: { label: 'أداء رياضي',       color: '#f97316' },
}

const statusCfg = {
  new:      { bg: 'bg-amber-100 text-amber-700',   Icon: Clock         },
  reviewed: { bg: 'bg-blue-100 text-blue-700',     Icon: Eye           },
  active:   { bg: 'bg-emerald-100 text-emerald-700', Icon: CheckCircle2 },
}

function StatCard({ icon: Icon, label, value, sub, color, lightBg }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:-translate-y-1 transition-transform">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 ${lightBg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        {sub && (
          <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">
            <ArrowUpRight className="w-3 h-3" />{sub}
          </span>
        )}
      </div>
      <p className="text-4xl font-extrabold text-slate-900 tracking-tight">{value}</p>
      <p className="mt-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
    </div>
  )
}

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#111] border border-white/10 rounded-xl p-3 shadow-xl text-xs">
      <p className="font-bold text-white/50 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-bold">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function DashboardClient({ submissions }) {
  const total    = submissions.length
  const newCount = submissions.filter(s => s.status === 'new').length
  const active   = submissions.filter(s => s.status === 'active').length
  const reviewed = submissions.filter(s => s.status === 'reviewed').length

  const goalCounts = Object.fromEntries(Object.keys(goalMap).map(k => [k, 0]))
  submissions.forEach(s => { if (goalCounts[s.goal] !== undefined) goalCounts[s.goal]++ })

  const pieData = total > 0
    ? Object.entries(goalMap)
        .map(([k, v]) => ({ name: v.label, value: goalCounts[k], color: v.color }))
        .filter(g => g.value > 0)
    : [
        { name: 'خسارة وزن',       value: 45, color: '#f59e0b' },
        { name: 'بناء عضلات',       value: 35, color: '#10b981' },
        { name: 'الحفاظ على الوزن', value: 20, color: '#6366f1' },
      ]

  const recent = submissions.slice(0, 6)

  const today = new Date().toLocaleDateString('ar', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="space-y-5">

      {/* Welcome Banner */}
      <div className="bg-[#0a0a0a] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -left-6 -top-6 w-36 h-36 bg-gold-400/8 rounded-full" />
        <div className="absolute left-20 -bottom-8 w-24 h-24 bg-gold-400/5 rounded-full" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-2">{today}</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight">
              مرحباً،{' '}
              <span className="text-gold-400">أمين حمدي</span>
            </h1>
            <p className="text-white/30 text-sm mt-2 font-medium">
              {newCount > 0
                ? `⚡ لديك ${newCount} استبيان جديد ينتظر مراجعتك`
                : 'لا توجد استبيانات جديدة اليوم'}
            </p>
          </div>
          <div className="hidden sm:flex w-14 h-14 bg-gold-400 rounded-2xl items-center justify-center flex-shrink-0 shadow-lg shadow-gold-400/20">
            <Zap className="w-7 h-7 text-black" fill="black" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ClipboardList} label="إجمالي الاستبيانات" value={total}
          sub={newCount > 0 ? `${newCount} جديد` : undefined}
          color="text-gold-600" lightBg="bg-gold-50" />
        <StatCard icon={Clock}         label="استبيانات جديدة"   value={newCount}
          color="text-orange-500" lightBg="bg-orange-50" />
        <StatCard icon={CheckCircle2}  label="عملاء نشطون"        value={active}
          color="text-emerald-600" lightBg="bg-emerald-50" />
        <StatCard icon={TrendingUp}    label="تمت مراجعتهم"       value={reviewed}
          color="text-blue-600" lightBg="bg-blue-50" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">نمو المشتركين والجلسات</h2>
            <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full font-medium">2025</span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={monthlyData} margin={{ top:5, right:5, bottom:5, left:-20 }}>
              <defs>
                <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gJ" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#94a3b8' }} />
              <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} />
              <Tooltip content={<ChartTip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:12 }} />
              <Area type="monotone" dataKey="مشتركون" stroke="#f59e0b" strokeWidth={2.5} fill="url(#gS)" dot={{ r:4, fill:'#f59e0b' }} />
              <Area type="monotone" dataKey="جلسات"   stroke="#10b981" strokeWidth={2.5} fill="url(#gJ)" dot={{ r:4, fill:'#10b981' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h2 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide mb-1">توزيع الأهداف</h2>
          {total === 0 && <p className="text-xs text-slate-400 mb-3">بيانات تجريبية</p>}
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={v => total > 0 ? `${v} عميل` : `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-xs text-slate-500 font-medium">{d.name}</span>
                </div>
                <span className="text-xs font-extrabold text-slate-800">{total > 0 ? d.value : `${d.value}%`}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">آخر الاستبيانات</h2>
          <Link href="/dashboard/clients"
            className="flex items-center gap-1 text-gold-600 text-sm font-bold hover:text-gold-500 transition">
            عرض الكل <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-16 text-slate-300">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-bold text-sm">لا توجد استبيانات بعد</p>
            <p className="text-xs mt-1 text-slate-400">ستظهر هنا بعد ملء العملاء للاستبيان</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recent.map(c => {
              const st = statusCfg[c.status] || statusCfg.new
              const Icon = st.Icon
              return (
                <Link key={c.id} href="/dashboard/clients"
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#0a0a0a] text-gold-400 flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                    {c.name?.[0] ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate text-sm">{c.name}</p>
                    <p className="text-xs text-slate-400 truncate">{c.email}</p>
                  </div>
                  <div className="hidden sm:block text-xs text-slate-300 font-medium">
                    {new Date(c.createdAt).toLocaleDateString('ar')}
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${st.bg}`}>
                    <Icon className="w-3 h-3" />
                    {c.status === 'new' ? 'جديد' : c.status === 'reviewed' ? 'مراجعة' : 'نشط'}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
