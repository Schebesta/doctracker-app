const fs = require('fs');
const pagePath = 'src/app/page.tsx';
let code = fs.readFileSync(pagePath, 'utf8');

const oldSpan = `<span className="text-xs font-mono text-gray-600">/d/{doc.links[0].substring(0, 8)}</span>`;
const newSpan = `<button 
                                onClick={() => handleCopyLink(doc.links[0])}
                                className="text-xs font-mono text-gray-600 hover:text-blue-600 transition-colors text-left"
                                title="Copy full link"
                              >
                                /d/{doc.links[0].substring(0, 8)}
                              </button>`;

if (code.includes(oldSpan)) {
  code = code.replace(oldSpan, newSpan);
  fs.writeFileSync(pagePath, code);
}
