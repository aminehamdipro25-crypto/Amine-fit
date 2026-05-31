import { NextResponse } from 'next/server'
import { getSubmissionByEmail, updateSubmission } from '@/lib/submissions'
import { createToken } from '@/lib/clientAuth'
import { hashPassword, verifyPassword } from '@/lib/password'

function setClientCookie(res, clientId) {
  res.cookies.set('client_token', createToken(clientId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  })
}

// Activate account with one-time code + set own password
async function handleActivation(email, activationCode, password, confirmPassword) {
  if (!email || !activationCode || !password || !confirmPassword) {
    return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: 'كلمة المرور وتأكيدها غير متطابقتين' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 })
  }
  if (password.length > 200 || activationCode.length > 20) {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
  }

  const client = await getSubmissionByEmail(email.toLowerCase().trim())
  if (!client || !client.activationCode) {
    return NextResponse.json({ error: 'البريد الإلكتروني أو كود التفعيل غير صحيح' }, { status: 401 })
  }
  if (client.activationCode !== activationCode.toUpperCase().trim()) {
    return NextResponse.json({ error: 'البريد الإلكتروني أو كود التفعيل غير صحيح' }, { status: 401 })
  }

  // Set password and clear the activation code
  await updateSubmission(client.id, {
    clientPassword: hashPassword(password),
    activationCode: null,
  })

  const res = NextResponse.json({ success: true, name: client.name })
  setClientCookie(res, client.id)
  return res
}

// Regular login with email + password
async function handleLogin(email, password) {
  if (!email || !password) {
    return NextResponse.json({ error: 'البريد وكلمة المرور مطلوبان' }, { status: 400 })
  }
  if (email.length > 200 || password.length > 200) {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
  }

  const client = await getSubmissionByEmail(email.toLowerCase().trim())
  const stored = client?.clientPassword || ''
  const match  = stored && verifyPassword(password, stored)

  if (!client || !match) {
    return NextResponse.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 })
  }

  const res = NextResponse.json({ success: true, name: client.name })
  setClientCookie(res, client.id)
  return res
}

export async function POST(req) {
  try {
    const body = await req.json()
    if (body.activationCode !== undefined) {
      return handleActivation(body.email, body.activationCode, body.password, body.confirmPassword)
    }
    return handleLogin(body.email, body.password)
  } catch (err) {
    console.error('[client auth]', err.message)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
