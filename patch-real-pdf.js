const fs = require('fs');

// --- 1. PATCH VIEWER CLIENT ---
const viewerPath = 'src/app/d/[slug]/viewer-client.tsx';
let viewerCode = fs.readFileSync(viewerPath, 'utf8');

if (!viewerCode.includes("import { PDFViewer }")) {
  viewerCode = viewerCode.replace(
    "import { WatermarkOverlay } from '@/components/viewer/WatermarkOverlay'",
    "import { WatermarkOverlay } from '@/components/viewer/WatermarkOverlay'\nimport { PDFViewer } from '@/components/viewer/PDFViewer'"
  );
}

if (!viewerCode.includes("pdf_url?: string")) {
  viewerCode = viewerCode.replace(
    "document_name: string\n  passcode: string | null\n}",
    "document_name: string\n  passcode: string | null\n  pdf_url?: string\n}"
  );
}

// Replace the placeholder PDF page
const placeholderStart = `{/* Placeholder PDF page */}`;
const placeholderEnd = `upload a real PDF`;

if (viewerCode.includes(placeholderStart)) {
  const replacement = `{/* Real PDF Viewer */}
        <div className="relative w-full max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-4 overflow-hidden">
          {config.watermark_enabled && viewerEmail && (
            <WatermarkOverlay email={viewerEmail} />
          )}
          {config.pdf_url ? (
            <PDFViewer 
              url={config.pdf_url} 
              onPageChange={handlePageChange}
              onLoadSuccess={(pages) => {}}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-96 gap-6 text-center">
              <FileText className="w-12 h-12 text-gray-300" />
              <p className="text-gray-500">Document file not found.</p>
            </div>
          )}
        </div>
      </div>`;

  viewerCode = viewerCode.replace(/\{\/\* Placeholder PDF page \*\/\}[\s\S]*?<\/p>\s*<\/div>\s*<\/div>\s*<\/div>/, replacement);
  
  // Remove the old page navigation UI since PDFViewer renders its own
  viewerCode = viewerCode.replace(/\{\/\* Page Navigation \*\/\}[\s\S]*?<\/div>\s*<\/div>/, '</div>');
  
  fs.writeFileSync(viewerPath, viewerCode);
}

// --- 2. PATCH SERVER PAGE ---
const pagePath = 'src/app/d/[slug]/page.tsx';

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

  // Find document that contains this link
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .contains('links', [slug])
    .limit(1)

  const document = documents?.[0]

  if (!document) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Link not found or expired</div>
  }

  // Get public URL for the PDF
  const { data: publicUrlData } = supabase.storage
    .from('documents')
    .getPublicUrl(document.storage_path)

  const config = {
    slug,
    require_email: true, // we can make this dynamic later based on a 'links' table
    allow_download: true,
    notify_on_view: false,
    nda_enabled: false,
    nda_text: null,
    watermark_enabled: true,
    cta_url: document.cta_url,
    cta_label: document.cta_label,
    document_name: document.name,
    passcode: null,
    pdf_url: publicUrlData.publicUrl
  }

  return <ViewerClient config={config} />
}
`;

fs.writeFileSync(pagePath, newPageCode);

