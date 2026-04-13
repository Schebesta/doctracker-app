import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      link_id,
      viewer_email,
      viewer_name,
      event_type,
      page_number,
      duration_seconds,
    } = body

    // In production this would write to Supabase
    console.log('[Telemetry]', {
      link_id,
      viewer_email,
      viewer_name,
      event_type,
      page_number,
      duration_seconds,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Telemetry Error]', error)
    return NextResponse.json({ error: 'Failed to record telemetry' }, { status: 500 })
  }
}
