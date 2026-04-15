'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { FileText, LayoutGrid, Bell, Settings, ChevronDown, LogOut, Loader2 } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

const navLinks = [
  { href: '/', label: 'Documents', icon: FileText },
  { href: '/spaces', label: 'Spaces', icon: LayoutGrid },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  
  // Dropdown states
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  
  // Notification data
  const [recentDocs, setRecentDocs] = useState<any[]>([])
  
  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      if (session?.user) fetchRecentActivities(session.user.id)
    })
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      if (session?.user) fetchRecentActivities(session.user.id)
      else setRecentDocs([])
    })
    
    return () => authListener.subscription.unsubscribe()
  }, [])

  const fetchRecentActivities = async (userId: string) => {
    const { data } = await supabase
      .from('documents')
      .select('id, name, created_at')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
      .limit(3)
    if (data) setRecentDocs(data)
  }

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'F'
  const userName = user?.is_anonymous ? 'Guest User' : (user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User')

  return (
    <div className="w-full flex flex-col sticky top-0 z-50">
      {user?.is_anonymous && (
        <div className="bg-orange-500 px-4 py-2 text-center flex items-center justify-center gap-3">
          <span className="text-white text-sm font-medium">
            You are in Guest Mode. Sign up to save your presentations, otherwise they will be lost.
          </span>
          <Link href="/login?mode=signup" className="bg-white text-orange-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-orange-50 transition-colors">
            Sign Up Now
          </Link>
        </div>
      )}
      <nav className="border-b border-border bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-gray-900">
                DocTracker
              </span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    pathname === href
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={cn(
                  "relative p-2 rounded-md transition-colors",
                  notificationsOpen ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
              </button>
              
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {recentDocs.length > 0 ? (
                      recentDocs.map(doc => (
                        <div key={doc.id} className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                          <p className="text-sm text-gray-800">
                            You uploaded <span className="font-medium">"{doc.name}"</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(doc.created_at)}</p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-500 text-sm">
                        No recent activities
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <Link 
              href="/settings"
              className={cn(
                "p-2 rounded-md transition-colors",
                pathname === '/settings' ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <Settings className="w-5 h-5" />
            </Link>

            {/* User Profile */}
            <div className="relative border-l border-gray-200 pl-2 ml-1" ref={profileRef}>
              {user ? (
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                    {userInitial}
                  </div>
                  <div className="hidden md:flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-700">{userName}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                </button>
              ) : (
                <Link href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-2">
                  Sign In
                </Link>
              )}

              {/* Profile Dropdown */}
              {user && profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  
                  <Link 
                    href="/settings" 
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-2 text-gray-400" />
                    Account Settings
                  </Link>
                  
                  <button
                    onClick={() => {
                      setProfileOpen(false)
                      handleSignOut()
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2 text-red-400" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </nav>
    </div>
  )
}
