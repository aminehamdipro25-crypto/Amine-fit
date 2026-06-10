// Shared food utility functions used across plan builder components
import { FOODS, EX } from '@/lib/nutritionEngine'

// Flat searchable list from all groups
export const ALL_FOODS = Object.entries(FOODS).flatMap(([group, list]) =>
  list.map(f => ({ ...f, group }))
)

// Create a structured food item from a DB food entry
export function makeDBItem(food, servings = 1) {
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
export function calcItemTotals(items) {
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
export function findFoodInDB(name) {
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
export function linkMealsToDB(meals) {
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

export const emptyMeal     = () => ({ name:'', time:'', calories:'', description:'', items:[], macros:{ protein:'', carbs:'', fats:'' } })
export const emptyItem     = () => ({ food:'', amount:'' })
export const emptyExercise = () => ({ name:'', sets:'', reps:'', rest:'', note:'', videoUrl:'' })
export const emptyDay      = () => ({ name:'', focus:'', description:'', exercises:[] })
