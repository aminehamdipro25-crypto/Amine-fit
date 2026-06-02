'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const TYPE_CONFIG = {
  before:   { label: 'قبل',    emoji: '📸', badge: 'bg-blue-100 text-blue-700',    border: 'border-blue-300' },
  progress: { label: 'تقدم',   emoji: '📊', badge: 'bg-amber-100 text-amber-700',  border: 'border-amber-300' },
  after:    { label: 'بعد',    emoji: '🏆', badge: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-300' },
}

const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو',
                 'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']

function fmtDate(iso) {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

// Compress an image File to JPEG base64, max 800px wide, quality 0.7
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const MAX_W = 800
      let w = img.naturalWidth
      let h = img.naturalHeight
      if (w > MAX_W) {
        h = Math.round((h * MAX_W) / w)
        w = MAX_W
      }
      const canvas = document.createElement('canvas')
      canvas.width  = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)
      const compressed = canvas.toDataURL('image/jpeg', 0.7)
      resolve(compressed)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('فشل تحميل الصورة')) }
    img.src = url
  })
}

function sizeKBFromDataUrl(dataUrl) {
  const base64 = dataUrl.split(',')[1] || ''
  return Math.round((base64.length * 0.75) / 1024)
}

export default function PhotosPage() {
  const router = useRouter()
  const fileInputRef = useRef(null)
  const dropZoneRef  = useRef(null)

  const [photos,    setPhotos]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState('')

  // Upload form state
  const [preview,   setPreview]   = useState(null)   // compressed dataUrl
  const [photoType, setPhotoType] = useState('before')
  const [note,      setNote]      = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // Delete confirm
  const [confirmId, setConfirmId] = useState(null)
  const longPressTimer = useRef(null)

  // ── Load photos ──────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/client/photos')
      .then(r => {
        if (r.status === 401) { router.push('/client/login'); return null }
        return r.json()
      })
      .then(data => { if (Array.isArray(data)) setPhotos(data) })
      .finally(() => setLoading(false))
  }, [router])

  // ── File selection (input or drop) ───────────────────────────────────────────
  const handleFile = useCallback(async (file) => {
    setError('')
    if (!file || !file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة صالح')
      return
    }
    try {
      const compressed = await compressImage(file)
      const kb = sizeKBFromDataUrl(compressed)
      if (kb > 200) {
        setError(`حجم الصورة بعد الضغط ${kb} كيلوبايت — الحد الأقصى 200 كيلوبايت`)
        return
      }
      setPreview(compressed)
    } catch (e) {
      setError(e.message || 'فشل معالجة الصورة')
    }
  }, [])

  function onFileChange(e) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // reset so selecting same file again fires change
    e.target.value = ''
  }

  // Drag & drop handlers
  function onDragOver(e) {
    e.preventDefault()
    setIsDragging(true)
  }
  function onDragLeave() { setIsDragging(false) }
  function onDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  // ── Upload ───────────────────────────────────────────────────────────────────
  async function upload() {
    if (!preview) return
    setUploading(true)
    setError('')
    try {
      const res = await fetch('/api/client/photos', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ dataUrl: preview, type: photoType, note }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'فشل الرفع')
      } else {
        setPhotos(prev => [...prev, data])
        setPreview(null)
        setNote('')
        setPhotoType('before')
      }
    } catch {
      setError('خطأ في الاتصال بالخادم')
    } finally {
      setUploading(false)
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────────
  async function deletePhoto(id) {
    setConfirmId(null)
    const res = await fetch('/api/client/photos', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id }),
    })
    if (res.ok) setPhotos(prev => prev.filter(p => p.id !== id))
  }

  // Long-press support for touch devices
  function onPointerDown(id) {
    longPressTimer.current = setTimeout(() => setConfirmId(id), 600)
  }
  function onPointerUp() {
    clearTimeout(longPressTimer.current)
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-2 border-[#fbbf24] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-5 max-w-2xl mx-auto" dir="rtl">

      {/* Privacy notice */}
      <div className="bg-[#0a0a0a] rounded-2xl px-5 py-3.5 flex items-center gap-3">
        <span className="text-lg">🔒</span>
        <p className="text-white/70 text-sm font-medium">
          صورك خاصة — يراها المدرب فقط
        </p>
      </div>

      {/* Page header */}
      <div>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">معرض الصور</p>
        <h1 className="text-2xl font-extrabold text-slate-900">صور قبل وبعد 📸</h1>
        <p className="text-sm text-slate-400 mt-1">ارفع صورك لتتابع تحولك مع الوقت</p>
      </div>

      {/* Upload card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-[#0a0a0a] px-5 py-4">
          <h2 className="text-white font-extrabold text-sm">رفع صورة جديدة</h2>
          <p className="text-white/40 text-xs mt-0.5">الحد الأقصى 200 كيلوبايت — يتم الضغط تلقائياً</p>
        </div>

        <div className="p-5 space-y-4">
          {/* Drop zone */}
          <div
            ref={dropZoneRef}
            onClick={() => !preview && fileInputRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer
              ${preview
                ? 'border-[#fbbf24] bg-amber-50 cursor-default'
                : isDragging
                  ? 'border-[#fbbf24] bg-amber-50 scale-[1.01]'
                  : 'border-slate-200 bg-slate-50 hover:border-[#fbbf24] hover:bg-amber-50/40'
              }`}
          >
            {preview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="معاينة"
                  className="w-full max-h-64 object-contain rounded-xl"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); setPreview(null) }}
                  className="absolute top-2 left-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center text-sm hover:bg-black/80 transition"
                  aria-label="إزالة الصورة"
                >
                  ✕
                </button>
                <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {sizeKBFromDataUrl(preview)} KB
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center select-none">
                <span className="text-4xl mb-3">🖼️</span>
                <p className="font-bold text-slate-600 text-sm">اضغط لاختيار صورة أو اسحبها هنا</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, HEIC — يتم الضغط تلقائياً</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />

          {/* Type selector */}
          <div>
            <p className="text-xs font-bold text-slate-500 mb-2">نوع الصورة</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPhotoType(key)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all font-bold text-sm
                    ${photoType === key
                      ? `${cfg.border} ${cfg.badge} scale-105 shadow-sm`
                      : 'border-slate-100 text-slate-500 hover:border-slate-200'
                    }`}
                >
                  <span className="text-xl">{cfg.emoji}</span>
                  <span>{cfg.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">
              ملاحظة (اختياري — حتى 100 حرف)
            </label>
            <input
              type="text"
              maxLength={100}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="مثال: الأسبوع الأول، الوزن 85 كغ..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#fbbf24] transition font-medium"
            />
            {note.length > 80 && (
              <p className="text-xs text-amber-500 mt-1 font-medium">{note.length}/100</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* Upload button */}
          <button
            onClick={upload}
            disabled={!preview || uploading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#0a0a0a] text-[#fbbf24] rounded-xl font-extrabold text-sm disabled:opacity-40 hover:bg-[#1a1a1a] transition"
          >
            {uploading
              ? <><div className="w-4 h-4 border-2 border-[#fbbf24] border-t-transparent rounded-full animate-spin" /> جاري الرفع...</>
              : <>📤 رفع الصورة</>
            }
          </button>
        </div>
      </div>

      {/* Gallery */}
      {photos.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest px-1">
            معرضك ({photos.length}/12)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...photos].reverse().map(photo => {
              const cfg = TYPE_CONFIG[photo.type] || TYPE_CONFIG.progress
              return (
                <div
                  key={photo.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group"
                  onContextMenu={e => { e.preventDefault(); setConfirmId(photo.id) }}
                  onPointerDown={() => onPointerDown(photo.id)}
                  onPointerUp={onPointerUp}
                  onPointerLeave={onPointerUp}
                >
                  {/* Image */}
                  <div className="relative aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.dataUrl}
                      alt={`${cfg.label} — ${fmtDate(photo.date)}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Delete overlay on hover (desktop) */}
                    <button
                      onClick={() => setConfirmId(photo.id)}
                      className="absolute top-2 left-2 w-7 h-7 bg-black/60 text-white rounded-full items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition hidden sm:flex"
                      aria-label="حذف الصورة"
                    >
                      🗑️
                    </button>
                    {/* Type badge */}
                    <span className={`absolute top-2 right-2 text-xs font-extrabold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                      {cfg.emoji} {cfg.label}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="px-3 py-2.5">
                    <p className="text-xs font-bold text-slate-400">{fmtDate(photo.date)}</p>
                    {photo.note && (
                      <p className="text-xs text-slate-600 font-medium mt-0.5 truncate">{photo.note}</p>
                    )}
                    <p className="text-[10px] text-slate-300 mt-0.5">{photo.sizeKB} KB</p>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-center text-xs text-slate-300 font-medium pt-1">
            اضغط مطولاً على الصورة أو كليك يمين لحذفها
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 py-16 text-center px-6">
          <p className="text-6xl mb-4">📷</p>
          <p className="font-extrabold text-slate-700 text-lg mb-2">لا توجد صور بعد</p>
          <p className="text-slate-400 text-sm leading-relaxed">
            ابدأ برفع أول صورة لتتبع تقدمك
          </p>
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center" dir="rtl">
            <p className="text-4xl mb-4">🗑️</p>
            <h3 className="font-extrabold text-slate-900 text-lg mb-2">حذف الصورة؟</h3>
            <p className="text-slate-400 text-sm mb-6">لا يمكن التراجع عن هذا الإجراء</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition"
              >
                إلغاء
              </button>
              <button
                onClick={() => deletePhoto(confirmId)}
                className="py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
