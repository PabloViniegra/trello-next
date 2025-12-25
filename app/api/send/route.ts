import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  await resend.emails.send({
    from: process.env.RESEND_FROM as string,
    to: 'example@gmail.com',
    subject: 'Hello world',
    html: '<h1>Hello world</h1><p>This is a test email</p>',
  })

  return NextResponse.json({ message: 'Email sent' })
}
