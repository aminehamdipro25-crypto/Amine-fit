import { NextResponse } from 'next/server'
import { getSubmissions, saveSubmission, deleteSubmission } from '@/lib/submissions'

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

  // Test 2: Save a test submission via the real saveSubmission function
  let testSaveResult = null
  let testSaveId = null
  try {
    const entry = await saveSubmission({
      email: 'debug@test.com', name: 'DEBUG_TEST', gender: 'male',
      age: '25', height: '175', weight: '70', workActivity: 'test',
      goal: 'loss', targetWeight: '65', dailyMeals: '3',
      waterIntake: '2', activityLevel: 'moderate', sleepHours: '7',
      hasScale: 'no', hasInBody: 'no', hasNFS: 'no', hasPsychStress: 'no',
      foodPrep: 'self', _debug: true,
    })
    testSaveId = entry.id
    testSaveResult = 'OK — saved ' + entry.id
  } catch(e) {
    testSaveResult = 'ERROR: ' + e.message
  }

  // Test 3: Read all submissions
  let submissions = []
  let submissionsError = null
  try {
    submissions = await getSubmissions()
  } catch(e) {
    submissionsError = e.message
  }

  // Test 4: Delete the test submission we just created
  let deleteResult = null
  if (testSaveId) {
    try {
      const ok = await deleteSubmission(testSaveId)
      deleteResult = ok ? 'deleted test entry' : 'not found'
    } catch(e) {
      deleteResult = 'ERROR: ' + e.message
    }
  }

  // Test 5: Read again after delete
  let afterDelete = []
  try { afterDelete = await getSubmissions() } catch {}

  return NextResponse.json({
    env: {
      url_set:    url !== 'NOT SET',
      token_set:  token !== 'NOT SET',
      url_prefix: url.substring(0, 40),
    },
    ping:              pingResult,
    test_save:         testSaveResult,
    count_after_save:  submissions.length,
    delete_test:       deleteResult,
    count_after_delete: afterDelete.length,
    submissions_error: submissionsError,
    real_submissions:  afterDelete.map(s => ({ id: s.id, name: s.name, date: s.createdAt })),
  })
}
