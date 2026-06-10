'use client'
import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { FOODS, EX } from '@/lib/nutritionEngine'

// Flat searchable list from all groups
const ALL_FOODS = Object.entries(FOODS).flatMap(([group, list]) =>
  list.map(f => ({ ...f, group }))
)

/* ── Search aliases: Arabic category terms + English → food groups ───────── */
const CATEGORY_ALIASES = {
  // Arabic — فئات وأسماء شائعة
  'مكسرات':       ['fat'],
  'نات':           ['fat'],
  'دهون':         ['fat'],
  'دهن':          ['fat'],
  'زيوت':         ['fat'],
  'زيت':          ['fat'],
  'بروتين':       ['meat'],
  'لحوم':         ['meat'],
  'بروتينات':     ['meat'],
  'دجاج':         ['meat'],
  'سمك':          ['meat'],
  'بيض':          ['meat'],
  'لحم':          ['meat'],
  'نشويات':       ['starch'],
  'نشا':          ['starch'],
  'كارب':         ['starch'],
  'كربوهيدرات':   ['starch'],
  'خبز':          ['starch'],
  'أرز':          ['starch'],
  'فاكهة':        ['fruit'],
  'فواكه':        ['fruit'],
  'فاكهه':        ['fruit'],
  'خضار':         ['vegetable'],
  'خضروات':       ['vegetable'],
  'خضراوات':      ['vegetable'],
  'سلطة':         ['vegetable'],
  'حليب':         ['milk'],
  'ألبان':        ['milk'],
  'لبن':          ['milk'],
  'زبادي':        ['milk'],
  // English — groups and common food terms
  'nuts':         ['fat'],
  'nut':          ['fat'],
  'fat':          ['fat'],
  'fats':         ['fat'],
  'oil':          ['fat'],
  'oils':         ['fat'],
  'protein':      ['meat'],
  'meat':         ['meat'],
  'chicken':      ['meat'],
  'fish':         ['meat'],
  'egg':          ['meat'],
  'eggs':         ['meat'],
  'tuna':         ['meat'],
  'starch':       ['starch'],
  'starches':     ['starch'],
  'carb':         ['starch'],
  'carbs':        ['starch'],
  'rice':         ['starch'],
  'bread':        ['starch'],
  'fruit':        ['fruit'],
  'fruits':       ['fruit'],
  'vegetable':    ['vegetable'],
  'vegetables':   ['vegetable'],
  'veggies':      ['vegetable'],
  'salad':        ['vegetable'],
  'dairy':        ['milk'],
  'milk':         ['milk'],
  'yogurt':       ['milk'],
  'yoghurt':      ['milk'],
}

// Smart food search: category alias → group, then name/keyword match
function searchFoods(q) {
  const trimmed = q.trim()
  if (!trimmed) return []
  const lq = trimmed.toLowerCase()

  // 1. Category alias match → show all foods in that group
  const groups = CATEGORY_ALIASES[trimmed] || CATEGORY_ALIASES[lq]
  if (groups) {
    return ALL_FOODS.filter(f => groups.includes(f.group))
  }

  // 2. Food name + keyword match (Arabic and English)
  return ALL_FOODS.filter(f =>
    f.nameAr.includes(trimmed) ||
    f.keywords.some(k => k.includes(lq) || lq.includes(k))
  )
}

/* ── FoodSearchInput ─────────────────────────────────────────────────────── */
// onAdd receives a raw DB food object (not yet converted to a meal item)
export default function FoodSearchInput({ onAdd }) {
  const [q, setQ]       = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const results = searchFoods(q).slice(0, 10)

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-gold-400 bg-gold-50/30 focus-within:border-gold-500 transition">
        <Search className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
        <input
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="ابحث... موز، nuts، مكسرات، chicken، أرز"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 font-medium"
        />
        {q && <button type="button" onClick={() => { setQ(''); setOpen(false) }} className="text-slate-300 hover:text-slate-500"><X className="w-3.5 h-3.5" /></button>}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 z-30 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
          {results.map((food, i) => {
            const ex = EX[food.group] || {}
            return (
              <button key={i} type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => { onAdd(food); setQ(''); setOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gold-50 transition text-right border-b border-slate-50 last:border-0">
                <span className="text-lg flex-shrink-0">{ex.icon || '🍽️'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">{food.nameAr}</p>
                  <p className="text-[10px] text-slate-400">{food.grams} {food.suffix} · {ex.nameAr}</p>
                </div>
                <div className="text-[10px] font-bold flex-shrink-0 text-left ltr space-x-1">
                  <span className="text-amber-600">{ex.kcal} kcal</span>
                  {ex.protein > 0 && <span className="text-blue-500 mr-1">P:{ex.protein}غ</span>}
                  {ex.carbs   > 0 && <span className="text-emerald-500 mr-1">C:{ex.carbs}غ</span>}
                  {ex.fat     > 0 && <span className="text-rose-400 mr-1">F:{ex.fat}غ</span>}
                </div>
              </button>
            )
          })}
        </div>
      )}
      {open && q.trim().length >= 1 && results.length === 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 z-30 bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm text-slate-400 text-center">
          لا توجد نتائج — يمكنك إضافة الطعام يدوياً بالزر أدناه
        </div>
      )}
    </div>
  )
}
