import { NextRequest, NextResponse } from 'next/server'
import { generateSlug } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      asset_id,
      require_email,
      passcode,
      expires_at,
      allow_download,
      notify_on_view,
      notify_email,
      nda_enabled,
      nda_text,
      watermark_enabled,
    } = body

    const slug = generateSlug()

    // In production this would write to Supabase
    const link = {
      id: slug,
      slug,
      asset_id,
      require_email: require_email ?? true,
      passcode: passcode || null,
      expires_at: expires_at || null,
      allow_download: allow_download ?? false,
      notify_on_view: notify_on_view ?? true,
      notify_email: notify_email || null,
      nda_enabled: nda_enabled ?? false,
      nda_text: nda_text || null,
      watermark_enabled: watermark_enabled ?? true,
      is_active: true,
      created_at: new Date().toISOString(),
    }

    console.log('[Link Created]', link)

    return NextResponse.json({ link, url: `${process.env.NEXT_PUBLIC_APP_URL}/d/${slug}` })
  } catch (error) {
    console.error('[Links Error]', error)
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 })
  }
}

export async function GET() {
  // Return mock links list
  return NextResponse.json({
    links: [
      { id: 'abc123', slug: 'abc123', is_active: true, views: 35 },
      { id: 'def456', slug: 'def456', is_active: true, views: 12 },
    ],
  })
}
