import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key
export const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: "brand" | "influencer"
          avatar_url: string | null
          bio: string | null
          website: string | null
          social_links: Record<string, any>
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role: "brand" | "influencer"
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          social_links?: Record<string, any>
          verified?: boolean
        }
        Update: {
          name?: string
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          social_links?: Record<string, any>
          verified?: boolean
        }
      }
      campaigns: {
        Row: {
          id: string
          brand_id: string
          title: string
          description: string | null
          budget: number | null
          requirements: string | null
          deliverables: string[]
          start_date: string | null
          end_date: string | null
          status: "draft" | "active" | "paused" | "completed" | "cancelled"
          tags: string[]
          target_audience: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          title: string
          description?: string | null
          budget?: number | null
          requirements?: string | null
          deliverables?: string[]
          start_date?: string | null
          end_date?: string | null
          status?: "draft" | "active" | "paused" | "completed" | "cancelled"
          tags?: string[]
          target_audience?: Record<string, any>
        }
        Update: {
          title?: string
          description?: string | null
          budget?: number | null
          requirements?: string | null
          deliverables?: string[]
          start_date?: string | null
          end_date?: string | null
          status?: "draft" | "active" | "paused" | "completed" | "cancelled"
          tags?: string[]
          target_audience?: Record<string, any>
        }
      }
      campaign_applications: {
        Row: {
          id: string
          campaign_id: string
          influencer_id: string
          status: "pending" | "approved" | "rejected" | "completed"
          proposal: string | null
          proposed_rate: number | null
          applied_at: string
          reviewed_at: string | null
        }
        Insert: {
          campaign_id: string
          influencer_id: string
          proposal?: string | null
          proposed_rate?: number | null
        }
        Update: {
          status?: "pending" | "approved" | "rejected" | "completed"
          reviewed_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          read: boolean
          data: Record<string, any>
          created_at: string
        }
        Insert: {
          user_id: string
          title: string
          message: string
          type: string
          data?: Record<string, any>
        }
        Update: {
          read?: boolean
        }
      }
      wallet_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: "credit" | "debit"
          description: string
          reference_id: string | null
          reference_type: string | null
          status: "pending" | "completed" | "failed"
          created_at: string
        }
        Insert: {
          user_id: string
          amount: number
          type: "credit" | "debit"
          description: string
          reference_id?: string | null
          reference_type?: string | null
          status?: "pending" | "completed" | "failed"
        }
        Update: {
          status?: "pending" | "completed" | "failed"
        }
      }
    }
  }
}
