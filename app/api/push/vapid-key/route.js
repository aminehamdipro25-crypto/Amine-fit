import { NextResponse } from 'next/server'
import { getPublicKey } from '@/lib/webPush'

export const dynamic = 'force-dynamic'

export async function GET() {
  const key = getPublicKey()
  if (!key) return NextResponse.json({ error: 'not configured' }, { status: 503 })
  return NextResponse.json({ key })
}
