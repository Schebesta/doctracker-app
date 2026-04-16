const fs = require('fs');
const pagePath = 'src/app/page.tsx';
let code = fs.readFileSync(pagePath, 'utf8');

// 1. We need a way to copy the link from the dashboard
const importsStr = `import {
  Upload,
  FileText,
  Video,
  Eye,
  BarChart2,
  Link2,
  RefreshCw,
  TrendingUp,
  Clock,
  Files,
  Activity,
  MoreHorizontal,
} from 'lucide-react'`;
const newImportsStr = `import {
  Upload,
  FileText,
  Video,
  Eye,
  BarChart2,
  Link2,
  RefreshCw,
  TrendingUp,
  Clock,
  Files,
  Activity,
  MoreHorizontal,
  Copy,
  Check,
  Edit2
} from 'lucide-react'`;

if (code.includes(importsStr)) {
  code = code.replace(importsStr, newImportsStr);
}

// Add state for copying in the dashboard
const dashboardStart = `export default function DashboardPage() {`;
const newDashboardStart = `export default function DashboardPage() {
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  
  const handleCopyLink = async (slug: string) => {
    const url = \`\${window.location.origin}/d/\${slug}\`
    await navigator.clipboard.writeText(url)
    setCopiedLink(slug)
    setTimeout(() => setCopiedLink(null), 2000)
  }`;

if (code.includes(dashboardStart) && !code.includes('handleCopyLink')) {
  code = code.replace(dashboardStart, newDashboardStart);
}

// 2. Modify the "Links" column
const linksColumnOld = `<td className="px-4 py-4">
                      <span className="text-sm text-gray-700">
                        {doc.links.length} {doc.links.length === 1 ? 'link' : 'links'}
                      </span>
                    </td>`;

const linksColumnNew = `<td className="px-4 py-4">
                      {doc.links.length > 0 ? (
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md py-1.5 px-2 w-max">
                          <span className="text-xs font-mono text-gray-600">/d/{doc.links[0].substring(0, 8)}</span>
                          <div className="flex items-center gap-1 border-l pl-2">
                            <button
                              onClick={() => handleCopyLink(doc.links[0])}
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                              title="Copy Link"
                            >
                              {copiedLink === doc.links[0] ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => setLinkDoc(doc)}
                              className="text-gray-400 hover:text-orange-600 transition-colors"
                              title="Edit Link Settings"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 italic">No links</span>
                      )}
                    </td>`;

if (code.includes(linksColumnOld)) {
  code = code.replace(linksColumnOld, linksColumnNew);
}

// Modify CreateLinkModal call to handle newly created links
const oldLinkModal = `<CreateLinkModal
          open={!!linkDoc}
          onClose={() => setLinkDoc(null)}
          documentName={linkDoc.name}
          documentId={linkDoc.id}
        />`;

const newLinkModal = `<CreateLinkModal
          open={!!linkDoc}
          onClose={() => setLinkDoc(null)}
          documentName={linkDoc.name}
          documentId={linkDoc.id}
          onSuccess={(slug) => {
            setDocuments(prev => prev.map(d => 
              d.id === linkDoc.id ? { ...d, links: [slug, ...d.links] } : d
            ))
          }}
        />`;

if (code.includes(oldLinkModal)) {
  code = code.replace(oldLinkModal, newLinkModal);
}

fs.writeFileSync(pagePath, code);
