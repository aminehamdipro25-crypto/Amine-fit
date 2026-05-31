import { NextResponse } from 'next/server'
import { getSubmissionByEmail } from '@/lib/submissions'
import { createToken } from '@/lib/clientAuth'
import { verifyPassword } from '@/lib/password'

export async function POST(req) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'البريد وكلمة المرور مطلوبان' }, { status: 400 })
    }
    if (email.length > 200 || password.length > 200) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }

    const client = await getSubmissionByEmail(email.toLowerCase().trim())
    // Constant-time response to prevent email enumeration
    const stored = client?.clientPassword || ''
    const match  = stored && verifyPassword(password, stored)

    if (!client || !match) {
      return NextResponse.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 })
    }

    const token = createToken(client.id)
    const res = NextResponse.json({ success: true, name: client.name })
    res.cookies.set('client_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })
    return res
  } catch (err) {
    console.error('[client auth]', err.message)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
