'use client'
import { useState, useEffect } from 'react'
import { Scale, Loader2, ClipboardList } from 'lucide-react'

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

  const latestWeight = progress?.filter(e => e.weight)?.at(-1)
  const prevWeight   = progress?.filter(e => e.weight)?.at(-2)
  const weightDiff   = latestWeight?.weight && prevWeight?.weight
    ? (latestWeight.weight - prevWeight.weight).toFixed(1) : null
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
      {latestWeight ? (
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-4 h-4 text-amber-500" />
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">آخر قياس</p>
            <span className="text-[10px] text-slate-300 mr-auto">
              {new Date(latestWeight.date).toLocaleDateString('ar', { month:'short', day:'numeric' })}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label:'الوزن', val: latestWeight.weight, unit:'كغ', diff: weightDiff },
              { label:'الخصر', val: latestWeight.waist,  unit:'سم', diff: null },
              { label:'الصدر', val: latestWeight.chest,  unit:'سم', diff: null },
            ].filter(f => f.val).map(f => (
              <div key={f.label} className="bg-white rounded-xl p-2.5 text-center border border-slate-100">
                <p className="text-sm font-extrabold text-slate-900">{f.val} <span className="text-[10px] font-semibold text-slate-400">{f.unit}</span></p>
                <p className="text-[10px] text-slate-400 font-semibold">{f.label}</p>
                {f.diff !== null && (
                  <p className={`text-[10px] font-extrabold mt-0.5 ${+f.diff < 0 ? 'text-emerald-500' : +f.diff > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                    {+f.diff > 0 ? '+' : ''}{f.diff} {f.unit}
                  </p>
                )}
              </div>
            ))}
          </div>
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
