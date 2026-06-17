'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Dumbbell,
  Utensils,
  Loader2,
} from 'lucide-react'

// ─── helpers ────────────────────────────────────────────────────────────────

const MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
]

function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function fmtDateShort(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now - d) / 86400000)
  if (diffDays === 0) return 'اليوم'
  if (diffDays === 1) return 'أمس'
  if (diffDays < 7)  return `منذ ${diffDays} أيام`
  return fmtDate(iso)
}

const TYPE_META = {
  nutrition:        { labelAr: 'تغذية' },
  training:         { labelAr: 'تدريب' },
  general:          { labelAr: 'عامة' },
}

// ─── notification builder ────────────────────────────────────────────────────

function buildNotifications(client, appointments) {
  const list = []

  // 1. Appointment-derived notifications
  for (const appt of (appointments || [])) {
    const dateLabel = appt.confirmedDate || appt.preferredDate || ''
    const timeLabel = appt.confirmedTime || appt.preferredTime || ''
    const typeLabel = TYPE_META[appt.type]?.labelAr || appt.type || ''
    const displayDt = dateLabel ? `${dateLabel}${timeLabel ? ' الساعة ' + timeLabel : ''}` : ''

    if (appt.status === 'confirmed') {
      list.push({
        id:      `appt-confirmed-${appt.id}`,
        kind:    'appt_confirmed',
        ts:      appt.updatedAt || appt.confirmedDate || appt.createdAt,
        message: `تم تأكيد موعدك — استشارة ${typeLabel}${displayDt ? ' في ' + displayDt : ''}`,
      })
    } else if (appt.status === 'cancelled') {
      list.push({
        id:      `appt-cancelled-${appt.id}`,
        kind:    'appt_cancelled',
        ts:      appt.updatedAt || appt.createdAt,
        message: `تم إلغاء الموعد — استشارة ${typeLabel}${displayDt ? ' كانت في ' + displayDt : ''}`,
      })
    }
  }

  // 2. Nutrition plan added
  const nutritionPlan = client?.plan?.nutrition
  if (nutritionPlan) {
    list.push({
      id:      'plan-nutrition',
      kind:    'plan_nutrition',
      ts:      client.nutritionPlanAddedAt || client.updatedAt || client.createdAt,
      message: 'تم إضافة خطتك الغذائية',
    })
  }

  // 3. Training plan added
  const trainingPlan = client?.plan?.training
  if (trainingPlan) {
    list.push({
      id:      'plan-training',
      kind:    'plan_training',
      ts:      client.trainingPlanAddedAt || client.updatedAt || client.createdAt,
      message: 'تم إضافة برنامجك التدريبي',
    })
  }

  // 4. Check-in coach replies
  for (const ci of (client?.checkins || [])) {
    if (ci.coachReply) {
      list.push({
        id:      `checkin-reply-${ci.id || ci.date}`,
        kind:    'checkin_reply',
        ts:      ci.repliedAt || ci.date,
        message: `رد المدرب على تقريرك بتاريخ ${fmtDate(ci.date)}`,
      })
    }
  }

  // Sort descending by timestamp — missing timestamps go to the end
  list.sort((a, b) => {
    const ta = a.ts ? new Date(a.ts).getTime() : 0
    const tb = b.ts ? new Date(b.ts).getTime() : 0
    return tb - ta
  })

  return list
}

// ─── icon + colour config per kind ──────────────────────────────────────────

const KIND_CONFIG = {
  appt_confirmed: {
    Icon:       CheckCircle2,
    iconClass:  'text-emerald-500',
    bgClass:    'bg-emerald-50',
    borderClass:'border-emerald-100',
    dot:        'bg-emerald-400',
  },
  appt_cancelled: {
    Icon:       XCircle,
    iconClass:  'text-red-400',
    bgClass:    'bg-red-50',
    borderClass:'border-red-100',
    dot:        'bg-red-400',
  },
  plan_nutrition: {
    Icon:       Utensils,
    iconClass:  'text-amber-500',
    bgClass:    'bg-amber-50',
    borderClass:'border-amber-100',
    dot:        'bg-amber-400',
  },
  plan_training: {
    Icon:       Dumbbell,
    iconClass:  'text-blue-500',
    bgClass:    'bg-blue-50',
    borderClass:'border-blue-100',
    dot:        'bg-blue-400',
  },
  checkin_reply: {
    Icon:       MessageSquare,
    iconClass:  'text-violet-500',
    bgClass:    'bg-violet-50',
    borderClass:'border-violet-100',
    dot:        'bg-violet-400',
  },
}

const FALLBACK_CONFIG = {
  Icon:       Bell,
  iconClass:  'text-slate-400',
  bgClass:    'bg-slate-50',
  borderClass:'border-slate-100',
  dot:        'bg-slate-300',
}

// ─── sub-components ──────────────────────────────────────────────────────────

function NotificationCard({ notif }) {
  const cfg = KIND_CONFIG[notif.kind] || FALLBACK_CONFIG
  const { Icon, iconClass, bgClass, borderClass } = cfg

  return (
    <div className={`bg-white rounded-2xl border ${borderClass} shadow-sm flex items-start gap-4 px-5 py-4`}>
      {/* Icon bubble — on the right for RTL */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${iconClass}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 leading-snug">{notif.message}</p>
        {notif.ts && (
          <p className="text-xs text-slate-400 font-medium mt-1">{fmtDateShort(notif.ts)}</p>
        )}
      </div>
    </div>
  )
}

// ─── page ────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const router = useRouter()

  const [client,       setClient]       = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    async function load() {
      try {
        // Fetch client profile
        const meRes = await fetch('/api/client/me', { cache: 'no-store' })
        if (meRes.status === 401) {
          router.push('/client/login')
          return
        }
        const meData = await meRes.json()
        setClient(meData.client || meData)

        // Fetch appointments (best-effort — may not exist for all clients)
        try {
          const apptRes = await fetch('/api/client/appointments', { cache: 'no-store' })
          if (apptRes.ok) {
            const apptData = await apptRes.json()
            setAppointments(apptData.appointments || [])
          }
        } catch {
          // appointments endpoint failure is non-fatal
        }
      } catch (err) {
        console.error('[notifications] load error:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router])

  const notifications = loading ? [] : buildNotifications(client, appointments)

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Dark header card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 pt-10 pb-8">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">مركز الإشعارات</p>
              <h1 className="text-xl font-extrabold text-white">إشعاراتي</h1>
            </div>
          </div>
          {!loading && (
            <p className="text-sm text-slate-400 mt-3">
              {notifications.length === 0
                ? 'لا توجد إشعارات بعد'
                : `${notifications.length} إشعار`}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-xl mx-auto px-4 py-6 space-y-3">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
            <p className="text-sm text-slate-400 font-medium">جارٍ التحميل…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && notifications.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 py-16 text-center px-6 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-extrabold text-slate-700 text-base mb-2">لا توجد إشعارات</p>
            <p className="text-slate-400 text-sm leading-relaxed">
              ستظهر هنا تأكيدات المواعيد وردود المدرب وتحديثات خططك
            </p>
          </div>
        )}

        {/* Notification list */}
        {!loading && notifications.map((notif) => (
          <NotificationCard key={notif.id} notif={notif} />
        ))}

        {/* Legend / info strip */}
        {!loading && notifications.length > 0 && (
          <div className="pt-4 pb-2">
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                { kind: 'appt_confirmed', label: 'موعد مؤكد' },
                { kind: 'appt_cancelled', label: 'موعد ملغى' },
                { kind: 'plan_nutrition', label: 'خطة غذائية' },
                { kind: 'plan_training',  label: 'برنامج تدريبي' },
                { kind: 'checkin_reply',  label: 'رد المدرب' },
              ].map(({ kind, label }) => {
                const cfg = KIND_CONFIG[kind]
                return (
                  <div key={kind} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className="text-[11px] text-slate-400 font-medium">{label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
