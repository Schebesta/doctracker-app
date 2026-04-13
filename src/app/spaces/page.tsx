'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/ui/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { mockSpaces } from '@/lib/mock-data'
import { formatRelativeTime } from '@/lib/utils'
import { Plus, LayoutGrid, FileText, ChevronRight, Folder } from 'lucide-react'

type SpaceType = typeof mockSpaces[0]

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<SpaceType[]>(mockSpaces)
  const [createOpen, setCreateOpen] = useState(false)
  const [newSpaceName, setNewSpaceName] = useState('')
  const [newSpaceDesc, setNewSpaceDesc] = useState('')
  const [newSpaceColor, setNewSpaceColor] = useState('#3B82F6')

  const handleCreate = () => {
    if (!newSpaceName.trim()) return
    const newSpace: SpaceType = {
      id: `space${Date.now()}`,
      name: newSpaceName.trim(),
      description: newSpaceDesc.trim() || 'No description',
      logo_url: null,
      brand_color: newSpaceColor,
      owner_id: 'user1',
      created_at: new Date().toISOString(),
      documentCount: 0,
    }
    setSpaces(prev => [...prev, newSpace])
    setNewSpaceName('')
    setNewSpaceDesc('')
    setNewSpaceColor('#3B82F6')
    setCreateOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Spaces</h1>
            <p className="text-sm text-gray-500 mt-1">
              Organize documents into branded workspaces
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 gap-2"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Create Space
          </Button>
        </div>

        {/* Spaces Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {spaces.map((space) => (
            <Link key={space.id} href={`/spaces/${space.id}`}>
              <Card className="p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-sm"
                    style={{ backgroundColor: space.brand_color || '#3B82F6' }}
                  >
                    {space.name.charAt(0)}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors mt-1" />
                </div>

                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {space.name}
                </h3>
                {space.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{space.description}</p>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{space.documentCount} documents</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatRelativeTime(space.created_at)}
                  </span>
                </div>
              </Card>
            </Link>
          ))}

          {/* Create Space Card */}
          <button
            onClick={() => setCreateOpen(true)}
            className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-blue-300 hover:bg-blue-50 transition-colors group min-h-[180px]"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
              <Plus className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
                Create New Space
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Organize your documents</p>
            </div>
          </button>
        </div>

        {spaces.length === 0 && (
          <div className="text-center py-20">
            <LayoutGrid className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700">No spaces yet</h3>
            <p className="text-gray-500 text-sm mt-1 mb-6">
              Create a space to organize documents for specific projects or teams
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 gap-2"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Create your first space
            </Button>
          </div>
        )}
      </main>

      {/* Create Space Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Create Space</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Space Name</Label>
              <Input
                value={newSpaceName}
                onChange={(e) => setNewSpaceName(e.target.value)}
                placeholder="e.g. Fundraising, Sales Enablement..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Input
                value={newSpaceDesc}
                onChange={(e) => setNewSpaceDesc(e.target.value)}
                placeholder="What is this space for?"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Brand Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={newSpaceColor}
                  onChange={(e) => setNewSpaceColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                />
                <div
                  className="flex-1 h-10 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: newSpaceColor }}
                >
                  {newSpaceName || 'Preview'}
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={!newSpaceName.trim()}
                onClick={handleCreate}
              >
                Create Space
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
