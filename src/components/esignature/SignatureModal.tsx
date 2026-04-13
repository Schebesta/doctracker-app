'use client'

import { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PenLine, Type, RotateCcw, Check } from 'lucide-react'

interface SignatureModalProps {
  open: boolean
  onClose: () => void
  viewerName?: string
  viewerEmail?: string
  onSign: (signatureData: string, name: string, email: string) => void
}

export function SignatureModal({ open, onClose, viewerName = '', viewerEmail = '', onSign }: SignatureModalProps) {
  const sigCanvas = useRef<SignatureCanvas>(null)
  const [typedSignature, setTypedSignature] = useState(viewerName)
  const [name, setName] = useState(viewerName)
  const [email, setEmail] = useState(viewerEmail)
  const [activeTab, setActiveTab] = useState('draw')
  const [signing, setSigning] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)

  const handleClear = () => {
    sigCanvas.current?.clear()
    setIsEmpty(true)
  }

  const handleSign = async () => {
    setSigning(true)
    let signatureData = ''

    if (activeTab === 'draw') {
      if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
        signatureData = sigCanvas.current.toDataURL('image/png')
      }
    } else {
      // Generate a styled text signature
      signatureData = `typed:${typedSignature}`
    }

    await new Promise(r => setTimeout(r, 600))
    setSigning(false)
    onSign(signatureData, name, email)
    onClose()
  }

  const canSign = () => {
    if (!name.trim() || !email.trim()) return false
    if (activeTab === 'draw') return !isEmpty
    return typedSignature.trim().length > 0
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <PenLine className="w-5 h-5 text-blue-600" />
            Sign Document
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Signer Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sig-name">Full Name</Label>
              <Input
                id="sig-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sig-email">Email</Label>
              <Input
                id="sig-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                type="email"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="draw" className="gap-1.5">
                <PenLine className="w-3.5 h-3.5" />
                Draw
              </TabsTrigger>
              <TabsTrigger value="type" className="gap-1.5">
                <Type className="w-3.5 h-3.5" />
                Type
              </TabsTrigger>
            </TabsList>

            <TabsContent value="draw" className="mt-3">
              <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden relative bg-gray-50">
                <SignatureCanvas
                  ref={sigCanvas}
                  canvasProps={{
                    width: 440,
                    height: 160,
                    className: 'w-full h-40',
                    style: { touchAction: 'none' },
                  }}
                  backgroundColor="rgb(249,250,251)"
                  onBegin={() => setIsEmpty(false)}
                />
                {isEmpty && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-sm text-gray-400">Draw your signature here</p>
                  </div>
                )}
              </div>
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 mt-2 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            </TabsContent>

            <TabsContent value="type" className="mt-3">
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <input
                  type="text"
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  placeholder="Type your signature..."
                  className="w-full bg-transparent outline-none text-center text-gray-800 placeholder-gray-400"
                  style={{
                    fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
                    fontSize: '28px',
                    lineHeight: '1.5',
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                Your typed name serves as your legal signature
              </p>
            </TabsContent>
          </Tabs>

          {/* Legal notice */}
          <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3 border border-gray-100">
            By signing, you agree that this electronic signature is legally binding and equivalent to a handwritten signature.
          </p>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={!canSign() || signing}
              onClick={handleSign}
            >
              {signing ? (
                'Signing...'
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  Sign Document
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
