import { NextResponse } from 'next/server'
import { updateSubmission, getSubmissionById } from '@/lib/submissions'
import { requireAdmin } from '@/lib/adminAuth'
import { hashPassword } from '@/lib/password'
import { isRateLimited } from '@/lib/rateLimit'

export async function GET(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny
  const client = await getSubmissionById(params.id)
  if (!client) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ plan: client.plan || null })
}

export async function PUT(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny
  try {
    const { plan } = await req.json()
    const updated = await updateSubmission(params.id, { plan })
    if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

export async function PATCH(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny

  // Rate-limit admin password changes: max 10 per hour
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (await isRateLimited(`admin_pw_set:${ip}`, 10, 3600)) {
    return NextResponse.json({ error: 'محاولات كثيرة — حاول لاحقاً' }, { status: 429 })
  }

  try {
    const { clientPassword } = await req.json()
    if (!clientPassword || typeof clientPassword !== 'string' || clientPassword.length < 8) {
      return NextResponse.json({ error: 'كلمة المرور قصيرة جداً (8 أحرف على الأقل)' }, { status: 400 })
    }
    if (clientPassword.length > 200) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }
    const hashed = hashPassword(clientPassword.trim())
    const updated = await updateSubmission(params.id, { clientPassword: hashed })
    if (!updated) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
