const fs = require('fs');
const pagePath = 'src/app/page.tsx';
let code = fs.readFileSync(pagePath, 'utf8');

const oldFetch = `const { data: docsData } = await supabase.from('documents').select('*').order('created_at', { ascending: false })`;
const newFetch = `const { data: docsData } = await supabase.from('documents').select('*').eq('owner_id', userId).order('created_at', { ascending: false })`;

if (code.includes(oldFetch)) {
  code = code.replace(oldFetch, newFetch);
  fs.writeFileSync(pagePath, code);
}
