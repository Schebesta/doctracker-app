'use client'

import { useState, useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, CheckSquare, Square, RotateCcw } from 'lucide-react'

interface NDAGateProps {
  ndaText: string
  onAgree: (name: string) => void
}

export function NDAGate({ ndaText, onAgree }: NDAGateProps) {
  const [agreed, setAgreed] = useState(false)
  const [name, setName] = useState('')
  const sigCanvas = useRef<SignatureCanvas>(null)
  const [isEmpty, setIsEmpty] = useState(true)

  const handleClear = () => {
    sigCanvas.current?.clear()
    setIsEmpty(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-lg w-full p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <Shield className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Non-Disclosure Agreement</h2>
            <p className="text-sm text-gray-500">Please read and agree before viewing</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 max-h-48 overflow-y-auto border border-gray-200">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{ndaText}</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full-name">Your Full Name</Label>
            <Input
              id="full-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full legal name"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Signature</Label>
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
          </div>

          <button
            onClick={() => setAgreed(!agreed)}
            className="flex items-start gap-2.5 text-left w-full"
          >
            {agreed ? (
              <CheckSquare className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            ) : (
              <Square className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
            )}
            <span className="text-sm text-gray-700">
              I have read and agree to the terms of this Non-Disclosure Agreement, and I understand my obligations to maintain confidentiality.
            </span>
          </button>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!agreed || !name.trim() || isEmpty}
            onClick={() => onAgree(name.trim())}
          >
            I Agree — Continue to Document
          </Button>
        </div>
      </div>
    </div>
  )
}
