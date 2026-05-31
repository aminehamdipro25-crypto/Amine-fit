import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSubmissionById } from '@/lib/submissions'
import { createToken } from '@/lib/clientAuth'

export async function POST(req, { params }) {
  const adminToken = cookies().get('admin_token')?.value
  const correct = process.env.DASHBOARD_PASSWORD || 'amine2025'
  if (!adminToken || adminToken !== correct) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const client = await getSubmissionById(params.id)
  if (!client) {
    return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })
  }

  const token = createToken(client.id)
  const previewData = encodeURIComponent(JSON.stringify({ id: client.id, name: client.name }))

  const res = NextResponse.json({ success: true })

  // httpOnly token for actual auth
  res.cookies.set('client_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 2,
    path: '/',
  })

  // Non-httpOnly cookie so the client layout can detect preview mode
  res.cookies.set('coach_preview', previewData, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 2,
    path: '/',
  })

  return res
}
