'use client'
import Link from 'next/link'
import { Users, TrendingUp, ClipboardList, CheckCircle2, ArrowUpRight, Clock, Eye } from 'lucide-react'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { monthlyData } from '@/lib/mockData'

const goalMap = {
  loss:        { label: 'خسارة وزن',       color: '#6366f1' },
  gain:        { label: 'بناء عضلات',       color: '#10b981' },
  maintain:    { label: 'الحفاظ على الوزن', color: '#f59e0b' },
  performance: { label: 'أداء رياضي',       color: '#3b82f6' },
}

const statusCfg = {
  new:      'bg-amber-100 text-amber-700',
  reviewed: 'bg-blue-100 text-blue-700',
  active:   'bg-emerald-100 text-emerald-700',
}
const statusLbl  = { new: 'جديد', reviewed: 'تمت المراجعة', active: 'نشط' }
const statusIcon = { new: Clock,  reviewed: Eye,             active: CheckCircle2 }

function StatCard({ icon: Icon, label, value, sub, bg, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:-translate-y-1 transition-transform">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        {sub && (
          <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
            <ArrowUpRight className="w-3 h-3" /> {sub}
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-extrabold text-slate-800">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  )
}

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-sm">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
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
        { name: 'خسارة وزن',       value: 45, color: '#6366f1' },
        { name: 'بناء عضلات',       value: 35, color: '#10b981' },
        { name: 'الحفاظ على الوزن', value: 20, color: '#f59e0b' },
      ]

  const recent = submissions.slice(0, 6)

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}         label="إجمالي الاستبيانات"  value={total}    sub={newCount > 0 ? `${newCount} جديد` : undefined} bg="bg-primary-50"  color="text-primary-600" />
        <StatCard icon={ClipboardList} label="استبيانات جديدة"    value={newCount} bg="bg-amber-50"   color="text-amber-600" />
        <StatCard icon={CheckCircle2}  label="عملاء نشطون"         value={active}   bg="bg-emerald-50" color="text-emerald-600" />
        <StatCard icon={TrendingUp}    label="تمت مراجعتهم"        value={reviewed} bg="bg-blue-50"    color="text-blue-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">نمو المشتركين والجلسات</h2>
            <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">2025 — توقعات</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ top:5, right:5, bottom:5, left:-20 }}>
              <defs>
                <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gJ" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#94a3b8' }} />
              <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} />
              <Tooltip content={<Tip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:12 }} />
              <Area type="monotone" dataKey="مشتركون" stroke="#6366f1" strokeWidth={2} fill="url(#gS)" dot={{ r:4, fill:'#6366f1' }} />
              <Area type="monotone" dataKey="جلسات"   stroke="#10b981" strokeWidth={2} fill="url(#gJ)" dot={{ r:4, fill:'#10b981' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-1">توزيع الأهداف</h2>
          {total === 0 && <p className="text-xs text-slate-400 mb-3">بيانات تجريبية</p>}
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={v => total > 0 ? `${v} عميل` : `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-600">{d.name}</span>
                </div>
                <span className="font-bold text-slate-800">{total > 0 ? d.value : `${d.value}%`}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent real submissions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">آخر الاستبيانات</h2>
          <Link href="/dashboard/clients" className="text-primary-600 text-sm font-medium hover:underline">
            عرض الكل وإدارة العملاء
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-14 text-slate-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium text-sm">لا توجد استبيانات بعد</p>
            <p className="text-xs mt-1">ستظهر هنا بعد ملء العملاء للاستبيان</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent.map(c => {
              const Icon = statusIcon[c.status] || Clock
              return (
                <Link key={c.id} href="/dashboard/clients"
                  className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-emerald-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {c.name?.[0] ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate text-sm">{c.name}</p>
                    <p className="text-xs text-slate-500 truncate">{c.email}</p>
                  </div>
                  <div className="hidden sm:block text-xs text-slate-400">
                    {new Date(c.createdAt).toLocaleDateString('ar')}
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg[c.status] || statusCfg.new}`}>
                    <Icon className="w-3 h-3" />
                    {statusLbl[c.status] ?? 'جديد'}
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
