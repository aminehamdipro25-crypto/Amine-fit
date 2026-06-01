import { NextResponse } from 'next/server'

const cache = new Map()

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name')?.trim()
  if (!name) return NextResponse.json({ url: null })

  const key = name.toLowerCase()
  if (cache.has(key)) return NextResponse.json({ url: cache.get(key) })

  try {
    // Single call — wger.de search returns image URL directly in suggestions[0].data.image
    const res = await fetch(
      `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(name)}&language=english&format=json`,
      { signal: AbortSignal.timeout(6000) }
    )
    if (!res.ok) throw new Error(`wger ${res.status}`)
    const data = await res.json()

    // image comes directly from search response
    let url = data.suggestions?.[0]?.data?.image || null

    // fallback: try exerciseimage endpoint using base_id
    if (!url) {
      const baseId = data.suggestions?.[0]?.data?.base_id
      if (baseId) {
        const r2 = await fetch(
          `https://wger.de/api/v2/exerciseimage/?exercise_base=${baseId}&format=json&limit=1`,
          { signal: AbortSignal.timeout(4000) }
        )
        if (r2.ok) {
          const d2 = await r2.json()
          url = d2.results?.[0]?.image || null
        }
      }
    }

    cache.set(key, url)
    return NextResponse.json({ url })
  } catch {
    cache.set(key, null)
    return NextResponse.json({ url: null })
  }
}
