'use client'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Users, TrendingUp, Target, Activity, Calendar, ArrowUpRight } from 'lucide-react'

const GOAL_LABELS = { loss: 'خسارة وزن', gain: 'بناء عضلات', maintain: 'المحافظة', performance: 'أداء رياضي' }
const GOAL_COLORS = { loss: '#f59e0b', gain: '#10b981', maintain: '#6366f1', performance: '#f97316' }
const ACT_LABELS  = { sedentary: 'خامل', light: 'خفيف', moderate: 'معتدل', active: 'نشيط', veryActive: 'نشيط جداً' }
const MONTHS      = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#111] border border-white/10 rounded-xl p-3 text-xs shadow-xl">
      <p className="font-bold text-white/50 mb-1">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }} className="font-bold">{p.name}: {p.value}</p>)}
    </div>
  )
}

function Stat({ icon: Icon, label, value, badge, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color.bg}`}>
          <Icon className={`w-5 h-5 ${color.text}`} />
        </div>
        {badge && <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">{badge}</span>}
      </div>
      <p className="text-4xl font-extrabold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mt-1">{label}</p>
    </div>
  )
}

export default function AnalyticsClient({ submissions }) {
  const total   = submissions.length
  const active  = submissions.filter(s => s.status === 'active').length
  const newOnes = submissions.filter(s => s.status === 'new').length

  // Monthly registrations (last 6 months)
  const now = new Date()
  const monthlyReg = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const count = submissions.filter(s => {
      const sd = new Date(s.createdAt)
      return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth()
    }).length
    return { month: MONTHS[d.getMonth()].slice(0, 3), count }
  })

  // Goals distribution
  const goalData = Object.entries(GOAL_LABELS).map(([k, label]) => ({
    name: label,
    value: submissions.filter(s => s.goal === k).length,
    color: GOAL_COLORS[k],
  })).filter(g => g.value > 0)

  // Activity distribution
  const actData = Object.entries(ACT_LABELS).map(([k, label]) => ({
    name: label,
    value: submissions.filter(s => s.activity === k).length,
  })).filter(g => g.value > 0)

  // Gender split
  const males   = submissions.filter(s => s.gender === 'male').length
  const females = submissions.filter(s => s.gender === 'female').length
  const genderData = [
    { name: 'ذكور', value: males,   color: '#3b82f6' },
    { name: 'إناث', value: females, color: '#ec4899' },
  ].filter(g => g.value > 0)

  // Avg age
  const ages   = submissions.filter(s => s.age).map(s => +s.age)
  const avgAge = ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : '—'

  // Avg weight
  const weights   = submissions.filter(s => s.weight).map(s => +s.weight)
  const avgWeight = weights.length ? Math.round(weights.reduce((a, b) => a + b, 0) / weights.length) : '—'

  // Progress entries across all clients
  const progressEntries = submissions.reduce((acc, s) => acc + (s.progress?.length || 0), 0)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">الإحصائيات والتحليلات</h1>
        <p className="text-sm text-slate-400 mt-0.5">نظرة شاملة على أداء الأكاديمية</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Users}      label="إجمالي العملاء"    value={total}          color={{ bg: 'bg-gold-50',    text: 'text-gold-600' }} />
        <Stat icon={Activity}   label="عملاء نشطون"        value={active}         color={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }} badge={total ? `${Math.round(active/total*100)}%` : undefined} />
        <Stat icon={Calendar}   label="سجلات التقدم"       value={progressEntries} color={{ bg: 'bg-blue-50',   text: 'text-blue-600' }} />
        <Stat icon={Target}     label="متوسط العمر"        value={avgAge === '—' ? '—' : `${avgAge} سنة`} color={{ bg: 'bg-violet-50', text: 'text-violet-600' }} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly registrations */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h2 className="font-extrabold text-slate-900 text-sm mb-4">التسجيلات الشهرية (آخر 6 أشهر)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyReg} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="count" name="تسجيل" fill="#fbbf24" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity levels */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h2 className="font-extrabold text-slate-900 text-sm mb-4">مستويات النشاط</h2>
          {actData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-300 text-sm">لا بيانات</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={actData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="value" name="عدد" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Goals pie */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h2 className="font-extrabold text-slate-900 text-sm mb-4">توزيع الأهداف</h2>
          {goalData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-300 text-sm">لا بيانات</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={goalData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                    {goalData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={v => `${v} عميل`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {goalData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-xs text-slate-500">{d.name}</span>
                    <span className="text-xs font-extrabold text-slate-800 mr-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Gender + avg stats */}
        <div className="space-y-4">
          {/* Gender */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h2 className="font-extrabold text-slate-900 text-sm mb-3">توزيع الجنس</h2>
            {genderData.length === 0 ? (
              <p className="text-slate-300 text-sm">لا بيانات</p>
            ) : (
              <div className="space-y-2">
                {genderData.map(g => (
                  <div key={g.name}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-600">{g.name}</span>
                      <span style={{ color: g.color }}>{g.value} ({total ? Math.round(g.value/total*100) : 0}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${total ? g.value/total*100 : 0}%`, background: g.color }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Avg stats */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h2 className="font-extrabold text-slate-900 text-sm mb-3">متوسطات العملاء</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'متوسط الوزن', val: avgWeight === '—' ? '—' : `${avgWeight} كغ`, color: '#f59e0b' },
                { label: 'متوسط العمر',  val: avgAge === '—' ? '—' : `${avgAge} سنة`,   color: '#6366f1' },
                { label: 'عملاء جدد',   val: newOnes,                                    color: '#f97316' },
                { label: 'معدل التفعيل', val: total ? `${Math.round(active/total*100)}%` : '0%', color: '#10b981' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-extrabold" style={{ color: s.color }}>{s.val}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
