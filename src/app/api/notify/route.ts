import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, viewer_email, document_name } = body

    // Strike Alert — in production this would send an email
    console.log('[Strike Alert] Document viewed!', {
      document: document_name,
      link: slug,
      viewer: viewer_email,
      time: new Date().toISOString(),
    })

    // Would send email via SendGrid/Resend/etc in production:
    // await sendEmail({
    //   to: notifyEmail,
    //   subject: `DocTracker: "${document_name}" was just viewed`,
    //   html: `<p>${viewer_email} just opened your document.</p>`,
    // })

    return NextResponse.json({ success: true, message: 'Notification sent' })
  } catch (error) {
    console.error('[Notify Error]', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
