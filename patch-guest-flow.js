const fs = require('fs');

// --- 1. PATCH PAGE.TSX ---
const pagePath = 'src/app/page.tsx';
let pageCode = fs.readFileSync(pagePath, 'utf8');

// Update auth listener to handle anonymous sign in
const oldAuthEffect = `    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setLoadingSession(false)
      if (session?.user) fetchDocs(session.user.id)
    })`;

const newAuthEffect = `    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        // Automatically sign in as anonymous guest
        const { data, error } = await supabase.auth.signInAnonymously()
        if (!error && data.user) {
          setUser(data.user)
          fetchDocs(data.user.id)
        }
      } else {
        setUser(session.user)
        fetchDocs(session.user.id)
      }
      setLoadingSession(false)
    })`;

if (pageCode.includes(oldAuthEffect)) {
  pageCode = pageCode.replace(oldAuthEffect, newAuthEffect);
}

// Disable Link creation for anonymous users
const oldCreateLinkBtn = `onClick={() => setLinkDoc(doc)}`;
const newCreateLinkBtn = `onClick={() => user?.is_anonymous ? window.location.href = '/login' : setLinkDoc(doc)}`;

pageCode = pageCode.replaceAll(oldCreateLinkBtn, newCreateLinkBtn);

// Also remove explicit sign in requirement for upload since we auto-anon
const oldUploadBtn = `onClick={() => user ? setUploadOpen(true) : router.push("/login")}`;
const newUploadBtn = `onClick={() => setUploadOpen(true)}`;
pageCode = pageCode.replaceAll(oldUploadBtn, newUploadBtn);

fs.writeFileSync(pagePath, pageCode);

// --- 2. PATCH NAVBAR.TSX (Add Banner) ---
const navPath = 'src/components/ui/navbar.tsx';
let navCode = fs.readFileSync(navPath, 'utf8');

const navStart = `<nav className="border-b border-border bg-white sticky top-0 z-50">`;
const newNavStart = `<div className="w-full flex flex-col sticky top-0 z-50">
      {user?.is_anonymous && (
        <div className="bg-orange-500 px-4 py-2 text-center flex items-center justify-center gap-3">
          <span className="text-white text-sm font-medium">
            You are in Guest Mode. Sign up to save your presentations, otherwise they will be lost.
          </span>
          <Link href="/login" className="bg-white text-orange-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-orange-50 transition-colors">
            Sign Up Now
          </Link>
        </div>
      )}
      <nav className="border-b border-border bg-white">`;

if (navCode.includes(navStart)) {
  navCode = navCode.replace(navStart, newNavStart);
  navCode = navCode.replace(`</nav>\n  )`, `</nav>\n    </div>\n  )`);
}

// Update profile dropdown to show "Guest"
const oldUserName = `const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'`;
const newUserName = `const userName = user?.is_anonymous ? 'Guest User' : (user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User')`;
if (navCode.includes(oldUserName)) {
  navCode = navCode.replace(oldUserName, newUserName);
}

fs.writeFileSync(navPath, navCode);

// --- 3. PATCH LOGIN/PAGE.TSX ---
const loginPath = 'src/app/login/page.tsx';
let loginCode = fs.readFileSync(loginPath, 'utf8');

const oldHandleAuth = `    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setMessage('Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/')
        router.refresh()
      }
    } catch (error: any) {`;

const newHandleAuth = `    try {
      if (isSignUp) {
        // If they are an anonymous guest, UPGRADE their account instead of creating a new one
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.is_anonymous) {
          const { error } = await supabase.auth.updateUser({ email, password })
          if (error) throw error
          router.push('/')
          router.refresh()
          return
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setMessage('Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/')
        router.refresh()
      }
    } catch (error: any) {`;

if (loginCode.includes(oldHandleAuth)) {
  loginCode = loginCode.replace(oldHandleAuth, newHandleAuth);
  fs.writeFileSync(loginPath, loginCode);
}

