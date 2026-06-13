import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/clientAuth'
import { getSubmissionById, updateSubmission } from '@/lib/submissions'

export const dynamic = 'force-dynamic'

const MAX_ENTRIES    = 200
const MAX_EXERCISES  = 20

async function getPayload() {
  const token = cookies().get('client_token')?.value
  return verifyToken(token)
}

// ── Validation helpers ────────────────────────────────────────────────────────

function isIntInRange(v, min, max) {
  return Number.isInteger(v) && v >= min && v <= max
}

function validateBody(body) {
  const { dayIndex, dayName, focus, exercises, durationMins, notes, rating } = body

  if (!isIntInRange(dayIndex, 0, 6)) {
    return 'dayIndex يجب أن يكون عدداً صحيحاً من 0 إلى 6'
  }
  if (typeof dayName !== 'string' || dayName.trim().length === 0 || dayName.length > 50) {
    return 'dayName غير صالح (1-50 حرف)'
  }
  if (focus !== undefined && focus !== null && typeof focus === 'string' && focus.length > 100) {
    return 'focus أطول من 100 حرف'
  }
  if (!isIntInRange(durationMins, 1, 300)) {
    return 'durationMins يجب أن يكون من 1 إلى 300'
  }
  if (!Array.isArray(exercises) || exercises.length === 0 || exercises.length > MAX_EXERCISES) {
    return `exercises يجب أن تكون مصفوفة من 1 إلى ${MAX_EXERCISES} عنصر`
  }
  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i]
    if (!ex || typeof ex !== 'object') return `التمرين ${i + 1} غير صالح`
    if (typeof ex.name !== 'string' || ex.name.trim().length === 0 || ex.name.length > 100) {
      return `اسم التمرين ${i + 1} غير صالح (1-100 حرف)`
    }
    if (!Array.isArray(ex.sets)) return `sets في التمرين ${i + 1} يجب أن تكون مصفوفة`
    for (let j = 0; j < ex.sets.length; j++) {
      const s = ex.sets[j]
      if (!s || typeof s !== 'object') return `الجولة ${j + 1} في التمرين ${i + 1} غير صالحة`
      const weight = Number(s.weight)
      const reps   = Number(s.reps)
      if (!Number.isFinite(weight) || weight < 0 || weight > 1000) {
        return `وزن غير صالح في التمرين ${i + 1} الجولة ${j + 1} (0-1000)`
      }
      if (!Number.isFinite(reps) || reps < 0 || reps > 100) {
        return `تكرارات غير صالحة في التمرين ${i + 1} الجولة ${j + 1} (0-100)`
      }
    }
  }
  if (rating !== undefined && !isIntInRange(rating, 1, 5)) {
    return 'rating يجب أن يكون من 1 إلى 5'
  }
  return null
}

// ── GET — return workout logs ─────────────────────────────────────────────────

export async function GET() {
  const payload = await getPayload()
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const client = await getSubmissionById(payload.id)
  if (!client) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })

  return NextResponse.json(client.workoutLogs || [])
}

// ── POST — append new workout log entry ───────────────────────────────────────

export async function POST(req) {
  const payload = await getPayload()
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  let body
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'JSON غير صالح' }, { status: 400 })
  }

  const validationError = validateBody(body)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

  const client = await getSubmissionById(payload.id)
  if (!client) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })

  const { dayIndex, dayName, focus, exercises, durationMins, notes, rating } = body

  // Sanitise exercises: keep only known fields, coerce number types
  const cleanExercises = exercises.map(ex => ({
    name: ex.name.trim().slice(0, 100),
    sets: ex.sets.map(s => ({
      weight: Number(s.weight),
      unit:   s.unit === 'lb' ? 'lb' : 'kg',
      reps:   Number(s.reps),
      done:   Boolean(s.done),
    })),
  }))

  const entry = {
    id:          String(Date.now()),
    date:        new Date().toISOString(),
    dayIndex,
    dayName:     dayName.trim(),
    focus:       typeof focus === 'string' ? focus.trim().slice(0, 100) : '',
    durationMins,
    exercises:   cleanExercises,
    notes:       typeof notes === 'string' ? notes.trim().slice(0, 1000) : '',
    rating:      rating !== undefined ? rating : null,
  }

  const existing = Array.isArray(client.workoutLogs) ? client.workoutLogs : []

  // Enforce max 200 entries — drop oldest if needed
  const updated = [...existing, entry].slice(-MAX_ENTRIES)

  const result = await updateSubmission(payload.id, { workoutLogs: updated })
  if (!result) return NextResponse.json({ error: 'فشل حفظ الجلسة' }, { status: 500 })

  return NextResponse.json(entry, { status: 201 })
}

// ── DELETE — remove entry by id ───────────────────────────────────────────────

export async function DELETE(req) {
  const payload = await getPayload()
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const entryId = searchParams.get('id')
  if (!entryId) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 })

  const client = await getSubmissionById(payload.id)
  if (!client) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })

  const existing = Array.isArray(client.workoutLogs) ? client.workoutLogs : []
  const filtered = existing.filter(e => e.id !== entryId)

  if (filtered.length === existing.length) {
    return NextResponse.json({ error: 'الجلسة غير موجودة' }, { status: 404 })
  }

  const result = await updateSubmission(payload.id, { workoutLogs: filtered })
  if (!result) return NextResponse.json({ error: 'فشل الحذف' }, { status: 500 })

  return NextResponse.json({ success: true })
}
