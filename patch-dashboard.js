const fs = require('fs');
const pagePath = 'src/app/page.tsx';
let code = fs.readFileSync(pagePath, 'utf8');

// Replace the strict redirect logic with a passive session check
const oldEffect = `  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        setLoadingSession(false)
      }
    })
  }, [router])`;

const newEffect = `  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setLoadingSession(false)
    })
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })
    
    return () => authListener.subscription.unsubscribe()
  }, [])`;

if (code.includes(oldEffect)) {
  code = code.replace(oldEffect, newEffect);
}

// Also replace loading state if it blocks rendering
const oldLoading = `  if (loadingSession) return <div className="min-h-screen flex items-center justify-center">Loading...</div>`;
const newLoading = `  // removed blocking loading state`;
if (code.includes(oldLoading)) {
  code = code.replace(oldLoading, newLoading);
}

// Modify the Upload buttons to require auth
code = code.replaceAll('onClick={() => setUploadOpen(true)}', 'onClick={() => user ? setUploadOpen(true) : router.push("/login")}');

// Add a login/logout button to the header
const headerDiv = `<div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and track your shared documents
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 gap-2"`;
            
const newHeaderDiv = `<div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and track your shared documents
            </p>
          </div>
          <div className="flex gap-3">
            {!user ? (
              <Button variant="outline" onClick={() => router.push("/login")}>
                Sign In / Sign Up
              </Button>
            ) : (
              <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); router.refresh(); }}>
                Sign Out
              </Button>
            )}
            <Button
              className="bg-blue-600 hover:bg-blue-700 gap-2"`;

if (code.includes(headerDiv)) {
  code = code.replace(headerDiv, newHeaderDiv);
}

fs.writeFileSync(pagePath, code);
