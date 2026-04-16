const fs = require('fs');

// --- 1. PATCH CREATE LINK MODAL ---
const modalPath = 'src/components/documents/CreateLinkModal.tsx';
let modalCode = fs.readFileSync(modalPath, 'utf8');

if (!modalCode.includes("import { supabase }")) {
  modalCode = modalCode.replace(
    "import { generateSlug } from '@/lib/utils'",
    "import { generateSlug } from '@/lib/utils'\nimport { supabase } from '@/lib/supabase'"
  );
}

const oldHandleCreate = `  const handleCreate = async () => {
    setCreating(true)
    await new Promise(r => setTimeout(r, 600))
    const slug = generateSlug()
    const url = \`\${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/d/\${slug}\`
    setCreatedLink(url)
    if (onSuccess) onSuccess(slug)
    setCreating(false)
  }`;

const newHandleCreate = `  const handleCreate = async () => {
    setCreating(true)
    try {
      const slug = generateSlug()
      
      const { error } = await supabase.from('links').insert({
        slug,
        document_id: documentId,
        require_email: requireEmail,
        password_protect: passwordProtect,
        passcode: passwordProtect ? password : null,
        set_expiration: setExpiration,
        expires_at: setExpiration && expiresAt ? new Date(expiresAt).toISOString() : null,
        allow_download: allowDownload,
        notify_on_view: notifyOnView,
        notify_email: notifyOnView ? notifyEmail : null,
        nda_enabled: ndaEnabled,
        nda_text: ndaEnabled ? ndaText : null,
        watermark_enabled: watermarkEnabled
      })
      
      if (error) throw error

      const url = \`\${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/d/\${slug}\`
      setCreatedLink(url)
      if (onSuccess) onSuccess(slug)
    } catch (err: any) {
      alert("Error creating link: " + err.message)
    } finally {
      setCreating(false)
    }
  }`;

if (modalCode.includes(oldHandleCreate)) {
  modalCode = modalCode.replace(oldHandleCreate, newHandleCreate);
  fs.writeFileSync(modalPath, modalCode);
}


// --- 2. PATCH VIEWER PAGE ---
const pagePath = 'src/app/d/[slug]/page.tsx';
let pageCode = fs.readFileSync(pagePath, 'utf8');

const newPageCode = `import { ViewerClient } from './viewer-client'
import { createClient } from '@supabase/supabase-js'

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

  // Check expiration
  if (linkData.set_expiration && linkData.expires_at) {
    if (new Date() > new Date(linkData.expires_at)) {
      return <div className="min-h-screen flex items-center justify-center text-gray-500">This link has expired</div>
    }
  }

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
    pdf_url: publicUrlData.publicUrl
  }

  return <ViewerClient config={config} />
}
`;

fs.writeFileSync(pagePath, newPageCode);

