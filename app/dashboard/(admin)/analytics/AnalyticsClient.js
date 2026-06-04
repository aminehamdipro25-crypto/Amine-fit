'use client'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Users, TrendingUp, Target, Activity, Calendar,
  DollarSign, AlertTriangle, TrendingDown, Percent, RefreshCw,
} from 'lucide-react'

// ── Constants ──────────────────────────────────────────────────────────────────
const GOAL_LABELS  = { loss: 'خسارة وزن', gain: 'بناء عضلات', maintain: 'المحافظة', performance: 'أداء رياضي' }
const GOAL_COLORS  = { loss: '#f59e0b', gain: '#10b981', maintain: '#6366f1', performance: '#f97316' }
const ACT_LABELS   = { sedentary: 'خامل', light: 'خفيف', moderate: 'معتدل', active: 'نشيط', veryActive: 'نشيط جداً' }
const MONTHS       = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

// Plan prices in TND
const PLAN_PRICE   = { basic: 50, standard: 125, premium: 100 }
const PLAN_LABELS  = { basic: 'برنامج التدريب', standard: 'الباقة الشهرية', premium: 'باقة 3 أشهر' }

// Guess plan from free-text interestedPlan field
function guessPriceFromText(text) {
  if (!text) return null
  const t = text.toLowerCase()
  if (t.includes('premium') || t.includes('3') || t.includes('ثلاث') || t.includes('ثلث')) return 300
  if (t.includes('standard') || t.includes('شهري') || t.includes('شهرية')) return 125
  if (t.includes('basic') || t.includes('تدريب')) return 50
  return 50 // default guess
}

function maskEmail(email) {
  if (!email || !email.includes('@')) return email
  const [user, domain] = email.split('@')
  return user.slice(0, 2) + '***@' + domain
}

function daysSince(isoStr) {
  if (!isoStr) return null
  return Math.floor((Date.now() - new Date(isoStr).getTime()) / 86400000)
}

// ── Tooltip component ──────────────────────────────────────────────────────────
function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#111] border border-white/10 rounded-xl p-3 text-xs shadow-xl">
      <p className="font-bold text-white/50 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-bold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

// ── KPI Card ───────────────────────────────────────────────────────────────────
function Stat({ icon: Icon, label, value, badge, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color.bg}`}>
          <Icon className={`w-5 h-5 ${color.text}`} />
        </div>
        {badge && (
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">
            {badge}
          </span>
        )}
      </div>
      <p className="text-3xl font-extrabold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mt-1">{label}</p>
    </div>
  )
}

// ── Funnel bar ─────────────────────────────────────────────────────────────────
function FunnelBar({ label, count, pct, color }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-slate-600">{label}</span>
        <span style={{ color }}>{count} ({pct}%)</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AnalyticsClient({ submissions }) {
  const total = submissions.length
  const now   = new Date()

  // Status groups
  const activeClients      = submissions.filter(s => s.status === 'active')
  const suspendedClients   = submissions.filter(s => s.status === 'suspended')
  const pendingClients     = submissions.filter(s => s.status === 'pending')
  const expiredClients     = submissions.filter(s => s.status === 'payment_expired')
  const newClients         = submissions.filter(s => s.status === 'new')
  const cancelledClients   = submissions.filter(s => s.status === 'cancelled')
  const paidClients        = [...activeClients, ...suspendedClients, ...cancelledClients] // ever paid

  // ── Revenue calculations ────────────────────────────────────────────────────
  const totalRevenue = paidClients.reduce((sum, s) => {
    const price = PLAN_PRICE[s.subscriptionPlan] ?? 0
    // premium is 3 months; we track total paid not MRR here
    const months = s.subscriptionPlan === 'premium' ? 3 : 1
    return sum + price * months
  }, 0)

  const thisMonthRevenue = paidClients.filter(s => {
    if (!s.subscriptionStartDate) return false
    const d = new Date(s.subscriptionStartDate)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).reduce((sum, s) => {
    const price = PLAN_PRICE[s.subscriptionPlan] ?? 0
    const months = s.subscriptionPlan === 'premium' ? 3 : 1
    return sum + price * months
  }, 0)

  // MRR: active clients, normalized to monthly (premium = 100/month)
  const mrr = activeClients.reduce((sum, s) => sum + (PLAN_PRICE[s.subscriptionPlan] ?? 0), 0)

  // Lost revenue: payment_expired who had an interested plan
  const lostRevenue = expiredClients.reduce((sum, s) => {
    const price = guessPriceFromText(s.interestedPlan)
    return sum + (price ?? 0)
  }, 0)

  // ── Conversion funnel ───────────────────────────────────────────────────────
  const reachedPayment = pendingClients.length + expiredClients.length + paidClients.length
  const paid           = paidClients.length
  const currentlyActive = activeClients.length

  const pct = n => (total ? Math.round((n / total) * 100) : 0)
  const conversionRate = pct(paid)

  // ── Revenue by plan ─────────────────────────────────────────────────────────
  const planData = ['basic', 'standard', 'premium'].map(key => {
    const clients = paidClients.filter(s => s.subscriptionPlan === key)
    const months  = key === 'premium' ? 3 : 1
    return {
      name:    PLAN_LABELS[key],
      عملاء:  clients.length,
      إيراد:  clients.length * PLAN_PRICE[key] * months,
    }
  })

  // ── Monthly revenue (last 6 months) ─────────────────────────────────────────
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const d     = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const slice = paidClients.filter(s => {
      if (!s.subscriptionStartDate) return false
      const sd = new Date(s.subscriptionStartDate)
      return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth()
    })
    const revenue = slice.reduce((sum, s) => {
      const months = s.subscriptionPlan === 'premium' ? 3 : 1
      return sum + (PLAN_PRICE[s.subscriptionPlan] ?? 0) * months
    }, 0)
    return { month: MONTHS[d.getMonth()].slice(0, 3), إيراد: revenue }
  })

  // ── Monthly registrations (last 6 months) ───────────────────────────────────
  const monthlyReg = Array.from({ length: 6 }, (_, i) => {
    const d     = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const count = submissions.filter(s => {
      const sd = new Date(s.createdAt)
      return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth()
    }).length
    return { month: MONTHS[d.getMonth()].slice(0, 3), تسجيل: count }
  })

  // ── Goals distribution ───────────────────────────────────────────────────────
  const goalData = Object.entries(GOAL_LABELS).map(([k, label]) => ({
    name:  label,
    value: submissions.filter(s => s.goal === k).length,
    color: GOAL_COLORS[k],
  })).filter(g => g.value > 0)

  // ── Activity distribution ────────────────────────────────────────────────────
  const actData = Object.entries(ACT_LABELS).map(([k, label]) => ({
    name:  label,
    value: submissions.filter(s => s.activity === k || s.activityLevel === k).length,
  })).filter(g => g.value > 0)

  // ── Gender split ─────────────────────────────────────────────────────────────
  const males    = submissions.filter(s => s.gender === 'male').length
  const females  = submissions.filter(s => s.gender === 'female').length
  const genderData = [
    { name: 'ذكور', value: males,   color: '#3b82f6' },
    { name: 'إناث', value: females, color: '#ec4899' },
  ].filter(g => g.value > 0)

  // ── Avg stats ────────────────────────────────────────────────────────────────
  const ages      = submissions.filter(s => s.age).map(s => +s.age)
  const avgAge    = ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : '—'
  const weights   = submissions.filter(s => s.weight).map(s => +s.weight)
  const avgWeight = weights.length ? Math.round(weights.reduce((a, b) => a + b, 0) / weights.length) : '—'
  const progressEntries = submissions.reduce((acc, s) => acc + (s.progress?.length || 0), 0)

  // ── Abandoned clients table ──────────────────────────────────────────────────
  const abandonedClients = expiredClients.sort((a, b) =>
    new Date(b.paymentExpiredAt || b.createdAt) - new Date(a.paymentExpiredAt || a.createdAt)
  )

  return (
    <div className="space-y-5" dir="rtl">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">الإحصائيات والتحليلات</h1>
        <p className="text-sm text-slate-400 mt-0.5">نظرة شاملة على أداء الأكاديمية</p>
      </div>

      {/* ── Revenue KPIs ──────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-wide mb-3">الإيرادات</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat
            icon={DollarSign}
            label="إجمالي الإيرادات"
            value={`${totalRevenue.toLocaleString()} د.ت`}
            color={{ bg: 'bg-amber-50', text: 'text-amber-600' }}
          />
          <Stat
            icon={TrendingUp}
            label="إيرادات هذا الشهر"
            value={`${thisMonthRevenue.toLocaleString()} د.ت`}
            color={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }}
          />
          <Stat
            icon={RefreshCw}
            label="MRR (إيراد شهري متكرر)"
            value={`${mrr.toLocaleString()} د.ت`}
            badge={activeClients.length ? `${activeClients.length} نشط` : undefined}
            color={{ bg: 'bg-blue-50', text: 'text-blue-600' }}
          />
          <Stat
            icon={TrendingDown}
            label="إيراد ضائع (لم يدفعوا)"
            value={`${lostRevenue.toLocaleString()} د.ت`}
            color={{ bg: 'bg-red-50', text: 'text-red-500' }}
          />
        </div>
      </div>

      {/* ── Client KPIs ───────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-extrabold text-slate-500 uppercase tracking-wide mb-3">العملاء</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat
            icon={Users}
            label="إجمالي المسجلين"
            value={total}
            color={{ bg: 'bg-amber-50', text: 'text-amber-600' }}
          />
          <Stat
            icon={Activity}
            label="عملاء نشطون"
            value={currentlyActive}
            badge={total ? `${pct(currentlyActive)}%` : undefined}
            color={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }}
          />
          <Stat
            icon={Percent}
            label="معدل التحويل"
            value={`${conversionRate}%`}
            color={{ bg: 'bg-violet-50', text: 'text-violet-600' }}
          />
          <Stat
            icon={AlertTriangle}
            label="تخلّوا عن الدفع"
            value={expiredClients.length}
            color={{ bg: 'bg-red-50', text: 'text-red-500' }}
          />
        </div>
      </div>

      {/* ── Conversion Funnel ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <h2 className="font-extrabold text-slate-900 text-sm mb-1">قمع التحويل</h2>
        <p className="text-xs text-slate-400 mb-4">
          معدل التحويل (مسجل → دفع): <span className="text-emerald-600 font-extrabold">{conversionRate}%</span>
        </p>
        <div className="space-y-3">
          <FunnelBar label="مسجّلون" count={total}            pct={100}                color="#fbbf24" />
          <FunnelBar label="وصلوا للدفع" count={reachedPayment} pct={pct(reachedPayment)} color="#f97316" />
          <FunnelBar label="دفعوا فعلاً" count={paid}           pct={pct(paid)}           color="#10b981" />
          <FunnelBar label="نشطون الآن"  count={currentlyActive} pct={pct(currentlyActive)} color="#6366f1" />
        </div>
      </div>

      {/* ── Revenue by Plan + Monthly Revenue ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue by plan */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h2 className="font-extrabold text-slate-900 text-sm mb-4">الإيراد حسب الباقة</h2>
          {planData.every(d => d['إيراد'] === 0) ? (
            <div className="h-48 flex items-center justify-center text-slate-300 text-sm">لا بيانات</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={planData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="إيراد" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="عملاء" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h2 className="font-extrabold text-slate-900 text-sm mb-4">الإيراد الشهري (آخر 6 أشهر)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyRevenue} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="إيراد" name="إيراد (د.ت)" fill="#fbbf24" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Monthly Registrations ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h2 className="font-extrabold text-slate-900 text-sm mb-4">التسجيلات الشهرية (آخر 6 أشهر)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyReg} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="تسجيل" fill="#6366f1" radius={[6, 6, 0, 0]} />
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

      {/* ── Goals + Gender + Avg Stats ────────────────────────────────────────── */}
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
                  <Pie
                    data={goalData}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={65}
                    paddingAngle={3} dataKey="value"
                  >
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
                      <span style={{ color: g.color }}>
                        {g.value} ({total ? Math.round(g.value / total * 100) : 0}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${total ? g.value / total * 100 : 0}%`, background: g.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h2 className="font-extrabold text-slate-900 text-sm mb-3">متوسطات العملاء</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'متوسط الوزن',  val: avgWeight === '—' ? '—' : `${avgWeight} كغ`, color: '#f59e0b' },
                { label: 'متوسط العمر',  val: avgAge === '—'    ? '—' : `${avgAge} سنة`,   color: '#6366f1' },
                { label: 'سجلات التقدم', val: progressEntries,                               color: '#3b82f6' },
                { label: 'معدل التفعيل', val: total ? `${Math.round(currentlyActive / total * 100)}%` : '0%', color: '#10b981' },
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

      {/* ── Abandoned Clients Table ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-extrabold text-slate-900 text-sm">العملاء المتخلّون (لم يكملوا الدفع)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {abandonedClients.length} عميل — إيراد ضائع محتمل:{' '}
              <span className="text-red-500 font-bold">{lostRevenue.toLocaleString()} د.ت</span>
            </p>
          </div>
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>

        {abandonedClients.length === 0 ? (
          <div className="py-10 text-center text-slate-300 text-sm">لا يوجد عملاء متخلّون</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-right pb-2 text-slate-400 font-bold">الاسم</th>
                  <th className="text-right pb-2 text-slate-400 font-bold">البريد</th>
                  <th className="text-right pb-2 text-slate-400 font-bold">الباقة المهتم بها</th>
                  <th className="text-right pb-2 text-slate-400 font-bold">تاريخ التسجيل</th>
                  <th className="text-right pb-2 text-slate-400 font-bold">منذ الانتهاء</th>
                  <th className="text-right pb-2 text-slate-400 font-bold">التذكير</th>
                </tr>
              </thead>
              <tbody>
                {abandonedClients.map(client => {
                  const days         = daysSince(client.paymentExpiredAt || client.createdAt)
                  const reminderCount = client.reminderCount || (client.reminderSentAt ? 1 : 0)
                  return (
                    <tr key={client.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 font-bold text-slate-700">{client.name || '—'}</td>
                      <td className="py-2.5 text-slate-500 font-mono">{maskEmail(client.email)}</td>
                      <td className="py-2.5 text-slate-600">{client.interestedPlan || '—'}</td>
                      <td className="py-2.5 text-slate-400">
                        {client.createdAt
                          ? new Date(client.createdAt).toLocaleDateString('ar-TN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="py-2.5 text-slate-500">
                        {days !== null ? `${days} يوم` : '—'}
                      </td>
                      <td className="py-2.5">
                        {reminderCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px]">
                            {reminderCount}/5 رسائل ✓
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-bold text-[10px]">
                            لم يتم التذكير
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
