import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, phone, email, goal, pkg, message } = body

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: 'الاسم ورقم الهاتف مطلوبان' }, { status: 400 })
    }

    // Log lead (replace with DB/email service in production)
    console.log('[Amine-Fit Lead]', {
      name, phone, email, goal, pkg, message,
      receivedAt: new Date().toISOString(),
    })

    // TODO: integrate Resend / Nodemailer here to send email notification
    // e.g.: await resend.emails.send({ from: 'leads@amine-fit.com', to: 'amine.hamdi.pro25@gmail.com', ... })

    return NextResponse.json({ success: true, message: 'تم استلام طلبك بنجاح' })
  } catch {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
