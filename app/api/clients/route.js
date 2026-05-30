import { NextResponse } from 'next/server'
import { saveSubmission } from '@/lib/submissions'

export async function POST(req) {
  try {
    const { name, email, phone, password, goal, notes } = await req.json()
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'الاسم والبريد الإلكتروني مطلوبان' }, { status: 400 })
    }
    const entry = await saveSubmission({
      name:           name.trim(),
      email:          email.trim().toLowerCase(),
      phone:          phone?.trim() || '',
      goal:           goal || '',
      notes:          notes?.trim() || '',
      clientPassword: password?.trim() || '',
      source:         'manual',
      status:         'active',
    })
    return NextResponse.json({ success: true, id: entry.id })
  } catch (err) {
    console.error('[clients/create]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
