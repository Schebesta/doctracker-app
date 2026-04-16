const fs = require('fs');

// --- 1. PATCH PAGE.TSX ---
const pagePath = 'src/app/d/[slug]/page.tsx';
let pageCode = fs.readFileSync(pagePath, 'utf8');

if (!pageCode.includes("oauth_enabled:")) {
  const fetchSettingsOld = `  // Get public URL for the PDF
  const { data: publicUrlData } = supabase.storage
    .from('documents')
    .getPublicUrl(document.storage_path)`;

  const fetchSettingsNew = `  // Get user settings to see if OAuth is enabled
  const { data: settings } = await supabase
    .from('user_settings')
    .select('oauth_enabled')
    .eq('id', document.owner_id)
    .single()

  const oauthEnabled = settings?.oauth_enabled || false

  // Get public URL for the PDF
  const { data: publicUrlData } = supabase.storage
    .from('documents')
    .getPublicUrl(document.storage_path)`;

  pageCode = pageCode.replace(fetchSettingsOld, fetchSettingsNew);

  const configOld = `cta_label: document.cta_label,
    document_name: document.name,
    passcode: linkData.password_protect ? linkData.passcode : null,
    pdf_url: publicUrlData.publicUrl`;

  const configNew = `cta_label: document.cta_label,
    document_name: document.name,
    passcode: linkData.password_protect ? linkData.passcode : null,
    pdf_url: publicUrlData.publicUrl,
    oauth_enabled: oauthEnabled`;

  pageCode = pageCode.replace(configOld, configNew);
  fs.writeFileSync(pagePath, pageCode);
}


// --- 2. PATCH VIEWER-CLIENT.TSX ---
const viewerPath = 'src/app/d/[slug]/viewer-client.tsx';
let viewerCode = fs.readFileSync(viewerPath, 'utf8');

if (!viewerCode.includes("oauth_enabled: boolean")) {
  viewerCode = viewerCode.replace(
    "pdf_url?: string\n}",
    "pdf_url?: string\n  oauth_enabled: boolean\n}"
  );
}

// Wrap Google/LinkedIn buttons in oauth_enabled check
const buttonsOld = `{/* Google */}
            <button
              onClick={() => handleOAuthContinue('google')}
              className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm text-gray-700"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {/* LinkedIn */}
            <button
              onClick={() => handleOAuthContinue('linkedin_oidc')}
              className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm text-gray-700"
            >
              <svg viewBox="0 0 24 24" fill="#0A66C2" className="w-5 h-5">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Continue with LinkedIn
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>`;

const buttonsNew = `{config.oauth_enabled && (
              <>
                {/* Google */}
                <button
                  onClick={() => handleOAuthContinue('google')}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm text-gray-700"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                {/* LinkedIn */}
                <button
                  onClick={() => handleOAuthContinue('linkedin_oidc')}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm text-gray-700"
                >
                  <svg viewBox="0 0 24 24" fill="#0A66C2" className="w-5 h-5">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Continue with LinkedIn
                </button>

                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              </>
            )}`;

if (viewerCode.includes("Continue with Google")) {
  viewerCode = viewerCode.replace(buttonsOld, buttonsNew);
  fs.writeFileSync(viewerPath, viewerCode);
}

