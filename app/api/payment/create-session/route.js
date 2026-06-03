import { NextResponse } from 'next/server'
import { isRateLimited } from '@/lib/rateLimit'

const PLANS = {
  training: { name: 'برنامج التدريب', price:  5000, desc: 'برنامج تدريب مخصص' },         // 50 TND
  monthly:  { name: 'الباقة الشهرية', price: 12500, desc: 'تغذية + تدريب + متابعة' },    // 125 TND
  '3months':{ name: 'باقة 3 أشهر',   price: 30000, desc: 'كل الخدمات — الأوفر قيمة' }, // 300 TND
}

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (await isRateLimited(`stripe_session:${ip}`, 10, 3600)) {
    return NextResponse.json({ error: 'محاولات كثيرة — حاول لاحقاً' }, { status: 429 })
  }

  const { plan, email, name } = await req.json()

  if (!email || typeof email !== 'string' || email.length > 254 || !email.includes('@')) {
    return NextResponse.json({ error: 'بريد إلكتروني غير صالح' }, { status: 400 })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const selectedPlan = PLANS[plan]
  if (!selectedPlan) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      metadata: { plan, name: name || '' },
      line_items: [{
        price_data: {
          currency: 'tnd',
          product_data: {
            name: `Amine-Fit — ${selectedPlan.name}`,
            description: selectedPlan.desc,
          },
          unit_amount: selectedPlan.price,
        },
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'}/payment`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe error:', err.message)
    return NextResponse.json({ error: 'حدث خطأ في معالجة الدفع' }, { status: 500 })
  }
}
