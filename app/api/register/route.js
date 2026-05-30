import { NextResponse } from 'next/server'
import { saveSubmission } from '@/lib/submissions'

export async function POST(req) {
  try {
    const body = await req.json()

    const required = ['email', 'name', 'gender', 'age', 'height', 'weight',
      'workActivity', 'goal', 'targetWeight', 'dailyMeals',
      'waterIntake', 'activityLevel', 'sleepHours']

    const missing = required.filter(k => !body[k]?.toString().trim())
    if (missing.length) {
      return NextResponse.json(
        { error: 'يرجى ملء جميع الحقول الإلزامية', missing },
        { status: 400 }
      )
    }

    const entry = await saveSubmission(body)
    return NextResponse.json({ success: true, id: entry.id })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { getSubmissions } = await import('@/lib/submissions')
    const list = await getSubmissions()
    return NextResponse.json(list)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
