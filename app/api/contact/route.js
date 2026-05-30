import { NextResponse } from 'next/server'
import { saveSubmission } from '@/lib/submissions'

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, phone, email, goal, pkg, message } = body

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: 'الاسم ورقم الهاتف مطلوبان' }, { status: 400 })
    }

    // Save to Redis so it appears in the dashboard
    const entry = await saveSubmission({
      name:    name.trim(),
      phone:   phone.trim(),
      email:   email?.trim() || '',
      goal:    goal   || '',
      notes:   [pkg ? `الباقة المهتم بها: ${pkg}` : '', message || ''].filter(Boolean).join('\n'),
      source:  'contact',  // distinguishes from full questionnaire
      status:  'new',
    })

    console.log('[contact] saved lead:', entry.id, name)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact] error:', err.message)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
