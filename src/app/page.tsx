'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
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
  Download,
  MoreHorizontal,
  Copy,
  Check,
  Edit2
} from 'lucide-react'

type DocumentType = typeof mockDocuments[0]

export default function DashboardPage() {
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  
  const handleCopyLink = async (slug: string) => {
    const url = `${window.location.origin}/d/${slug}`
    await navigator.clipboard.writeText(url)
    setCopiedLink(slug)
    setTimeout(() => setCopiedLink(null), 2000)
  }
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loadingSession, setLoadingSession] = useState(true)

  useEffect(() => {
    const fetchDocs = async (userId: string) => {
      // 1. Fetch Docs
      const { data: docsData } = await supabase.from('documents').select('*').eq('owner_id', userId).order('created_at', { ascending: false })
      if (!docsData) return

      // 2. Fetch Links
      const docIds = docsData.map((d: any) => d.id)
      const { data: linksData } = await supabase.from('links').select('slug, document_id').in('document_id', docIds)
      const slugs = linksData?.map((l: any) => l.slug) || []
      
      // 3. Fetch Telemetry
      const { data: telemetryData } = slugs.length > 0 ? 
        await supabase.from('telemetry').select('*').in('link_slug', slugs) : { data: [] }

      // Map telemetry to documents
      const docStats: Record<string, { views: number, timeSum: number, viewEvents: number, pagesSet: Set<string> }> = {}
      docsData.forEach((d: any) => docStats[d.id] = { views: 0, timeSum: 0, viewEvents: 0, pagesSet: new Set() })

      let recentViews = 0
      let totalTimeSum = 0
      let totalTimeEvents = 0
      let oldTimeSum = 0
      let oldTimeEvents = 0

      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      telemetryData?.forEach((t: any) => {
        const link = linksData?.find((l: any) => l.slug === t.link_slug)
        if (!link) return
        const docId = link.document_id
        
        const tDate = new Date(t.created_at)

        if (t.event_type === 'open') {
          docStats[docId].views += 1
          if (tDate > oneDayAgo) recentViews += 1
        } else if (t.event_type === 'page_view' && t.duration_seconds) {
          docStats[docId].timeSum += t.duration_seconds
          docStats[docId].viewEvents += 1
          if (t.page_number) docStats[docId].pagesSet.add(`${t.viewer_email}-${t.page_number}`)
          
          if (tDate > oneWeekAgo) {
            totalTimeSum += t.duration_seconds
            totalTimeEvents += 1
          } else {
            oldTimeSum += t.duration_seconds
            oldTimeEvents += 1
          }
        }
      })

      let recentDocs = 0
      docsData.forEach((d: any) => {
        if (new Date(d.created_at) > oneWeekAgo) recentDocs += 1
      })

      const currentAvg = totalTimeEvents > 0 ? Math.round(totalTimeSum / totalTimeEvents) : 0
      const oldAvg = oldTimeEvents > 0 ? Math.round(oldTimeSum / oldTimeEvents) : 0
      const diff = currentAvg - oldAvg
      const timeChangeStr = diff >= 0 ? `+${diff}s vs last week` : `${diff}s vs last week`

      setDashboardStats({
        docChange: `+${recentDocs} this week`,
        viewsChange: `+${recentViews} today`,
        timeChange: timeChangeStr
      })

      setDocuments(docsData.map((d: any) => {
        const stats = docStats[d.id]
        return {
          ...d,
          totalViews: stats.views,
          avgTimeSpent: stats.viewEvents > 0 ? Math.round(stats.timeSum / stats.viewEvents) : 0,
          pagesViewed: stats.pagesSet.size,
          links: d.links || []
        }
      }))
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        // Automatically sign in as anonymous guest
        const { data, error } = await supabase.auth.signInAnonymously()
        if (!error && data.user) {
          setUser(data.user)
          fetchDocs(data.user.id)
        }
      } else {
        setUser(session.user)
        fetchDocs(session.user.id)
      }
      setLoadingSession(false)
    })
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      if (session?.user) fetchDocs(session.user.id)
      else setDocuments([])
    })
    
    return () => authListener.subscription.unsubscribe()
  }, [])

  // removed blocking loading state

  const [documents, setDocuments] = useState<any[]>([])
  const [dashboardStats, setDashboardStats] = useState({
    docChange: '',
    viewsChange: '',
    timeChange: ''
  })
  const [uploadOpen, setUploadOpen] = useState(false)
  const [analyticsDoc, setAnalyticsDoc] = useState<DocumentType | null>(null)
  const [linkDoc, setLinkDoc] = useState<DocumentType | null>(null)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

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
      change: dashboardStats.docChange,
    },
    {
      label: 'Total Views',
      value: totalViews,
      icon: Eye,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      change: dashboardStats.viewsChange,
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
      value: formatDuration(avgTime || 0),
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      change: dashboardStats.timeChange,
    },
  ]

  const handleUploadSuccess = (doc: any) => {
    const newDoc = {
      ...doc,
      totalViews: doc.total_views || 0,
      avgTimeSpent: doc.avg_time_spent || 0,
      links: doc.links || []
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
                    Pages Viewed
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
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {doc.pagesViewed || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2 items-start">
                        {doc.links.length > 0 ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs gap-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 w-max -ml-2"
                              onClick={() => setLinkDoc(doc)}
                            >
                              <Link2 className="w-3 h-3" />
                              Create Link
                            </Button>
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md py-1.5 px-2 w-max">
                              <button 
                                onClick={() => handleCopyLink(doc.links[0])}
                                className="text-xs font-mono text-gray-600 hover:text-blue-600 transition-colors text-left"
                                title="Copy full link"
                              >
                                /d/{doc.links[0].substring(0, 8)}
                              </button>
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
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 text-xs gap-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 w-max"
                            onClick={() => setLinkDoc(doc)}
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            Create Link
                          </Button>
                        )}
                      </div>
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
                        

                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-gray-600"
                            onClick={() => setOpenDropdownId(openDropdownId === doc.id ? null : doc.id)}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                          {openDropdownId === doc.id && (
                            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-100 z-50 py-1">
                              <button
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                onClick={() => {
                                  setOpenDropdownId(null)
                                }}
                              >
                                <Download className="w-4 h-4 text-gray-500" />
                                Download
                              </button>
                            </div>
                          )}
                        </div>
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
          documentId={analyticsDoc.id}
        />
      )}

      {linkDoc && (
        <CreateLinkModal
          open={!!linkDoc}
          onClose={() => setLinkDoc(null)}
          documentName={linkDoc.name}
          documentId={linkDoc.id}
          onSuccess={async (slug) => {
            const currentLinks = linkDoc.links || []
            const newLinks = [slug, ...currentLinks]
            setDocuments(prev => prev.map(d => 
              d.id === linkDoc.id ? { ...d, links: newLinks } : d
            ))
            await supabase.from('documents').update({ links: newLinks }).eq('id', linkDoc.id)
          }}
        />
      )}
    </div>
  )
}
