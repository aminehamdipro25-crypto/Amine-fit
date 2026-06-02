'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, RefreshCw, Printer, CheckCircle2, Circle } from 'lucide-react'

// ── Category metadata ─────────────────────────────────────────────────────────
const CATEGORY_META = {
  'بروتينات':        { emoji: '🥩', color: 'bg-red-50   border-red-100',   badge: 'bg-red-100   text-red-700'   },
  'كربوهيدرات':      { emoji: '🌾', color: 'bg-amber-50  border-amber-100', badge: 'bg-amber-100 text-amber-700' },
  'خضروات':          { emoji: '🥦', color: 'bg-emerald-50 border-emerald-100', badge: 'bg-emerald-100 text-emerald-700' },
  'فواكه':           { emoji: '🍎', color: 'bg-pink-50   border-pink-100',  badge: 'bg-pink-100  text-pink-700'  },
  'ألبان ومنتجاتها': { emoji: '🥛', color: 'bg-sky-50    border-sky-100',   badge: 'bg-sky-100   text-sky-700'   },
  'دهون صحية':       { emoji: '🥑', color: 'bg-lime-50   border-lime-100',  badge: 'bg-lime-100  text-lime-700'  },
  'أخرى':            { emoji: '🛒', color: 'bg-slate-50  border-slate-100', badge: 'bg-slate-100 text-slate-600' },
}

function getMeta(categoryName) {
  return CATEGORY_META[categoryName] || CATEGORY_META['أخرى']
}

// ── Loading Spinner ───────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="max-w-md mx-auto text-center py-20">
      <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl">
        🛒
      </div>
      <h2 className="text-xl font-extrabold text-slate-900 mb-3">
        لم يتم إعداد الخطة الغذائية بعد
      </h2>
      <p className="text-slate-500 font-medium text-sm mb-6 leading-relaxed">
        قائمة التسوق تُولَّد تلقائياً من وجباتك اليومية.
        يرجى انتظار تجهيز الخطة الغذائية من قِبَل المدرب.
      </p>
      <Link
        href="/client/plan/nutrition"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 text-black font-bold rounded-xl hover:bg-amber-300 transition text-sm"
      >
        عرض الخطة الغذائية
      </Link>
    </div>
  )
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ checked, total }) {
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 print:hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-slate-700">
          {checked} / {total} مكتمل
        </span>
        <span className="text-xs font-extrabold text-amber-500">{pct}%</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ShoppingListPage() {
  const router = useRouter()
  const [loading, setLoading]       = useState(true)
  const [noplan, setNoplan]         = useState(false)
  const [categories, setCategories] = useState([])
  const [checkedSet, setCheckedSet] = useState(new Set())
  const [generatedAt, setGeneratedAt] = useState(null)

  const fetchList = useCallback(async () => {
    setLoading(true)
    setCheckedSet(new Set())
    try {
      const res = await fetch('/api/client/shopping-list')
      if (res.status === 401) { router.push('/client/login'); return }
      const data = await res.json()
      if (data.noplan) {
        setNoplan(true)
        setCategories([])
      } else {
        setNoplan(false)
        setCategories(data.categories || [])
        setGeneratedAt(data.generatedAt || null)
      }
    } catch {
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchList() }, [fetchList])

  // Count totals for the progress bar
  const totalItems   = categories.reduce((s, c) => s + c.items.length, 0)
  const checkedCount = checkedSet.size

  function toggleItem(key) {
    setCheckedSet(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function itemKey(catName, itemName) {
    return `${catName}::${itemName}`
  }

  // Format the generatedAt timestamp for display
  function formatDate(iso) {
    if (!iso) return ''
    try {
      return new Intl.DateTimeFormat('ar-SA', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(iso))
    } catch { return '' }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4" dir="rtl">

      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="print:hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-amber-400" />
              قائمة التسوق الأسبوعية
            </h1>
            {generatedAt && (
              <p className="text-xs text-slate-400 font-medium mt-1">
                تم التوليد: {formatDate(generatedAt)}
              </p>
            )}
          </div>

          {/* Action buttons */}
          {!loading && !noplan && (
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={fetchList}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition text-xs font-bold"
                title="تجديد القائمة"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                تجديد القائمة
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 text-black hover:bg-amber-300 transition text-xs font-bold"
                title="طباعة / تنزيل"
              >
                <Printer className="w-3.5 h-3.5" />
                طباعة / تنزيل
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Print header (only visible in print) ─────────────────────── */}
      <div className="hidden print:block mb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">قائمة التسوق الأسبوعية — Amine Fit</h1>
        {generatedAt && (
          <p className="text-xs text-slate-400 mt-1">{formatDate(generatedAt)}</p>
        )}
      </div>

      {/* ── States ───────────────────────────────────────────────────── */}
      {loading && <Spinner />}

      {!loading && noplan && <EmptyState />}

      {!loading && !noplan && categories.length === 0 && (
        <div className="text-center py-16 text-slate-400 font-medium">
          لا توجد عناصر في القائمة
        </div>
      )}

      {!loading && !noplan && categories.length > 0 && (
        <>
          {/* Progress bar */}
          <ProgressBar checked={checkedCount} total={totalItems} />

          {/* Category cards */}
          {categories.map(cat => {
            const meta = getMeta(cat.name)
            const catChecked = cat.items.filter(it => checkedSet.has(itemKey(cat.name, it.name))).length

            return (
              <div
                key={cat.name}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${meta.color}`}
              >
                {/* Category header */}
                <div className={`flex items-center justify-between px-5 py-3 border-b ${meta.color}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{meta.emoji}</span>
                    <span className="font-extrabold text-slate-900 text-sm">{cat.name}</span>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${meta.badge}`}>
                    {catChecked}/{cat.items.length}
                  </span>
                </div>

                {/* Items */}
                <div className="bg-white divide-y divide-slate-50">
                  {cat.items.map(item => {
                    const key     = itemKey(cat.name, item.name)
                    const checked = checkedSet.has(key)
                    return (
                      <div
                        key={key}
                        className={`flex items-center gap-3 px-5 py-3 cursor-pointer select-none transition hover:bg-slate-50 print:hover:bg-white ${
                          checked ? 'opacity-50' : ''
                        }`}
                        onClick={() => toggleItem(key)}
                      >
                        {/* Checkbox (hidden in print) */}
                        <span className="print:hidden flex-shrink-0">
                          {checked
                            ? <CheckCircle2 className="w-5 h-5 text-amber-400" />
                            : <Circle       className="w-5 h-5 text-slate-300" />
                          }
                        </span>

                        {/* Print checkbox square */}
                        <span
                          className="hidden print:inline-flex flex-shrink-0 w-4 h-4 border border-slate-400 rounded"
                          aria-hidden="true"
                        />

                        {/* Item name */}
                        <span
                          className={`flex-1 text-sm font-semibold text-slate-800 ${
                            checked ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {item.name}
                        </span>

                        {/* Quantity */}
                        <span className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full flex-shrink-0 print:bg-transparent print:border-0">
                          {item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(1)}{' '}
                          {item.unit}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Bottom action bar */}
          <div className="flex gap-3 pt-2 print:hidden">
            <button
              onClick={fetchList}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition font-bold text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              تجديد القائمة
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-400 text-black hover:bg-amber-300 transition font-bold text-sm"
            >
              <Printer className="w-4 h-4" />
              طباعة / تنزيل
            </button>
          </div>

          <p className="text-center text-slate-400 text-xs font-medium pb-4 print:hidden">
            الكميات محسوبة لمدة أسبوع كامل (7 أيام)
          </p>
        </>
      )}

      {/* ── Print styles ─────────────────────────────────────────────── */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:block  { display: block !important; }
        }
      `}</style>
    </div>
  )
}
