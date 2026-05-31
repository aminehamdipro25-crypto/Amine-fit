import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifyAdminSession } from './adminSession'

export async function isAdmin() {
  const token = cookies().get('admin_token')?.value
  return verifyAdminSession(token)
}

export async function requireAdmin() {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  return null
}
