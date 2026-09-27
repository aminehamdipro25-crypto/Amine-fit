'use client'
import { useState, useEffect } from 'react'
import { Scale, Loader2, ClipboardList } from 'lucide-react'

const MEASURE_FIELDS = [
  { key: 'weight',   label: 'الوزن',           unit: 'كغ',    inbody: false },
  { key: 'bodyFat',  label: 'نسبة الدهون',     unit: '%',     inbody: true },
  { key: 'muscle',   label: 'الكتلة العضلية',  unit: 'كغ',    inbody: true, higherBetter: true },
  { key: 'visceral', label: 'الدهون الحشوية',  unit: '',      inbody: true },
  { key: 'waist',    label: 'الخصر',           unit: 'سم',    inbody: false },
  { key: 'chest',    label: 'الصدر',           unit: 'سم',    inbody: false },
  { key: 'hips',     label: 'الأرداف',          unit: 'سم',   inbody: false },
  { key: 'arm',      label: 'الذراع',           unit: 'سم',   inbody: false },
  { key: 'thigh',    label: 'الفخذ',           unit: 'سم',    inbody: false },
]

export default function ClientProgressPanel({ clientId }) {
  const [progress, setProgress]   = useState(null)
  const [checkins, setCheckins]   = useState(null)
  const [reply, setReply]         = useState('')
  const [sending, setSending]     = useState(false)
  const [sent, setSent]           = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/clients/${clientId}/progress`).then(r => r.ok ? r.json() : []),
      fetch(`/api/admin/clients/${clientId}/checkins`).then(r => r.ok ? r.json() : []),
    ]).then(([p, c]) => { setProgress(p); setCheckins(c) }).catch(() => {})
  }, [clientId])

  // Latest entry overall + per-field latest value with diff vs the previous entry that had it
  const latestEntry = progress?.at(-1)
  const measures = (progress && progress.length)
    ? MEASURE_FIELDS.map(f => {
        const vals = progress.filter(e => e[f.key] != null && e[f.key] !== '')
        if (!vals.length) return null
        const last = vals.at(-1)[f.key]
        const prev = vals.length > 1 ? vals.at(-2)[f.key] : null
        const diff = prev != null ? +(last - prev).toFixed(1) : null
        return { ...f, val: last, diff }
      }).filter(Boolean)
    : []
  const lastCheckin  = checkins?.at(-1)

  async function sendReply() {
    if (!reply.trim() || !lastCheckin) return
    setSending(true)
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/checkin-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkinId: lastCheckin.id, reply }),
      })
      if (!res.ok) throw new Error(`server ${res.status}`)
      setCheckins(prev => prev.map(c =>
        c.id === lastCheckin.id ? { ...c, coachReply: reply, repliedAt: new Date().toISOString() } : c
      ))
      setReply('')
      setSent(true)
      setTimeout(() => setSent(false), 3000)
    } catch (e) {
      console.error('[sendReply]', e.message)
      alert('فشل إرسال الرد — حاول مرة أخرى')
    } finally { setSending(false) }
  }

  if (!progress && !checkins) return (
    <div className="flex items-center justify-center py-6">
      <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
    </div>
  )

  return (
    <div className="space-y-3">
      {/* Latest measurements */}
      {measures.length ? (
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-4 h-4 text-amber-500" />
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">آخر قياس</p>
            {latestEntry && (
              <span className="text-[10px] text-slate-300 mr-auto">
                {new Date(latestEntry.date).toLocaleDateString('ar', { month:'short', day:'numeric' })}
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {measures.map(f => {
              // good = green: for muscle higher is better, for everything else lower is better
              const good = f.diff == null ? null : (f.higherBetter ? f.diff > 0 : f.diff < 0)
              return (
                <div key={f.key} className={`rounded-xl p-2.5 text-center border ${f.inbody ? 'bg-red-50/50 border-red-100' : 'bg-white border-slate-100'}`}>
                  <p className="text-sm font-extrabold text-slate-900">{f.val} <span className="text-[10px] font-semibold text-slate-400">{f.unit}</span></p>
                  <p className="text-[10px] text-slate-400 font-semibold flex items-center justify-center gap-1">
                    {f.label}
                    {f.inbody && <span className="text-[8px] font-extrabold text-red-400">InBody</span>}
                  </p>
                  {f.diff != null && f.diff !== 0 && (
                    <p className={`text-[10px] font-extrabold mt-0.5 ${good ? 'text-emerald-500' : 'text-red-400'}`}>
                      {f.diff > 0 ? '+' : ''}{f.diff} {f.unit}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
          {latestEntry?.note && (
            <p className="text-[11px] text-slate-500 bg-white rounded-xl px-3 py-2 border border-slate-100 mt-2 italic">
              "{latestEntry.note}"
            </p>
          )}
          <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">
            {progress.length} إدخال مسجل
          </p>
        </div>
      ) : (
        <p className="text-xs text-slate-400 text-center py-3">لا توجد قياسات بعد</p>
      )}

      {/* Last check-in + coach reply */}
      {lastCheckin ? (
        <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-violet-500" />
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">آخر تقرير أسبوعي</p>
            <span className="text-[10px] text-slate-300 mr-auto">
              {new Date(lastCheckin.date).toLocaleDateString('ar', { month:'short', day:'numeric' })}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label:'الطاقة', val:`${lastCheckin.energy}/5`,               emoji:'⚡' },
              { label:'النوم',  val:`${lastCheckin.sleep}ساعة`,               emoji:'🌙' },
              { label:'التوتر', val: lastCheckin.stress ? `${lastCheckin.stress}/5` : '—', emoji:'😤' },
              { label:'تدريب',  val:`${lastCheckin.trainingDone}أيام`,        emoji:'🏋️' },
              { label:'تغذية',  val:`${lastCheckin.nutritionDays}/7`,         emoji:'🥗' },
              { label:'الوزن',  val: lastCheckin.weight ? `${lastCheckin.weight}كغ` : '—', emoji:'⚖️' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl p-2 text-center border border-slate-100">
                <p className="text-base">{s.emoji}</p>
                <p className="text-xs font-extrabold text-slate-800">{s.val}</p>
                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          {lastCheckin.pain && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
              <p className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wide mb-1">⚠️ ألم / إصابة مُبلَّغ عنها</p>
              <p className="text-xs text-slate-700">{lastCheckin.pain}</p>
            </div>
          )}
          {lastCheckin.note && (
            <p className="text-xs text-slate-500 bg-white rounded-xl px-3 py-2 border border-slate-100 italic">
              "{lastCheckin.note}"
            </p>
          )}
          {/* Coach reply */}
          {lastCheckin.coachReply ? (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
              <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wide mb-1">ردك للعميل ✅</p>
              <p className="text-xs text-slate-700">{lastCheckin.coachReply}</p>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
                placeholder="اكتب ردك للعميل... (Enter للإرسال)"
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-violet-400 transition font-medium"
              />
              <button onClick={sendReply} disabled={sending || !reply.trim()}
                className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition
                  ${sent ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40'}`}>
                {sent ? '✓ أُرسل' : sending ? '...' : 'ردّ'}
              </button>
            </div>
          )}
          <p className="text-[10px] text-slate-400 text-center font-medium">{checkins.length} تقرير مسجل</p>
        </div>
      ) : (
        <p className="text-xs text-slate-400 text-center py-3">لا توجد تقارير أسبوعية بعد</p>
      )}
    </div>
  )
}
