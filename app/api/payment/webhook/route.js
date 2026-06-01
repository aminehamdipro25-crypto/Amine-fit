import { NextResponse } from 'next/server'
import { getSubmissionByEmail, updateSubmission } from '@/lib/submissions'

export async function POST(req) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  let event
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[webhook] signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const email   = session.customer_email
    const plan    = session.metadata?.plan

    // Validate plan against known values to prevent metadata injection
    const VALID_PLANS = ['basic', 'standard', 'premium', 'pro', 'monthly', 'quarterly', 'yearly']
    const safePlan = VALID_PLANS.includes(plan) ? plan : 'unknown'

    if (email) {
      const client = await getSubmissionByEmail(email)
      if (client) {
        await updateSubmission(client.id, {
          status:    'active',
          paidPlan:  safePlan,
          paidAt:    new Date().toISOString(),
          paymentId: session.payment_intent,
        })
      }
    }
  }

  return NextResponse.json({ received: true })
}
