const fs = require('fs');
const pagePath = 'src/app/d/[slug]/page.tsx';
let code = fs.readFileSync(pagePath, 'utf8');

code = code.replace('allow_download: true,', 'allow_download: false,');

fs.writeFileSync(pagePath, code);
