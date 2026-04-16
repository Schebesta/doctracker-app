const fs = require('fs');
const path = 'src/app/d/[slug]/viewer-client.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
`      </div>

      <SignatureModal`,
`      </div></div>

      <SignatureModal`
);
fs.writeFileSync(path, code);
