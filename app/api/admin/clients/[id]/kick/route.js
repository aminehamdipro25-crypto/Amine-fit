import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { deleteClientSession } from '@/lib/clientSession'

export const dynamic = 'force-dynamic'

export async function DELETE(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny

  await deleteClientSession(params.id)
  return NextResponse.json({ ok: true })
}
