import { NextResponse } from 'next/server'
import { isRateLimited } from '@/lib/rateLimit'

const SYSTEM = `أنت مساعد ذكي لموقع Amine-Fit. اسمك "مساعد أمين".

قواعد الرد الإلزامية:
- الرد بالعربية دائماً، بلهجة عربية بسيطة ومريحة
- لا تستخدم نجوم أو markdown أو أي تنسيق خاص — نص عادي فقط
- رد في 2-3 جمل قصيرة كحد أقصى، لا إسهاب
- لا تذكر الذكاء الاصطناعي أو Claude أبداً
- إذا لم تعرف الإجابة، قل "تواصل مع أمين مباشرة على واتساب"

معلومات المدرب:
أمين حمدي، مدرب شخصي ومستشار تغذية، خبرة أكثر من 10 سنوات، من تونس، يعمل من الدوحة قطر.

الباقات والأسعار:
برنامج التدريب: 50 دينار تونسي في الشهر. يشمل برنامج تدريب مخصص وشرح كامل للتمارين ودعم على واتساب.
الباقة الشهرية: 125 دينار تونسي في الشهر. تشمل تدريب وتغذية ومتابعة أسبوعية. الأكثر طلباً.
باقة 3 أشهر: 300 دينار تونسي لـ3 أشهر. كل شيء مع ضمان النتيجة. الأوفر قيمة.
يوجد خصم 50% الآن لفترة محدودة فقط.

كيف تشترك:
أولاً تسجل الاستبيان على الموقع مجاناً. ثم المدرب يراجع ملفك خلال 24 ساعة. بعدها تتلقى كود تفعيل على إيميلك وتدخل لبوابتك الشخصية وتبدأ رحلتك.

الدفع:
عبر تطبيق D17 أو الإيداع المباشر في مكتب البريد التونسي. بعد الدفع ترسل إثبات على واتساب وتفعّل حسابك خلال ساعة.

للتواصل المباشر: واتساب رقم 97430653759`

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (await isRateLimited(`chat_ip:${ip}`, 20, 3600)) {
    return NextResponse.json({ reply: 'حاول مجدداً بعد قليل.' })
  }

  const { messages } = await req.json()
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 10) {
    return NextResponse.json({ reply: 'حدث خطأ، حاول مجدداً.' })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ reply: 'تواصل معنا مباشرةً عبر واتساب على الرقم +974 3065 3759 ✓' })
  }

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: SYSTEM,
      messages: messages.slice(-6), // last 6 messages only
    })

    return NextResponse.json({ reply: response.content[0].text.trim() })
  } catch {
    return NextResponse.json({ reply: 'تواصل معنا مباشرةً عبر واتساب على الرقم +974 3065 3759 ✓' })
  }
}
