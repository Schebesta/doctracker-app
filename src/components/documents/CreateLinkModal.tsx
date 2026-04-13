'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Link2, Copy, Check, ExternalLink } from 'lucide-react'
import { generateSlug } from '@/lib/utils'

interface CreateLinkModalProps {
  open: boolean
  onClose: () => void
  documentName: string
  documentId: string
}

export function CreateLinkModal({ open, onClose, documentName, documentId }: CreateLinkModalProps) {
  const [requireEmail, setRequireEmail] = useState(true)
  const [passwordProtect, setPasswordProtect] = useState(false)
  const [password, setPassword] = useState('')
  const [setExpiration, setSetExpiration] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')
  const [allowDownload, setAllowDownload] = useState(false)
  const [notifyOnView, setNotifyOnView] = useState(true)
  const [notifyEmail, setNotifyEmail] = useState('')
  const [ndaEnabled, setNdaEnabled] = useState(false)
  const [ndaText, setNdaText] = useState('This document contains confidential and proprietary information. By accessing this document, you agree to maintain its confidentiality and not to disclose any information contained herein to any third party without prior written consent.')
  const [watermarkEnabled, setWatermarkEnabled] = useState(true)
  const [createdLink, setCreatedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    setCreating(true)
    await new Promise(r => setTimeout(r, 600))
    const slug = generateSlug()
    const url = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/d/${slug}`
    setCreatedLink(url)
    setCreating(false)
  }

  const handleCopy = async () => {
    if (!createdLink) return
    await navigator.clipboard.writeText(createdLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setCreatedLink(null)
    setCopied(false)
    setCreating(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create Sharing Link</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">{documentName}</p>
        </DialogHeader>

        {createdLink ? (
          <div className="space-y-5 mt-2">
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Link2 className="w-4 h-4 text-green-600 shrink-0" />
              <span className="text-sm text-green-800 font-medium">Link created successfully!</span>
            </div>

            <div className="space-y-1.5">
              <Label>Shareable Link</Label>
              <div className="flex gap-2">
                <Input value={createdLink} readOnly className="font-mono text-xs" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(createdLink, '_blank')}
                  className="shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-5 mt-2">
            {/* Require Email */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Require Email / Identity</Label>
                <p className="text-xs text-gray-500">Viewers must verify with Google, LinkedIn, or email</p>
              </div>
              <Switch checked={requireEmail} onCheckedChange={setRequireEmail} />
            </div>

            {/* Password Protect */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Password Protect</Label>
                  <p className="text-xs text-gray-500">Require a passcode to access</p>
                </div>
                <Switch checked={passwordProtect} onCheckedChange={setPasswordProtect} />
              </div>
              {passwordProtect && (
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter passcode..."
                  type="text"
                />
              )}
            </div>

            {/* Set Expiration */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Set Expiration</Label>
                  <p className="text-xs text-gray-500">Link automatically deactivates after date</p>
                </div>
                <Switch checked={setExpiration} onCheckedChange={setSetExpiration} />
              </div>
              {setExpiration && (
                <Input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              )}
            </div>

            {/* Allow Download */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Allow Download</Label>
                <p className="text-xs text-gray-500">Viewers can download the original file</p>
              </div>
              <Switch checked={allowDownload} onCheckedChange={setAllowDownload} />
            </div>

            {/* Notify on View */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Notify me when viewed</Label>
                  <p className="text-xs text-gray-500">Get an email alert each time someone opens this link</p>
                </div>
                <Switch checked={notifyOnView} onCheckedChange={setNotifyOnView} />
              </div>
              {notifyOnView && (
                <Input
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  placeholder="your@email.com"
                  type="email"
                />
              )}
            </div>

            {/* NDA Gate */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Enable NDA Gate</Label>
                  <p className="text-xs text-gray-500">Require viewers to agree to NDA before viewing</p>
                </div>
                <Switch checked={ndaEnabled} onCheckedChange={setNdaEnabled} />
              </div>
              {ndaEnabled && (
                <Textarea
                  value={ndaText}
                  onChange={(e) => setNdaText(e.target.value)}
                  rows={4}
                  className="text-xs"
                  placeholder="Enter NDA text..."
                />
              )}
            </div>

            {/* Dynamic Watermark */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Dynamic Watermark</Label>
                <p className="text-xs text-gray-500">Overlay viewer email and IP on each page</p>
              </div>
              <Switch checked={watermarkEnabled} onCheckedChange={setWatermarkEnabled} />
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleCreate}
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Link'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
