const fs = require('fs');
const pagePath = 'src/app/page.tsx';
let code = fs.readFileSync(pagePath, 'utf8');

if (!code.includes('import { supabase }')) {
  code = code.replace(
    "import { useState } from 'react'",
    "import { useState, useEffect } from 'react'\nimport { useRouter } from 'next/navigation'\nimport { supabase } from '@/lib/supabase'"
  );
  
  code = code.replace(
    "export default function DashboardPage() {",
    "export default function DashboardPage() {\n  const router = useRouter()\n  const [user, setUser] = useState<any>(null)\n  const [loadingSession, setLoadingSession] = useState(true)\n\n  useEffect(() => {\n    supabase.auth.getSession().then(({ data: { session } }) => {\n      if (!session) {\n        router.push('/login')\n      } else {\n        setUser(session.user)\n        setLoadingSession(false)\n      }\n    })\n  }, [router])\n\n  if (loadingSession) return <div className=\"min-h-screen flex items-center justify-center\">Loading...</div>\n"
  );
  
  fs.writeFileSync(pagePath, code);
}
