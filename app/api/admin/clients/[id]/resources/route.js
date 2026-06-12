import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { getSubmissionById, updateSubmission } from '@/lib/submissions'

export const dynamic = 'force-dynamic'

// 2 MB base64 size limit (~2.7 MB raw base64 string)
const MAX_DATA_URI_SIZE = 2.7 * 1024 * 1024

export async function GET(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny

  const client = await getSubmissionById(params.id)
  if (!client) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })

  return NextResponse.json({ resources: client.resources || [] })
}

export async function POST(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny

  const client = await getSubmissionById(params.id)
  if (!client) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })

  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const { title, type, url, description, filename } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: 'العنوان مطلوب' }, { status: 400 })
  }
  if (!url?.trim()) {
    return NextResponse.json({ error: 'الرابط أو الملف مطلوب' }, { status: 400 })
  }

  // Field size limits
  if (title.trim().length > 200) return NextResponse.json({ error: 'العنوان طويل جداً' }, { status: 400 })
  if (description?.trim().length > 1000) return NextResponse.json({ error: 'الوصف طويل جداً' }, { status: 400 })

  if (url.startsWith('data:')) {
    // Validate size for data URIs (base64 uploads)
    if (url.length > MAX_DATA_URI_SIZE) {
      return NextResponse.json({ error: 'حجم الملف كبير جداً — الحد الأقصى 2 ميغابايت' }, { status: 400 })
    }
  } else {
    // Validate URL scheme — only http/https allowed
    if (url.trim().length > 2048) return NextResponse.json({ error: 'الرابط طويل جداً' }, { status: 400 })
    try {
      const parsed = new URL(url.trim())
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return NextResponse.json({ error: 'رابط غير صالح — يجب أن يبدأ بـ http أو https' }, { status: 400 })
      }
    } catch {
      return NextResponse.json({ error: 'رابط غير صالح' }, { status: 400 })
    }
  }

  const resource = {
    id: crypto.randomUUID(),
    title: title.trim(),
    type: type || 'link',
    url: url.trim(),
    description: description?.trim() || '',
    filename: filename?.trim() || '',
    createdAt: new Date().toISOString(),
  }

  const existing = client.resources || []
  await updateSubmission(params.id, { resources: [...existing, resource] })

  return NextResponse.json({ resource }, { status: 201 })
}

export async function DELETE(req, { params }) {
  const deny = await requireAdmin()
  if (deny) return deny

  const { searchParams } = new URL(req.url)
  const resourceId = searchParams.get('resourceId')

  if (!resourceId) {
    return NextResponse.json({ error: 'resourceId مطلوب' }, { status: 400 })
  }

  const client = await getSubmissionById(params.id)
  if (!client) return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })

  const filtered = (client.resources || []).filter(r => r.id !== resourceId)
  await updateSubmission(params.id, { resources: filtered })

  return NextResponse.json({ ok: true })
}
