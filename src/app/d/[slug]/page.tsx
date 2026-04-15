import { ViewerClient } from './viewer-client'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function DocumentViewerPage({ params }: PageProps) {
  const { slug } = await params
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Fetch the specific link configuration AND the joined document data
  const { data: linkData } = await supabase
    .from('links')
    .select('*, documents(*)')
    .eq('slug', slug)
    .single()

  if (!linkData || !linkData.documents) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Link not found or expired</div>
  }

  const document = linkData.documents

  // Check expiration and fallback to newest link
  if (linkData.set_expiration && linkData.expires_at && new Date() > new Date(linkData.expires_at)) {
    // Look for a newer valid link for the same document
    const { data: newerLinks } = await supabase
      .from('links')
      .select('*')
      .eq('document_id', document.id)
      .order('created_at', { ascending: false })

    const newestValid = newerLinks?.find(l => 
      !l.set_expiration || !l.expires_at || new Date() < new Date(l.expires_at)
    )

    if (newestValid && newestValid.slug !== slug) {
      redirect(`/d/${newestValid.slug}`)
    } else {
      return <div className="min-h-screen flex items-center justify-center text-gray-500">This link has expired and no updated link is available.</div>
    }
  }

  // Get user settings to see if OAuth is enabled
  const { data: settings } = await supabase
    .from('user_settings')
    .select('oauth_enabled')
    .eq('id', document.owner_id)
    .single()

  const oauthEnabled = settings?.oauth_enabled || false

  // Get public URL for the PDF
  const { data: publicUrlData } = supabase.storage
    .from('documents')
    .getPublicUrl(document.storage_path)

  const config = {
    slug,
    require_email: linkData.require_email,
    allow_download: linkData.allow_download,
    notify_on_view: linkData.notify_on_view,
    nda_enabled: linkData.nda_enabled,
    nda_text: linkData.nda_text,
    watermark_enabled: linkData.watermark_enabled,
    cta_url: document.cta_url,
    cta_label: document.cta_label,
    document_name: document.name,
    passcode: linkData.password_protect ? linkData.passcode : null,
    pdf_url: publicUrlData.publicUrl,
    oauth_enabled: oauthEnabled
  }

  return <ViewerClient config={config} />
}
