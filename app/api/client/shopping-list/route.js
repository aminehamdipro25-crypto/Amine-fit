import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/clientAuth'
import { getSubmissionById } from '@/lib/submissions'

export const dynamic = 'force-dynamic'

// ── Category classification ────────────────────────────────────────────────────
const CATEGORY_PATTERNS = [
  {
    id: 'بروتينات',
    keywords: [
      'لحم', 'دجاج', 'سمك', 'تونة', 'بيض', 'ستيك', 'كفتة', 'شاورما',
      'روبيان', 'جمبري', 'سردين', 'سلمون', 'هامور', 'بيف', 'لحمة',
      'فراخ', 'حمام', 'ديك', 'ارانب', 'كبدة', 'قانصة',
      'chicken', 'beef', 'fish', 'tuna', 'egg', 'shrimp', 'salmon',
      'meat', 'turkey', 'protein',
    ],
  },
  {
    id: 'كربوهيدرات',
    keywords: [
      'خبز', 'رز', 'أرز', 'معكرونة', 'باستا', 'شوفان', 'بطاطا', 'بطاطس',
      'عيش', 'توست', 'فطير', 'كسكس', 'برغل', 'شعير', 'ذرة', 'دقيق',
      'قمح', 'بسكويت', 'كريكر', 'تورتيلا', 'بيتا', 'نان',
      'bread', 'rice', 'pasta', 'oat', 'potato', 'corn', 'wheat', 'cereal',
    ],
  },
  {
    id: 'خضروات',
    keywords: [
      'خيار', 'طماطم', 'بندورة', 'خس', 'جرجير', 'سبانخ', 'بروكلي', 'قرنبيط',
      'جزر', 'فلفل', 'بصل', 'ثوم', 'كوسا', 'باذنجان', 'فاصوليا خضراء',
      'بازلاء', 'ملفوف', 'كرنب', 'سلق', 'هليون', 'فجل', 'شمندر',
      'قرع', 'لفت', 'بامية', 'قرع عسلي',
      'cucumber', 'tomato', 'lettuce', 'spinach', 'broccoli', 'carrot',
      'pepper', 'onion', 'garlic', 'zucchini', 'eggplant', 'cauliflower',
      'vegetable', 'veggie',
    ],
  },
  {
    id: 'فواكه',
    keywords: [
      'تفاح', 'موز', 'برتقال', 'مانجا', 'عنب', 'فراولة', 'كيوي',
      'بطيخ', 'شمام', 'خوخ', 'مشمش', 'كمثرى', 'إجاص', 'رمان',
      'توت', 'تين', 'بلح', 'تمر', 'ليمون', 'جريب فروت',
      'apple', 'banana', 'orange', 'mango', 'grape', 'strawberry', 'kiwi',
      'watermelon', 'peach', 'pear', 'pomegranate', 'lemon', 'fruit',
    ],
  },
  {
    id: 'ألبان ومنتجاتها',
    keywords: [
      'حليب', 'لبن', 'زبادي', 'يوغرت', 'جبن', 'جبنة', 'قشطة', 'كريمة',
      'بروتين مسحوق', 'كوتيج', 'ريكوتا', 'موزاريلا', 'شيدر',
      'milk', 'yogurt', 'cheese', 'cottage', 'cream', 'dairy', 'whey',
      'casein',
    ],
  },
  {
    id: 'دهون صحية',
    keywords: [
      'زيت زيتون', 'زيت جوز الهند', 'أفوكادو', 'افوكادو', 'مكسرات',
      'لوز', 'جوز', 'كاجو', 'فستق', 'بندق', 'زبدة فول سوداني',
      'طحينة', 'طحينية', 'بذور كتان', 'بذور شيا', 'بذور عباد الشمس',
      'coconut oil', 'olive oil', 'avocado', 'almond', 'walnut',
      'cashew', 'pistachio', 'peanut butter', 'tahini', 'nut', 'seed',
    ],
  },
]

function classifyItem(name) {
  const lower = (name || '').toLowerCase()
  for (const cat of CATEGORY_PATTERNS) {
    if (cat.keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      return cat.id
    }
  }
  return 'أخرى'
}

// ── Quantity parsing ───────────────────────────────────────────────────────────
// Tries to extract a numeric amount and unit from strings like "100 غ", "2 ملعقة", "½ كوب"
const fractionMap = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 0.333, '⅔': 0.667 }

function parseAmount(amountStr) {
  if (!amountStr) return { qty: 1, unit: 'حصة' }
  const s = String(amountStr).trim()

  // Replace unicode fractions
  let normalized = s
  for (const [frac, val] of Object.entries(fractionMap)) {
    normalized = normalized.replace(frac, val)
  }

  // Match leading number (int or decimal) + optional unit text
  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*(.*)$/)
  if (match) {
    return {
      qty: parseFloat(match[1]),
      unit: (match[2] || 'حصة').trim() || 'حصة',
    }
  }
  return { qty: 1, unit: s || 'حصة' }
}

// ── Main aggregation ───────────────────────────────────────────────────────────
function buildShoppingList(meals) {
  // Map keyed by food name (lowercased) → accumulated data
  const map = new Map()

  for (const meal of meals) {
    const items = meal.items || []
    for (const item of items) {
      const foodName = (item.food || '').trim()
      if (!foodName) continue

      const { qty, unit } = parseAmount(item.amount)
      const key = foodName.toLowerCase()

      if (map.has(key)) {
        const existing = map.get(key)
        // Accumulate quantity only when units match; otherwise keep first entry unchanged
        if (existing.unit === unit) {
          existing.qty += qty
        }
      } else {
        map.set(key, {
          name: foodName,
          qty,
          unit,
          category: classifyItem(foodName),
        })
      }
    }
  }

  // Multiply every item × 7 for weekly list
  const allItems = []
  for (const item of map.values()) {
    const weeklyQty = Math.round(item.qty * 7 * 10) / 10  // round to 1 decimal
    allItems.push({
      name: item.name,
      quantity: weeklyQty,
      unit: item.unit,
      category: item.category,
      checked: false,
    })
  }

  // Group by category preserving display order
  const CATEGORY_ORDER = [
    'بروتينات',
    'كربوهيدرات',
    'خضروات',
    'فواكه',
    'ألبان ومنتجاتها',
    'دهون صحية',
    'أخرى',
  ]

  const groups = {}
  for (const cat of CATEGORY_ORDER) groups[cat] = []
  for (const item of allItems) {
    const cat = item.category
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(item)
  }

  const categories = CATEGORY_ORDER
    .filter(cat => groups[cat].length > 0)
    .map(cat => ({
      name: cat,
      items: groups[cat].sort((a, b) => a.name.localeCompare(b.name, 'ar')),
    }))

  return categories
}

// ── Route handler ──────────────────────────────────────────────────────────────
export async function GET() {
  const token = cookies().get('client_token')?.value
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const client = await getSubmissionById(payload.id)
  if (!client) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })

  const nutrition = client.plan?.nutrition
  if (!nutrition || !nutrition.meals || nutrition.meals.length === 0) {
    return NextResponse.json({ categories: [], noplan: true })
  }

  const categories = buildShoppingList(nutrition.meals)
  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0)

  return NextResponse.json({
    categories,
    generatedAt: new Date().toISOString(),
    totalItems,
  })
}
