'use client'
import { useState } from 'react'
import { Trash2, ChevronDown, ChevronUp, CheckCircle2, Plus, X } from 'lucide-react'
import { EX, FOODS } from '@/lib/nutritionEngine'
import FoodSearchInput from './FoodSearchInput'
import { makeDBItem, calcItemTotals, findFoodInDB } from './foodUtils'

const emptyItem = () => ({ food: '', amount: '' })

/* ── MealCard ─────────────────────────────────────────────────────────────── */
export default function MealCard({ meal, idx, onChange, onRemove }) {
  const [open, setOpen]           = useState(true)
  const [suggestion, setSuggestion] = useState(null)

  const update      = (field, val) => onChange({ ...meal, [field]: val })
  const updateMacro = (field, val) => onChange({ ...meal, macros: { ...meal.macros, [field]: val } })

  // Called whenever items array changes — recalculates meal macros from DB items
  const applyItems = (newItems) => {
    const totals = calcItemTotals(newItems)
    if (totals) {
      onChange({
        ...meal,
        items:    newItems,
        calories: String(Math.round(totals.kcal)),
        macros: {
          protein: String(Math.round(totals.protein)),
          carbs:   String(Math.round(totals.carbs)),
          fats:    String(Math.round(totals.fat)),
        },
      })
    } else {
      onChange({ ...meal, items: newItems })
    }
  }

  const addDBItem = (food) => {
    setSuggestion(null)
    applyItems([...(meal.items || []), makeDBItem(food, 1)])
  }

  const addTextItem = () => onChange({ ...meal, items: [...(meal.items || []), emptyItem()] })

  const removeItem = (i) => {
    const item      = meal.items[i]
    const newItems  = meal.items.filter((_, j) => j !== i)

    // Resolve nutritional data for the removed item
    let removedMacros = null
    let group = item?.group || null

    if (item?.fromDB) {
      removedMacros = { kcal: item.kcal || 0, protein: item.protein || 0, carbs: item.carbs || 0, fat: item.fat || 0 }
    } else if (item?.food) {
      // Text item — try to find in DB and estimate macros
      const dbFood = findFoodInDB(item.food)
      if (dbFood) {
        group = dbFood.group
        const gramsMatch = (item.amount || '').match(/^(\d+(?:\.\d+)?)/)
        const totalGrams = gramsMatch ? parseFloat(gramsMatch[1]) : dbFood.grams
        const servings   = Math.max(1, Math.round(totalGrams / dbFood.grams))
        const ex         = EX[dbFood.group] || {}
        removedMacros = {
          kcal:    Math.round((ex.kcal    || 0) * servings),
          protein: Math.round((ex.protein || 0) * servings),
          carbs:   Math.round((ex.carbs   || 0) * servings),
          fat:     Math.round((ex.fat     || 0) * servings),
        }
      }
    }

    // If all remaining items have DB data → recalculate from scratch (includes empty list case)
    const remaining = newItems.filter(x => x.fromDB)
    const allDB     = remaining.length === newItems.length

    if (allDB) {
      applyItems(newItems)
    } else if (removedMacros) {
      // Subtract the removed item's macros from the meal totals
      onChange({
        ...meal,
        items:    newItems,
        calories: String(Math.max(0, Math.round((parseFloat(meal.calories) || 0) - removedMacros.kcal))),
        macros: {
          protein: String(Math.max(0, Math.round((parseFloat(meal.macros?.protein) || 0) - removedMacros.protein))),
          carbs:   String(Math.max(0, Math.round((parseFloat(meal.macros?.carbs)   || 0) - removedMacros.carbs))),
          fats:    String(Math.max(0, Math.round((parseFloat(meal.macros?.fats)    || 0) - removedMacros.fat))),
        },
      })
    } else {
      onChange({ ...meal, items: newItems })
    }

    // Suggest alternative from the same food group
    if (group) {
      const alts = (FOODS[group] || []).filter(f => f.nameAr !== item.food)
      if (alts.length) {
        const alt = alts[Math.floor(Math.random() * Math.min(4, alts.length))]
        setSuggestion({ group, food: alt, original: item.food })
      }
    }
  }

  const updateTextItem = (i, f, v) => {
    const items = [...(meal.items || [])]
    items[i] = { ...items[i], [f]: v }
    onChange({ ...meal, items })
  }

  // Computed macros from DB items (for the badge)
  const dbTotals = calcItemTotals(meal.items || [])

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-slate-50 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="w-8 h-8 bg-[#0a0a0a] rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-gold-400 font-extrabold text-xs">{idx + 1}</span>
        </div>
        <span className="font-bold text-slate-800 flex-1 text-sm">{meal.name || `وجبة ${idx + 1}`}</span>
        {meal.calories && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${dbTotals ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400'}`}>
            {meal.calories} kcal {dbTotals ? '✓' : ''}
          </span>
        )}
        <button type="button" onClick={e => { e.stopPropagation(); onRemove() }} className="p-1 text-red-400 hover:text-red-600 transition">
          <Trash2 className="w-4 h-4" />
        </button>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </div>

      {open && (
        <div className="p-4 space-y-3">
          {/* Name + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">اسم الوجبة</label>
              <input value={meal.name} onChange={e => update('name', e.target.value)} placeholder="فطور، غداء..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">الوقت</label>
              <input value={meal.time} onChange={e => update('time', e.target.value)} placeholder="7:00 صباحاً"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
            </div>
          </div>

          {/* Macros — auto-filled when DB items present, manual otherwise */}
          <div>
            {dbTotals && (
              <p className="text-[10px] text-emerald-600 font-bold mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> تُحسب تلقائياً من الأطعمة المختارة
              </p>
            )}
            <div className="grid grid-cols-4 gap-2">
              {[
                { f: 'calories', label: 'سعرات',    ph: '500' },
                { f: 'protein',  label: 'بروتين غ', ph: '40',  macro: true },
                { f: 'carbs',    label: 'كارب غ',   ph: '60',  macro: true },
                { f: 'fats',     label: 'دهون غ',   ph: '15',  macro: true },
              ].map(({ f, label, ph, macro }) => (
                <div key={f}>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">{label}</label>
                  <input type="number"
                    value={macro ? (meal.macros?.[f] ?? '') : (meal[f] ?? '')}
                    onChange={e => macro ? updateMacro(f, e.target.value) : update(f, e.target.value)}
                    placeholder={ph}
                    readOnly={!!dbTotals}
                    className={`w-full px-2 py-2 rounded-xl border text-sm outline-none transition font-medium
                      ${dbTotals ? 'border-emerald-200 bg-emerald-50 text-emerald-700 cursor-default' : 'border-slate-200 focus:border-gold-400'}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">وصف اختياري</label>
            <textarea value={meal.description} onChange={e => update('description', e.target.value)} rows={2} placeholder="وصف مختصر..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium resize-none" />
          </div>

          {/* Food items section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">الأطعمة</p>
              <button type="button" onClick={addTextItem}
                className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition">
                <Plus className="w-3 h-3" /> إضافة نصي
              </button>
            </div>

            {/* Food search */}
            <div className="mb-3">
              <FoodSearchInput onAdd={addDBItem} />
            </div>

            {/* Suggestion banner */}
            {suggestion && (
              <div className="flex items-center gap-3 mb-2 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="text-lg flex-shrink-0">{EX[suggestion.group]?.icon || '💡'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-blue-600 font-bold">بديل مقترح — نفس المجموعة الغذائية</p>
                  <p className="text-sm font-extrabold text-slate-800">{suggestion.food.nameAr}</p>
                  <p className="text-[10px] text-slate-400">
                    {suggestion.food.grams} {suggestion.food.suffix} · {EX[suggestion.group]?.kcal} kcal
                  </p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button type="button"
                    onClick={() => addDBItem({ ...suggestion.food, group: suggestion.group })}
                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition">
                    إضافة
                  </button>
                  <button type="button" onClick={() => setSuggestion(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 transition">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Items list */}
            <div className="space-y-1.5">
              {(meal.items || []).map((item, i) =>
                item.fromDB ? (
                  /* DB-linked item */
                  <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                    <span className="text-base flex-shrink-0">{EX[item.group]?.icon || '🍽️'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{item.food}</p>
                      <p className="text-[10px] text-slate-400">{item.amount}</p>
                    </div>
                    <div className="text-[10px] font-bold flex gap-1 flex-shrink-0">
                      <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">{item.kcal}</span>
                      {item.protein > 0 && <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">P{item.protein}</span>}
                      {item.carbs   > 0 && <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">C{item.carbs}</span>}
                      {item.fat     > 0 && <span className="bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded">F{item.fat}</span>}
                    </div>
                    <button type="button" onClick={() => removeItem(i)} className="p-1.5 text-red-300 hover:text-red-500 transition flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  /* Legacy text item */
                  <div key={i} className="flex gap-2">
                    <input value={item.food || ''} onChange={e => updateTextItem(i, 'food', e.target.value)} placeholder="الطعام"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
                    <input value={item.amount || ''} onChange={e => updateTextItem(i, 'amount', e.target.value)} placeholder="الكمية"
                      className="w-28 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
                    <button type="button" onClick={() => removeItem(i)} className="p-2 text-red-300 hover:text-red-500 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              )}
              {(meal.items || []).length === 0 && (
                <p className="text-[11px] text-slate-300 text-center py-2 font-medium">ابحث عن طعام بالأعلى لإضافته</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
