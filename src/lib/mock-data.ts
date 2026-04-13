export const mockDocuments = [
  {
    id: '1',
    name: 'Series A Pitch Deck',
    type: 'pdf' as const,
    storage_path: '',
    owner_id: 'user1',
    space_id: null,
    cta_url: 'https://calendly.com/example',
    cta_label: 'Book a Meeting',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    totalViews: 47,
    avgTimeSpent: 284,
    links: ['abc123', 'def456'],
  },
  {
    id: '2',
    name: 'Investor Update Q1 2026',
    type: 'pdf' as const,
    storage_path: '',
    owner_id: 'user1',
    space_id: null,
    cta_url: null,
    cta_label: null,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    totalViews: 12,
    avgTimeSpent: 156,
    links: ['ghi789'],
  },
  {
    id: '3',
    name: 'Product Demo Video',
    type: 'video' as const,
    storage_path: '',
    owner_id: 'user1',
    space_id: null,
    cta_url: null,
    cta_label: null,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    totalViews: 89,
    avgTimeSpent: 420,
    links: ['jkl012'],
  },
]

export const mockPageAnalytics = [
  { page: 1, timeSpent: 45 },
  { page: 2, timeSpent: 120 },
  { page: 3, timeSpent: 89 },
  { page: 4, timeSpent: 34 },
  { page: 5, timeSpent: 178 },
  { page: 6, timeSpent: 56 },
  { page: 7, timeSpent: 23 },
  { page: 8, timeSpent: 91 },
]

export const mockVisitors = [
  { email: 'alex.johnson@acme.com', name: 'Alex Johnson', company: 'Acme Corp', viewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), timeSpent: 340, pagesViewed: 8 },
  { email: 'sarah.chen@sequoia.com', name: 'Sarah Chen', company: 'Sequoia Capital', viewedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), timeSpent: 520, pagesViewed: 8 },
  { email: 'mike.rodriguez@a16z.com', name: 'Mike Rodriguez', company: 'a16z', viewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), timeSpent: 180, pagesViewed: 4 },
  { email: 'priya@tiger.com', name: 'Priya Patel', company: 'Tiger Global', viewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), timeSpent: 445, pagesViewed: 8 },
]

export const mockLinks = [
  { id: 'abc123', slug: 'abc123', asset_id: '1', require_email: true, passcode: null, expires_at: null, allow_download: false, notify_on_view: true, notify_email: 'founder@startup.com', nda_enabled: false, nda_text: null, watermark_enabled: true, is_active: true, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), views: 35 },
  { id: 'def456', slug: 'def456', asset_id: '1', require_email: false, passcode: 'secret123', expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), allow_download: true, notify_on_view: false, notify_email: null, nda_enabled: true, nda_text: 'This document contains confidential information...', watermark_enabled: false, is_active: true, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), views: 12 },
]

export const mockSpaces = [
  { id: 'space1', name: 'Fundraising', description: 'All investor relations documents', logo_url: null, brand_color: '#3B82F6', owner_id: 'user1', created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), documentCount: 5 },
  { id: 'space2', name: 'Customer Success', description: 'Onboarding and support materials', logo_url: null, brand_color: '#10B981', owner_id: 'user1', created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), documentCount: 8 },
  { id: 'space3', name: 'Sales Enablement', description: 'Sales decks, case studies, and proposals', logo_url: null, brand_color: '#8B5CF6', owner_id: 'user1', created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), documentCount: 12 },
]
