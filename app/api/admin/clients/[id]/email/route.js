import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { changeClientEmail } from '@/lib/submissions'

export const dynamic = 'force-dynamic'

// Admin-only: correct a client's email (e.g. registered with a typo). Re-indexes
// the email key so login/activation keep working under the new address.
export async function POST(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny

  const { email } = await req.json().catch(() => ({}))
  const result = await changeClientEmail(params.id, email)

  if (!result.ok) {
    const map = {
      invalid_email: ['بريد إلكتروني غير صالح', 400],
      email_taken:   ['هذا البريد مستخدم لحساب آخر', 409],
      not_found:     ['العميل غير موجود', 404],
      server_error:  ['تعذّر تحديث البريد — حاول مجدداً', 500],
    }
    const [msg, status] = map[result.error] || ['خطأ', 400]
    return NextResponse.json({ error: msg }, { status })
  }

  return NextResponse.json({ success: true, email: result.client.email })
}
