import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Fire and forget
    await supabase.from('telemetry').insert({
      link_slug: link_id,
      viewer_email: viewer_email || 'anonymous',
      viewer_name: viewer_name || 'Anonymous Viewer',
      event_type,
      page_number,
      duration_seconds: duration_seconds || 0
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Telemetry Error]', error)
    return NextResponse.json({ error: 'Failed to record telemetry' }, { status: 500 })
  }
}
