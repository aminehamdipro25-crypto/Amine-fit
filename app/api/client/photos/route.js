import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/clientAuth'
import { getSubmissionById, updateSubmission } from '@/lib/submissions'

export const dynamic = 'force-dynamic'

async function getPayload() {
  const token = cookies().get('client_token')?.value
  return await verifyToken(token)
}

// GET — return this client's photos
export async function GET() {
  const payload = await getPayload()
  if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const client = await getSubmissionById(payload.id)
  if (!client) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })

  return NextResponse.json(client.photos || [])
}

// POST — upload a new photo
export async function POST(req) {
  try {
    const payload = await getPayload()
    if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const body = await req.json()
    const { dataUrl, type, note } = body

    // Validate dataUrl — allowlist safe raster formats only (no SVG/XSS vectors)
    const ALLOWED = ['data:image/jpeg;base64,', 'data:image/png;base64,', 'data:image/webp;base64,']
    if (!dataUrl || typeof dataUrl !== 'string' || !ALLOWED.some(p => dataUrl.startsWith(p))) {
      return NextResponse.json({ error: 'صيغة الصورة غير مدعومة — يُقبل JPEG أو PNG أو WebP فقط' }, { status: 400 })
    }

    // Validate type
    if (!['before', 'after', 'progress'].includes(type)) {
      return NextResponse.json({ error: 'نوع الصورة غير صحيح' }, { status: 400 })
    }

    // Check size: base64 payload length × 0.75 / 1024 = KB
    const base64Data = dataUrl.split(',')[1] || ''
    const sizeKB = Math.round((base64Data.length * 0.75) / 1024)
    if (sizeKB > 200) {
      return NextResponse.json({ error: 'حجم الصورة يتجاوز 200 كيلوبايت' }, { status: 400 })
    }

    const client = await getSubmissionById(payload.id)
    if (!client) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })

    const entry = {
      id:     Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      date:   new Date().toISOString(),
      type:   type,
      dataUrl: dataUrl,
      note:   (note ?? '').toString().slice(0, 100),
      sizeKB: sizeKB,
    }

    // Keep max 12 photos (slice to last 12)
    const photos = [...(client.photos || []), entry].slice(-12)
    await updateSubmission(payload.id, { photos })

    return NextResponse.json(entry)
  } catch (err) {
    console.error('[photos POST]', err.message)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

// DELETE — remove a photo by id
export async function DELETE(req) {
  try {
    const payload = await getPayload()
    if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    const body = await req.json()
    const { id } = body
    if (!id) return NextResponse.json({ error: 'معرّف الصورة مطلوب' }, { status: 400 })

    const client = await getSubmissionById(payload.id)
    if (!client) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })

    const before  = client.photos || []
    const photos  = before.filter(p => p.id !== id)
    if (photos.length === before.length) {
      return NextResponse.json({ error: 'الصورة غير موجودة' }, { status: 404 })
    }

    await updateSubmission(payload.id, { photos })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[photos DELETE]', err.message)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
