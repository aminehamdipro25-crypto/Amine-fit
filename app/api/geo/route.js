import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Vercel automatically injects x-vercel-ip-country on all requests
// QA = Qatar, TN = Tunisia, SA = Saudi Arabia, AE = UAE, KW = Kuwait, etc.
const GULF = new Set(['QA', 'AE', 'SA', 'KW', 'BH', 'OM'])
const MAGHREB = new Set(['TN', 'MA', 'DZ', 'LY'])

export async function GET(req) {
  const country = req.headers.get('x-vercel-ip-country') || ''
  const zone = GULF.has(country) ? 'gulf' : MAGHREB.has(country) ? 'maghreb' : 'gulf'
  return NextResponse.json({ country, zone })
}
