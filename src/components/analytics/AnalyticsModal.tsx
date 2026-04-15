'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Users, Clock, Eye, TrendingUp, Mail, Building2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { formatDuration, formatRelativeTime } from '@/lib/utils'

interface AnalyticsModalProps {
  open: boolean
  onClose: () => void
  documentName: string
  totalViews: number
  avgTimeSpent: number
  documentId: string
}

export function AnalyticsModal({ open, onClose, documentName, totalViews: initialViews, avgTimeSpent: initialAvg, documentId }: AnalyticsModalProps) {
  const [loading, setLoading] = useState(true)
  const [visitors, setVisitors] = useState<any[]>([])
  const [pageStats, setPageStats] = useState<any[]>([])
  const [stats, setStats] = useState({ views: initialViews, avg: initialAvg, completion: 0 })

  useEffect(() => {
    if (!open || !documentId) return
    let isMounted = true
    const fetchStats = async () => {
      // Get all link slugs for this document
      const { data: links } = await supabase.from('links').select('slug').eq('document_id', documentId)
      const slugs = links?.map(l => l.slug) || []
      
      if (slugs.length === 0) {
        if (isMounted) setLoading(false)
        return
      }

      // Fetch telemetry
      const { data: telemetry } = await supabase.from('telemetry').select('*').in('link_slug', slugs)
      
      if (!telemetry || telemetry.length === 0) {
        if (isMounted) setLoading(false)
        return
      }

      // Process visitors
      const visitorsMap = new Map()
      const pagesMap = new Map()

      let totalViewsCount = 0
      
      telemetry.forEach(t => {
        if (t.event_type === 'open') totalViewsCount++
        
        // Group by email
        if (!visitorsMap.has(t.viewer_email)) {
          visitorsMap.set(t.viewer_email, {
            email: t.viewer_email,
            name: t.viewer_name,
            timeSpent: 0,
            pagesViewed: new Set(),
            viewedAt: t.created_at
          })
        }
        
        const v = visitorsMap.get(t.viewer_email)
        if (t.event_type === 'page_view') {
          v.pagesViewed.add(t.page_number)
          if (t.duration_seconds > 0) v.timeSpent += t.duration_seconds
          
          // Page stats
          if (!pagesMap.has(t.page_number)) {
            pagesMap.set(t.page_number, { page: t.page_number, timeSpent: 0, count: 0 })
          }
          const p = pagesMap.get(t.page_number)
          if (t.duration_seconds > 0) {
             p.timeSpent += t.duration_seconds
             p.count += 1
          }
        }
      })

      const visitorsArray = Array.from(visitorsMap.values()).map(v => ({
        ...v,
        pagesViewed: v.pagesViewed.size,
      })).sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())

      const pageStatsArray = Array.from(pagesMap.values()).map(p => ({
        page: p.page,
        timeSpent: p.count > 0 ? Math.round(p.timeSpent / p.count) : 0
      })).sort((a, b) => a.page - b.page)

      let completionRate = 0
      if (visitorsArray.length > 0 && pageStatsArray.length > 0) {
        const maxPages = Math.max(...pageStatsArray.map(p => p.page), 1)
        completionRate = Math.round(
          (visitorsArray.filter(v => v.pagesViewed >= maxPages * 0.8).length / visitorsArray.length) * 100
        )
      }
      
      let totalTime = visitorsArray.reduce((sum, v) => sum + v.timeSpent, 0)
      let avg = visitorsArray.length > 0 ? Math.round(totalTime / visitorsArray.length) : 0

      if (isMounted) {
        setVisitors(visitorsArray)
        setPageStats(pageStatsArray)
        setStats({ views: totalViewsCount, avg, completion: completionRate })
        setLoading(false)
      }
    }
    
    fetchStats()
    return () => { isMounted = false }
  }, [open, documentId])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Document Analytics</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">{documentName}</p>
        </DialogHeader>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-2">
          {[
            { label: 'Total Views', value: stats.views, icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Unique Visitors', value: visitors.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Avg. Time Spent', value: formatDuration(stats.avg), icon: Clock, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Completion Rate', value: `${stats.completion}%`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="visitors" className="mt-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="visitors">Visitors</TabsTrigger>
            <TabsTrigger value="pages">Page Analytics</TabsTrigger>
          </TabsList>

          {/* Visitors Tab */}
          <TabsContent value="visitors" className="mt-4 space-y-3">
            {visitors.map((visitor) => (
              <div
                key={visitor.email}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  {visitor.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{visitor.name}</p>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                      {visitor.pagesViewed === 8 ? '100%' : `${Math.round(visitor.pagesViewed / 8 * 100)}%`}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Mail className="w-3 h-3" />
                      {visitor.email}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Building2 className="w-3 h-3" />
                      ""
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-gray-700">{formatDuration(visitor.timeSpent)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(visitor.viewedAt)}</p>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Page Analytics Tab */}
          <TabsContent value="pages" className="mt-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Time Spent Per Page</h3>
              <p className="text-xs text-gray-500">Average seconds viewers spent on each page</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={pageStats}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}s`}
                />
                <YAxis
                  type="category"
                  dataKey="page"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `Page ${v}`}
                  width={50}
                />
                <Tooltip
                  formatter={(value) => [`${value}s`, 'Time Spent']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="timeSpent" radius={[0, 4, 4, 0]} maxBarSize={24}>
                  {pageStats.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.timeSpent === Math.max(...pageStats.map(d => d.timeSpent))
                        ? '#3b82f6'
                        : '#bfdbfe'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 text-center mt-2">
              Page 5 had the highest engagement at {pageStats[4].timeSpent}s avg.
            </p>
          </TabsContent>
        </Tabs>
        </>
        )}
      </DialogContent>
    </Dialog>
  )
}
