export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      factories: {
        Row: {
          id: number
          name: string
          category: string
          phase: string
          lat: number
          lon: number
          address: string
          phone: string
          work_start: string
          work_end: string
          lot_number: string
          is_active: boolean
          description: string
          image: string
          website_url: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          category?: string
          phase?: string
          lat?: number
          lon?: number
          address?: string
          phone?: string
          work_start?: string
          work_end?: string
          lot_number?: string
          is_active?: boolean
          description?: string
          image?: string
          website_url?: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          category?: string
          phase?: string
          lat?: number
          lon?: number
          address?: string
          phone?: string
          work_start?: string
          work_end?: string
          lot_number?: string
          is_active?: boolean
          description?: string
          image?: string
          website_url?: string
          created_at?: string
        }
      }
      phases: {
        Row: {
          id: number
          name: string
          number: number
          image: string
          description: string
          area: string
          is_active: boolean
          boundary: number[][]
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          number?: number
          image?: string
          description?: string
          area?: string
          is_active?: boolean
          boundary?: number[][]
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          number?: number
          image?: string
          description?: string
          area?: string
          is_active?: boolean
          boundary?: number[][]
          created_at?: string
        }
      }
      news: {
        Row: {
          id: number
          title: string
          summary: string
          body: string
          image: string
          cover_image: string
          published_at: string | null
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: number
          title: string
          summary?: string
          body?: string
          image?: string
          cover_image?: string
          published_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: number
          title?: string
          summary?: string
          body?: string
          image?: string
          cover_image?: string
          published_at?: string | null
          is_active?: boolean
        }
      }
      announcements: {
        Row: {
          id: number
          title: string
          body: string
          image: string
          published_at: string | null
          expires_at: string | null
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: number
          title: string
          body?: string
          image?: string
          published_at?: string | null
          expires_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: number
          title?: string
          body?: string
          image?: string
          published_at?: string | null
          expires_at?: string | null
          is_active?: boolean
        }
      }
      emergency_contacts: {
        Row: {
          id: number
          name: string
          phone: string
          icon: string
          sort_order: number
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: number
          name: string
          phone: string
          icon?: string
          sort_order?: number
          is_active?: boolean
        }
        Update: {
          id?: number
          name?: string
          phone?: string
          icon?: string
          sort_order?: number
          is_active?: boolean
        }
      }
      pois: {
        Row: {
          id: number
          name: string
          name_en: string
          lat: number
          lon: number
          icon: string
          category: string
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          name_en?: string
          lat: number
          lon: number
          icon?: string
          category?: string
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          name_en?: string
          lat?: number
          lon?: number
          icon?: string
          category?: string
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
