import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { getSubmissionById, updateSubmission } from '@/lib/submissions'

const PLAN_DAYS = { basic: 30, standard: 30, premium: 30 }

export async function POST(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny

  const { plan, durationDays, startDate } = await req.json()

  if (!['basic', 'standard', 'premium'].includes(plan)) {
    return NextResponse.json({ error: 'باقة غير صالحة' }, { status: 400 })
  }

  const days = parseInt(durationDays) || PLAN_DAYS[plan] || 30
  if (days < 1 || days > 365) {
    return NextResponse.json({ error: 'المدة يجب أن تكون بين 1 و 365 يوم' }, { status: 400 })
  }

  const start = startDate ? new Date(startDate) : new Date()
  if (isNaN(start.getTime())) {
    return NextResponse.json({ error: 'تاريخ بداية غير صالح' }, { status: 400 })
  }
  // Set to start of day in Qatar time (UTC+3)
  start.setUTCHours(0, 0, 0, 0)

  const end = new Date(start.getTime() + days * 86400000)

  const client = await getSubmissionById(params.id)
  if (!client) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })

  const updated = await updateSubmission(params.id, {
    subscriptionPlan:      plan,
    subscriptionStartDate: start.toISOString(),
    subscriptionEndDate:   end.toISOString(),
    subscriptionDays:      days,
    status:                'active',
  })

  return NextResponse.json({
    success: true,
    subscription: {
      plan:      updated.subscriptionPlan,
      startDate: updated.subscriptionStartDate,
      endDate:   updated.subscriptionEndDate,
      days:      updated.subscriptionDays,
    },
  })
}

export async function DELETE(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny

  const client = await getSubmissionById(params.id)
  if (!client) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })

  await updateSubmission(params.id, {
    subscriptionPlan:      null,
    subscriptionStartDate: null,
    subscriptionEndDate:   null,
    subscriptionDays:      null,
  })

  return NextResponse.json({ success: true })
}
