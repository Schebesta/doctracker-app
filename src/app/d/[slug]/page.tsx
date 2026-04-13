import { ViewerClient } from './viewer-client'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Mock link configs for demo
function getLinkConfig(slug: string) {
  const configs: Record<string, {
    slug: string
    require_email: boolean
    allow_download: boolean
    notify_on_view: boolean
    nda_enabled: boolean
    nda_text: string | null
    watermark_enabled: boolean
    cta_url: string | null
    cta_label: string | null
    document_name: string
    passcode: string | null
  }> = {
    abc123: {
      slug: 'abc123',
      require_email: true,
      allow_download: false,
      notify_on_view: true,
      nda_enabled: false,
      nda_text: null,
      watermark_enabled: true,
      cta_url: 'https://calendly.com/example',
      cta_label: 'Book a Meeting',
      document_name: 'Series A Pitch Deck',
      passcode: null,
    },
    def456: {
      slug: 'def456',
      require_email: false,
      allow_download: true,
      notify_on_view: false,
      nda_enabled: true,
      nda_text: 'This document contains confidential and proprietary information. By accessing this document, you agree to maintain its confidentiality and not disclose any information to third parties without prior written consent.',
      watermark_enabled: false,
      cta_url: null,
      cta_label: null,
      document_name: 'Series A Pitch Deck — Confidential',
      passcode: 'secret123',
    },
  }

  return configs[slug] || {
    slug,
    require_email: true,
    allow_download: false,
    notify_on_view: false,
    nda_enabled: false,
    nda_text: null,
    watermark_enabled: true,
    cta_url: null,
    cta_label: null,
    document_name: 'Shared Document',
    passcode: null,
  }
}

export default async function DocumentViewerPage({ params }: PageProps) {
  const { slug } = await params
  const config = getLinkConfig(slug)

  return <ViewerClient config={config} />
}
