export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      establishment_details: {
        Row: {
          address_city: string | null
          address_complement: string | null
          address_latitude: string | null
          address_longitude: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_zipcode: string | null
          created_at: string | null
          custom_url: string | null
          description: string | null
          document_number: string | null
          document_type: string | null
          email: string | null
          facebook: string | null
          id: string
          instagram: string | null
          logo_url: string | null
          primary_color: string | null
          responsible_email: string | null
          responsible_name: string | null
          responsible_phone: string | null
          tiktok: string | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          address_city?: string | null
          address_complement?: string | null
          address_latitude?: string | null
          address_longitude?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zipcode?: string | null
          created_at?: string | null
          custom_url?: string | null
          description?: string | null
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          facebook?: string | null
          id: string
          instagram?: string | null
          logo_url?: string | null
          primary_color?: string | null
          responsible_email?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          tiktok?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          address_city?: string | null
          address_complement?: string | null
          address_latitude?: string | null
          address_longitude?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zipcode?: string | null
          created_at?: string | null
          custom_url?: string | null
          description?: string | null
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          primary_color?: string | null
          responsible_email?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          tiktok?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      blocked_times: {
        Row: {
          id: number
          establishment_id: string
          professional_id: number | null
          start_date: string
          end_date: string
          start_time: string | null
          end_time: string | null
          reason: string | null
          is_full_day: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          establishment_id: string
          professional_id?: number | null
          start_date: string
          end_date: string
          start_time?: string | null
          end_time?: string | null
          reason?: string | null
          is_full_day: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          establishment_id?: string
          professional_id?: number | null
          start_date?: string
          end_date?: string
          start_time?: string | null
          end_time?: string | null
          reason?: string | null
          is_full_day?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_times_establishment_id_fkey"
            columns: ["establishment_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          created_at: string
          establishment_name: string
          id: string
          is_profile_complete: boolean
          subscription_active: boolean
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          establishment_name: string
          id: string
          is_profile_complete?: boolean
          subscription_active?: boolean
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          establishment_name?: string
          id?: string
          is_profile_complete?: boolean
          subscription_active?: boolean
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
