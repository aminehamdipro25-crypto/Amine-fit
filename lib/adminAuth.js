import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export function isAdmin() {
  const token   = cookies().get('admin_token')?.value
  const correct = process.env.DASHBOARD_PASSWORD || 'amine2025'
  return !!token && token === correct
}

export function requireAdmin() {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  return null
}
