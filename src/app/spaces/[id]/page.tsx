'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/ui/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockSpaces, mockDocuments } from '@/lib/mock-data'
import { formatRelativeTime, formatDuration } from '@/lib/utils'
import {
  ArrowLeft,
  FileText,
  Video,
  Eye,
  Clock,
  Pencil,
  Upload,
  Folder,
  FolderOpen,
} from 'lucide-react'

export default function SpaceDetailPage() {
  const params = useParams()
  const spaceId = params.id as string
  const space = mockSpaces.find(s => s.id === spaceId) || mockSpaces[0]

  // Mock: show all documents in this space
  const spaceDocuments = mockDocuments

  const folders = ['Pitch Decks', 'Financials', 'Legal', 'Team']

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          href="/spaces"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Spaces
        </Link>

        {/* Space Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md"
              style={{ backgroundColor: space.brand_color || '#3B82F6' }}
            >
              {space.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{space.name}</h1>
              {space.description && (
                <p className="text-sm text-gray-500 mt-1">{space.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-gray-400">
                  {spaceDocuments.length} documents
                </span>
                <span className="text-xs text-gray-300">•</span>
                <span className="text-xs text-gray-400">
                  Created {formatRelativeTime(space.created_at)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Pencil className="w-3.5 h-3.5" />
              Edit Space
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2" size="sm">
              <Upload className="w-3.5 h-3.5" />
              Add Document
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-52 shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 mb-2">
                Folders
              </p>
              <div className="space-y-0.5">
                <button className="w-full flex items-center gap-2 px-2 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium">
                  <FolderOpen className="w-4 h-4" />
                  All Documents
                </button>
                {folders.map((folder) => (
                  <button
                    key={folder}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm transition-colors"
                  >
                    <Folder className="w-4 h-4 text-gray-400" />
                    {folder}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Document Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {spaceDocuments.map((doc) => (
                <Card
                  key={doc.id}
                  className="p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${doc.type === 'pdf' ? 'bg-red-50' : 'bg-purple-50'}`}>
                      {doc.type === 'pdf' ? (
                        <FileText className="w-5 h-5 text-red-500" />
                      ) : (
                        <Video className="w-5 h-5 text-purple-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {doc.name}
                      </p>
                      <Badge
                        variant="secondary"
                        className={`text-xs mt-1 ${doc.type === 'pdf' ? 'bg-red-50 text-red-600' : 'bg-purple-50 text-purple-600'}`}
                      >
                        {doc.type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {doc.totalViews} views
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(doc.avgTimeSpent)}
                    </div>
                    <span>{formatRelativeTime(doc.created_at)}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
