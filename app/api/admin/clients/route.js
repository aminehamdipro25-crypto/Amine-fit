import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { getSubmissions } from '@/lib/submissions'

export const dynamic = 'force-dynamic'

export async function GET() {
  const deny = await requireAdmin()
  if (deny) return deny

  const all = await getSubmissions()

  // Return only fields needed for the calculator / plan builder
  const clients = all.map(c => ({
    id:             c.id,
    name:           c.name    || '',
    email:          c.email   || '',
    gender:         c.gender  || 'male',
    age:            c.age     || '',
    weight:         c.weight  || '',
    height:         c.height  || '',
    targetWeight:   c.targetWeight || '',
    activityLevel:  c.activityLevel || 'moderate',
    goal:           c.goal    || 'maintain',
    preferredFoods: c.preferredFoods  || '',
    dislikedFoods:  c.dislikedFoods   || '',
    foodAllergy:    c.foodAllergy     || '',
    status:         c.status  || 'pending',
  }))

  return NextResponse.json({ clients })
}
