import { NextResponse } from 'next/server'
import { isRateLimited } from '@/lib/rateLimit'
import { validateGiftCode, redeemGiftCode } from '@/lib/giftCodes'

export const dynamic = 'force-dynamic'

// GET /api/gift?code=XXXXXX — validate a gift code (public, read-only)
export async function GET(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (await isRateLimited(`gift_check:${ip}`, 10, 300)) {
    return NextResponse.json({ valid: false, reason: 'too_many' })
  }

  const code = new URL(req.url).searchParams.get('code')
  return NextResponse.json(await validateGiftCode(code))
}

// POST /api/gift — mark a gift code as used after successful registration.
// Internal-only: requires X-Internal-Secret header matching CRON_SECRET, which
// prevents unauthenticated external callers from burning codes. (The internal
// registration flow redeems directly via lib/giftCodes, not through this route.)
export async function POST(req) {
  const secret = process.env.CRON_SECRET
  const provided = req.headers.get('x-internal-secret')
  if (!secret || !provided || provided !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const { code, email } = await req.json().catch(() => ({}))
  if (!code || !email) return NextResponse.json({ ok: false }, { status: 400 })

  const result = await redeemGiftCode(code, email)
  const status = result.ok ? 200 : (result.reason === 'unavailable' ? 503 : 200)
  return NextResponse.json(result, { status })
}
