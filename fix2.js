const fs = require('fs');
const path = 'src/app/d/[slug]/viewer-client.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
`      <SignatureModal
        open={signatureOpen}
        onClose={() => setSignatureOpen(false)}
        viewerName={viewerName}
        viewerEmail={viewerEmail}
        onSign={(sig, name, email) => {
          postTelemetry('signature')
          console.log('Signed:', { sig: sig.substring(0, 50), name, email })
        }}
      />
    </div>
  )
}`,
`      <SignatureModal
        open={signatureOpen}
        onClose={() => setSignatureOpen(false)}
        viewerName={viewerName}
        viewerEmail={viewerEmail}
        onSign={(sig, name, email) => {
          postTelemetry('signature')
          console.log('Signed:', { sig: sig.substring(0, 50), name, email })
        }}
      />
    </div>
  )
}`
); // wait, let me just look at the raw tail.
