import { NextResponse } from 'next/server'
import { isRateLimited } from '@/lib/rateLimit'

const SYSTEM = `أنت مساعد ذكي لموقع Amine-Fit. ردودك بالعربية دائماً، مختصرة وودية (3-4 جمل كحد أقصى).

معلومات عن المدرب:
- الاسم: أمين حمدي — مدرب شخصي ومستشار تغذية، خبرة +10 سنوات
- الموقع: الدوحة، قطر
- الجمهور: العرب، خاصةً تونس

الباقات والأسعار (الدينار التونسي):
- برنامج التدريب: 50 د.ت/شهر — برنامج تدريب مخصص + شرح التمارين + دعم واتساب
- الباقة الشهرية: 125 د.ت/شهر — تدريب + تغذية + متابعة أسبوعية (الأكثر طلباً)
- باقة 3 أشهر: 300 د.ت/3 أشهر — كل شيء + ضمان النتيجة (الأوفر)
- هناك خصم 50% الآن لفترة محدودة

كيف يعمل البرنامج:
1. تسجيل الاستبيان على الموقع (مجاناً)
2. انتظار مراجعة المدرب (24-48 ساعة)
3. موافقة المدرب وإرسال كود تفعيل على الإيميل
4. تفعيل الحساب والدخول لبوابة العميل الشخصية
5. استلام الخطة والمتابعة المستمرة

طريقة الدفع:
- عبر تطبيق D17 (البريد التونسي) — تحويل مباشر
- أو الذهاب لأقرب مكتب بريد وإيداع المبلغ في الحساب الجاري

التواصل المباشر: واتساب +974 3065 3759

قواعد مهمة:
- لا تذكر الذكاء الاصطناعي أو Claude أبداً
- لا تخترع معلومات غير موجودة هنا
- إذا سأل عن شيء لا تعرفه، اقترح التواصل على الواتساب
- كن حماسياً ومحفزاً`

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
