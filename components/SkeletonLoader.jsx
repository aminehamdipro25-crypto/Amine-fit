'use client'
export function SkeletonBox({ className = '' }) {
  return <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 space-y-3 border border-slate-100">
      <SkeletonBox className="h-4 w-2/3" />
      <SkeletonBox className="h-3 w-full" />
      <SkeletonBox className="h-3 w-4/5" />
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-200 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded-lg w-1/3" />
            <div className="h-3 bg-slate-200 rounded-lg w-1/2" />
          </div>
        </div>
      </div>
      {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}

export function SkeletonMessages() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
          <div className={`animate-pulse bg-slate-200 rounded-2xl h-12 ${i % 2 === 0 ? 'w-3/4' : 'w-2/3'}`} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonList({ rows = 4 }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-200 rounded w-1/2" />
            <div className="h-2 bg-slate-200 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}
