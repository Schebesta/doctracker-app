'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Users, Clock, Eye, TrendingUp, Mail, Building2 } from 'lucide-react'
import { mockPageAnalytics, mockVisitors } from '@/lib/mock-data'
import { formatDuration, formatRelativeTime } from '@/lib/utils'

interface AnalyticsModalProps {
  open: boolean
  onClose: () => void
  documentName: string
  totalViews: number
  avgTimeSpent: number
}

export function AnalyticsModal({ open, onClose, documentName, totalViews, avgTimeSpent }: AnalyticsModalProps) {
  const completionRate = Math.round(
    (mockVisitors.filter(v => v.pagesViewed >= 7).length / mockVisitors.length) * 100
  )

  const totalTime = mockVisitors.reduce((sum, v) => sum + v.timeSpent, 0)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Document Analytics</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">{documentName}</p>
        </DialogHeader>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-2">
          {[
            { label: 'Total Views', value: totalViews, icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Unique Visitors', value: mockVisitors.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Avg. Time Spent', value: formatDuration(avgTimeSpent), icon: Clock, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Completion Rate', value: `${completionRate}%`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
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
            {mockVisitors.map((visitor) => (
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
                      {visitor.company}
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
                data={mockPageAnalytics}
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
                  {mockPageAnalytics.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.timeSpent === Math.max(...mockPageAnalytics.map(d => d.timeSpent))
                        ? '#3b82f6'
                        : '#bfdbfe'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 text-center mt-2">
              Page 5 had the highest engagement at {mockPageAnalytics[4].timeSpent}s avg.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
