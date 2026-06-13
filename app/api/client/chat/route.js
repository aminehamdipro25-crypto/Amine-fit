import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/clientAuth'
import { getSubmissionById } from '@/lib/submissions'
import { isRateLimited } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `أنت مساعد متخصص في التغذية والتدريب الرياضي، تعمل مع المدرب الشخصي أمين حمدي في الدوحة، قطر.

مهمتك:
- الإجابة على أسئلة التغذية والتدريب الرياضي
- شرح مفاهيم الصحة واللياقة البدنية بأسلوب واضح ومبسط
- تحفيز العميل ودعمه في رحلته الرياضية
- شرح محتوى الخطة الغذائية وبروتوكولات التدريب

قواعد صارمة:
1. تحدث دائماً بالعربية — لغة ودودة وتشجيعية
2. ردودك مختصرة وواضحة — لا تتجاوز 150 كلمة
3. لا تقدم تشخيصاً طبياً ولا توصي بأدوية — وجّه للطبيب عند الحاجة
4. لا تعدل على الخطة الغذائية المخصصة من المدرب — اشرحها فقط ولا تغيّرها
5. إذا كان السؤال خارج نطاق التغذية والتدريب قل: "هذا السؤال خارج تخصصي — تواصل مع المدرب أمين مباشرة"
6. استخدم نبرة تحفيزية وإيجابية دائماً`

export async function POST(req) {
  try {
    const token = cookies().get('client_token')?.value
    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

    if (await isRateLimited(`client_chat:${payload.id}`, 15, 3600)) {
      return NextResponse.json({ error: 'وصلت الحد المسموح (15 رسالة/ساعة) — حاول لاحقاً' }, { status: 429 })
    }

    const { messages } = await req.json()
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'رسالة فارغة' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        message: 'المساعد غير متاح حالياً. تواصل مع مدربك أمين مباشرة على واتساب: +974 3065 3759'
      })
    }

    const client = await getSubmissionById(payload.id)

    const safeMessages = messages.slice(-8).map(m => ({
      role:    m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content || '').slice(0, 800),
    }))

    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const clientCtx = client
      ? `\n\nمعلومات العميل:\n- الاسم: ${client.name}\n- الهدف: ${client.goal || 'لم يُحدد'}\n- العمر: ${client.age || '؟'} سنة\n- الوزن الحالي: ${client.weight || '؟'} كغ`
      : ''

    const response = await anthropic.messages.create({
      model:      'claude-haiku-4-5',
      max_tokens: 400,
      system:     SYSTEM_PROMPT + clientCtx,
      messages:   safeMessages,
    })

    const text = response.content.find(b => b.type === 'text')?.text?.trim()
      || 'عذراً، لم أتمكن من الإجابة الآن.'
    return NextResponse.json({ message: text })

  } catch (err) {
    console.error('[client/chat]', err.message)
    return NextResponse.json({ error: 'خطأ في الخادم — حاول مجدداً' }, { status: 500 })
  }
}
