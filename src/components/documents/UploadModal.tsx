'use client'

import { useState, useRef, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, FileText, Video, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface UploadModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (doc: any) => void
}

export function UploadModal({ open, onClose, onSuccess }: UploadModalProps) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [ctaUrl, setCtaUrl] = useState('')
  const [ctaLabel, setCtaLabel] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) {
      setFile(dropped)
      if (!name) setName(dropped.name.replace(/\.[^.]+$/, ''))
    }
  }, [name])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      if (!name) setName(selected.name.replace(/\.[^.]+$/, ''))
    }
  }

  const getFileType = (file: File): 'pdf' | 'video' => {
    if (file.type === 'application/pdf') return 'pdf'
    if (file.type.startsWith('video/')) return 'video'
    return 'pdf'
  }

  const handleSubmit = async () => {
    if (!file || !name.trim()) return
    setUploading(true)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 8)}-${Date.now()}.${fileExt}`
      const filePath = `${session.user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: docData, error: dbError } = await supabase.from('documents').insert({
        owner_id: session.user.id,
        name: name.trim(),
        type: getFileType(file),
        storage_path: filePath,
        cta_label: ctaLabel || null,
        cta_url: ctaUrl || null,
        total_views: 0,
        avg_time_spent: 0,
        links: []
      }).select().single()

      if (dbError) throw dbError

      onSuccess(docData)
      handleClose()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setName('')
    setCtaUrl('')
    setCtaLabel('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Upload Document</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Required Steps Highlight Box */}
          <div className="bg-blue-50/40 border border-blue-200 rounded-xl p-4 space-y-4 relative shadow-sm">
            <div className="absolute -top-2.5 left-4 px-2 bg-blue-100 text-xs font-bold text-blue-700 rounded-full border border-blue-200">
              Mandatory
            </div>

            {/* Drop Zone */}
            {!file ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors bg-white',
                  dragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50/50'
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Upload className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-800">
                  Drop your file here, or <span className="text-blue-600 font-bold hover:underline">browse</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Supports PDF and video files</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-blue-200 shadow-sm">
                {getFileType(file) === 'pdf' ? (
                  <FileText className="w-8 h-8 text-red-500 shrink-0" />
                ) : (
                  <Video className="w-8 h-8 text-purple-500 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Document Name */}
            <div className="space-y-1.5">
              <Label htmlFor="doc-name" className="text-blue-900 font-medium">Document Name <span className="text-red-500">*</span></Label>
              <Input
                id="doc-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Series A Pitch Deck"
                className="border-blue-200 focus-visible:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {/* CTA */}
          <div className="pt-2">
            <div className="mb-3 space-y-0.5">
              <h3 className="text-sm font-medium text-gray-900">Presentation Call to action</h3>
              <p className="text-xs text-gray-500">Put a call to action at the end of your presentation</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cta-label">CTA Button Label <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input
                  id="cta-label"
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  placeholder="Book a Meeting"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cta-url">CTA URL <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input
                  id="cta-url"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="https://calendly.com/..."
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={!file || !name.trim() || uploading}
              onClick={handleSubmit}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Document'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
