const fs = require('fs');
const pagePath = 'src/app/d/[slug]/page.tsx';
let code = fs.readFileSync(pagePath, 'utf8');

// Add redirect import
if (!code.includes("import { redirect }")) {
  code = code.replace(
    "import { createClient }",
    "import { createClient }\nimport { redirect } from 'next/navigation'"
  );
}

const oldLogic = `  // Check expiration
  if (linkData.set_expiration && linkData.expires_at) {
    if (new Date() > new Date(linkData.expires_at)) {
      return <div className="min-h-screen flex items-center justify-center text-gray-500">This link has expired</div>
    }
  }`;

const newLogic = `  // Check expiration and fallback to newest link
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
      redirect(\`/d/\${newestValid.slug}\`)
    } else {
      return <div className="min-h-screen flex items-center justify-center text-gray-500">This link has expired and no updated link is available.</div>
    }
  }`;

if (code.includes(oldLogic)) {
  code = code.replace(oldLogic, newLogic);
  fs.writeFileSync(pagePath, code);
}
