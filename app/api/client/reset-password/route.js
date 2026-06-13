import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getSubmissionByEmail, updateSubmission } from '@/lib/submissions'
import { isRateLimited } from '@/lib/rateLimit'
import { hashPassword } from '@/lib/password'
import { createToken } from '@/lib/clientAuth'
import { createClientSession, deleteClientSession } from '@/lib/clientSession'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (await isRateLimited(`reset_pw:${ip}`, 10, 900)) {
      return NextResponse.json({ error: 'محاولات كثيرة — حاول لاحقاً' }, { status: 429 })
    }

    const { email, code, password, confirmPassword } = await req.json().catch(() => ({}))

    if (!email || !code || !password || !confirmPassword) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'كلمتا المرور غير متطابقتين' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'كلمة المرور 8 أحرف على الأقل' }, { status: 400 })
    }
    if (password.length > 200) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }

    const upperCode = String(code).toUpperCase().trim()
    if (!/^[A-Z2-9]{6}$/.test(upperCode)) {
      return NextResponse.json({ error: 'الكود غير صحيح' }, { status: 401 })
    }

    const emailKey = `reset_pw_email:${email.toLowerCase().trim()}`
    if (await isRateLimited(emailKey, 5, 900)) {
      return NextResponse.json({ error: 'محاولات كثيرة — حاول لاحقاً' }, { status: 429 })
    }

    const client = await getSubmissionByEmail(email.toLowerCase().trim())
    if (!client || !client.passwordResetCode || !client.passwordResetExpiry) {
      return NextResponse.json({ error: 'الكود غير صحيح أو انتهت صلاحيته' }, { status: 401 })
    }

    // Check expiry
    if (new Date(client.passwordResetExpiry) < new Date()) {
      return NextResponse.json({ error: 'انتهت صلاحية الكود — اطلب كوداً جديداً' }, { status: 401 })
    }

    // Verify code hash (timing-safe)
    const submittedHash = crypto.createHash('sha256').update(upperCode).digest('hex')
    const storedBuf    = Buffer.from(client.passwordResetCode, 'hex')
    const submitBuf    = Buffer.from(submittedHash, 'hex')
    const match = storedBuf.length === submitBuf.length &&
      crypto.timingSafeEqual(storedBuf, submitBuf)

    if (!match) {
      return NextResponse.json({ error: 'الكود غير صحيح أو انتهت صلاحيته' }, { status: 401 })
    }

    // Update password, clear reset fields
    await updateSubmission(client.id, {
      clientPassword:      hashPassword(password),
      passwordResetCode:   null,
      passwordResetExpiry: null,
    })

    // Auto-login after reset
    await deleteClientSession(client.id)
    const sessionId = await createClientSession(client.id)
    const token = createToken(client.id, sessionId)

    const res = NextResponse.json({ success: true, name: client.name })
    res.cookies.set('client_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })
    return res
  } catch (err) {
    console.error('[reset-password]', err.message)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
