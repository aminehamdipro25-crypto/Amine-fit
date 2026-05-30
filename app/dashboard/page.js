'use client'
import { Users, TrendingUp, Calendar, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { subscribers, monthlyData, goalData } from '@/lib/mockData'

function StatCard({ icon: Icon, label, value, change, positive, bg, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:-translate-y-1 transition-transform">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full
          ${positive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </span>
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

const statusCfg = { active: 'bg-emerald-100 text-emerald-700', expired: 'bg-red-100 text-red-600', pending: 'bg-amber-100 text-amber-700' }
const statusLbl = { active: 'نشط', expired: 'منتهي', pending: 'معلق' }

export default function DashboardPage() {
  const active  = subscribers.filter(s => s.status === 'active').length
  const expired = subscribers.filter(s => s.status === 'expired').length
  const sessions = subscribers.reduce((a, s) => a + s.sessions, 0)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}     label="إجمالي المشتركين" value={subscribers.length} change="+12%" positive bg="bg-primary-50" color="text-primary-600" />
        <StatCard icon={Activity}  label="المشتركون النشطون" value={active}             change="+8%"  positive bg="bg-emerald-50" color="text-emerald-600" />
        <StatCard icon={Calendar}  label="جلسات هذا الشهر"  value={sessions}           change="+18%" positive bg="bg-blue-50"    color="text-blue-600" />
        <StatCard icon={TrendingUp}label="عقود منتهية"       value={expired}            change="+1"   positive={false} bg="bg-red-50" color="text-red-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">نمو المشتركين والجلسات</h2>
            <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">2025</span>
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
          <h2 className="font-bold text-slate-800 mb-4">توزيع الأهداف</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={goalData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                {goalData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={v => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {goalData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-600">{d.name}</span>
                </div>
                <span className="font-bold text-slate-800">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscribers table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">أحدث المشتركين</h2>
          <a href="/dashboard/subscribers" className="text-primary-600 text-sm font-medium hover:underline">عرض الكل</a>
        </div>
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>{['المشترك','الهدف','السعرات','التقدم','الحالة'].map(h =>
                <th key={h} className="text-right font-semibold text-slate-500 px-5 py-3">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subscribers.slice(0,5).map(s => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${s.color} text-white flex items-center justify-center font-bold text-sm`}>{s.avatar}</div>
                      <div><p className="font-semibold text-slate-800">{s.name}</p><p className="text-xs text-slate-400">{s.age} سنة</p></div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{s.goal}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800">{s.calories.toLocaleString()} سعرة</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2 min-w-[60px]">
                        <div className="h-2 rounded-full bg-primary-500" style={{ width:`${s.progress}%` }} />
                      </div>
                      <span className="text-xs text-slate-500 w-8">{s.progress}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg[s.status]}`}>
                      {statusLbl[s.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="sm:hidden divide-y divide-slate-100">
          {subscribers.slice(0,4).map(s => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3">
              <div className={`w-10 h-10 rounded-full ${s.color} text-white flex items-center justify-center font-bold`}>{s.avatar}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{s.name}</p>
                <p className="text-xs text-slate-500">{s.goal} · {s.calories.toLocaleString()} سعرة</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg[s.status]}`}>{statusLbl[s.status]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
