const fs = require('fs');
const path = 'src/components/documents/UploadModal.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldCTA = `{/* CTA */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cta-label">CTA Button Label</Label>
              <Input
                id="cta-label"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="Book a Meeting"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cta-url">CTA URL</Label>
              <Input
                id="cta-url"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://calendly.com/..."
              />
            </div>
          </div>`;

const newCTA = `{/* CTA */}
          <div className="pt-2">
            <div className="mb-3 space-y-0.5">
              <h3 className="text-sm font-medium text-gray-900">Presentation Call to action</h3>
              <p className="text-xs text-gray-500">Put a call to action at the end of your presentation</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cta-label">CTA Button Label <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input
                  id="cta-label"
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  placeholder="Book a Meeting"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cta-url">CTA URL <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input
                  id="cta-url"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="https://calendly.com/..."
                />
              </div>
            </div>
          </div>`;

if (code.includes(oldCTA)) {
  code = code.replace(oldCTA, newCTA);
  fs.writeFileSync(path, code);
}
