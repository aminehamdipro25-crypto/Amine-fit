import { NextResponse } from 'next/server'
import { getSubmissions, saveSubmission } from '@/lib/submissions'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL   || 'NOT SET'
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || 'NOT SET'

  const cfg   = url !== 'NOT SET' ? { url: url.replace(/\/$/, ''), token } : null

  // Test 1: PING
  let pingResult = null
  if (cfg) {
    try {
      const r = await fetch(cfg.url + '/pipeline', {
        method: 'POST',
        headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([['PING']]),
      })
      pingResult = await r.json()
    } catch(e) { pingResult = { error: e.message } }
  }

  // Test 2: SET a test value
  let setResult = null
  if (cfg) {
    try {
      const r = await fetch(cfg.url + '/pipeline', {
        method: 'POST',
        headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([['SET', 'test_key', 'hello123']]),
      })
      setResult = await r.json()
    } catch(e) { setResult = { error: e.message } }
  }

  // Test 3: GET the test value
  let getResult = null
  if (cfg) {
    try {
      const r = await fetch(cfg.url + '/pipeline', {
        method: 'POST',
        headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([['GET', 'test_key']]),
      })
      getResult = await r.json()
    } catch(e) { getResult = { error: e.message } }
  }

  // Test 4: read all submissions
  let submissions = []
  let submissionsError = null
  try {
    submissions = await getSubmissions()
  } catch(e) {
    submissionsError = e.message
  }

  return NextResponse.json({
    env: { url_set: url !== 'NOT SET', token_set: token !== 'NOT SET', url_prefix: url.substring(0, 35) },
    ping: pingResult,
    set_test: setResult,
    get_test: getResult,
    submissions_count: submissions.length,
    submissions_error: submissionsError,
    first_submission: submissions[0] ? { id: submissions[0].id, name: submissions[0].name } : null,
  })
}
