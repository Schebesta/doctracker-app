const fs = require('fs');
const pagePath = 'src/app/page.tsx';
let code = fs.readFileSync(pagePath, 'utf8');

if (!code.includes('documentId={analyticsDoc.id}')) {
  code = code.replace(
    'avgTimeSpent={analyticsDoc.avgTimeSpent}',
    'avgTimeSpent={analyticsDoc.avgTimeSpent}\n          documentId={analyticsDoc.id}'
  );
  fs.writeFileSync(pagePath, code);
}
