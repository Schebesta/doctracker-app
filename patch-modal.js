const fs = require('fs');
const path = 'src/components/documents/CreateLinkModal.tsx';
let code = fs.readFileSync(path, 'utf8');

const interfaceOld = `interface CreateLinkModalProps {
  open: boolean
  onClose: () => void
  documentName: string
  documentId: string
}`;

const interfaceNew = `interface CreateLinkModalProps {
  open: boolean
  onClose: () => void
  documentName: string
  documentId: string
  onSuccess?: (slug: string) => void
}`;

if (code.includes(interfaceOld)) {
  code = code.replace(interfaceOld, interfaceNew);
}

const componentOld = `export function CreateLinkModal({ open, onClose, documentName, documentId }: CreateLinkModalProps) {`;
const componentNew = `export function CreateLinkModal({ open, onClose, documentName, documentId, onSuccess }: CreateLinkModalProps) {`;

if (code.includes(componentOld)) {
  code = code.replace(componentOld, componentNew);
}

const handleCreateOld = `  const handleCreate = async () => {
    setCreating(true)
    await new Promise(r => setTimeout(r, 600))
    const slug = generateSlug()
    const url = \`\${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/d/\${slug}\`
    setCreatedLink(url)
    setCreating(false)
  }`;

const handleCreateNew = `  const handleCreate = async () => {
    setCreating(true)
    await new Promise(r => setTimeout(r, 600))
    const slug = generateSlug()
    const url = \`\${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/d/\${slug}\`
    setCreatedLink(url)
    if (onSuccess) onSuccess(slug)
    setCreating(false)
  }`;

if (code.includes(handleCreateOld)) {
  code = code.replace(handleCreateOld, handleCreateNew);
}

fs.writeFileSync(path, code);
