import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/clientAuth'
import { getClientLogs, upsertDayLog } from '@/lib/clientLogs'

export const dynamic = 'force-dynamic'

function clientId() {
  const token = cookies().get('client_token')?.value
  const payload = verifyToken(token)
  return payload?.id || null
}

export async function GET() {
  const id = clientId()
  if (!id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const logs = await getClientLogs(id)
  return NextResponse.json(logs)
}

export async function POST(req) {
  const id = clientId()
  if (!id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { date, ...fields } = await req.json()
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 })
  const entry = await upsertDayLog(id, date, fields)
  return NextResponse.json(entry)
}
