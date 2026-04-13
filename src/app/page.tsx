'use client'

import { useState } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UploadModal } from '@/components/documents/UploadModal'
import { CreateLinkModal } from '@/components/documents/CreateLinkModal'
import { AnalyticsModal } from '@/components/analytics/AnalyticsModal'
import { mockDocuments } from '@/lib/mock-data'
import { formatDuration, formatRelativeTime } from '@/lib/utils'
import {
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
} from 'lucide-react'

type DocumentType = typeof mockDocuments[0]

export default function DashboardPage() {
  const [documents, setDocuments] = useState<DocumentType[]>(mockDocuments)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [analyticsDoc, setAnalyticsDoc] = useState<DocumentType | null>(null)
  const [linkDoc, setLinkDoc] = useState<DocumentType | null>(null)

  const totalViews = documents.reduce((sum, d) => sum + d.totalViews, 0)
  const totalLinks = documents.reduce((sum, d) => sum + d.links.length, 0)
  const avgTime = Math.round(documents.reduce((sum, d) => sum + d.avgTimeSpent, 0) / documents.length)
  const activeLinks = totalLinks

  const stats = [
    {
      label: 'Total Documents',
      value: documents.length,
      icon: Files,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      change: '+2 this week',
    },
    {
      label: 'Total Views',
      value: totalViews,
      icon: Eye,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      change: '+18 today',
    },
    {
      label: 'Active Links',
      value: activeLinks,
      icon: Activity,
      color: 'text-green-600',
      bg: 'bg-green-50',
      change: `${totalLinks} created`,
    },
    {
      label: 'Avg. Time Spent',
      value: formatDuration(avgTime),
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      change: '+12s vs last week',
    },
  ]

  const handleUploadSuccess = (doc: { id: string; name: string; type: 'pdf' | 'video' }) => {
    const newDoc: DocumentType = {
      ...doc,
      storage_path: '',
      owner_id: 'user1',
      space_id: null,
      cta_url: null,
      cta_label: null,
      created_at: new Date().toISOString(),
      totalViews: 0,
      avgTimeSpent: 0,
      links: [],
    }
    setDocuments(prev => [newDoc, ...prev])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and track your shared documents
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 gap-2"
            onClick={() => setUploadOpen(true)}
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color, bg, change }) => (
            <Card key={label} className="p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-3">{value}</p>
              <p className="text-sm text-gray-600 mt-0.5">{label}</p>
              <p className="text-xs text-green-600 font-medium mt-1">{change}</p>
            </Card>
          ))}
        </div>

        {/* Documents Table */}
        <Card className="border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Recent Documents</h2>
            <span className="text-sm text-gray-500">{documents.length} documents</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">
                    Name
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                    Type
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                    Views
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                    Avg. Time
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                    Links
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
                    Created
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${doc.type === 'pdf' ? 'bg-red-50' : 'bg-purple-50'}`}>
                          {doc.type === 'pdf' ? (
                            <FileText className="w-4 h-4 text-red-500" />
                          ) : (
                            <Video className="w-4 h-4 text-purple-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {doc.name}
                          </p>
                          {doc.cta_label && (
                            <p className="text-xs text-gray-400 mt-0.5">{doc.cta_label}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${doc.type === 'pdf' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}
                      >
                        {doc.type.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{doc.totalViews}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {doc.avgTimeSpent > 0 ? formatDuration(doc.avgTimeSpent) : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-700">
                        {doc.links.length} {doc.links.length === 1 ? 'link' : 'links'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-500">
                        {formatRelativeTime(doc.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-xs gap-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => setAnalyticsDoc(doc)}
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                          Analytics
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-xs gap-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50"
                          onClick={() => setLinkDoc(doc)}
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          Link
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-xs gap-1.5 text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Update
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-gray-600"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {documents.length === 0 && (
              <div className="text-center py-16">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No documents yet</p>
                <p className="text-gray-400 text-sm mt-1">Upload your first document to get started</p>
                <Button
                  className="mt-4 bg-blue-600 hover:bg-blue-700 gap-2"
                  onClick={() => setUploadOpen(true)}
                >
                  <Upload className="w-4 h-4" />
                  Upload Document
                </Button>
              </div>
            )}
          </div>
        </Card>
      </main>

      {/* Modals */}
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {analyticsDoc && (
        <AnalyticsModal
          open={!!analyticsDoc}
          onClose={() => setAnalyticsDoc(null)}
          documentName={analyticsDoc.name}
          totalViews={analyticsDoc.totalViews}
          avgTimeSpent={analyticsDoc.avgTimeSpent}
        />
      )}

      {linkDoc && (
        <CreateLinkModal
          open={!!linkDoc}
          onClose={() => setLinkDoc(null)}
          documentName={linkDoc.name}
          documentId={linkDoc.id}
        />
      )}
    </div>
  )
}
