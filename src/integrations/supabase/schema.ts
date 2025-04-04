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
      appointments: {
        Row: {
          id: number
          client_id: number
          client_name: string
          professional_id: number
          professional_name: string
          services: Json
          date: string
          start_time: string
          end_time: string
          duration: number
          status: 'pending' | 'confirmed' | 'canceled' | 'completed'
          payment_status: 'pending' | 'partial' | 'paid'
          notes: string | null
          total_value: number
          created_at: string
          updated_at: string
          establishment_id: string
        }
        Insert: {
          id?: number
          client_id: number
          client_name: string
          professional_id: number
          professional_name: string
          services: Json
          date: string
          start_time: string
          end_time: string
          duration: number
          status?: 'pending' | 'confirmed' | 'canceled' | 'completed'
          payment_status?: 'pending' | 'partial' | 'paid'
          notes?: string | null
          total_value: number
          created_at?: string
          updated_at?: string
          establishment_id: string
        }
        Update: {
          id?: number
          client_id?: number
          client_name?: string
          professional_id?: number
          professional_name?: string
          services?: Json
          date?: string
          start_time?: string
          end_time?: string
          duration?: number
          status?: 'pending' | 'confirmed' | 'canceled' | 'completed'
          payment_status?: 'pending' | 'partial' | 'paid'
          notes?: string | null
          total_value?: number
          created_at?: string
          updated_at?: string
          establishment_id?: string
        }
      }
      professionals: {
        Row: {
          id: number
          name: string
          specialties: string[]
          schedule: Json
          created_at: string
          updated_at: string
          establishment_id: string
        }
        Insert: {
          id?: number
          name: string
          specialties?: string[]
          schedule?: Json
          created_at?: string
          updated_at?: string
          establishment_id: string
        }
        Update: {
          id?: number
          name?: string
          specialties?: string[]
          schedule?: Json
          created_at?: string
          updated_at?: string
          establishment_id?: string
        }
      }
      blocked_times: {
        Row: {
          id: number
          professional_id: number | null
          establishment_id: string
          start_date: string
          end_date: string
          start_time: string | null
          end_time: string | null
          reason: string | null
          is_full_day: boolean
          created_at: string
        }
        Insert: {
          id?: number
          professional_id?: number | null
          establishment_id: string
          start_date: string
          end_date: string
          start_time?: string | null
          end_time?: string | null
          reason?: string | null
          is_full_day?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          professional_id?: number | null
          establishment_id?: string
          start_date?: string
          end_date?: string
          start_time?: string | null
          end_time?: string | null
          reason?: string | null
          is_full_day?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 