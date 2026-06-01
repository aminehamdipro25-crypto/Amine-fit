import { NextResponse } from 'next/server'

const cache = new Map()

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name')?.trim()
  if (!name) return NextResponse.json({ url: null })

  const key = name.toLowerCase()
  if (cache.has(key)) return NextResponse.json({ url: cache.get(key) })

  try {
    // Search exercise on wger.de (free, no API key)
    const searchRes = await fetch(
      `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(name)}&language=english&format=json`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!searchRes.ok) throw new Error('search failed')
    const { suggestions } = await searchRes.json()
    const baseId = suggestions?.[0]?.data?.base_id
    if (!baseId) { cache.set(key, null); return NextResponse.json({ url: null }) }

    // Get exercise image
    const imgRes = await fetch(
      `https://wger.de/api/v2/exerciseimage/?exercise_base=${baseId}&format=json&limit=1`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!imgRes.ok) throw new Error('img failed')
    const imgData = await imgRes.json()
    const url = imgData.results?.[0]?.image || null
    cache.set(key, url)
    return NextResponse.json({ url })
  } catch {
    cache.set(key, null)
    return NextResponse.json({ url: null })
  }
}
