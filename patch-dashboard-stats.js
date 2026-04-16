const fs = require('fs');
const pagePath = 'src/app/page.tsx';
let code = fs.readFileSync(pagePath, 'utf8');

// 1. We need to add state for dashboard stats
const stateStart = `  const [documents, setDocuments] = useState<any[]>([])`;
const newState = `  const [documents, setDocuments] = useState<any[]>([])
  const [dashboardStats, setDashboardStats] = useState({
    docChange: '',
    viewsChange: '',
    timeChange: ''
  })`;

if (code.includes(stateStart) && !code.includes('dashboardStats')) {
  code = code.replace(stateStart, newState);
}

// 2. Rewrite fetchDocs to aggregate real data
const oldFetch = `    const fetchDocs = async (userId: string) => {
      const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false })
      if (data) {
        setDocuments(data.map(d => ({
          ...d,
          totalViews: d.total_views || 0,
          avgTimeSpent: d.avg_time_spent || 0,
          links: d.links || []
        })))
      }
    }`;

const newFetch = `    const fetchDocs = async (userId: string) => {
      // 1. Fetch Docs
      const { data: docsData } = await supabase.from('documents').select('*').order('created_at', { ascending: false })
      if (!docsData) return

      // 2. Fetch Links
      const docIds = docsData.map((d: any) => d.id)
      const { data: linksData } = await supabase.from('links').select('slug, document_id').in('document_id', docIds)
      const slugs = linksData?.map((l: any) => l.slug) || []
      
      // 3. Fetch Telemetry
      const { data: telemetryData } = slugs.length > 0 ? 
        await supabase.from('telemetry').select('*').in('link_slug', slugs) : { data: [] }

      // Map telemetry to documents
      const docStats: Record<string, { views: number, timeSum: number, viewEvents: number }> = {}
      docsData.forEach((d: any) => docStats[d.id] = { views: 0, timeSum: 0, viewEvents: 0 })

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
      const timeChangeStr = diff >= 0 ? \`+\${diff}s vs last week\` : \`\${diff}s vs last week\`

      setDashboardStats({
        docChange: \`+\${recentDocs} this week\`,
        viewsChange: \`+\${recentViews} today\`,
        timeChange: timeChangeStr
      })

      setDocuments(docsData.map((d: any) => {
        const stats = docStats[d.id]
        return {
          ...d,
          totalViews: stats.views,
          avgTimeSpent: stats.viewEvents > 0 ? Math.round(stats.timeSum / stats.viewEvents) : 0,
          links: d.links || []
        }
      }))
    }`;

if (code.includes(oldFetch)) {
  code = code.replace(oldFetch, newFetch);
}

// 3. Update the stats array to use dynamic changes
const oldStats = `  const stats = [
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
      change: \`\${totalLinks} created\`,
    },
    {
      label: 'Avg. Time Spent',
      value: formatDuration(avgTime || 0),
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      change: '+12s vs last week',
    },
  ]`;

const newStats = `  const stats = [
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
      change: \`\${totalLinks} created\`,
    },
    {
      label: 'Avg. Time Spent',
      value: formatDuration(avgTime || 0),
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      change: dashboardStats.timeChange,
    },
  ]`;

if (code.includes(oldStats)) {
  code = code.replace(oldStats, newStats);
} else {
  // Try regex if spacing varies
  code = code.replace(/const stats = \[[\s\S]*?change: '\+12s vs last week',\s*},\s*\]/, newStats);
}

fs.writeFileSync(pagePath, code);
