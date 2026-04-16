const fs = require('fs');
const path = 'src/components/analytics/AnalyticsModal.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace imports and add state
code = code.replace(
  "import { mockPageAnalytics, mockVisitors } from '@/lib/mock-data'",
  "import { supabase } from '@/lib/supabase'\nimport { useState, useEffect } from 'react'\nimport { Loader2 } from 'lucide-react'"
);

// Add documentId to interface
code = code.replace(
  "avgTimeSpent: number\n}",
  "avgTimeSpent: number\n  documentId: string\n}"
);

// Update component signature
code = code.replace(
  "export function AnalyticsModal({ open, onClose, documentName, totalViews, avgTimeSpent }: AnalyticsModalProps) {",
  "export function AnalyticsModal({ open, onClose, documentName, totalViews: initialViews, avgTimeSpent: initialAvg, documentId }: AnalyticsModalProps) {"
);

// Add data fetching
const oldCompletion = `  const completionRate = Math.round(
    (mockVisitors.filter(v => v.pagesViewed >= 7).length / mockVisitors.length) * 100
  )

  const totalTime = mockVisitors.reduce((sum, v) => sum + v.timeSpent, 0)`;

const newFetch = `  const [loading, setLoading] = useState(true)
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
  }, [open, documentId])`;

code = code.replace(oldCompletion, newFetch);

// Update map variables
code = code.replace(/mockVisitors/g, 'visitors');
code = code.replace(/mockPageAnalytics/g, 'pageStats');
code = code.replace('totalViews', 'stats.views');
code = code.replace('avgTimeSpent', 'stats.avg');
code = code.replace('`${completionRate}%`', '`${stats.completion}%`');
code = code.replace('{visitor.company}', '""'); // removed company field since we don't capture it easily

const dialogContentStart = `<DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">`;
const dialogContentWithLoading = `<DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>`;
code = code.replace(dialogContentStart, dialogContentWithLoading);

const dialogContentEnd = `</Tabs>\n      </DialogContent>`;
const dialogContentEndWithLoading = `</Tabs>\n        </>\n        )}\n      </DialogContent>`;
code = code.replace(dialogContentEnd, dialogContentEndWithLoading);

fs.writeFileSync(path, code);
