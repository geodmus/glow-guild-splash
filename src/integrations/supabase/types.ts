export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'creator' | 'sponsor' | 'admin'
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'completed'
export type Platform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook' | 'linkedin' | 'pinterest' | 'snapchat' | 'other'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role: UserRole
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: UserRole
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      creators: {
        Row: {
          id: string
          profile_slug: string
          display_name: string
          bio: string | null
          location_city: string | null
          location_region: string | null
          niche_tags: string[]
          primary_platforms: Platform[]
          follower_count_total: number
          rate_min_usd: number | null
          rate_max_usd: number | null
          portfolio_links: string[]
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          profile_slug: string
          display_name: string
          bio?: string | null
          location_city?: string | null
          location_region?: string | null
          niche_tags?: string[]
          primary_platforms?: Platform[]
          follower_count_total?: number
          rate_min_usd?: number | null
          rate_max_usd?: number | null
          portfolio_links?: string[]
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_slug?: string
          display_name?: string
          bio?: string | null
          location_city?: string | null
          location_region?: string | null
          niche_tags?: string[]
          primary_platforms?: Platform[]
          follower_count_total?: number
          rate_min_usd?: number | null
          rate_max_usd?: number | null
          portfolio_links?: string[]
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sponsors: {
        Row: {
          id: string
          company_name: string
          industry: string | null
          website_url: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          company_name: string
          industry?: string | null
          website_url?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          industry?: string | null
          website_url?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      booking_requests: {
        Row: {
          id: string
          creator_id: string
          sponsor_id: string
          campaign_title: string
          deliverable: string
          budget_offer_usd: number
          timeline_start: string
          timeline_end: string
          campaign_brief: string
          status: BookingStatus
          created_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          sponsor_id: string
          campaign_title: string
          deliverable: string
          budget_offer_usd: number
          timeline_start: string
          timeline_end: string
          campaign_brief: string
          status?: BookingStatus
          created_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          sponsor_id?: string
          campaign_title?: string
          deliverable?: string
          budget_offer_usd?: number
          timeline_start?: string
          timeline_end?: string
          campaign_brief?: string
          status?: BookingStatus
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          booking_request_id: string
          sender_id: string
          body: string
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_request_id: string
          sender_id: string
          body: string
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_request_id?: string
          sender_id?: string
          body?: string
          read_at?: string | null
          created_at?: string
        }
      }
    }
    Enums: {
      user_role: UserRole
      booking_status: BookingStatus
      platform: Platform
    }
  }
}
