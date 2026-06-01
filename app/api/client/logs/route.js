import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/clientAuth'
import { getClientLogs, upsertDayLog } from '@/lib/clientLogs'

export const dynamic = 'force-dynamic'

async function clientId() {
  const token = cookies().get('client_token')?.value
  const payload = await verifyToken(token)
  return payload?.id || null
}

export async function GET() {
  const id = await clientId()
  if (!id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const logs = await getClientLogs(id)
  return NextResponse.json(logs)
}

const ALLOWED_LOG_FIELDS = new Set(['water', 'waterGoal', 'notes', 'mood', 'weight'])

export async function POST(req) {
  const id = await clientId()
  if (!id) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const body = await req.json()
  const { date, ...rawFields } = body

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'تاريخ غير صالح' }, { status: 400 })
  }

  // Whitelist fields to prevent storing arbitrary data
  const fields = {}
  for (const key of Object.keys(rawFields)) {
    if (!ALLOWED_LOG_FIELDS.has(key)) continue
    const val = rawFields[key]
    if (key === 'notes' || key === 'mood') {
      if (typeof val === 'string') fields[key] = val.slice(0, 500)
    } else if (key === 'water' || key === 'waterGoal') {
      const n = Number(val)
      if (Number.isFinite(n) && n >= 0 && n <= 30) fields[key] = n
    } else if (key === 'weight') {
      const n = Number(val)
      if (Number.isFinite(n) && n >= 0 && n <= 500) fields[key] = n
    }
  }

  const entry = await upsertDayLog(id, date, fields)
  return NextResponse.json(entry)
}
