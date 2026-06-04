'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Utensils, Dumbbell, Plus, Trash2, Save, ArrowRight,
  ChevronDown, ChevronUp, Loader2, CheckCircle2, Flame, Zap,
  Sparkles, LogIn, Download, Info, X, Brain, Wand2, Paperclip, Search,
} from 'lucide-react'
import { FOODS, EX } from '@/lib/nutritionEngine'

// Flat searchable list from all groups
const ALL_FOODS = Object.entries(FOODS).flatMap(([group, list]) =>
  list.map(f => ({ ...f, group }))
)

// Create a structured food item from a DB food entry
function makeDBItem(food, servings = 1) {
  const ex = EX[food.group] || {}
  return {
    food:     food.nameAr,
    amount:   `${food.grams * servings} ${food.suffix}`,
    group:    food.group,
    servings,
    kcal:     Math.round((ex.kcal    || 0) * servings),
    protein:  Math.round((ex.protein || 0) * servings),
    carbs:    Math.round((ex.carbs   || 0) * servings),
    fat:      Math.round((ex.fat     || 0) * servings),
    fromDB:   true,
  }
}

// Sum macros from DB-linked items only
function calcItemTotals(items) {
  const db = (items || []).filter(i => i.fromDB)
  if (!db.length) return null
  return db.reduce((acc, i) => ({
    kcal:    acc.kcal    + (i.kcal    || 0),
    protein: acc.protein + (i.protein || 0),
    carbs:   acc.carbs   + (i.carbs   || 0),
    fat:     acc.fat     + (i.fat     || 0),
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0 })
}

// Find a food in DB using exact → partial → keyword matching
function findFoodInDB(name) {
  if (!name) return null
  const n = name.trim()
  // 1. Exact
  let f = ALL_FOODS.find(x => x.nameAr === n)
  if (f) return f
  // 2. One contains the other
  f = ALL_FOODS.find(x => x.nameAr.includes(n) || n.includes(x.nameAr))
  if (f) return f
  // 3. Keyword match
  const lq = n.toLowerCase()
  f = ALL_FOODS.find(x => x.keywords.some(k => k.includes(lq) || lq.includes(k)))
  return f || null
}

// Retroactively link saved text items to DB (for existing plans from Redis)
function linkMealsToDB(meals) {
  return (meals || []).map(m => {
    const linkedItems = (m.items || []).map(item => {
      if (item.fromDB) return item
      const dbFood = findFoodInDB(item.food)
      if (!dbFood) return item
      // Estimate servings from the amount string ("40 غ مطبوخ..." → 40 / grams_per_serving)
      const gramsMatch = (item.amount || '').match(/^(\d+(?:\.\d+)?)/)
      const totalGrams = gramsMatch ? parseFloat(gramsMatch[1]) : dbFood.grams
      const ratio      = totalGrams > 0 ? totalGrams / dbFood.grams : 1
      // Only convert if ratio is plausible (0.5–8×); otherwise keep as text to avoid wrong macros
      if (ratio < 0.5 || ratio > 8) return item
      const servings = Math.max(1, Math.round(ratio))
      return makeDBItem(dbFood, servings)
    })
    const totals = calcItemTotals(linkedItems)
    if (!totals) return { ...m, items: linkedItems }
    return {
      ...m,
      items:    linkedItems,
      calories: String(Math.round(totals.kcal)),
      macros: {
        protein: String(Math.round(totals.protein)),
        carbs:   String(Math.round(totals.carbs)),
        fats:    String(Math.round(totals.fat)),
      },
    }
  })
}

const emptyMeal     = () => ({ name:'', time:'', calories:'', description:'', items:[], macros:{ protein:'', carbs:'', fats:'' } })
const emptyItem     = () => ({ food:'', amount:'' })
const emptyExercise = () => ({ name:'', sets:'', reps:'', rest:'', note:'', videoUrl:'' })
const emptyDay      = () => ({ name:'', focus:'', description:'', exercises:[] })

/* ── Training templates ──────────────────────────────────────────────────── */
const TEMPLATES = {
  ppl: {
    label: 'Push / Pull / Legs',
    emoji: '💪',
    desc: '٣ أيام — PPL',
    days: [
      { name:'Push Day', focus:'صدر وكتف', description:'', exercises:[
        { name:'Barbell Bench Press',    sets:'4', reps:'8-10',  rest:'90s',   note:'Keep the bar touching chest each rep', videoUrl:'' },
        { name:'Incline Dumbbell Press', sets:'3', reps:'10-12', rest:'60s',   note:'', videoUrl:'' },
        { name:'Overhead Press',         sets:'4', reps:'8-10',  rest:'90s',   note:'', videoUrl:'' },
        { name:'Lateral Raise',          sets:'3', reps:'15',    rest:'45s',   note:'Control the descent', videoUrl:'' },
        { name:'Tricep Pushdown',        sets:'3', reps:'15',    rest:'45s',   note:'', videoUrl:'' },
      ]},
      { name:'Pull Day', focus:'ظهر وبايسبس', description:'', exercises:[
        { name:'Wide-Grip Pull-Up',      sets:'4', reps:'6-8',   rest:'90s',   note:'ابدأ الحركة بعضلة الظهر لا الذراع', videoUrl:'' },
        { name:'Barbell Row',            sets:'4', reps:'8-10',  rest:'90s',   note:'', videoUrl:'' },
        { name:'Lat Pulldown',           sets:'3', reps:'12',    rest:'60s',   note:'', videoUrl:'' },
        { name:'Barbell Curl',           sets:'3', reps:'10-12', rest:'60s',   note:'', videoUrl:'' },
        { name:'Hammer Curl',            sets:'3', reps:'12',    rest:'45s',   note:'', videoUrl:'' },
      ]},
      { name:'Legs Day', focus:'أرجل', description:'', exercises:[
        { name:'Barbell Back Squat',     sets:'5', reps:'8-10',  rest:'2 min', note:'ظهر مستقيم، ركبة لا تتجاوز القدم', videoUrl:'' },
        { name:'Leg Press',              sets:'4', reps:'12',    rest:'90s',   note:'', videoUrl:'' },
        { name:'Romanian Deadlift',      sets:'3', reps:'12',    rest:'90s',   note:'', videoUrl:'' },
        { name:'Leg Curl',               sets:'3', reps:'15',    rest:'60s',   note:'', videoUrl:'' },
        { name:'Standing Calf Raise',    sets:'4', reps:'20',    rest:'45s',   note:'', videoUrl:'' },
      ]},
    ],
  },
  upper_lower: {
    label: 'Upper / Lower',
    emoji: '🔄',
    desc: '٤ أيام — علوي/سفلي',
    days: [
      { name:'Upper Body A', focus:'صدر وظهر', description:'', exercises:[
        { name:'Barbell Bench Press',    sets:'4', reps:'6-8',   rest:'2 min', note:'', videoUrl:'' },
        { name:'Barbell Row',            sets:'4', reps:'6-8',   rest:'2 min', note:'', videoUrl:'' },
        { name:'Incline Dumbbell Press', sets:'3', reps:'10-12', rest:'90s',   note:'', videoUrl:'' },
        { name:'Cable Row',              sets:'3', reps:'10-12', rest:'90s',   note:'', videoUrl:'' },
      ]},
      { name:'Lower Body A', focus:'أرجل', description:'', exercises:[
        { name:'Barbell Back Squat',     sets:'4', reps:'6-8',   rest:'2 min', note:'', videoUrl:'' },
        { name:'Leg Press',              sets:'3', reps:'12',    rest:'90s',   note:'', videoUrl:'' },
        { name:'Leg Extension',          sets:'3', reps:'15',    rest:'60s',   note:'', videoUrl:'' },
        { name:'Standing Calf Raise',    sets:'4', reps:'15',    rest:'45s',   note:'', videoUrl:'' },
      ]},
      { name:'Upper Body B', focus:'كتف', description:'', exercises:[
        { name:'Overhead Press',         sets:'4', reps:'8-10',  rest:'90s',   note:'', videoUrl:'' },
        { name:'Lat Pulldown',           sets:'4', reps:'8-10',  rest:'90s',   note:'', videoUrl:'' },
        { name:'Lateral Raise',          sets:'3', reps:'15',    rest:'45s',   note:'', videoUrl:'' },
        { name:'Barbell Curl',           sets:'3', reps:'10-12', rest:'60s',   note:'', videoUrl:'' },
        { name:'Tricep Pushdown',        sets:'3', reps:'12',    rest:'60s',   note:'', videoUrl:'' },
      ]},
      { name:'Lower Body B', focus:'أرجل وبطن', description:'', exercises:[
        { name:'Romanian Deadlift',      sets:'4', reps:'8-10',  rest:'90s',   note:'ظهر مستقيم طوال الحركة', videoUrl:'' },
        { name:'Walking Lunge',          sets:'3', reps:'12 each',rest:'60s',  note:'', videoUrl:'' },
        { name:'Leg Curl',               sets:'3', reps:'12',    rest:'60s',   note:'', videoUrl:'' },
        { name:'Plank',                  sets:'3', reps:'45s',   rest:'30s',   note:'', videoUrl:'' },
        { name:'Cable Crunch',           sets:'3', reps:'20',    rest:'30s',   note:'', videoUrl:'' },
      ]},
    ],
  },
  full_body: {
    label: 'Full Body 3×',
    emoji: '⚡',
    desc: '٣ أيام — جسم كامل',
    days: [
      { name:'Full Body A', focus:'كامل', description:'', exercises:[
        { name:'Barbell Back Squat',     sets:'3', reps:'8',     rest:'2 min', note:'', videoUrl:'' },
        { name:'Barbell Bench Press',    sets:'3', reps:'8',     rest:'90s',   note:'', videoUrl:'' },
        { name:'Barbell Row',            sets:'3', reps:'8',     rest:'90s',   note:'', videoUrl:'' },
        { name:'Overhead Press',         sets:'3', reps:'10',    rest:'90s',   note:'', videoUrl:'' },
        { name:'Plank',                  sets:'3', reps:'45s',   rest:'30s',   note:'', videoUrl:'' },
      ]},
      { name:'Full Body B', focus:'كامل', description:'', exercises:[
        { name:'Romanian Deadlift',      sets:'3', reps:'10',    rest:'90s',   note:'', videoUrl:'' },
        { name:'Incline Dumbbell Press', sets:'3', reps:'12',    rest:'60s',   note:'', videoUrl:'' },
        { name:'Cable Row',              sets:'3', reps:'12',    rest:'60s',   note:'', videoUrl:'' },
        { name:'Lateral Raise',          sets:'3', reps:'15',    rest:'45s',   note:'', videoUrl:'' },
        { name:'Bicycle Crunch',         sets:'3', reps:'20',    rest:'30s',   note:'', videoUrl:'' },
      ]},
      { name:'Full Body C', focus:'كامل', description:'', exercises:[
        { name:'Walking Lunge',          sets:'3', reps:'12 each',rest:'60s',  note:'', videoUrl:'' },
        { name:'Dumbbell Bench Press',   sets:'3', reps:'15',    rest:'60s',   note:'', videoUrl:'' },
        { name:'Lat Pulldown',           sets:'3', reps:'15',    rest:'60s',   note:'', videoUrl:'' },
        { name:'Arnold Press',           sets:'3', reps:'12',    rest:'60s',   note:'', videoUrl:'' },
        { name:'Leg Raise',              sets:'3', reps:'15',    rest:'45s',   note:'', videoUrl:'' },
      ]},
    ],
  },
}

const FOCUS_OPTIONS = ['صدر', 'ظهر', 'كتف', 'ذراعين', 'أرجل', 'بطن', 'كارديو', 'كامل', 'صدر وكتف', 'ظهر وبايسبس']
const FOCUS_ICONS   = { 'صدر':'🫀','ظهر':'🔙','كتف':'💪','ذراعين':'💪','أرجل':'🦵','بطن':'⚡','كارديو':'🏃','كامل':'⚡','صدر وكتف':'🫀','ظهر وبايسبس':'🔙' }

/* ── ExerciseRow — compact inline edit ───────────────────────────────────── */
function ExerciseRow({ ex, idx, onChange, onRemove }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      {/* Compact row */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="w-6 h-6 bg-slate-100 rounded-lg text-slate-500 text-[10px] font-extrabold flex items-center justify-center flex-shrink-0">
          {idx + 1}
        </span>
        <input
          value={ex.name}
          onChange={e => onChange({ ...ex, name: e.target.value })}
          placeholder="اسم التمرين..."
          className="flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-300 min-w-0"
        />
        <input
          value={ex.sets}
          onChange={e => onChange({ ...ex, sets: e.target.value })}
          placeholder="3"
          title="عدد المجموعات"
          className="w-9 text-center text-xs font-bold text-slate-700 bg-slate-50 rounded-lg py-1 border border-slate-200 outline-none focus:border-gold-400 transition"
        />
        <span className="text-slate-300 text-xs font-bold select-none">×</span>
        <input
          value={ex.reps}
          onChange={e => onChange({ ...ex, reps: e.target.value })}
          placeholder="12"
          title="عدد التكرارات"
          className="w-12 text-center text-xs font-bold text-slate-700 bg-slate-50 rounded-lg py-1 border border-slate-200 outline-none focus:border-gold-400 transition"
        />
        <input
          value={ex.rest}
          onChange={e => onChange({ ...ex, rest: e.target.value })}
          placeholder="60ث"
          title="الراحة"
          className="w-14 text-center text-[11px] text-slate-500 bg-slate-50 rounded-lg py-1 border border-slate-200 outline-none focus:border-gold-400 transition"
        />
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          title="ملاحظة / فيديو"
          className={`p-1 rounded-lg transition flex-shrink-0 ${open ? 'bg-slate-100 text-slate-600' : 'text-slate-300 hover:text-slate-500'}`}
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
        <button type="button" onClick={onRemove} className="p-1 text-red-200 hover:text-red-500 transition flex-shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Expandable details */}
      {open && (
        <div className="border-t border-slate-50 bg-slate-50/50 px-3 pb-3 pt-2 space-y-2">
          <input
            value={ex.note || ''}
            onChange={e => onChange({ ...ex, note: e.target.value })}
            placeholder="ملاحظة للعميل — اختياري"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-gold-400 transition font-medium"
          />
          <input
            value={ex.videoUrl || ''}
            onChange={e => onChange({ ...ex, videoUrl: e.target.value })}
            placeholder="رابط YouTube للشرح — اختياري"
            dir="ltr"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-gold-400 transition font-medium"
          />
        </div>
      )}
    </div>
  )
}

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
function FoodSearchInput({ onAdd }) {
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
                onClick={() => { onAdd(makeDBItem(food, 1)); setQ(''); setOpen(false) }}
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

/* ── MealCard ─────────────────────────────────────────────────────────────── */
function MealCard({ meal, idx, onChange, onRemove }) {
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

  const addDBItem = (dbFood) => {
    setSuggestion(null)
    applyItems([...(meal.items || []), dbFood])
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
                    onClick={() => addDBItem(makeDBItem({ ...suggestion.food, group: suggestion.group }))}
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

/* ── DayCard ──────────────────────────────────────────────────────────────── */
function DayCard({ day, idx, onChange, onRemove }) {
  const [open, setOpen] = useState(true)
  const update = (field, val) => onChange({ ...day, [field]: val })
  const addExercise = () => onChange({ ...day, exercises: [...(day.exercises || []), emptyExercise()] })
  const updateEx = (i, val) => {
    const exercises = [...(day.exercises || [])]
    exercises[i] = val
    onChange({ ...day, exercises })
  }
  const removeEx = (i) => onChange({ ...day, exercises: day.exercises.filter((_, j) => j !== i) })
  const focusIcon = FOCUS_ICONS[day.focus] || '🏋️'

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 p-4 bg-slate-50 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="w-8 h-8 bg-[#0a0a0a] rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-gold-400 font-extrabold text-xs">{idx + 1}</span>
        </div>
        <span className="text-lg">{focusIcon}</span>
        <div className="flex-1 min-w-0">
          <span className="font-bold text-slate-800 text-sm block truncate">{day.name || `اليوم ${idx + 1}`}</span>
          {day.focus && <span className="text-xs text-slate-400">{day.focus} · {day.exercises?.length || 0} تمارين</span>}
        </div>
        <button type="button" onClick={e => { e.stopPropagation(); onRemove() }} className="p-1 text-red-400 hover:text-red-600 transition">
          <Trash2 className="w-4 h-4" />
        </button>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </div>

      {open && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">اسم اليوم</label>
              <input value={day.name} onChange={e => update('name', e.target.value)} placeholder="يوم الصدر..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">العضلة المستهدفة</label>
              <select value={day.focus} onChange={e => update('focus', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium bg-white">
                <option value="">اختر...</option>
                {FOCUS_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* Exercises header */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-xs font-extrabold text-slate-600">التمارين</p>
              <p className="text-[10px] text-slate-400">المجموعات × التكرارات · الراحة — اضغط ↓ لإضافة ملاحظة أو فيديو</p>
            </div>
            <button type="button" onClick={addExercise}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0a0a0a] text-white font-bold text-[11px] hover:bg-black transition">
              <Plus className="w-3 h-3" /> إضافة
            </button>
          </div>

          {(day.exercises || []).length === 0 ? (
            <div className="text-center py-5 border-2 border-dashed border-slate-100 rounded-xl">
              <p className="text-xs text-slate-300 font-medium">لا تمارين — اضغط "إضافة" أو اختر قالباً</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {(day.exercises || []).map((ex, i) => (
                <ExerciseRow key={i} ex={ex} idx={i} onChange={v => updateEx(i, v)} onRemove={() => removeEx(i)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── AI Generate Modal ───────────────────────────────────────────────────── */
function AIGenerateModal({ form, setForm, onGenerate, onClose, loading }) {
  const goalOptions    = [{ v:'gain', l:'بناء العضلات 💪' }, { v:'loss', l:'خسارة الدهون 🔥' }, { v:'maintain', l:'الحفاظ على اللياقة ⚡' }]
  const levelOptions   = [{ v:'beginner', l:'مبتدئ' }, { v:'intermediate', l:'متوسط' }, { v:'advanced', l:'متقدم' }]
  const daysOptions    = ['2','3','4','5','6']
  const equipOptions   = [{ v:'gym', l:'صالة كاملة 🏋️' }, { v:'home', l:'منزل (دمبل+بار) 🏠' }, { v:'bodyweight', l:'بدون معدات 🤸' }]

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-[#0a0a0a] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#fbbf24]/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-[#fbbf24]" />
            </div>
            <div>
              <p className="text-white font-extrabold text-sm">توليد بالذكاء الاصطناعي</p>
              <p className="text-white/40 text-[11px]">برنامج مخصص في ثوانٍ</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">الهدف</label>
            <div className="grid grid-cols-3 gap-2">
              {goalOptions.map(o => (
                <button key={o.v} type="button" onClick={() => setForm(f => ({ ...f, goal: o.v }))}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${form.goal === o.v ? 'bg-[#0a0a0a] text-[#fbbf24] border-[#0a0a0a]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">المستوى</label>
            <div className="grid grid-cols-3 gap-2">
              {levelOptions.map(o => (
                <button key={o.v} type="button" onClick={() => setForm(f => ({ ...f, level: o.v }))}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${form.level === o.v ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">أيام التدريب / أسبوع</label>
            <div className="flex gap-2">
              {daysOptions.map(d => (
                <button key={d} type="button" onClick={() => setForm(f => ({ ...f, daysPerWeek: d }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-extrabold border transition-all ${form.daysPerWeek === d ? 'bg-[#fbbf24] text-black border-[#fbbf24]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">المعدات</label>
            <div className="grid grid-cols-3 gap-2">
              {equipOptions.map(o => (
                <button key={o.v} type="button" onClick={() => setForm(f => ({ ...f, equipment: o.v }))}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${form.equipment === o.v ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">إصابات أو قيود (اختياري)</label>
            <input value={form.injuries} onChange={e => setForm(f => ({ ...f, injuries: e.target.value }))}
              placeholder="مثال: ألم في الركبة اليسرى..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#fbbf24] transition font-medium" />
          </div>
          <button onClick={onGenerate} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0a0a0a] text-white rounded-2xl font-extrabold text-sm hover:bg-black transition disabled:opacity-60 shadow-lg">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري التوليد...</>
              : <><Wand2 className="w-4 h-4 text-[#fbbf24]" /> توليد البرنامج</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Toast ───────────────────────────────────────────────────────────────── */
function Toast({ msg, onClose }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#0a0a0a] text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold animate-fade-in">
      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
      {msg}
      <button onClick={onClose} className="mr-2 text-white/40 hover:text-white/80 transition"><X className="w-3.5 h-3.5" /></button>
    </div>
  )
}

/* ── Main PlanBuilder ─────────────────────────────────────────────────────── */
export default function PlanBuilder({ client }) {
  const router = useRouter()
  const existing = client.plan || {}
  const [previewing, setPreviewing] = useState(false)

  async function previewAsClient() {
    if (!confirm(`ستدخل كالعميل "${client.name}" وستُفتح بوابته في تبويب جديد. هل تريد المتابعة؟`)) return
    setPreviewing(true)
    try {
      const res  = await fetch(`/api/admin/preview-client/${client.id}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { console.error('preview error:', data.error); return }
      if (data.success) {
        const tab = window.open('/client/dashboard', '_blank')
        if (!tab) window.location.href = '/client/dashboard'
      }
    } catch (e) { console.error('preview failed:', e) }
    finally { setPreviewing(false) }
  }

  const [tab, setTab]     = useState('nutrition')
  const [saving, setSaving] = useState(false)
  const [toast, setToast]   = useState('')

  // Nutrition state
  const [calories, setCalories] = useState(existing.nutrition?.calories   || '')
  const [protein, setProtein]   = useState(existing.nutrition?.protein    || '')
  const [carbs, setCarbs]       = useState(existing.nutrition?.carbs      || '')
  const [fats, setFats]         = useState(existing.nutrition?.fats       || '')
  const [waterGoal, setWater]   = useState(existing.nutrition?.waterGoal  || '')
  const [fiberG, setFiber]      = useState(existing.nutrition?.fiberG     || '')
  const [nutritionNote, setNNote] = useState(existing.nutrition?.note     || '')
  const [nutritionTips, setNTips] = useState(existing.nutrition?.tips?.join('\n') || '')
  const [meals, setMeals]       = useState(() => linkMealsToDB(existing.nutrition?.meals || []))
  const [importStatus, setImportStatus] = useState('')

  // Training state
  const [daysPerWeek, setDPW]   = useState(existing.training?.daysPerWeek || '')
  const [duration, setDuration] = useState(existing.training?.duration    || '')
  const [level, setLevel]       = useState(existing.training?.level       || '')
  const [trainingNote, setTNote] = useState(existing.training?.note       || '')
  const [trainingTips, setTTips] = useState(existing.training?.tips?.join('\n') || '')
  const [days, setDays]         = useState(existing.training?.days        || [])

  // AI generation state
  const [aiModal, setAiModal]     = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiForm, setAiForm]       = useState({ goal: client.goal || 'gain', level: client.activityLevel?.includes('مبتدئ') ? 'beginner' : 'intermediate', daysPerWeek: '3', equipment: 'gym', injuries: '' })

  // Nutrition AI generation panel
  const GOAL_MAP = { loss:'loss', gain:'gain', maintain:'maintain', performance:'maintain' }
  const [showGenPanel,  setShowGenPanel]  = useState(false)
  const [genLoading,    setGenLoading]    = useState(false)
  const [genMeals,      setGenMeals]      = useState(5)
  const [genDuration,   setGenDuration]   = useState('day')
  const [genPreferred,  setGenPreferred]  = useState(client.preferredFoods || '')
  const [genAvoided,    setGenAvoided]    = useState(
    [client.dislikedFoods, client.foodAllergy].filter(Boolean).join('، ')
  )
  // For week/month: store all generated days, keep in memory for navigation
  const [genDays,       setGenDays]       = useState(null) // [{name, menu}]
  const [genPickDay,    setGenPickDay]    = useState(false)
  const [activeDayIdx,  setActiveDayIdx]  = useState(0)

  // Convert a raw menu array → PlanBuilder meals (shared helper)
  function menuToMeals(menu) {
    return (menu || []).map(m => {
      const linkedItems = (m.items || []).map(item => {
        const dbFood = findFoodInDB(item.food)
        if (dbFood) return makeDBItem(dbFood, item.servings || 1)
        return { food: item.food || '', amount: item.amount || '' }
      })
      const totals = calcItemTotals(linkedItems)
      return {
        name:     m.name || '',
        time:     m.time || '',
        calories: totals ? String(Math.round(totals.kcal)) : String(Math.round(m.kcal || 0)),
        description: '',
        macros: {
          protein: totals ? String(Math.round(totals.protein)) : String(Math.round(m.protein || 0)),
          carbs:   totals ? String(Math.round(totals.carbs))   : String(Math.round(m.carbs   || 0)),
          fats:    totals ? String(Math.round(totals.fat))     : String(Math.round(m.fat     || 0)),
        },
        items: linkedItems,
      }
    })
  }

  function importDay(menu, idx) {
    setMeals(menuToMeals(menu))
    setActiveDayIdx(idx)
    setGenPickDay(false)
    setShowGenPanel(false)
    setImportStatus('ok')
    setChatMessages([])
    setTimeout(() => setImportStatus(''), 4000)
  }

  // Save current meal edits back into genDays before switching days
  function switchDay(idx) {
    if (!genDays) return
    // persist current meals into genDays[activeDayIdx]
    const updatedDays = genDays.map((d, i) =>
      i === activeDayIdx
        ? { ...d, menu: mealsToMenuFormat(meals) }
        : d
    )
    setGenDays(updatedDays)
    setActiveDayIdx(idx)
    setMeals(menuToMeals(updatedDays[idx].menu))
    setChatMessages([])
  }

  async function generateNutritionPlan() {
    setGenLoading(true)
    setImportStatus('')
    setGenPickDay(false)
    setGenDays(null)
    try {
      const form = {
        name:         client.name         || '',
        age:          client.age          || '',
        gender:       client.gender       || 'male',
        weight:       client.weight       || '',
        height:       client.height       || '',
        targetWeight: client.targetWeight || '',
        bodyFatPct:   client.bodyFatPct   || null,
        activity:     client.activityLevel || 'moderate',
        goal:         GOAL_MAP[client.goal] || 'maintain',
        preferred:    genPreferred,
        avoided:      genAvoided,
        meals:        genMeals,
        duration:     genDuration,
      }
      const res  = await fetch('/api/ai-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const plan = await res.json()

      // Set shared macros from plan
      if (plan.target) setCalories(String(Math.round(plan.target)))
      if (plan.ex?.macros) {
        setProtein(String(Math.round(plan.ex.macros.protein || 0)))
        setCarbs(String(Math.round(plan.ex.macros.carbs    || 0)))
        setFats(String(Math.round(plan.ex.macros.fat       || 0)))
      }
      if (plan.water?.liters) setWater(String(plan.water.liters))
      if (plan.ex?.fiber?.g)  setFiber(String(plan.ex.fiber.g))

      if (genDuration === 'day' && Array.isArray(plan.menu) && plan.menu.length > 0) {
        setMeals(menuToMeals(plan.menu))
        setGenDays(null)
        setShowGenPanel(false)
        setChatMessages([])
        setImportStatus('ok')
        setTimeout(() => setImportStatus(''), 4000)
      } else if (genDuration === 'week' && Array.isArray(plan.days)) {
        setGenDays(plan.days)
        setActiveDayIdx(0)
        setGenPickDay(true)
        // Auto-load first day immediately
        setMeals(menuToMeals(plan.days[0].menu))
        setChatMessages([])
      } else if (genDuration === 'month' && Array.isArray(plan.weeks)) {
        const allDays = plan.weeks.flatMap(w =>
          (w.menu ? [{ name: w.name, menu: w.menu }] : [])
        )
        setGenDays(allDays)
        setActiveDayIdx(0)
        setGenPickDay(true)
        setMeals(menuToMeals(allDays[0]?.menu || []))
        setChatMessages([])
      }
    } catch {
      setImportStatus('حدث خطأ أثناء التوليد — تحقق من الاتصال.')
    } finally {
      setGenLoading(false)
    }
  }

  // Resources tab state
  const [resList, setResList]   = useState([])
  const [resLoading, setResLoading] = useState(false)
  const [resAdding, setResAdding]   = useState(false)
  const [resForm, setResForm]   = useState({ title: '', type: 'link', url: '', fileDataUrl: '', filename: '', description: '' })

  async function fetchResources() {
    setResLoading(true)
    try {
      const res = await fetch(`/api/admin/clients/${client.id}/resources`)
      const data = await res.json()
      setResList(data.resources || [])
    } catch {}
    finally { setResLoading(false) }
  }

  async function addResource() {
    if (!resForm.title.trim()) return
    const url = resForm.type === 'pdf' || resForm.type === 'image' ? resForm.fileDataUrl : resForm.url
    if (!url.trim()) return
    setResAdding(true)
    try {
      const res = await fetch(`/api/admin/clients/${client.id}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: resForm.title,
          type: resForm.type,
          url,
          description: resForm.description,
          filename: resForm.filename,
        }),
      })
      if (res.ok) {
        setResForm({ title: '', type: 'link', url: '', fileDataUrl: '', filename: '', description: '' })
        await fetchResources()
      }
    } catch {}
    finally { setResAdding(false) }
  }

  async function deleteResource(resourceId) {
    if (!confirm('حذف هذا الملف/الرابط؟')) return
    try {
      await fetch(`/api/admin/clients/${client.id}/resources?resourceId=${resourceId}`, { method: 'DELETE' })
      await fetchResources()
    } catch {}
  }

  function handleResFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setResForm(f => ({ ...f, fileDataUrl: ev.target.result, filename: file.name }))
    reader.readAsDataURL(file)
  }

  // Load resources when switching to resources tab
  useEffect(() => {
    if (tab === 'resources') fetchResources()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  // Auto-sum meal macros into top-level daily totals
  useEffect(() => {
    const hasData = meals.some(m =>
      parseFloat(m.calories) > 0 ||
      parseFloat(m.macros?.protein) > 0 ||
      parseFloat(m.macros?.carbs) > 0 ||
      parseFloat(m.macros?.fats) > 0
    )
    if (!hasData) return
    const sum = meals.reduce((acc, m) => ({
      kcal:    acc.kcal    + (parseFloat(m.calories)        || 0),
      protein: acc.protein + (parseFloat(m.macros?.protein) || 0),
      carbs:   acc.carbs   + (parseFloat(m.macros?.carbs)   || 0),
      fats:    acc.fats    + (parseFloat(m.macros?.fats)    || 0),
    }), { kcal: 0, protein: 0, carbs: 0, fats: 0 })
    setCalories(sum.kcal    ? String(Math.round(sum.kcal))    : '')
    setProtein (sum.protein ? String(Math.round(sum.protein)) : '')
    setCarbs   (sum.carbs   ? String(Math.round(sum.carbs))   : '')
    setFats    (sum.fats    ? String(Math.round(sum.fats))    : '')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meals])

  async function generateWithAI() {
    setAiLoading(true)
    try {
      const res  = await fetch('/api/ai-training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...aiForm, age: client.age, gender: client.gender }),
      })
      const plan = await res.json()
      setDays(plan.days || [])
      if (plan.daysPerWeek) setDPW(String(plan.daysPerWeek))
      if (plan.duration)    setDuration(String(plan.duration))
      if (plan.level)       setLevel(plan.level === 'beginner' ? 'مبتدئ' : plan.level === 'advanced' ? 'متقدم' : 'متوسط')
      if (plan.note)        setTNote(plan.note)
      if (plan.tips?.length) setTTips(plan.tips.join('\n'))
      setAiModal(false)
      setToast(plan.ai ? '✨ تم توليد البرنامج بالذكاء الاصطناعي' : '✓ تم تحميل البرنامج الافتراضي')
    } catch (err) {
      console.error(err)
      setToast('حدث خطأ أثناء التوليد')
    } finally {
      setAiLoading(false)
    }
  }

  const updateMeal = (i, val) => { const m = [...meals]; m[i] = val; setMeals(m) }
  const removeMeal = (i) => setMeals(meals.filter((_, j) => j !== i))
  const updateDay  = (i, val) => { const d = [...days]; d[i] = val; setDays(d) }
  const removeDay  = (i) => setDays(days.filter((_, j) => j !== i))

  // Nutrition AI chat refinement
  const [chatMessages,  setChatMessages]  = useState([])
  const [chatInput,     setChatInput]     = useState('')
  const [chatLoading,   setChatLoading]   = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages, chatLoading])

  // Convert PlanBuilder meals → ai-chat menu format
  function mealsToMenuFormat(mealsList) {
    return mealsList.map(m => ({
      name:    m.name,
      time:    m.time,
      icon:    '🍽️',
      kcal:    parseFloat(m.calories)       || 0,
      carbs:   parseFloat(m.macros?.carbs)  || 0,
      protein: parseFloat(m.macros?.protein)|| 0,
      fat:     parseFloat(m.macros?.fats)   || 0,
      items:   (m.items || []).map(item => ({
        group:    item.group    || '',
        icon:     '•',
        servings: item.servings || 1,
        food:     item.food     || '',
        amount:   item.amount   || '',
      })),
    }))
  }

  async function sendNutritionChat() {
    const msg = chatInput.trim()
    if (!msg || chatLoading || meals.length === 0) return
    setChatInput('')
    const newMessages = [...chatMessages, { role: 'user', content: msg }]
    setChatMessages(newMessages)
    setChatLoading(true)
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: { target: parseFloat(calories) || 0 },
          menu: mealsToMenuFormat(meals),
          messages: newMessages,
        }),
      })
      const { menu: updatedMenu, message } = await res.json()
      setMeals(menuToMeals(updatedMenu))
      setChatMessages(prev => [...prev, { role: 'assistant', content: message }])
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: '⚠️ حدث خطأ في الاتصال — لم تتغير الخطة.' }])
    } finally {
      setChatLoading(false)
    }
  }

  /* Import macros + meals from the calculator (localStorage) */
  function importFromCalculator() {
    try {
      const raw = localStorage.getItem('amineFitPlan')
      if (!raw) {
        setImportStatus('لم تُنشئ خطة في الحاسبة بعد — اذهب إلى الحاسبة أولاً ثم ارجع هنا.')
        return
      }
      const plan = JSON.parse(raw)
      const { target, ex, menu } = plan

      // Macros
      if (target)      setCalories(String(Math.round(target)))
      if (ex?.macros) {
        setProtein(String(Math.round(ex.macros.protein || 0)))
        setCarbs(String(Math.round(ex.macros.carbs    || 0)))
        setFats(String(Math.round(ex.macros.fat       || 0)))
      }

      // Meals — link items to food DB using fuzzy matching
      if (Array.isArray(menu) && menu.length > 0) {
        setMeals(menu.map(m => {
          const linkedItems = (m.items || []).map(item => {
            const dbFood = findFoodInDB(item.food)
            if (dbFood) {
              const servings = item.servings || 1
              return makeDBItem(dbFood, servings)
            }
            return { food: item.food || '', amount: item.amount || '' }
          })
          const totals = calcItemTotals(linkedItems)
          return {
            name:        m.name || '',
            time:        m.time || '',
            calories:    totals ? String(Math.round(totals.kcal)) : String(Math.round(m.kcal || 0)),
            description: '',
            macros: {
              protein: totals ? String(Math.round(totals.protein)) : String(Math.round(m.protein || 0)),
              carbs:   totals ? String(Math.round(totals.carbs))   : String(Math.round(m.carbs   || 0)),
              fats:    totals ? String(Math.round(totals.fat))     : String(Math.round(m.fat     || 0)),
            },
            items: linkedItems,
          }
        }))
      }

      setImportStatus('ok')
      setTimeout(() => setImportStatus(''), 4000)
    } catch {
      setImportStatus('حدث خطأ أثناء الاستيراد.')
    }
  }

  async function save() {
    setSaving(true)
    const plan = {
      nutrition: {
        calories, protein, carbs, fats,
        waterGoal: waterGoal || null,
        fiberG:    fiberG    || null,
        note: nutritionNote,
        tips: nutritionTips.split('\n').map(t => t.trim()).filter(Boolean),
        meals,
      },
      training: {
        daysPerWeek: String(days.length),   // always sync with actual day count
        duration, level,
        note: trainingNote,
        tips: trainingTips.split('\n').map(t => t.trim()).filter(Boolean),
        days,
      },
    }
    try {
      const res = await fetch(`/api/register/${client.id}/plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setToast('تم حفظ الخطة بنجاح ✓')
    } catch {
      setToast('❌ فشل الحفظ — تحقق من الاتصال وأعد المحاولة')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()}
          className="p-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition text-slate-600">
          <ArrowRight className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">بناء الخطة</p>
          <h1 className="text-xl font-extrabold text-slate-900">{client.name}</h1>
          <p className="text-xs text-slate-400 mt-0.5" dir="ltr">{client.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={previewAsClient} disabled={previewing}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition disabled:opacity-50 shadow-sm">
            {previewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            دخول كالعميل
          </button>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] text-white rounded-xl font-bold text-sm hover:bg-black transition disabled:opacity-50 shadow-sm">
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...</>
              : <><Save className="w-4 h-4" /> حفظ الخطة</>
            }
          </button>
        </div>
      </div>

      {/* How it works banner */}
      <div className="bg-[#0a0a0a] rounded-2xl px-5 py-4 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-white text-xs font-extrabold mb-1">كيف تصل الخطة للعميل؟</p>
          <p className="text-white/40 text-xs leading-relaxed">
            ابنِ الخطة ثم اضغط <span className="text-gold-400 font-bold">حفظ الخطة</span> — سيجدها العميل فوراً في بوابته على{' '}
            <span className="text-gold-400 font-bold" dir="ltr">amine-fit.com/client/login</span>{' '}
            ببريده وكلمة المرور التي ضبطتها له.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'nutrition',  label: 'الخطة الغذائية',    icon: Utensils },
          { key: 'training',   label: 'الخطة التدريبية',   icon: Dumbbell },
          { key: 'resources',  label: 'الملفات والروابط',  icon: Paperclip },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all border
              ${tab === key
                ? 'bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-sm'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ═══ NUTRITION TAB ═══ */}
      {tab === 'nutrition' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-slate-800 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-gold-500" /> الماكرو اليومي
                </h2>
                {meals.some(m => parseFloat(m.calories) > 0) && (
                  <p className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> مجموع الوجبات — يتحدث تلقائياً
                  </p>
                )}
              </div>
              {/* Generate / Import buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGenPanel(p => !p)}
                  disabled={!client.age || !client.weight || !client.height}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed
                    ${showGenPanel ? 'border-violet-400 bg-violet-600 text-white' : 'border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100'}`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  توليد AI
                </button>
                <button
                  type="button"
                  onClick={importFromCalculator}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-gold-400 text-gold-600 text-xs font-bold hover:bg-gold-50 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  من الحاسبة
                </button>
              </div>
            </div>

            {/* AI Generation Panel — asks for options BEFORE generating */}
            {showGenPanel && (
              <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4 space-y-3">
                <p className="text-xs font-extrabold text-violet-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> إعدادات الخطة الغذائية
                </p>

                {/* Client summary — read-only */}
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {[
                    { l: 'الاسم', v: client.name },
                    { l: 'العمر', v: client.age ? client.age + ' سنة' : null },
                    { l: 'الوزن', v: client.weight ? client.weight + ' كغ' : null },
                    { l: 'الطول', v: client.height ? client.height + ' سم' : null },
                    { l: 'الهدف', v: { loss:'خسارة وزن', gain:'بناء عضلات', maintain:'حفاظ', performance:'أداء رياضي' }[client.goal] || client.goal },
                  ].filter(x => x.v).map(x => (
                    <span key={x.l} className="bg-white border border-violet-200 text-violet-800 font-semibold px-2 py-0.5 rounded-lg">
                      {x.l}: {x.v}
                    </span>
                  ))}
                </div>

                {/* Duration — day costs API credits, week/month are free */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">
                    مدة الخطة
                    <span className="mr-2 font-normal text-slate-400 text-[10px]">الأسبوع والشهر مجاناً (محرك محلي) • اليوم يستخدم Claude AI</span>
                  </label>
                  <div className="flex gap-2">
                    {[
                      { key:'day',   label:'يوم واحد', badge:'AI 💳', badgeColor:'bg-amber-100 text-amber-700' },
                      { key:'week',  label:'أسبوع كامل', badge:'مجاناً ✓', badgeColor:'bg-emerald-100 text-emerald-700' },
                      { key:'month', label:'شهر كامل',   badge:'مجاناً ✓', badgeColor:'bg-emerald-100 text-emerald-700' },
                    ].map(d => (
                      <button key={d.key} type="button" onClick={() => setGenDuration(d.key)}
                        className={`flex-1 py-2 px-1 rounded-xl border-2 font-bold text-xs transition-all flex flex-col items-center gap-0.5
                          ${genDuration === d.key ? 'border-violet-500 bg-violet-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300'}`}>
                        <span>{d.label}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${genDuration === d.key ? 'bg-white/20 text-white' : d.badgeColor}`}>{d.badge}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meal count — user picks */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">عدد الوجبات في اليوم</label>
                  <div className="flex gap-2">
                    {[3, 4, 5].map(n => (
                      <button key={n} type="button" onClick={() => setGenMeals(n)}
                        className={`flex-1 py-2 rounded-xl border-2 font-bold text-sm transition-all
                          ${genMeals === n ? 'border-violet-500 bg-violet-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300'}`}>
                        {n} وجبات
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred foods — pre-filled, editable */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">✅ الأطعمة المفضلة <span className="font-normal text-slate-400">(من الاستبيان — يمكنك التعديل)</span></label>
                  <input value={genPreferred} onChange={e => setGenPreferred(e.target.value)}
                    placeholder="دجاج، أرز، تونة..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-violet-400 transition" />
                </div>

                {/* Avoided foods — pre-filled, editable */}
                <div>
                  <label className="text-xs font-bold text-red-600 block mb-1">🚫 الأطعمة الممنوعة <span className="font-normal text-slate-400">(من الاستبيان — يمكنك التعديل)</span></label>
                  <input value={genAvoided} onChange={e => setGenAvoided(e.target.value)}
                    placeholder="لحم أحمر، حليب..."
                    className="w-full px-3 py-2 rounded-xl border border-red-200 bg-white text-sm outline-none focus:border-red-400 transition" />
                </div>

                <button type="button" onClick={generateNutritionPlan} disabled={genLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-primary-600 text-white font-bold text-sm hover:from-violet-700 hover:to-primary-700 disabled:from-slate-300 disabled:to-slate-300 transition shadow-lg shadow-violet-500/20">
                  {genLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري التوليد...</>
                    : <><Sparkles className="w-4 h-4" /> توليد {genMeals} وجبات — {{day:'يوم',week:'أسبوع',month:'شهر'}[genDuration]}</>
                  }
                </button>
              </div>
            )}

            {/* Persistent week/month day navigator — stays visible until admin clears it */}
            {genPickDay && genDays && genDays.length > 0 && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    تنقّل بين الأيام — التعديلات تُحفظ عند الانتقال
                  </p>
                  <button type="button" onClick={() => { setGenPickDay(false); setGenDays(null) }}
                    className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                    <X className="w-3 h-3" /> إغلاق
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {genDays.map((d, i) => (
                    <button key={i} type="button" onClick={() => switchDay(i)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all border
                        ${activeDayIdx === i
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white border-emerald-200 text-emerald-800 hover:border-emerald-400'}`}>
                      {d.name}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400">
                  يمكنك تعديل كل يوم بخانة الذكاء الاصطناعي ثم الانتقال للتالي • احفظ الخطة عند الانتهاء
                </p>
              </div>
            )}

            {/* Import status message */}
            {importStatus && importStatus !== 'ok' && (
              <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-medium">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {importStatus}
              </div>
            )}
            {importStatus === 'ok' && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                تم توليد الخطة بنجاح ✓
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { f: calories, set: setCalories, label: 'السعرات (kcal)', ph: '2000' },
                { f: protein,  set: setProtein,  label: 'بروتين (غ)',     ph: '150' },
                { f: carbs,    set: setCarbs,    label: 'كربوهيدرات (غ)', ph: '250' },
                { f: fats,     set: setFats,     label: 'دهون (غ)',        ph: '60' },
                { f: waterGoal,set: setWater,    label: 'ماء (لتر/يوم)',   ph: '2.5' },
                { f: fiberG,   set: setFiber,    label: 'ألياف (غ/يوم)',   ph: '25' },
              ].map(({ f, set, label, ph }) => (
                <div key={label}>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">{label}</label>
                  <input type="number" value={f} onChange={e => set(e.target.value)} placeholder={ph}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">ملاحظة للعميل</label>
              <textarea value={nutritionNote} onChange={e => setNNote(e.target.value)} rows={2}
                placeholder="ملاحظة تظهر في أعلى صفحة الخطة..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium resize-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">نصائح (سطر لكل نصيحة)</label>
              <textarea value={nutritionTips} onChange={e => setNTips(e.target.value)} rows={3}
                placeholder={"اشرب 3 لتر ماء يومياً\nلا تتخطى وجبة الفطور..."}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium resize-none" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-slate-800 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-gold-500" /> الوجبات ({meals.length})
              </h2>
              <button onClick={() => setMeals(m => [...m, emptyMeal()])}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gold-400 text-black font-bold text-xs hover:bg-gold-300 transition">
                <Plus className="w-3.5 h-3.5" /> إضافة وجبة
              </button>
            </div>
            {meals.map((meal, i) => (
              <MealCard key={i} meal={meal} idx={i} onChange={v => updateMeal(i, v)} onRemove={() => removeMeal(i)} />
            ))}
            {meals.length === 0 && (
              <div className="text-center py-8 text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">
                <p className="text-sm font-medium">لا توجد وجبات — أضفها يدوياً أو ولّدها بالذكاء الاصطناعي</p>
              </div>
            )}
          </div>

          {/* ── AI Chat Refinement ── */}
          {meals.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-white">
                <div className="w-7 h-7 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-800">تعديل الخطة بالذكاء الاصطناعي</p>
                  <p className="text-[10px] text-slate-400">اكتب تعليمات التعديل — مثال: "أزل السمك من الفطور"</p>
                </div>
                {chatMessages.length > 0 && (
                  <button onClick={() => setChatMessages([])} className="mr-auto text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                    <X className="w-3 h-3" /> مسح
                  </button>
                )}
              </div>

              {/* Messages */}
              {chatMessages.length > 0 && (
                <div className="px-4 py-3 space-y-2.5 max-h-52 overflow-y-auto">
                  {chatMessages.map((m, i) => (
                    <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-extrabold
                        ${m.role === 'user' ? 'bg-slate-800 text-white' : 'bg-violet-600 text-white'}`}>
                        {m.role === 'user' ? 'أ' : 'AI'}
                      </div>
                      <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-xs font-medium leading-relaxed
                        ${m.role === 'user'
                          ? 'bg-slate-800 text-white rounded-tl-none'
                          : 'bg-violet-50 border border-violet-100 text-slate-700 rounded-tr-none'}`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-[11px] font-extrabold flex-shrink-0">AI</div>
                      <div className="bg-violet-50 border border-violet-100 px-3 py-2 rounded-2xl rounded-tr-none flex gap-1 items-center">
                        {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay:`${i*0.15}s` }} />)}
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}

              {/* Input */}
              <div className="px-4 py-3 flex gap-2 border-t border-slate-50">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendNutritionChat()}
                  placeholder="مثال: أزل السمك من الفطور وضع بدله بيض..."
                  disabled={chatLoading}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition disabled:bg-slate-50 text-right"
                />
                <button onClick={sendNutritionChat} disabled={chatLoading || !chatInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-700 disabled:from-slate-300 disabled:bg-slate-300 transition flex items-center gap-1.5">
                  {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ TRAINING TAB ═══ */}
      {tab === 'training' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h2 className="font-extrabold text-slate-800 flex items-center gap-2">
              <Zap className="w-4 h-4 text-slate-600" /> إعدادات البرنامج
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">أيام/أسبوع</label>
                <input type="number" value={daysPerWeek} onChange={e => setDPW(e.target.value)} placeholder="5"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">المدة (دقيقة)</label>
                <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="60"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">المستوى</label>
                <select value={level} onChange={e => setLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium bg-white">
                  <option value="">اختر...</option>
                  <option value="مبتدئ">مبتدئ</option>
                  <option value="متوسط">متوسط</option>
                  <option value="متقدم">متقدم</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">ملاحظة للعميل</label>
              <textarea value={trainingNote} onChange={e => setTNote(e.target.value)} rows={2}
                placeholder="ملاحظة تظهر في أعلى صفحة الخطة..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium resize-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">نصائح (سطر لكل نصيحة)</label>
              <textarea value={trainingTips} onChange={e => setTTips(e.target.value)} rows={3}
                placeholder={"احمِّ عضلاتك قبل التمرين\nاشرب ماء كافياً..."}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium resize-none" />
            </div>
          </div>

          {/* AI Generate Button */}
          <button
            type="button"
            onClick={() => setAiModal(true)}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-dashed border-[#fbbf24]/40 bg-[#fbbf24]/5 hover:bg-[#fbbf24]/10 hover:border-[#fbbf24]/60 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0a0a0a] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5 text-[#fbbf24]" />
            </div>
            <div className="text-right">
              <p className="font-extrabold text-slate-800 text-sm">توليد بالذكاء الاصطناعي</p>
              <p className="text-[11px] text-slate-400 font-medium">برنامج مخصص بناءً على بيانات العميل</p>
            </div>
            <Wand2 className="w-4 h-4 text-[#fbbf24] mr-auto" />
          </button>

          {/* Templates */}
          <div className="bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-gold-500" />
              <h3 className="font-extrabold text-slate-700 text-sm">قوالب جاهزة</h3>
              <span className="text-xs text-slate-400 font-medium">— اختر وعدّل بعدها</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(TEMPLATES).map(([key, tpl]) => (
                <button key={key} type="button"
                  onClick={() => {
                    if (confirm(`تحميل قالب "${tpl.label}"؟ سيُستبدل الأيام الحالية.`)) {
                      const loaded = tpl.days.map(d => ({ ...d, exercises: d.exercises.map(e => ({ ...e })) }))
                      setDays(loaded)
                      setDPW(String(loaded.length))
                    }
                  }}
                  className="flex flex-col items-center gap-1.5 p-4 rounded-xl border border-slate-200 hover:border-gold-400 hover:bg-gold-50 transition text-center group">
                  <span className="text-3xl group-hover:scale-110 transition-transform">{tpl.emoji}</span>
                  <span className="text-xs font-extrabold text-slate-700 leading-tight">{tpl.label}</span>
                  <span className="text-[10px] text-slate-400">{tpl.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-slate-800 flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-slate-600" /> أيام التدريب ({days.length})
              </h2>
              <button onClick={() => setDays(d => [...d, emptyDay()])}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0a0a0a] text-white font-bold text-xs hover:bg-black transition">
                <Plus className="w-3.5 h-3.5" /> إضافة يوم
              </button>
            </div>
            {days.map((day, i) => (
              <DayCard key={i} day={day} idx={i} onChange={v => updateDay(i, v)} onRemove={() => removeDay(i)} />
            ))}
            {days.length === 0 && (
              <div className="text-center py-10 text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">
                <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">اختر قالباً جاهزاً أو أضف يوماً يدوياً</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ RESOURCES TAB ═══ */}
      {tab === 'resources' && (
        <div className="space-y-5">

          {/* Add resource form */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h2 className="font-extrabold text-slate-800 flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-gold-500" /> إضافة ملف أو رابط
            </h2>

            {/* Title */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">العنوان *</label>
              <input
                value={resForm.title}
                onChange={e => setResForm(f => ({ ...f, title: e.target.value }))}
                placeholder="مثال: تمارين الظهر المنزلية"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium"
              />
            </div>

            {/* Type */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">النوع</label>
              <select
                value={resForm.type}
                onChange={e => setResForm(f => ({ ...f, type: e.target.value, url: '', fileDataUrl: '', filename: '' }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium bg-white"
              >
                <option value="link">🔗 رابط</option>
                <option value="pdf">📄 PDF</option>
                <option value="video">🎬 فيديو</option>
                <option value="image">🖼️ صورة</option>
              </select>
            </div>

            {/* URL (link / video) */}
            {(resForm.type === 'link' || resForm.type === 'video') && (
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">الرابط *</label>
                <input
                  dir="ltr"
                  value={resForm.url}
                  onChange={e => setResForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium"
                />
              </div>
            )}

            {/* File upload (pdf / image) */}
            {(resForm.type === 'pdf' || resForm.type === 'image') && (
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  {resForm.type === 'pdf' ? 'ملف PDF *' : 'صورة *'}
                </label>
                <input
                  type="file"
                  accept={resForm.type === 'pdf' ? '.pdf,application/pdf' : 'image/*'}
                  onChange={handleResFileChange}
                  className="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-gold-50 file:text-gold-700 file:font-bold hover:file:bg-gold-100 transition"
                />
                {resForm.filename && (
                  <p className="text-xs text-emerald-600 mt-1 font-medium">✓ {resForm.filename}</p>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">وصف (اختياري)</label>
              <textarea
                value={resForm.description}
                onChange={e => setResForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                placeholder="وصف مختصر عن المحتوى..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-gold-400 transition font-medium resize-none"
              />
            </div>

            <button
              onClick={addResource}
              disabled={resAdding || !resForm.title.trim() || (resForm.type === 'link' || resForm.type === 'video' ? !resForm.url.trim() : !resForm.fileDataUrl)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] text-white rounded-xl font-bold text-sm hover:bg-black transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {resAdding
                ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الإضافة...</>
                : <><Plus className="w-4 h-4" /> إضافة</>
              }
            </button>
          </div>

          {/* Resources list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-slate-800 flex items-center gap-2 text-sm">
                <Paperclip className="w-4 h-4 text-gold-500" /> الملفات والروابط ({resList.length})
              </h2>
            </div>

            {resLoading ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري التحميل...
              </div>
            ) : resList.length === 0 ? (
              <div className="text-center py-8 text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">
                <Paperclip className="w-7 h-7 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">لا توجد ملفات — أضف أول ملف أو رابط</p>
              </div>
            ) : (
              resList.map(r => {
                const icons = { link:'🔗', pdf:'📄', video:'🎬', image:'🖼️' }
                return (
                  <div key={r.id} className="flex items-start gap-3 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                    <span className="text-2xl flex-shrink-0">{icons[r.type] || '📎'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{r.title}</p>
                      {r.description && <p className="text-xs text-slate-400 mt-0.5 truncate">{r.description}</p>}
                      <span className="inline-block mt-1 text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">
                        {r.type}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteResource(r.id)}
                      className="p-1.5 text-red-300 hover:text-red-500 transition flex-shrink-0"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Save button (bottom) — only for nutrition/training tabs */}
      {tab !== 'resources' && (
        <div className="flex justify-end pb-6">
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-[#0a0a0a] text-white rounded-xl font-bold hover:bg-black transition disabled:opacity-50 shadow-sm">
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...</>
              : <><Save className="w-4 h-4" /> حفظ الخطة</>
            }
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast msg={toast} onClose={() => setToast('')} />}

      {/* AI Modal */}
      {aiModal && (
        <AIGenerateModal
          form={aiForm}
          setForm={setAiForm}
          onGenerate={generateWithAI}
          onClose={() => setAiModal(false)}
          loading={aiLoading}
        />
      )}
    </div>
  )
}
