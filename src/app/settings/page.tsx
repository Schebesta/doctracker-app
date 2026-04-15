'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Shield, Loader2, CheckCircle2 } from 'lucide-react'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [oauthEnabled, setOauthEnabled] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const loadSettings = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      setUserId(session.user.id)
      
      const { data } = await supabase
        .from('user_settings')
        .select('oauth_enabled')
        .eq('id', session.user.id)
        .single()
        
      if (data) {
        setOauthEnabled(data.oauth_enabled)
      }
      setLoading(false)
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    if (!userId) return
    setSaving(true)
    
    const { error } = await supabase
      .from('user_settings')
      .upsert({ id: userId, oauth_enabled: oauthEnabled })
      
    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your document tracking and viewer preferences
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="p-6 border border-gray-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-gray-900">Viewer Authentication</h2>
                  <p className="text-sm text-gray-500 mt-1 mb-6">
                    Control how viewers can verify their identity when opening your protected documents.
                  </p>

                  <div className="flex items-start justify-between gap-4 py-4 border-t border-gray-100">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Enable Social Login (OAuth)</Label>
                      <p className="text-xs text-gray-500">
                        Allow viewers to sign in using Google or LinkedIn. If disabled, viewers will only see the email input box.
                      </p>
                    </div>
                    <Switch 
                      checked={oauthEnabled} 
                      onCheckedChange={(checked) => {
                        setOauthEnabled(checked)
                        setSaved(false)
                      }} 
                    />
                  </div>
                  
                  <div className="pt-6 flex items-center gap-3">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700" 
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Save Preferences
                    </Button>
                    {saved && (
                      <span className="flex items-center text-sm text-green-600 font-medium">
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        Saved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
