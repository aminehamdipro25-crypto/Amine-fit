import nodemailer from 'nodemailer'

// Shared transport — reused across requests to avoid TCP/TLS overhead per call
let _transport = null
function getGmailTransport() {
  if (!_transport) {
    _transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
  }
  return _transport
}

// Resend REST fallback
async function sendViaResend(options) {
  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify(options),
  })
  if (!res.ok) throw new Error(`Resend error ${res.status}: ${await res.text()}`)
  return res.json()
}

/**
 * Send an email using Gmail SMTP (primary) or Resend (fallback).
 * @param {{ to: string, subject: string, html: string, text: string }} opts
 */
export async function sendEmail({ to, subject, html, text }) {
  // Primary: Gmail SMTP
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    const transport = getGmailTransport()
    await transport.sendMail({
      from:     `"Amine-Fit" <${process.env.GMAIL_USER}>`,
      replyTo:  process.env.GMAIL_USER,
      to,
      subject,
      html,
      text,
    })
    return { provider: 'gmail' }
  }

  // Fallback: Resend
  if (process.env.RESEND_API_KEY) {
    await sendViaResend({
      from:     'AmineFit <onboarding@resend.dev>',
      reply_to: 'amine.hamdi.pro25@gmail.com',
      to:       [to],
      subject,
      html,
      text,
    })
    return { provider: 'resend' }
  }

  throw new Error('No email provider configured (GMAIL_USER or RESEND_API_KEY required)')
}
