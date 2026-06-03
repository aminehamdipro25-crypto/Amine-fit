import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getSubmissionByEmail, updateSubmission } from '@/lib/submissions'
import { createToken } from '@/lib/clientAuth'
import { createClientSession, deleteClientSession } from '@/lib/clientSession'
import { hashPassword, verifyPassword } from '@/lib/password'
import { isRateLimited } from '@/lib/rateLimit'
import { sendSecurityAlert } from '@/lib/securityAlert'

async function setClientCookie(res, clientId) {
  await deleteClientSession(clientId)
  const sessionId = await createClientSession(clientId)
  res.cookies.set('client_token', createToken(clientId, sessionId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
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
  if (password.length < 8) {
    return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }, { status: 400 })
  }
  if (password.length > 200) return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })

  // Validate activation code format: exactly 6 uppercase alphanumeric
  const code = activationCode.toUpperCase().trim()
  if (!/^[A-Z2-9]{6}$/.test(code)) {
    return NextResponse.json({ error: 'البريد الإلكتروني أو كود التفعيل غير صحيح' }, { status: 401 })
  }

  const client = await getSubmissionByEmail(email.toLowerCase().trim())
  if (!client || !client.activationCode) {
    return NextResponse.json({ error: 'البريد الإلكتروني أو كود التفعيل غير صحيح' }, { status: 401 })
  }

  if (client.status === 'suspended') {
    return NextResponse.json({ error: 'تم تعليق حسابك. تواصل مع المدرب أمين للاستفسار.' }, { status: 403 })
  }

  // Activation codes are stored as SHA-256 hex (64 chars)
  if (client.activationCode.length !== 64) {
    return NextResponse.json({ error: 'البريد الإلكتروني أو كود التفعيل غير صحيح' }, { status: 401 })
  }
  const submittedHash = crypto.createHash('sha256').update(code).digest('hex')
  const storedBuf     = Buffer.from(client.activationCode, 'hex')
  const submittedBuf  = Buffer.from(submittedHash, 'hex')
  const codeMatch = storedBuf.length === submittedBuf.length &&
    crypto.timingSafeEqual(storedBuf, submittedBuf)

  if (!codeMatch) {
    return NextResponse.json({ error: 'البريد الإلكتروني أو كود التفعيل غير صحيح' }, { status: 401 })
  }

  await updateSubmission(client.id, {
    clientPassword: hashPassword(password),
    activationCode: null,
  })

  const res = NextResponse.json({ success: true, name: client.name })
  await setClientCookie(res, client.id)
  return res
}

// Regular login with email + password
async function handleLogin(email, password) {
  if (!email || !password) {
    return NextResponse.json({ error: 'البريد وكلمة المرور مطلوبان' }, { status: 400 })
  }
  if (email.length > 320 || password.length > 200) {
    return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
  }

  const client = await getSubmissionByEmail(email.toLowerCase().trim())
  const stored = client?.clientPassword || ''
  const match  = stored && verifyPassword(password, stored)

  if (!client || !match) {
    return NextResponse.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, { status: 401 })
  }
  if (client.status === 'suspended') {
    return NextResponse.json({ error: 'تم تعليق حسابك. تواصل مع المدرب أمين للاستفسار.' }, { status: 403 })
  }

  const res = NextResponse.json({ success: true, name: client.name })
  await setClientCookie(res, client.id)
  return res
}

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const body = await req.json()

    // IP-level rate limit: 20 attempts per 15 min
    if (await isRateLimited(`client_auth_ip:${ip}`, 20, 900)) {
      sendSecurityAlert({ type: 'client_brute_force', ip, detail: 'تجاوز 20 محاولة دخول على بوابة العملاء' }).catch(() => {})
      return NextResponse.json({ error: 'محاولات كثيرة. حاول لاحقاً.' }, { status: 429 })
    }

    if (body.activationCode !== undefined) {
      const emailKey = `client_activate:${String(body.email || '').toLowerCase().trim()}`
      if (await isRateLimited(emailKey, 5, 900)) {
        return NextResponse.json({ error: 'محاولات كثيرة. حاول لاحقاً.' }, { status: 429 })
      }
      return await handleActivation(body.email, body.activationCode, body.password, body.confirmPassword)
    }

    const emailKey = `client_login:${String(body.email || '').toLowerCase().trim()}`
    if (await isRateLimited(emailKey, 5, 900)) {
      return NextResponse.json({ error: 'محاولات كثيرة. حاول لاحقاً.' }, { status: 429 })
    }
    return await handleLogin(body.email, body.password)
  } catch (err) {
    console.error('[client auth]', err.message)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
