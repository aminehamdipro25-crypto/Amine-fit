import { NextResponse } from 'next/server'

export async function POST(req) {
  const { password } = await req.json()
  const correct = process.env.DASHBOARD_PASSWORD || 'amine2025'
  if (password !== correct) {
    return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 })
  }
  const res = NextResponse.json({ success: true })
  res.cookies.set('admin_token', correct, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    secure: process.env.NODE_ENV === 'production',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete('admin_token')
  return res
}
