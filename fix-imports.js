const fs = require('fs');
const pagePath = 'src/app/d/[slug]/page.tsx';
let code = fs.readFileSync(pagePath, 'utf8');
code = code.replace("import { createClient }\nimport { redirect } from 'next/navigation' from '@supabase/supabase-js'", "import { createClient } from '@supabase/supabase-js'\nimport { redirect } from 'next/navigation'");
fs.writeFileSync(pagePath, code);
