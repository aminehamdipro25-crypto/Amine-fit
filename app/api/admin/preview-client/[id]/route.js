import { NextResponse } from 'next/server'
import { getSubmissionById } from '@/lib/submissions'
import { createToken } from '@/lib/clientAuth'
import { requireAdmin } from '@/lib/adminAuth'

export async function POST(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny

  const client = await getSubmissionById(params.id)
  if (!client) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })

  const token = createToken(client.id)
  // Only pass id (validated from DB), never raw user input
  const previewData = encodeURIComponent(JSON.stringify({ id: client.id, name: client.name }))

  const res = NextResponse.json({ success: true })
  res.cookies.set('client_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 2,
    path: '/',
  })
  res.cookies.set('coach_preview', previewData, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 2,
    path: '/',
  })
  return res
}
