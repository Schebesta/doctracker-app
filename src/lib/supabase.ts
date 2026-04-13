import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      spaces: {
        Row: {
          id: string
          name: string
          description: string | null
          logo_url: string | null
          brand_color: string | null
          owner_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['spaces']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['spaces']['Insert']>
      }
      assets: {
        Row: {
          id: string
          space_id: string | null
          name: string
          type: 'pdf' | 'video'
          storage_path: string
          owner_id: string
          cta_url: string | null
          cta_label: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['assets']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['assets']['Insert']>
      }
      document_versions: {
        Row: {
          id: string
          asset_id: string
          version_number: number
          storage_path: string
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['document_versions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['document_versions']['Insert']>
      }
      links: {
        Row: {
          id: string
          asset_id: string
          slug: string
          passcode: string | null
          expires_at: string | null
          require_email: boolean
          allow_download: boolean
          notify_on_view: boolean
          notify_email: string | null
          nda_enabled: boolean
          nda_text: string | null
          watermark_enabled: boolean
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['links']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['links']['Insert']>
      }
      telemetry_events: {
        Row: {
          id: string
          link_id: string
          viewer_email: string | null
          viewer_name: string | null
          event_type: 'open' | 'page_view' | 'close' | 'download' | 'signature'
          page_number: number | null
          duration_seconds: number | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['telemetry_events']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['telemetry_events']['Insert']>
      }
      signatures: {
        Row: {
          id: string
          link_id: string
          viewer_email: string
          viewer_name: string
          signature_data: string
          signed_at: string
          ip_address: string | null
        }
        Insert: Omit<Database['public']['Tables']['signatures']['Row'], 'id' | 'signed_at'>
        Update: Partial<Database['public']['Tables']['signatures']['Insert']>
      }
    }
  }
}
