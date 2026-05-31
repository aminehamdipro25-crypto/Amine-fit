import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSubmissionById } from '@/lib/submissions'
import { createToken } from '@/lib/clientAuth'

export async function POST(req, { params }) {
  // Verify admin token
  const adminToken = cookies().get('admin_token')?.value
  const correct = process.env.DASHBOARD_PASSWORD || 'amine2025'
  if (!adminToken || adminToken !== correct) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const client = await getSubmissionById(params.id)
  if (!client) {
    return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })
  }

  // Create a client token for this client (coach impersonation)
  const token = createToken(client.id)

  const res = NextResponse.json({ success: true, redirect: '/client/dashboard' })
  res.cookies.set('client_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 2, // 2 hours only (short-lived for preview)
    path: '/',
  })
  return res
}
