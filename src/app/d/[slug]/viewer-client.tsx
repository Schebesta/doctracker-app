'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { WatermarkOverlay } from '@/components/viewer/WatermarkOverlay'
import dynamic from 'next/dynamic'

const PDFViewer = dynamic(
  () => import('@/components/viewer/PDFViewer').then(mod => mod.PDFViewer),
  { 
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }
)
import { NDAGate } from '@/components/viewer/NDAgent'
import { SignatureModal } from '@/components/esignature/SignatureModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import {
  FileText,
  Download,
  PenLine,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Shield,
} from 'lucide-react'

interface LinkConfig {
  slug: string
  require_email: boolean
  allow_download: boolean
  notify_on_view: boolean
  nda_enabled: boolean
  nda_text: string | null
  watermark_enabled: boolean
  cta_url?: string | null
  cta_label?: string | null
  document_name: string
  passcode: string | null
  pdf_url?: string
  oauth_enabled: boolean
}

interface ViewerClientProps {
  config: LinkConfig
}

type ViewerStep = 'gate' | 'passcode' | 'nda' | 'viewer'

export function ViewerClient({ config }: ViewerClientProps) {
  const [step, setStep] = useState<ViewerStep>(
    config.require_email ? 'gate' : config.passcode ? 'passcode' : config.nda_enabled ? 'nda' : 'viewer'
  )
  const [viewerEmail, setViewerEmail] = useState('')
  const [viewerName, setViewerName] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(config.require_email)

  useEffect(() => {
    if (!config.require_email) return
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email) {
        setViewerEmail(session.user.email)
        setViewerName(session.user.user_metadata?.full_name || session.user.email.split('@')[0])
        
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: config.slug, viewer_email: session.user.email, document_name: config.document_name }),
        }).catch(() => {})

        if (config.passcode) setStep('passcode')
        else if (config.nda_enabled) setStep('nda')
        else setStep('viewer')
      }
      setCheckingAuth(false)
    }
    checkSession()
  }, [config])
  const [emailInput, setEmailInput] = useState('')
  const [passcodeInput, setPasscodeInput] = useState('')
  const [passcodeError, setPasscodeError] = useState('')
  const [signatureOpen, setSignatureOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages] = useState(8) // mock
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pageStartTime = useRef<number>(Date.now())

  const postTelemetry = useCallback(async (eventType: string, pageNumber?: number, durationSeconds?: number) => {
    try {
      await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          link_id: config.slug,
          viewer_email: viewerEmail,
          viewer_name: viewerName,
          event_type: eventType,
          page_number: pageNumber,
          duration_seconds: durationSeconds,
        }),
      })
    } catch {
      // ignore telemetry errors
    }
  }, [config.slug, viewerEmail, viewerName])

  // Run once when viewer opens
  useEffect(() => {
    if (step === 'viewer') {
      postTelemetry('open')
    }
  }, [step, postTelemetry])

  // Handle heartbeat and page tracking
  useEffect(() => {
    if (step !== 'viewer') return

    heartbeatRef.current = setInterval(() => {
      const duration = Math.round((Date.now() - pageStartTime.current) / 1000)
      postTelemetry('page_view', currentPage, duration)
    }, 5000)

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
      // Only send close event if we are actually closing the page, 
      // but since this unmounts on page change, we let handlePageChange do the exact tracking.
    }
  }, [step, postTelemetry, currentPage])

  const handlePageChange = (newPage: number) => {
    const duration = Math.round((Date.now() - pageStartTime.current) / 1000)
    postTelemetry('page_view', currentPage, duration)
    pageStartTime.current = Date.now()
    setCurrentPage(newPage)
  }

  const handleOAuthContinue = async (provider: 'google' | 'linkedin_oidc') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.href,
      }
    })
  }

  const handleEmailContinue = async (email: string, name?: string) => {
    setViewerEmail(email)
    setViewerName(name || email.split('@')[0])

    // Notify
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: config.slug, viewer_email: email, document_name: config.document_name }),
    }).catch(() => {})

    if (config.passcode) {
      setStep('passcode')
    } else if (config.nda_enabled) {
      setStep('nda')
    } else {
      setStep('viewer')
    }
  }

  const handlePasscode = () => {
    if (passcodeInput === config.passcode) {
      setPasscodeError('')
      if (config.nda_enabled) {
        setStep('nda')
      } else {
        setStep('viewer')
      }
    } else {
      setPasscodeError('Incorrect passcode. Please try again.')
    }
  }

  const handleNDAAgree = () => {
    setStep('viewer')
  }

  // Identity Gate
  if (step === 'gate') {
    if (checkingAuth) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">{config.document_name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Please verify your identity to view this document
            </p>
          </div>

          <div className="space-y-3">
            {config.oauth_enabled && (
              <>
                {/* Google */}
                <button
                  onClick={() => handleOAuthContinue('google')}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm text-gray-700"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                {/* LinkedIn */}
                <button
                  onClick={() => handleOAuthContinue('linkedin_oidc')}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm text-gray-700"
                >
                  <svg viewBox="0 0 24 24" fill="#0A66C2" className="w-5 h-5">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Continue with LinkedIn
                </button>

                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              </>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="viewer-email">Enter your email</Label>
              <Input
                id="viewer-email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="your@email.com"
                onKeyDown={(e) => e.key === 'Enter' && emailInput && handleEmailContinue(emailInput)}
              />
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!emailInput.trim()}
                onClick={() => handleEmailContinue(emailInput)}
              >
                Continue
              </Button>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            Your information is used for document access tracking only
          </p>
        </div>
      </div>
    )
  }

  // Passcode Gate
  if (step === 'passcode') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-orange-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Protected Document</h2>
            <p className="text-sm text-gray-500 mt-1">Enter the passcode to access this document</p>
          </div>
          <div className="space-y-3">
            <Input
              type="text"
              value={passcodeInput}
              onChange={(e) => {
                setPasscodeInput(e.target.value)
                setPasscodeError('')
              }}
              placeholder="Enter passcode..."
              onKeyDown={(e) => e.key === 'Enter' && handlePasscode()}
            />
            {passcodeError && (
              <p className="text-xs text-red-500">{passcodeError}</p>
            )}
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!passcodeInput.trim()}
              onClick={handlePasscode}
            >
              Unlock Document
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // NDA Gate
  if (step === 'nda') {
    return (
      <NDAGate
        ndaText={config.nda_text || 'This document contains confidential information.'}
        onAgree={handleNDAAgree}
      />
    )
  }

  // Document Viewer
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Viewer Navbar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{config.document_name}</p>
            {viewerEmail && (
              <p className="text-xs text-gray-400">{viewerEmail}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {config.allow_download && (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" />
              Download
            </Button>
          )}

          {config.cta_url && (
            <Button
              className="bg-blue-600 hover:bg-blue-700 gap-1.5 text-xs"
              size="sm"
              onClick={() => window.open(config.cta_url!, '_blank')}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {config.cta_label || 'Learn More'}
            </Button>
          )}
        </div>
      </header>

      {/* PDF Content */}
      <div className="flex-1 flex flex-col items-center py-8 px-4 relative overflow-auto">
        {/* Real PDF Viewer */}
        <div className="relative w-full max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-4 overflow-hidden">
          {config.watermark_enabled && viewerEmail && (
            <WatermarkOverlay email={viewerEmail} />
          )}
          {config.pdf_url ? (
            <PDFViewer 
              url={config.pdf_url} 
              onPageChange={handlePageChange}
              onLoadSuccess={(pages) => {}}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-96 gap-6 text-center">
              <FileText className="w-12 h-12 text-gray-300" />
              <p className="text-gray-500">Document file not found.</p>
            </div>
          )}
      </div></div>

      <SignatureModal
        open={signatureOpen}
        onClose={() => setSignatureOpen(false)}
        viewerName={viewerName}
        viewerEmail={viewerEmail}
        onSign={(sig, name, email) => {
          postTelemetry('signature')
          console.log('Signed:', { sig: sig.substring(0, 50), name, email })
        }}
      />
    </div>
  )
}
