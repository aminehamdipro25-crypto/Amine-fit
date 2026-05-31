import { NextResponse } from 'next/server'

const PLANS = {
  basic:    { name: 'الأساسي',   price: 20000, desc: 'خطة تغذية شهرية' },      // 200 QAR
  standard: { name: 'المتوسط',   price: 35000, desc: 'تغذية + تدريب + متابعة' }, // 350 QAR
  premium:  { name: 'البريميوم', price: 55000, desc: 'كل الخدمات + تواصل مباشر' }, // 550 QAR
}

export async function POST(req) {
  const { plan, email, name } = await req.json()

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
          currency: 'qar',
          product_data: {
            name: `Amine-Fit — ${selectedPlan.name}`,
            description: selectedPlan.desc,
          },
          unit_amount: selectedPlan.price,
        },
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.vercel.app'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.vercel.app'}/payment`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
