import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL   || 'NOT SET'
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || 'NOT SET'

  // Show all 4 env vars individually
  const envDetails = {
    UPSTASH_REDIS_REST_URL:    process.env.UPSTASH_REDIS_REST_URL   ? process.env.UPSTASH_REDIS_REST_URL.substring(0, 50)   : 'NOT SET',
    UPSTASH_REDIS_REST_TOKEN:  process.env.UPSTASH_REDIS_REST_TOKEN ? process.env.UPSTASH_REDIS_REST_TOKEN.substring(0, 20) + '...' : 'NOT SET',
    KV_REST_API_URL:           process.env.KV_REST_API_URL          ? process.env.KV_REST_API_URL.substring(0, 50)           : 'NOT SET',
    KV_REST_API_TOKEN:         process.env.KV_REST_API_TOKEN        ? process.env.KV_REST_API_TOKEN.substring(0, 20) + '...' : 'NOT SET',
    active_url: url.substring(0, 50),
    active_token_prefix: token.substring(0, 20) + '...',
  }

  if (url === 'NOT SET') {
    return NextResponse.json({ env: envDetails, error: 'No Redis config found' })
  }

  const cfg = { url: url.replace(/\/$/, ''), token }
  const TEST_KEY = 'debug_test_key_12345'
  const TEST_VAL = 'hello_' + Date.now()

  // Raw PING
  let pingRaw = null
  try {
    const r = await fetch(cfg.url + '/pipeline', {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([['PING']]),
    })
    pingRaw = { status: r.status, body: await r.json() }
  } catch(e) { pingRaw = { error: e.message } }

  // Raw SET a simple test key
  let setRaw = null
  try {
    const r = await fetch(cfg.url + '/pipeline', {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([['SET', TEST_KEY, TEST_VAL]]),
    })
    setRaw = { status: r.status, body: await r.json() }
  } catch(e) { setRaw = { error: e.message } }

  // Raw GET the same test key
  let getRaw = null
  try {
    const r = await fetch(cfg.url + '/pipeline', {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([['GET', TEST_KEY]]),
    })
    getRaw = { status: r.status, body: await r.json() }
  } catch(e) { getRaw = { error: e.message } }

  // Raw GET the real submissions key
  let realKeyRaw = null
  try {
    const r = await fetch(cfg.url + '/pipeline', {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([['GET', 'amine_fit_submissions']]),
    })
    const body = await r.json()
    const val = body?.[0]?.result
    realKeyRaw = {
      status: r.status,
      error: body?.[0]?.error || null,
      has_data: !!val,
      data_length: val ? val.length : 0,
      data_preview: val ? val.substring(0, 100) : null,
    }
  } catch(e) { realKeyRaw = { error: e.message } }

  // Clean up test key
  try {
    await fetch(cfg.url + '/pipeline', {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([['DEL', TEST_KEY]]),
    })
  } catch {}

  const setOk = setRaw?.body?.[0]?.result === 'OK'
  const getOk = getRaw?.body?.[0]?.result === TEST_VAL

  // Test getSubmissions() with the fixed double-parse logic
  const { getSubmissions } = await import('@/lib/submissions')
  let submissionsResult = []
  let submissionsError = null
  try { submissionsResult = await getSubmissions() }
  catch(e) { submissionsError = e.message }

  return NextResponse.json({
    env: envDetails,
    ping: pingRaw,
    set_get_match: setOk && getOk ? 'PASS — Redis read/write works!' : `FAIL — set:${setOk} get:${getOk}`,
    real_key: realKeyRaw,
    submissions_count: submissionsResult.length,
    submissions_error: submissionsError,
    submissions: submissionsResult.map(s => ({ id: s.id, name: s.name, date: s.createdAt, status: s.status })),
  })
}
