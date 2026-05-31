import { NextResponse } from 'next/server'
import { saveSubmission, getSubmissions } from '@/lib/submissions'
import { requireAdmin } from '@/lib/adminAuth'
import { hashPassword } from '@/lib/password'

export const dynamic = 'force-dynamic'

export async function GET() {
  const deny = requireAdmin()
  if (deny) return deny
  try {
    const list = await getSubmissions()
    return NextResponse.json(list)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req) {
  const deny = requireAdmin()
  if (deny) return deny
  try {
    const { name, email, phone, password, goal, notes } = await req.json()
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'الاسم والبريد الإلكتروني مطلوبان' }, { status: 400 })
    }
    if (name.trim().length > 100 || email.trim().length > 200) {
      return NextResponse.json({ error: 'بيانات طويلة جداً' }, { status: 400 })
    }
    const entry = await saveSubmission({
      name:           name.trim(),
      email:          email.trim().toLowerCase(),
      phone:          phone?.trim() || '',
      goal:           goal || '',
      notes:          notes?.trim() || '',
      clientPassword: password?.trim() ? hashPassword(password.trim()) : '',
      source:         'manual',
      status:         'active',
    })
    const { clientPassword: _, ...safeEntry } = entry
    return NextResponse.json({ success: true, id: entry.id, entry: safeEntry })
  } catch (err) {
    console.error('[clients/create]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
