'use client'
import Link from 'next/link'
import { Key, AlertCircle, CheckCircle2, Dumbbell, Clock, Eye, CreditCard } from 'lucide-react'
import { SubBadge } from './SubscriptionSection'

// ── Online status helpers ─────────────────────────────────────────────────────
function getOnlineStatus(info) {
  if (!info?.lastSeen) return 'offline'
  const diffMin = (Date.now() - new Date(info.lastSeen).getTime()) / 60000
  if (diffMin < 2)  return 'online'
  if (diffMin < 10) return 'away'
  return 'offline'
}

function formatAgo(iso) {
  if (!iso) return null
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diffMin < 1)  return 'الآن'
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24)   return `منذ ${diffH} ساعة`
  return new Date(iso).toLocaleDateString('ar', { month:'short', day:'numeric' })
}

const goalMap = {
  loss:        { label:'خسارة وزن',       color:'bg-amber-50 text-amber-700 border border-amber-200',   icon:'📉' },
  gain:        { label:'بناء عضلات',       color:'bg-blue-50 text-blue-700 border border-blue-200',      icon:'💪' },
  maintain:    { label:'الحفاظ على الوزن', color:'bg-emerald-50 text-emerald-700 border border-emerald-200', icon:'⚖️' },
  performance: { label:'أداء رياضي',       color:'bg-purple-50 text-purple-700 border border-purple-200', icon:'🏃' },
}

const statusMap = {
  new:             { label:'جديد',               color:'bg-amber-100 text-amber-700 border border-amber-200',     icon: Clock },
  reviewed:        { label:'تمت المراجعة',       color:'bg-blue-100 text-blue-700 border border-blue-200',       icon: Eye },
  pending:         { label:'انتظار الدفع',        color:'bg-yellow-100 text-yellow-700 border border-yellow-200', icon: CreditCard },
  payment_expired: { label:'انتهت مهلة الدفع',   color:'bg-orange-100 text-orange-700 border border-orange-200', icon: AlertCircle },
  active:          { label:'نشط',                color:'bg-emerald-100 text-emerald-700 border border-emerald-200', icon: CheckCircle2 },
  suspended:       { label:'معلق',               color:'bg-red-100 text-red-700 border border-red-200',           icon: AlertCircle },
}

function Badge({ status }) {
  const cfg = statusMap[status] || statusMap.new
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  )
}

export default function ClientCard({ client: c, onlineInfo, onSelect, onApprove, onChangeStatus, onBuildPlan }) {
  const goal = goalMap[c.goal]

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
      onClick={() => onSelect(c)}>

      {/* Card header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-[#0a0a0a] text-gold-400 flex items-center justify-center font-extrabold text-xl">
              {c.name?.[0] ?? '?'}
            </div>
            <span className={`absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 rounded-full border-2 border-white flex-shrink-0
              ${getOnlineStatus(onlineInfo) === 'online'  ? 'bg-emerald-500' :
                getOnlineStatus(onlineInfo) === 'away'    ? 'bg-amber-400' :
                'bg-slate-300'}`} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-extrabold text-slate-900 text-sm leading-tight">{c.name}</p>
              {c.source === 'contact' && (
                <span className="text-[9px] font-extrabold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full border border-blue-200 uppercase">تواصل</span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[140px] mt-0.5">
              {getOnlineStatus(onlineInfo) === 'online' ? (
                <span className="text-emerald-600 font-bold">● داخل المنصة الآن</span>
              ) : onlineInfo?.lastSeen ? (
                <span className="text-slate-400">{formatAgo(onlineInfo?.lastSeen)}</span>
              ) : (c.email || c.phone)}
            </p>
          </div>
        </div>
        <Badge status={c.status} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label:'العمر',  val: c.age    ? `${c.age}س`    : '—' },
          { label:'الوزن',  val: c.weight ? `${c.weight}كغ` : '—' },
          { label:'الطول',  val: c.height ? `${c.height}سم` : '—' },
        ].map(s => (
          <div key={s.label} className="bg-slate-50 rounded-xl p-2.5 text-center">
            <p className="text-sm font-extrabold text-slate-800">{s.val}</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Subscription badge */}
      {(c.subscriptionPlan || c.interestedPlan) && (
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <SubBadge client={c} />
          {!c.subscriptionPlan && c.interestedPlan && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 whitespace-nowrap">
              ⭐ {c.interestedPlan}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        {goal
          ? <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${goal.color}`}>{goal.icon} {goal.label}</span>
          : <span className="text-xs text-slate-300">—</span>
        }
        {c.status === 'pending' ? (
          <button
            onClick={e => { e.stopPropagation(); onApprove(c.id, c.email) }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-400 text-black text-[11px] font-extrabold hover:bg-amber-300 transition">
            ✓ موافقة
          </button>
        ) : c.status === 'suspended' ? (
          <button
            onClick={e => { e.stopPropagation(); onChangeStatus(c.id, 'active') }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 text-white text-[11px] font-extrabold hover:bg-emerald-600 transition">
            <CheckCircle2 className="w-3 h-3" />
            إعادة تفعيل
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button title="إنشاء كود تفعيل جديد"
              onClick={e => { e.stopPropagation(); onApprove(c.id, c.email) }}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:border-amber-300 hover:text-amber-500 hover:bg-amber-50 transition">
              <Key className="w-3.5 h-3.5" />
            </button>
            <button title="تعليق الحساب فوراً"
              onClick={e => { e.stopPropagation(); onChangeStatus(c.id, 'suspended') }}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition">
              <AlertCircle className="w-3.5 h-3.5" />
            </button>
            <Link href={`/dashboard/clients/${c.id}/plan`}
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0a0a0a] text-gold-400 text-[11px] font-extrabold hover:bg-black transition">
              <Dumbbell className="w-3 h-3" />
              {c.plan?.nutrition?.calories || c.plan?.training?.daysPerWeek ? 'تعديل الخطة' : 'بناء الخطة'}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
