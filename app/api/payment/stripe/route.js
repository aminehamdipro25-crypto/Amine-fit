import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const PLANS = {
  training:  { usd: 4900,  name: 'برنامج التدريب',  days: 30 },
  monthly:   { usd: 9900,  name: 'الباقة الشهرية', days: 30 },
  '3months': { usd: 24900, name: 'باقة 3 أشهر',   days: 90 },
}

export async function POST(req) {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 })

  try {
    const { plan, email, name } = await req.json()
    const planData = PLANS[plan]
    if (!planData) return NextResponse.json({ error: 'invalid_plan' }, { status: 400 })

    const emailLower = String(email || '').toLowerCase().trim()
    if (!emailLower) return NextResponse.json({ error: 'email_required' }, { status: 400 })

    const stripe = new Stripe(key, { apiVersion: '2024-06-20' })
    const BASE   = process.env.NEXT_PUBLIC_BASE_URL || 'https://amine-fit.com'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode:                 'payment',
      customer_email:       emailLower,
      client_reference_id:  emailLower,
      line_items: [{
        price_data: {
          currency:     'usd',
          product_data: {
            name:        planData.name,
            description: `Amine-Fit — ${planData.days} يوم`,
            images:      [`${BASE}/icon-512.png`],
          },
          unit_amount: planData.usd,
        },
        quantity: 1,
      }],
      metadata: {
        plan,
        days:  String(planData.days),
        email: emailLower,
        name:  String(name || '').slice(0, 100),
      },
      success_url: `${BASE}/payment/success?method=card`,
      cancel_url:  `${BASE}/payment?canceled=1`,
      locale:      'ar',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[stripe/create]', err.message)
    return NextResponse.json({ error: 'stripe_error' }, { status: 500 })
  }
}
