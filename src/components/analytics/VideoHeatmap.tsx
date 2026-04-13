'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const videoData = [
  { second: 0, viewers: 89 },
  { second: 30, viewers: 87 },
  { second: 60, viewers: 82 },
  { second: 90, viewers: 78 },
  { second: 120, viewers: 71 },
  { second: 150, viewers: 65 },
  { second: 180, viewers: 58 },
  { second: 210, viewers: 52 },
  { second: 240, viewers: 72 }, // spike (rewind)
  { second: 270, viewers: 48 },
  { second: 300, viewers: 42 },
  { second: 330, viewers: 38 },
  { second: 360, viewers: 31 },
  { second: 390, viewers: 28 },
  { second: 420, viewers: 24 },
]

interface VideoHeatmapProps {
  totalViewers?: number
  videoDuration?: number
}

export function VideoHeatmap({ totalViewers = 89, videoDuration = 420 }: VideoHeatmapProps) {
  const avgRetention = Math.round(
    (videoData.reduce((sum, d) => sum + d.viewers, 0) / videoData.length / totalViewers) * 100
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Viewer Retention</h3>
          <p className="text-xs text-gray-500 mt-0.5">Number of viewers at each point in the video</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{avgRetention}%</p>
          <p className="text-xs text-gray-500">avg. retention</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          data={videoData}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="viewerGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="second"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            domain={[0, totalViewers]}
          />
          <Tooltip
            formatter={(value) => [value, 'Viewers']}
            labelFormatter={(label) => {
              const mins = Math.floor(Number(label) / 60)
              const secs = Number(label) % 60
              return `${mins}:${String(secs).padStart(2, '0')}`
            }}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <Area
            type="monotone"
            dataKey="viewers"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#viewerGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-lg font-bold text-gray-900">{totalViewers}</p>
          <p className="text-xs text-gray-500">Total plays</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-lg font-bold text-gray-900">{avgRetention}%</p>
          <p className="text-xs text-gray-500">Avg. retention</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-lg font-bold text-gray-900">4:00</p>
          <p className="text-xs text-gray-500">Most rewatched</p>
        </div>
      </div>
    </div>
  )
}
