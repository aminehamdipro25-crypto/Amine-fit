'use client'
import { useState, useEffect } from 'react'
import { Camera } from 'lucide-react'

export default function ClientPhotosPanel({ clientId }) {
  const [photos, setPhotos] = useState(null)

  useEffect(() => {
    fetch(`/api/admin/clients/${clientId}/photos`)
      .then(r => r.ok ? r.json() : [])
      .then(setPhotos)
      .catch(() => setPhotos([]))
  }, [clientId])

  if (!photos) return null
  if (!photos.length) return null

  const TYPE_LABEL = { before: 'قبل 📸', progress: 'تقدم 📊', after: 'بعد 🏆' }
  const TYPE_COLOR = { before: 'bg-blue-100 text-blue-700', progress: 'bg-amber-100 text-amber-700', after: 'bg-emerald-100 text-emerald-700' }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Camera className="w-3.5 h-3.5 text-slate-400" />
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">صور العميل ({photos.length})</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {photos.slice(-9).map(p => (
          <div key={p.id} className="relative rounded-xl overflow-hidden border border-slate-100 aspect-square bg-slate-50">
            <img src={p.dataUrl} alt={p.type} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 inset-x-0 bg-black/50 px-2 py-1 flex items-center gap-1.5">
              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${TYPE_COLOR[p.type] || 'bg-slate-100 text-slate-600'}`}>
                {TYPE_LABEL[p.type] || p.type}
              </span>
              <span className="text-white/60 text-[9px]">
                {new Date(p.date).toLocaleDateString('ar', { month:'short', day:'numeric' })}
              </span>
            </div>
          </div>
        ))}
      </div>
      {photos.length > 9 && (
        <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">+ {photos.length - 9} صور أخرى</p>
      )}
    </div>
  )
}
