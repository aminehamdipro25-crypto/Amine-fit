import { useState } from 'react'
import { Search, Plus, Phone, Target, Flame, TrendingUp } from 'lucide-react'
import { subscribers as initialData } from '../data/mockData'

const statusLabels = { active: 'نشط', expired: 'منتهي', pending: 'معلق' }
const statusColors  = {
  active:  'bg-emerald-100 text-emerald-700 border border-emerald-200',
  expired: 'bg-red-100 text-red-600 border border-red-200',
  pending: 'bg-amber-100 text-amber-700 border border-amber-200',
}

function SubscriberCard({ sub }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow animate-slide-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full ${sub.color} text-white flex items-center justify-center font-bold text-lg flex-shrink-0`}>
            {sub.avatar}
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{sub.name}</h3>
            <p className="text-xs text-slate-500">{sub.age} سنة · {sub.height} سم · {sub.weight} كغ</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[sub.status]}`}>
          {statusLabels[sub.status]}
        </span>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-50 rounded-xl p-2 text-center">
          <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1" />
          <p className="text-xs text-slate-500">السعرات</p>
          <p className="font-bold text-slate-800 text-sm">{sub.calories.toLocaleString()}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-2 text-center">
          <Target className="w-4 h-4 text-primary-500 mx-auto mb-1" />
          <p className="text-xs text-slate-500">الجلسات</p>
          <p className="font-bold text-slate-800 text-sm">{sub.sessions}/أسبوع</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-2 text-center">
          <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
          <p className="text-xs text-slate-500">التقدم</p>
          <p className="font-bold text-slate-800 text-sm">{sub.progress}%</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{sub.goal}</span>
          <span>{sub.progress}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${sub.progress}%`,
              background: sub.progress >= 75 ? '#10b981' : sub.progress >= 40 ? '#6366f1' : '#f59e0b',
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
          <Phone className="w-3.5 h-3.5" />
          <span dir="ltr">{sub.phone}</span>
        </div>
        <div className="text-xs text-slate-400">
          {sub.startDate} → {sub.endDate}
        </div>
      </div>
    </div>
  )
}

export default function Subscribers() {
  const [query, setQuery]   = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = initialData.filter(s => {
    const matchQ = s.name.includes(query) || s.phone.includes(query)
    const matchF = filter === 'all' || s.status === filter
    return matchQ && matchF
  })

  const tabs = [
    { key: 'all',     label: 'الكل',     count: initialData.length },
    { key: 'active',  label: 'نشطون',    count: initialData.filter(s => s.status === 'active').length },
    { key: 'expired', label: 'منتهون',   count: initialData.filter(s => s.status === 'expired').length },
    { key: 'pending', label: 'معلقون',   count: initialData.filter(s => s.status === 'pending').length },
  ]

  return (
    <div className="space-y-5">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="بحث بالاسم أو الهاتف..."
            className="w-full pr-9 pl-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition"
          />
        </div>
        <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          مشترك جديد
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 bg-white border border-slate-200 rounded-2xl p-1.5 w-fit shadow-sm flex-wrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === t.key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              filter === t.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">لا توجد نتائج</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(s => <SubscriberCard key={s.id} sub={s} />)}
        </div>
      )}
    </div>
  )
}
