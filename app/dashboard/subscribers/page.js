'use client'
import { useState } from 'react'
import { Search, Plus, Phone, Target, Flame, TrendingUp } from 'lucide-react'
import { subscribers as data } from '@/lib/mockData'

const statusCfg = {
  active:  'bg-emerald-100 text-emerald-700 border border-emerald-200',
  expired: 'bg-red-100 text-red-600 border border-red-200',
  pending: 'bg-amber-100 text-amber-700 border border-amber-200',
}
const statusLbl = { active:'نشط', expired:'منتهي', pending:'معلق' }

function Card({ s }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full ${s.color} text-white flex items-center justify-center font-bold text-lg`}>{s.avatar}</div>
          <div>
            <h3 className="font-bold text-slate-800">{s.name}</h3>
            <p className="text-xs text-slate-500">{s.age} سنة · {s.height} سم · {s.weight} كغ</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg[s.status]}`}>{statusLbl[s.status]}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { icon: Flame,      color:'text-orange-500', label:'السعرات', val: s.calories.toLocaleString() },
          { icon: Target,     color:'text-primary-500',label:'الجلسات', val:`${s.sessions}/أسبوع` },
          { icon: TrendingUp, color:'text-emerald-500',label:'التقدم',  val:`${s.progress}%` },
        ].map(({ icon: Icon, color, label, val }) => (
          <div key={label} className="bg-slate-50 rounded-xl p-2 text-center">
            <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
            <p className="text-xs text-slate-500">{label}</p>
            <p className="font-bold text-slate-800 text-sm">{val}</p>
          </div>
        ))}
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-500 mb-1"><span>{s.goal}</span><span>{s.progress}%</span></div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div className="h-2 rounded-full transition-all" style={{
            width: `${s.progress}%`,
            background: s.progress >= 75 ? '#10b981' : s.progress >= 40 ? '#6366f1' : '#f59e0b'
          }} />
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
          <Phone className="w-3.5 h-3.5" /><span dir="ltr">{s.phone}</span>
        </div>
        <div className="text-xs text-slate-400">{s.startDate} → {s.endDate}</div>
      </div>
    </div>
  )
}

export default function SubscribersPage() {
  const [q, setQ]           = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = data.filter(s =>
    (s.name.includes(q) || s.phone.includes(q)) &&
    (filter === 'all' || s.status === filter)
  )

  const tabs = [
    { key:'all',     label:'الكل',   count:data.length },
    { key:'active',  label:'نشطون',  count:data.filter(s=>s.status==='active').length },
    { key:'expired', label:'منتهون', count:data.filter(s=>s.status==='expired').length },
    { key:'pending', label:'معلقون', count:data.filter(s=>s.status==='pending').length },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="بحث بالاسم أو الهاتف..."
            className="w-full pr-9 pl-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition" />
        </div>
        <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm">
          <Plus className="w-4 h-4" /> مشترك جديد
        </button>
      </div>

      <div className="flex gap-2 bg-white border border-slate-200 rounded-2xl p-1.5 w-fit shadow-sm flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
              ${filter===t.key ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter===t.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0
        ? <div className="text-center py-16 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا توجد نتائج</p>
          </div>
        : <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(s => <Card key={s.id} s={s} />)}
          </div>
      }
    </div>
  )
}
