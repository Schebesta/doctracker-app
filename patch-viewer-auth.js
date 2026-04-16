const fs = require('fs');

const path = 'src/app/d/[slug]/viewer-client.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add Supabase import
if (!code.includes("import { supabase } from '@/lib/supabase'")) {
  code = code.replace(
    "import { Label } from '@/components/ui/label'",
    "import { Label } from '@/components/ui/label'\nimport { supabase } from '@/lib/supabase'"
  );
}

// 2. Add auth effect to grab email if coming back from OAuth
const oldUseStateName = `const [viewerName, setViewerName] = useState('')`;
const newUseStateName = `const [viewerName, setViewerName] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(config.require_email)

  useEffect(() => {
    if (!config.require_email) return
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email) {
        setViewerEmail(session.user.email)
        setViewerName(session.user.user_metadata?.full_name || session.user.email.split('@')[0])
        
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: config.slug, viewer_email: session.user.email, document_name: config.document_name }),
        }).catch(() => {})

        if (config.passcode) setStep('passcode')
        else if (config.nda_enabled) setStep('nda')
        else setStep('viewer')
      }
      setCheckingAuth(false)
    }
    checkSession()
  }, [config])`;

if (code.includes(oldUseStateName)) {
  code = code.replace(oldUseStateName, newUseStateName);
}

// 3. Add OAuth handlers
const oldEmailContinue = `const handleEmailContinue = async (email: string, name?: string) => {`;
const newEmailContinue = `const handleOAuthContinue = async (provider: 'google' | 'linkedin_oidc') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.href,
      }
    })
  }

  const handleEmailContinue = async (email: string, name?: string) => {`;

if (code.includes(oldEmailContinue)) {
  code = code.replace(oldEmailContinue, newEmailContinue);
}

// 4. Update the buttons
const oldGoogleBtn = `<button
              onClick={() => handleEmailContinue('viewer@gmail.com', 'Google User')}`;
const newGoogleBtn = `<button
              onClick={() => handleOAuthContinue('google')}`;
code = code.replace(oldGoogleBtn, newGoogleBtn);

const oldLinkedInBtn = `<button
              onClick={() => handleEmailContinue('viewer@linkedin.com', 'LinkedIn User')}`;
const newLinkedInBtn = `<button
              onClick={() => handleOAuthContinue('linkedin_oidc')}`;
code = code.replace(oldLinkedInBtn, newLinkedInBtn);

// 5. Loading State for Checking Auth
const oldGateStart = `if (step === 'gate') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">`;

const newGateStart = `if (step === 'gate') {
    if (checkingAuth) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">`;

if (code.includes(oldGateStart)) {
  code = code.replace(oldGateStart, newGateStart);
}

fs.writeFileSync(path, code);
